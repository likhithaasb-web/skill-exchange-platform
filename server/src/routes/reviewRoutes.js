const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.post('/', requireAuth, reviewController.submitReview);
router.get('/user/:userId', optionalAuth, reviewController.getReviewsForUser);

module.exports = router;
