const Review = require('../models/Review');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment, cleanliness, communication, checkIn, accuracy, location, value } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review properties you have booked' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review completed bookings' });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Create review
    const review = new Review({
      property: propertyId,
      guest: req.user._id,
      host: property.host,
      booking: bookingId,
      rating,
      comment,
      cleanliness,
      communication,
      checkIn,
      accuracy,
      location,
      value,
      isVerified: true
    });

    await review.save();

    // Update property rating
    const allReviews = await Review.find({ property: propertyId });
    const avgRating = allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length;
    
    await Property.findByIdAndUpdate(propertyId, { rating: avgRating });

    // Populate review with user details
    const populatedReview = await Review.findById(review._id)
      .populate('guest', 'name profilePicture')
      .populate('host', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ property: propertyId })
      .populate('guest', 'name profilePicture')
      .populate('host', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Review.countDocuments({ property: propertyId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check if user can review a property
// @route   GET /api/reviews/can-review/:propertyId
// @access  Private
const canReviewProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find completed bookings for this user and property
    const bookings = await Booking.find({
      property: propertyId,
      guest: req.user._id,
      status: 'completed'
    });

    if (bookings.length === 0) {
      return res.json({ canReview: false, message: 'You need to complete a booking to review this property' });
    }

    // Check if user has already reviewed any of these bookings
    const reviewedBookings = await Review.find({
      booking: { $in: bookings.map(b => b._id) }
    });

    if (reviewedBookings.length > 0) {
      return res.json({ canReview: false, message: 'You have already reviewed this property' });
    }

    // Return the first booking that can be reviewed
    res.json({ 
      canReview: true, 
      bookingId: bookings[0]._id,
      booking: bookings[0]
    });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get review statistics for a property
// @route   GET /api/reviews/stats/:propertyId
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({ property: propertyId });
    
    if (reviews.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {
          cleanliness: 0,
          communication: 0,
          checkIn: 0,
          accuracy: 0,
          location: 0,
          value: 0
        }
      });
    }

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Calculate category averages
    const categoryAverages = {
      cleanliness: reviews.filter(r => r.cleanliness).reduce((acc, r) => acc + r.cleanliness, 0) / reviews.filter(r => r.cleanliness).length || 0,
      communication: reviews.filter(r => r.communication).reduce((acc, r) => acc + r.communication, 0) / reviews.filter(r => r.communication).length || 0,
      checkIn: reviews.filter(r => r.checkIn).reduce((acc, r) => acc + r.checkIn, 0) / reviews.filter(r => r.checkIn).length || 0,
      accuracy: reviews.filter(r => r.accuracy).reduce((acc, r) => acc + r.accuracy, 0) / reviews.filter(r => r.accuracy).length || 0,
      location: reviews.filter(r => r.location).reduce((acc, r) => acc + r.location, 0) / reviews.filter(r => r.location).length || 0,
      value: reviews.filter(r => r.value).reduce((acc, r) => acc + r.value, 0) / reviews.filter(r => r.value).length || 0
    };

    res.json({
      totalReviews: reviews.length,
      averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
      ratingDistribution,
      categoryAverages
    });
  } catch (error) {
    console.error('Review stats error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  canReviewProperty,
  getReviewStats
}; 