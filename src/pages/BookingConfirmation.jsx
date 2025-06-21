import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const BookingConfirmation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract booking details from navigation state
  const { bookingDetails } = location.state || {};

  const [guestDetails, setGuestDetails] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: '',
    address: '',
    govId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setGuestDetails({ ...guestDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the actual booking in the database
      const bookingData = {
        propertyId: bookingDetails.property._id,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        numberOfGuests: bookingDetails.guests,
        totalPrice: bookingDetails.total,
        guestDetails: guestDetails
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const createdBooking = await response.json();
      
      // Show success message
      alert('Booking confirmed successfully! You can view your booking in the "My Bookings" section.');
      navigate('/my-bookings'); // Redirect to bookings page
      
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No booking details found. Please start the booking process again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Booking</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Guest Details Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Guest Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" id="name" value={guestDetails.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" id="email" value={guestDetails.email} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" name="phone" id="phone" value={guestDetails.phone} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" id="address" value={guestDetails.address} onChange={handleChange} required rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
              </div>
              <div>
                <label htmlFor="govId" className="block text-sm font-medium text-gray-700">Government ID (e.g., Aadhar, Passport)</label>
                <input type="text" name="govId" id="govId" value={guestDetails.govId} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"/>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {loading ? 'Confirming...' : 'Confirm & Finalize Booking'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </div>

          {/* Booking Summary */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Booking Summary</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{bookingDetails.property.title}</h3>
                <p className="text-sm text-gray-600">{bookingDetails.property.location}</p>
              </div>
              <div className="border-t pt-4">
                <p><strong>Check-in:</strong> {new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> {new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> {bookingDetails.guests}</p>
              </div>
              <div className="border-t pt-4 font-bold text-lg">
                <p className="flex justify-between">
                  <span>Total Price:</span>
                  <span>₹{bookingDetails.total.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 