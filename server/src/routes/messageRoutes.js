const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

router.get('/conversations', requireAuth, messageController.getConversations);
router.get('/:peerId', requireAuth, messageController.getMessagesWithPeer);
router.post('/send', requireAuth, messageController.sendMessage);
router.post('/', requireAuth, messageController.sendMessage);
router.put('/:peerId/read', requireAuth, messageController.markConversationRead);

module.exports = router;
