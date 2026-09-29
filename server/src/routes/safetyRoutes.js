const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { requireAuth } = require('../middleware/auth');

router.post('/block', requireAuth, safetyController.blockUser);
router.post('/unblock', requireAuth, safetyController.unblockUser);
router.get('/blocked', requireAuth, safetyController.getBlockedUsers);
router.post('/report', requireAuth, safetyController.createReport);
router.get('/notifications', requireAuth, safetyController.getNotifications);
router.put('/notifications/:notificationId/read', requireAuth, safetyController.markNotificationRead);
router.put('/notifications/read-all', requireAuth, safetyController.markAllNotificationsRead);

module.exports = router;
