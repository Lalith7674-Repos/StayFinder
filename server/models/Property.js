const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  perNightPrice: {
    type: Number,
    required: [true, 'Please provide per night price (up to 1 week)']
  },
  perNightAfterWeekPrice: {
    type: Number,
    required: [true, 'Please provide per night price (after 1 week)']
  },
  gst: {
    type: Number,
    required: [true, 'Please provide GST percentage']
  },
  amenities: [{
    type: String
  }],
  coverPhoto: {
    type: String,
    required: [true, 'Please provide a cover photo']
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for location-based queries
propertySchema.index({ coordinates: '2dsphere' });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 