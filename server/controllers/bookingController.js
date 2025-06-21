const Booking = require('../models/Booking');
const Property = require('../models/Property');

// Helper function to check property availability
const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const conflictingBookings = await Booking.find({
    property: propertyId,
    status: { $in: ['pending', 'confirmed'] }, // Check both pending and confirmed bookings
    $or: [
      {
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn }
      }
    ]
  });

  return conflictingBookings.length === 0;
};

// Helper function to mark completed bookings
const markCompletedBookings = async (bookings) => {
  const today = new Date();
  const updatedBookings = [];

  for (const booking of bookings) {
    if (booking.status === 'confirmed' && new Date(booking.checkOut) < today) {
      booking.status = 'completed';
      await booking.save();
      updatedBookings.push(booking);
    } else {
      updatedBookings.push(booking);
    }
  }

  return updatedBookings;
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, numberOfGuests, totalPrice, guestDetails } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if dates are available
    const isAvailable = await checkAvailability(propertyId, checkIn, checkOut);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Property is not available for these dates' });
    }

    // Create booking with all details
    const booking = new Booking({
      property: propertyId,
      guest: req.user._id,
      host: property.host,
      checkIn,
      checkOut,
      numberOfGuests,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: guestDetails.address || '',
      // Store guest details in a structured way
      guestDetails: {
        name: guestDetails.name,
        email: guestDetails.email,
        phone: guestDetails.phone,
        address: guestDetails.address,
        idType: guestDetails.govId ? 'Government ID' : '',
        idNumber: guestDetails.govId || ''
      }
    });

    const createdBooking = await booking.save();
    
    // Populate the booking with property and guest details for response
    const populatedBooking = await Booking.findById(createdBooking._id)
      .populate('property', 'title images location')
      .populate('guest', 'name email phone')
      .populate('host', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('property', 'title images location')
      .populate('host', 'name email')
      .sort({ createdAt: -1 });

    // Mark completed bookings
    const updatedBookings = await markCompletedBookings(bookings);

    res.json(updatedBookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get host bookings
// @route   GET /api/bookings/host
// @access  Private/Host
const getHostBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('property', 'title images location')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 });

    // Mark completed bookings
    const updatedBookings = await markCompletedBookings(bookings);

    res.json(updatedBookings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location')
      .populate('host', 'name email phone')
      .populate('guest', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is either the guest or host
    if (booking.guest._id.toString() !== req.user._id.toString() && 
        booking.host._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location')
      .populate('guest', 'name email phone')
      .populate('host', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is either the guest or host
    if (booking.guest._id.toString() !== req.user._id.toString() && 
        booking.host._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.json(updatedBooking);
  } catch (error) {
    console.error('Booking status update error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getHostBookings,
  getBooking,
  updateBookingStatus
}; 