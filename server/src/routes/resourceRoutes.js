const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/upload', requireAuth, upload.single('file'), resourceController.uploadResource);
router.get('/studio/:studioId', requireAuth, resourceController.getStudioResources);
router.get('/:resourceId/download', requireAuth, resourceController.downloadResource);
router.delete('/:resourceId', requireAuth, resourceController.deleteResource);

module.exports = router;
