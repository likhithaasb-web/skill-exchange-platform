const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.get('/check-username', authController.checkUsername);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.put('/onboarding', requireAuth, authController.saveOnboarding);
router.put('/appearance', requireAuth, authController.updateAppearance);
router.put('/change-password', requireAuth, authController.changePassword);
router.post('/logout-session', requireAuth, authController.logoutSession);

module.exports = router;
