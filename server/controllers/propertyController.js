const Property = require('../models/Property');
const Booking = require('../models/Booking');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { fixPropertyImageUrls } = require('../utils/helpers');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    // Create directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).fields([
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Host
const createProperty = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const {
        title,
        description,
        location,
        coordinates,
        perNightPrice,
        perNightAfterWeekPrice,
        gst,
        amenities
      } = req.body;

      // Validate required fields
      if (!title || !description || !location || !perNightPrice || !perNightAfterWeekPrice || !gst) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }

      if (!req.files || !req.files.coverPhoto) {
        return res.status(400).json({ message: 'Cover photo is required' });
      }

      const parsedCoordinates = JSON.parse(coordinates);
      if (!parsedCoordinates || !parsedCoordinates.lat || !parsedCoordinates.lng) {
        return res.status(400).json({ message: 'Please provide valid coordinates' });
      }

      const parsedAmenities = JSON.parse(amenities);
      if (!parsedAmenities || parsedAmenities.length === 0) {
        return res.status(400).json({ message: 'Please provide at least one amenity' });
      }

      // Get file paths
      const coverPhotoPath = '/uploads/' + req.files.coverPhoto[0].filename;
      const imagePaths = req.files.images 
        ? req.files.images.map(file => '/uploads/' + file.filename)
        : [];

      const property = new Property({
        title,
        description,
        location,
        coordinates: parsedCoordinates,
        perNightPrice: Number(perNightPrice),
        perNightAfterWeekPrice: Number(perNightAfterWeekPrice),
        gst: Number(gst),
        amenities: parsedAmenities,
        coverPhoto: coverPhotoPath,
        images: imagePaths,
        host: req.user._id
      });

      const createdProperty = await property.save();
      res.status(201).json(createdProperty);
    });
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      city,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isActive: true };

    if (minPrice || maxPrice) {
      query.perNightPrice = {};
      if (minPrice) query.perNightPrice.$gte = Number(minPrice);
      if (maxPrice) query.perNightPrice.$lte = Number(maxPrice);
    }
    if (city) query.location = { $regex: city, $options: 'i' };

    const properties = await Property.find(query)
      .populate('host', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Property.countDocuments(query);

    // Fix image URLs for all properties
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const propertiesWithFixedUrls = properties.map(property => 
      fixPropertyImageUrls(property, baseUrl)
    );

    res.json({
      properties: propertiesWithFixedUrls,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name avatar email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Fix image URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const propertyData = fixPropertyImageUrls(property, baseUrl);

    res.json(propertyData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Host
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the host
    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Host
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the host
    if (property.host.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's own properties
// @route   GET /api/properties/my-listings
// @access  Private/Host
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ host: req.user._id })
      .sort({ createdAt: -1 });

    // Fix image URLs for all properties
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const propertiesWithFixedUrls = properties.map(property => 
      fixPropertyImageUrls(property, baseUrl)
    );

    res.json({ properties: propertiesWithFixedUrls });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add review to property
// @route   POST /api/properties/:id/reviews
// @access  Private
const addPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    property.reviews.push(review);

    // Calculate average rating
    property.rating = property.reviews.reduce((acc, item) => item.rating + acc, 0) / property.reviews.length;

    await property.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check property availability
// @route   POST /api/properties/:id/availability
// @access  Public
const checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;
    const propertyId = req.params.id;

    // Validate dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for conflicting bookings (pending or confirmed)
    const conflictingBookings = await Booking.find({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lte: new Date(checkOut) },
          checkOut: { $gte: new Date(checkIn) }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      available: isAvailable,
      message: isAvailable ? 'Property is available for these dates' : 'Property is not available for these dates'
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: 'Error checking availability' });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  addPropertyReview,
  checkAvailability
}; 