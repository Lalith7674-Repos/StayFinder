const express = require('express');
const router = express.Router();
const {
  createReview,
  getPropertyReviews,
  canReviewProperty,
  getReviewStats
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/property/:propertyId', getPropertyReviews);
router.get('/stats/:propertyId', getReviewStats);

// Protected routes
router.post('/', protect, createReview);
router.get('/can-review/:propertyId', protect, canReviewProperty);

module.exports = router; 