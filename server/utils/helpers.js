// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Calculate number of nights between two dates
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate total price based on nights and price per night
const calculateTotalPrice = (pricePerNight, nights) => {
  return pricePerNight * nights;
};

// Generate random string for file names
const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// Utility function to fix image URLs
const fixImageUrl = (url, baseUrl) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  // Remove any leading slashes and ensure proper path
  let cleanPath = url.replace(/^\/+/, '');
  
  // If it's already a full path starting with uploads, use it as is
  if (cleanPath.startsWith('uploads/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Otherwise, assume it's a filename and add uploads/ prefix
  return `${baseUrl}/uploads/${cleanPath}`;
};

// Utility function to fix image URLs for a property object
const fixPropertyImageUrls = (property, baseUrl) => {
  const propertyData = property.toObject ? property.toObject() : { ...property };
  
  if (propertyData.coverPhoto) {
    propertyData.coverPhoto = fixImageUrl(propertyData.coverPhoto, baseUrl);
  }
  
  if (propertyData.images && propertyData.images.length > 0) {
    propertyData.images = propertyData.images.map(image => fixImageUrl(image, baseUrl));
  }
  
  return propertyData;
};

module.exports = {
  formatDate,
  calculateNights,
  calculateTotalPrice,
  generateRandomString,
  isValidEmail,
  formatCurrency,
  calculateAverageRating,
  fixImageUrl,
  fixPropertyImageUrls
}; 