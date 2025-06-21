// Safe function to parse user data from localStorage
export function safeParseUser(userData) {
  try {
    if (!userData || userData === 'undefined') return null;
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

// Helper function to fix property image URLs (for backend use)
export function fixPropertyImageUrls(property, baseUrl) {
  const propertyObj = property.toObject ? property.toObject() : { ...property };
  
  if (propertyObj.coverPhoto) {
    propertyObj.coverPhoto = `${baseUrl}${propertyObj.coverPhoto}`;
  }
  
  if (propertyObj.images && propertyObj.images.length > 0) {
    propertyObj.images = propertyObj.images.map(img => `${baseUrl}${img}`);
  }
  
  return propertyObj;
} 