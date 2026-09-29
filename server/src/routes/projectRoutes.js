const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.post('/', requireAuth, projectController.createProject);
router.get('/', optionalAuth, projectController.getProjects);
router.get('/:projectId', optionalAuth, projectController.getProjectById);
router.put('/:projectId', requireAuth, projectController.updateProject);

module.exports = router;
