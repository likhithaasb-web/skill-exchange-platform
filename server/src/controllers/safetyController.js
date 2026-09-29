const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

exports.blockUser = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required.' });
    }

    if (targetUserId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself.' });
    }

    const user = await User.findById(userId);
    if (!user.security.blockedUsers.includes(targetUserId)) {
      user.security.blockedUsers.push(targetUserId);
      await user.save();
    }

    return res.json({
      success: true,
      message: 'User has been blocked. They can no longer interact or view your profile.'
    });
  } catch (err) {
    next(err);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.security.blockedUsers = user.security.blockedUsers.filter(id => id.toString() !== targetUserId.toString());
    await user.save();

    return res.json({
      success: true,
      message: 'User has been unblocked.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('security.blockedUsers', 'username displayName avatar');
    return res.json({
      success: true,
      blockedUsers: user.security.blockedUsers
    });
  } catch (err) {
    next(err);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details, targetDetails } = req.body;
    const reporterId = req.user._id;

    if (!targetType || !targetId || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target ID, reason, and details are required.'
      });
    }

    const report = new Report({
      reporterId,
      targetType,
      targetId,
      targetDetails: targetDetails || {},
      reason,
      details: details.trim(),
      status: 'pending'
    });

    await report.save();

    return res.status(201).json({
      success: true,
      message: 'Your report has been securely submitted to platform safety. We will review it promptly.',
      reportId: report._id
    });
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, isRead: false });

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: req.user._id },
      { isRead: true }
    );

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
