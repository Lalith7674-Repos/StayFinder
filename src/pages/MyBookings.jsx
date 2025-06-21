import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : (data.bookings || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <p>Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center">My Bookings</h1>
          <p className="mt-2 text-lg text-gray-600 text-center">All your property reservations in one place.</p>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">No bookings yet!</h2>
            <p className="mt-2 text-gray-500">
              Start exploring properties and make your first booking.
            </p>
            <Link 
              to="/" 
              className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="md:flex">
                  {/* Property Image */}
                  <div className="md:w-1/3">
                    <div className="h-48 md:h-full">
                      <img 
                        src={booking.property?.coverPhoto || (booking.property?.images && booking.property.images.length > 0 ? booking.property.images[0] : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80")} 
                        alt={booking.property?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
                        }}
                      />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.property?.title}</h3>
                        <p className="text-gray-600">{booking.property?.location}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status || 'Pending'}
                      </span>
                    </div>

                    {/* Booking Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-semibold text-gray-900">{formatDate(booking.checkOut)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Number of Guests</p>
                        <p className="font-semibold text-gray-900">{booking.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold text-gray-900">₹{booking.totalPrice}</p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Payment Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Special Requests</h4>
                        <p className="text-sm text-gray-700">{booking.specialRequests}</p>
                      </div>
                    )}

                    {/* Guest Details */}
                    {booking.guestDetails && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Guest Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span> {booking.guestDetails.name}
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span> {booking.guestDetails.email}
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span> {booking.guestDetails.phone}
                          </div>
                          <div>
                            <span className="text-gray-500">Address:</span> {booking.guestDetails.address}
                          </div>
                          {booking.guestDetails.idType && booking.guestDetails.idNumber && (
                            <div className="md:col-span-2">
                              <span className="text-gray-500">ID:</span> {booking.guestDetails.idType} - {booking.guestDetails.idNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/property/${booking.property?._id}`}
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                      >
                        View Property
                      </Link>
                      {booking.status?.toLowerCase() === 'pending' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                              // Add cancel booking functionality here
                              alert('Cancel booking functionality will be implemented');
                            }
                          }}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings; 