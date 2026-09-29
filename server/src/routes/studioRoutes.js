const express = require('express');
const router = express.Router();
const studioController = require('../controllers/studioController');
const { requireAuth } = require('../middleware/auth');

router.get('/:studioId', requireAuth, studioController.getStudioById);
router.put('/:studioId/settings', requireAuth, studioController.updateSessionSettings);
router.put('/:studioId/whiteboard', requireAuth, studioController.saveWhiteboardData);
router.put('/:studioId/code', requireAuth, studioController.saveCodeSpaceData);
router.put('/:studioId/end', requireAuth, studioController.endStudioSession);

module.exports = router;
