const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  cleanliness: { type: Number, min: 1, max: 5 },
  communication: { type: Number, min: 1, max: 5 },
  checkIn: { type: Number, min: 1, max: 5 },
  accuracy: { type: Number, min: 1, max: 5 },
  location: { type: Number, min: 1, max: 5 },
  value: { type: Number, min: 1, max: 5 },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema); 