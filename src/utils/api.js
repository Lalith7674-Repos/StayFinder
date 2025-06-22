const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Helper functions for common API operations
export const api = {
  // Auth endpoints
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Property endpoints
  getProperties: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/properties?${queryString}`);
  },
  
  getProperty: (id) => apiCall(`/properties/${id}`),
  
  createProperty: (formData) => apiCall('/properties', {
    method: 'POST',
    body: formData,
    headers: {} // Let browser set Content-Type for FormData
  }),
  
  updateProperty: (id, data) => apiCall(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  deleteProperty: (id) => apiCall(`/properties/${id}`, {
    method: 'DELETE'
  }),
  
  getMyProperties: () => apiCall('/properties/my-listings'),
  
  // Booking endpoints
  createBooking: (bookingData) => apiCall('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  
  getMyBookings: () => apiCall('/bookings/my-bookings'),
  
  // Review endpoints
  addReview: (propertyId, reviewData) => apiCall(`/properties/${propertyId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  
  getPropertyReviews: (propertyId) => apiCall(`/properties/${propertyId}/reviews`),
  
  // Favorite endpoints
  addToFavorites: (propertyId) => apiCall('/favorites', {
    method: 'POST',
    body: JSON.stringify({ propertyId })
  }),
  
  removeFromFavorites: (propertyId) => apiCall(`/favorites/${propertyId}`, {
    method: 'DELETE'
  }),
  
  getFavorites: () => apiCall('/favorites'),
  
  // Payment endpoints
  createPaymentIntent: (bookingData) => apiCall('/payments/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  
  confirmPayment: (paymentData) => apiCall('/payments/confirm', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
};

export default api; 