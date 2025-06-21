const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  addPropertyReview,
  checkAvailability
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProperties)
  .post(protect, authorize('host', 'admin'), createProperty);

router.route('/my-listings')
  .get(protect, authorize('host', 'admin'), getMyProperties);

router.route('/:id')
  .get(getProperty)
  .put(protect, authorize('host', 'admin'), updateProperty)
  .delete(protect, authorize('host', 'admin'), deleteProperty);

router.route('/:id/availability')
  .post(checkAvailability);

router.route('/:id/reviews')
  .post(protect, addPropertyReview);

module.exports = router; 