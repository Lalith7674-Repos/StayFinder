const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Add a property to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if it's already favorited
    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });
    if (existingFavorite) {
      return res.status(400).json({ success: false, message: 'Property already in favorites' });
    }

    const favorite = await Favorite.create({
      user: userId,
      property: propertyId
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({ user: userId, property: propertyId });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    // In our setup, the user must be the owner of the favorite. No extra check needed.
    
    await favorite.deleteOne(); // Using deleteOne on the document

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite properties
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ user: userId }).populate({
        path: 'property',
        model: 'Property'
    });

    // Extract just the property details
    const properties = favorites.map(fav => fav.property).filter(p => p != null);

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    next(error);
  }
}; 