const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/:username', optionalAuth, profileController.getProfileByUsername);
router.put('/update', requireAuth, profileController.updateProfile);
router.post('/teaching-skills', requireAuth, profileController.addTeachingSkill);
router.delete('/teaching-skills/:skillId', requireAuth, profileController.removeTeachingSkill);
router.post('/learning-skills', requireAuth, profileController.addLearningSkill);
router.delete('/learning-skills/:skillId', requireAuth, profileController.removeLearningSkill);
router.put('/privacy-settings', requireAuth, profileController.updatePrivacySettings);

module.exports = router;
