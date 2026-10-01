const SkillStudio = require('../models/SkillStudio');

const studioRooms = new Map(); // studioId -> Map(socketId -> { userId, username, displayName, avatar, isSpeaking, cursor })
const onlineUsers = new Map(); // userId -> { socketId, username, displayName, avatar, lastSeen }

function setupStudioSockets(io) {
  io.on('connection', (socket) => {
    let currentStudioId = null;
    let currentUser = null;

    // Track user presence and connect to user-specific room for direct messages
    socket.on('user-online', (user) => {
      if (!user) return;
      const uid = (user._id || user.id || '').toString();
      if (!uid) return;
      currentUser = user;
      socket.join(`user:${uid}`);

      onlineUsers.set(uid, {
        socketId: socket.id,
        userId: uid,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        lastSeen: new Date(),
      });

      // Broadcast active online users
      io.emit('online-users-list', Array.from(onlineUsers.keys()));
    });

    // Real-Time Direct Messaging
    socket.on('direct-message-send', ({ recipientId, message }) => {
      if (!recipientId || !message) return;
      const targetId = (recipientId?._id || recipientId?.id || recipientId).toString();
      io.to(`user:${targetId}`).emit('direct-message-received', message);
    });

    socket.on('direct-typing', ({ recipientId, isTyping }) => {
      if (!recipientId || !currentUser) return;
      const targetId = (recipientId?._id || recipientId?.id || recipientId).toString();
      const senderUid = (currentUser?._id || currentUser?.id || '').toString();
      io.to(`user:${targetId}`).emit('direct-typing-status', {
        senderId: senderUid,
        username: currentUser.username,
        isTyping,
      });
    });

    // Studio Join
    socket.on('join-studio', async ({ studioId, user, isHost }) => {
      try {
        currentStudioId = studioId;
        currentUser = user;

        socket.join(`studio:${studioId}`);

        if (!studioRooms.has(studioId)) {
          studioRooms.set(studioId, new Map());
        }

        let userIsHost = Boolean(isHost);
        try {
          const studioDoc = await SkillStudio.findById(studioId);
          if (studioDoc) {
            const hostP = studioDoc.participants.find((p) => p.role === 'host');
            const uid = (user.id || user._id || '').toString();
            if (hostP && (hostP.userId?._id || hostP.userId).toString() === uid) {
              userIsHost = true;
            }
          }
        } catch (err) {
          console.error('Error verifying host in join-studio:', err);
        }

        socket.isHost = userIsHost;

        const roomUsers = studioRooms.get(studioId);
        roomUsers.set(socket.id, {
          socketId: socket.id,
          userId: user.id || user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isHost: userIsHost,
          isSpeaking: false,
          cursor: { x: 0, y: 0 }
        });

        // Broadcast updated participants list
        const participants = Array.from(roomUsers.values());
        io.to(`studio:${studioId}`).emit('studio-participants-update', participants);

        // Notify room
        socket.to(`studio:${studioId}`).emit('user-entered-studio', {
          username: user.username,
          displayName: user.displayName
        });
      } catch (err) {
        console.error('Socket join error:', err);
      }
    });

    // Whiteboard drawing synchronization
    socket.on('whiteboard-element-add', ({ studioId, element }) => {
      socket.to(`studio:${studioId}`).emit('whiteboard-element-received', element);
    });

    socket.on('whiteboard-update-all', ({ studioId, elements }) => {
      socket.to(`studio:${studioId}`).emit('whiteboard-sync-all', elements);
    });

    socket.on('whiteboard-clear', ({ studioId }) => {
      socket.to(`studio:${studioId}`).emit('whiteboard-cleared');
    });

    // Live cursor pointer for collaborative drawing
    socket.on('cursor-move', ({ studioId, cursor }) => {
      socket.to(`studio:${studioId}`).emit('peer-cursor-moved', {
        socketId: socket.id,
        user: currentUser,
        cursor
      });
    });

    // Code Space synchronization
    socket.on('code-change', ({ studioId, code, language }) => {
      socket.to(`studio:${studioId}`).emit('code-updated', {
        code,
        language,
        senderUsername: currentUser?.username
      });
    });

    // Studio Chat
    socket.on('send-chat', async ({ studioId, text }) => {
      if (!currentUser || !text) return;

      const chatItem = {
        senderId: currentUser.id || currentUser._id,
        senderName: currentUser.displayName,
        senderUsername: currentUser.username,
        senderAvatar: currentUser.avatar,
        text: text.trim(),
        createdAt: new Date().toISOString()
      };

      io.to(`studio:${studioId}`).emit('new-chat-message', chatItem);

      try {
        await SkillStudio.findByIdAndUpdate(studioId, {
          $push: { chatMessages: chatItem }
        });
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });

    // WebRTC Signaling for Audio / Optional Video / Screen Share
    socket.on('webrtc-offer', ({ studioId, targetSocketId, offer }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        fromSocketId: socket.id,
        fromUser: currentUser,
        offer
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        fromSocketId: socket.id,
        answer
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        fromSocketId: socket.id,
        candidate
      });
    });

    // Voice speaking indicator
    socket.on('voice-activity', ({ studioId, isSpeaking }) => {
      if (currentStudioId && studioRooms.has(currentStudioId)) {
        const room = studioRooms.get(currentStudioId);
        if (room.has(socket.id)) {
          room.get(socket.id).isSpeaking = isSpeaking;
          socket.to(`studio:${studioId}`).emit('peer-voice-activity', {
            socketId: socket.id,
            userId: currentUser?.id || currentUser?._id,
            isSpeaking
          });
        }
      }
    });

    // Host session settings live update
    socket.on('update-session-settings', ({ studioId, settings }) => {
      io.to(`studio:${studioId}`).emit('session-settings-changed', settings);
    });

    // Explicit studio leave
    socket.on('leave-studio', async ({ studioId, isHost }) => {
      const targetStudioId = studioId || currentStudioId;
      if (!targetStudioId) return;

      const teachingPersonLeft = Boolean(isHost || socket.isHost);

      if (teachingPersonLeft) {
        // When teaching person leaves the meeting, end it completely for everyone!
        try {
          await SkillStudio.findByIdAndUpdate(targetStudioId, {
            status: 'ended',
            endedAt: new Date()
          });

          io.to(`studio:${targetStudioId}`).emit('studio-session-ended', {
            studioId: targetStudioId,
            endedBy: currentUser?.displayName || currentUser?.username || 'The Instructor',
            reason: 'The instructor has left the meeting. This session has now ended completely.'
          });

          if (studioRooms.has(targetStudioId)) {
            studioRooms.delete(targetStudioId);
          }
        } catch (err) {
          console.error('Error on host leave-studio:', err);
        }
      } else {
        // Regular participant left
        if (studioRooms.has(targetStudioId)) {
          const room = studioRooms.get(targetStudioId);
          room.delete(socket.id);
          const participants = Array.from(room.values());
          io.to(`studio:${targetStudioId}`).emit('studio-participants-update', participants);
        }

        if (currentUser) {
          socket.to(`studio:${targetStudioId}`).emit('user-left-studio', {
            username: currentUser.username,
            displayName: currentUser.displayName
          });
        }
      }
    });

    // Explicit end studio session (triggered by host)
    socket.on('end-studio-session', async ({ studioId, endedBy }) => {
      const targetStudioId = studioId || currentStudioId;
      if (!targetStudioId) return;

      try {
        await SkillStudio.findByIdAndUpdate(targetStudioId, {
          status: 'ended',
          endedAt: new Date()
        });

        io.to(`studio:${targetStudioId}`).emit('studio-session-ended', {
          studioId: targetStudioId,
          endedBy: endedBy || currentUser?.displayName || currentUser?.username || 'The Instructor',
          reason: 'The instructor has ended this session.'
        });

        if (studioRooms.has(targetStudioId)) {
          studioRooms.delete(targetStudioId);
        }
      } catch (err) {
        console.error('Error on end-studio-session:', err);
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', async () => {
      if (currentUser && currentUser._id) {
        onlineUsers.delete(currentUser._id.toString());
        io.emit('online-users-list', Array.from(onlineUsers.keys()));
      }

      if (currentStudioId && studioRooms.has(currentStudioId)) {
        const room = studioRooms.get(currentStudioId);
        const exitingUser = room.get(socket.id);
        const wasHost = exitingUser?.isHost || socket.isHost;
        room.delete(socket.id);

        if (wasHost) {
          // The teaching person disconnected! End the session completely for everyone!
          try {
            await SkillStudio.findByIdAndUpdate(currentStudioId, {
              status: 'ended',
              endedAt: new Date()
            });

            io.to(`studio:${currentStudioId}`).emit('studio-session-ended', {
              studioId: currentStudioId,
              endedBy: currentUser?.displayName || currentUser?.username || 'The Instructor',
              reason: 'The instructor has left the meeting. This session has now ended completely.'
            });

            studioRooms.delete(currentStudioId);
          } catch (err) {
            console.error('Error ending studio on host disconnect:', err);
          }
        } else {
          const participants = Array.from(room.values());
          io.to(`studio:${currentStudioId}`).emit('studio-participants-update', participants);

          if (currentUser) {
            socket.to(`studio:${currentStudioId}`).emit('user-left-studio', {
              username: currentUser.username,
              displayName: currentUser.displayName
            });
          }

          if (room.size === 0) {
            studioRooms.delete(currentStudioId);
          }
        }
      }
    });
  });
}

module.exports = setupStudioSockets;
