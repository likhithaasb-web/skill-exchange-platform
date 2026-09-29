const SkillStudio = require('../models/SkillStudio');

const studioRooms = new Map(); // studioId -> Map(socketId -> { userId, username, displayName, avatar, isSpeaking, cursor })
const onlineUsers = new Map(); // userId -> { socketId, username, displayName, avatar, lastSeen }

function setupStudioSockets(io) {
  io.on('connection', (socket) => {
    let currentStudioId = null;
    let currentUser = null;

    // Track user presence and connect to user-specific room for direct messages
    socket.on('user-online', (user) => {
      if (!user || !user._id) return;
      currentUser = user;
      const uid = user._id.toString();
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
      io.to(`user:${recipientId}`).emit('direct-message-received', message);
    });

    socket.on('direct-typing', ({ recipientId, isTyping }) => {
      if (!recipientId || !currentUser) return;
      io.to(`user:${recipientId}`).emit('direct-typing-status', {
        senderId: currentUser._id,
        username: currentUser.username,
        isTyping,
      });
    });

    // Studio Join
    socket.on('join-studio', async ({ studioId, user }) => {
      try {
        currentStudioId = studioId;
        currentUser = user;

        socket.join(`studio:${studioId}`);

        if (!studioRooms.has(studioId)) {
          studioRooms.set(studioId, new Map());
        }

        const roomUsers = studioRooms.get(studioId);
        roomUsers.set(socket.id, {
          socketId: socket.id,
          userId: user.id || user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
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

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (currentUser && currentUser._id) {
        onlineUsers.delete(currentUser._id.toString());
        io.emit('online-users-list', Array.from(onlineUsers.keys()));
      }

      if (currentStudioId && studioRooms.has(currentStudioId)) {
        const room = studioRooms.get(currentStudioId);
        room.delete(socket.id);

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
    });
  });
}

module.exports = setupStudioSockets;
