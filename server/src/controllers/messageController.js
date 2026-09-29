const mongoose = require('mongoose');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const SkillExchange = require('../models/SkillExchange');
const Notification = require('../models/Notification');

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all distinct peers from DirectMessage
    const messages = await DirectMessage.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    }).sort({ createdAt: -1 });

    const peerMap = new Map(); // peerId -> { lastMessage, unreadCount }

    for (const msg of messages) {
      const peerId = msg.senderId.toString() === userId.toString()
        ? msg.recipientId.toString()
        : msg.senderId.toString();

      if (!peerMap.has(peerId)) {
        peerMap.set(peerId, {
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.recipientId.toString() === userId.toString() && !msg.isRead) {
        peerMap.get(peerId).unreadCount += 1;
      }
    }

    // Also include any active exchange partners who haven't messaged yet
    const exchanges = await SkillExchange.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: { $in: ['accepted', 'in_progress', 'completed'] }
    });

    for (const ex of exchanges) {
      const peerId = ex.requesterId.toString() === userId.toString()
        ? ex.recipientId.toString()
        : ex.requesterId.toString();

      if (!peerMap.has(peerId)) {
        peerMap.set(peerId, {
          lastMessage: null,
          unreadCount: 0,
          exchangeContext: `${ex.offeredSkill.name} ↔ ${ex.requestedSkill.name}`,
        });
      }
    }

    const peerIds = Array.from(peerMap.keys());
    const peers = await User.find({ _id: { $in: peerIds } }).select('username displayName avatar location tagline');

    const conversations = peers.map(peer => {
      const data = peerMap.get(peer._id.toString());
      return {
        peer,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount,
        exchangeContext: data.exchangeContext,
      };
    });

    // Sort by last message date descending
    conversations.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return res.json({
      success: true,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMessagesWithPeer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { peerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(peerId)) {
      return res.status(400).json({ success: false, message: 'Invalid peer ID.' });
    }

    const peer = await User.findById(peerId).select('username displayName avatar tagline location');
    if (!peer) {
      return res.status(404).json({ success: false, message: 'Peer not found.' });
    }

    const messages = await DirectMessage.find({
      $or: [
        { senderId: userId, recipientId: peerId },
        { senderId: peerId, recipientId: userId },
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await DirectMessage.updateMany(
      { senderId: peerId, recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.json({
      success: true,
      peer,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId, text, attachments } = req.body;

    if (!recipientId || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and message text are required.' });
    }

    if (recipientId.toString() === senderId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found.' });
    }

    // Check if blocked
    if (recipient.security?.blockedUsers?.includes(senderId)) {
      return res.status(403).json({ success: false, message: 'Unable to message this user.' });
    }

    const message = new DirectMessage({
      senderId,
      recipientId,
      text: text.trim(),
      attachments: attachments || [],
      isRead: false,
    });

    await message.save();

    // Create a notification for the recipient
    await Notification.create({
      recipientId,
      senderId,
      type: 'exchange_request',
      title: `New message from @${req.user.username}`,
      message: text.trim().slice(0, 100),
      link: `/messages?peer=${req.user._id}`,
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (err) {
    next(err);
  }
};

exports.markConversationRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { peerId } = req.params;

    await DirectMessage.updateMany(
      { senderId: peerId, recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.json({ success: true, message: 'Conversation marked as read.' });
  } catch (err) {
    next(err);
  }
};
