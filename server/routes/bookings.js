const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBooking,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getUserBookings)
  .post(protect, createBooking);

router.get('/host', protect, authorize('host', 'admin'), getHostBookings);

router.route('/:id')
  .get(protect, getBooking);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

module.exports = router; 