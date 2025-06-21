const express = require('express');
const {
  addFavorite,
  removeFavorite,
  getFavorites
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(addFavorite)
  .get(getFavorites);

router.route('/:propertyId')
  .delete(removeFavorite);

module.exports = router; 