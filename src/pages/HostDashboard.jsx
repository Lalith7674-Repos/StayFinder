import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Notification from '../components/Notification';

const HostDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch properties
        const propertiesResponse = await fetch('/api/properties/my-listings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          setProperties(propertiesData.properties);
        }

        // Fetch bookings for host
        const bookingsResponse = await fetch('/api/bookings/host', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      setProperties(properties.filter(property => property._id !== propertyId));
    } catch (err) {
      alert('Failed to delete property: ' + err.message);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      // Update the booking status in the local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'confirmed' }
          : booking
      ));

      setNotification({
        message: 'Booking confirmed successfully!',
        type: 'success'
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      alert('Failed to confirm booking: ' + err.message);
    }
  };

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
      month: 'short',
      day: 'numeric'
    });
  };

  const isPropertyOccupied = (propertyId) => {
    const now = new Date();
    return bookings.some(booking => 
      booking.property._id === propertyId && 
      booking.status === 'confirmed' &&
      new Date(booking.checkIn) <= now && 
      new Date(booking.checkOut) >= now
    );
  };

  // Check for pending bookings and show notification
  useEffect(() => {
    if (bookings.length > 0) {
      const pendingBookings = bookings.filter(booking => booking.status === 'pending');
      if (pendingBookings.length > 0) {
        setNotification({
          message: `You have ${pendingBookings.length} pending booking${pendingBookings.length > 1 ? 's' : ''} to review!`,
          type: 'warning'
        });
      }
    }
  }, [bookings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <p>Please log in to see your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Host Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">Manage your properties and bookings.</p>
          </div>
          <Link
            to="/host/new-listing"
            className="mt-4 sm:mt-0 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            + Add New Property
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              My Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Bookings ({bookings.length})
            </button>
          </nav>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Properties Tab */}
        {!loading && !error && activeTab === 'properties' && (
          <>
            {properties.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">You haven't listed any properties yet.</h2>
                <p className="mt-2 text-gray-500">
                  Ready to start earning? Add your first property now.
                </p>
                <Link 
                  to="/host/new-listing" 
                  className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  List Your Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map(property => (
                  <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Property Image */}
                    <div className="relative h-48">
                      <img 
                        src={property.coverPhoto || (property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80")} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
                        }}
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {isPropertyOccupied(property._id) && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Occupied
                          </span>
                        )}
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-4">{property.location}</p>
                      
                      {/* Pricing Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Per Night (up to 1 week)</span>
                          <span className="font-semibold text-gray-900">₹{property.perNightPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Per Night (after 1 week)</span>
                          <span className="font-semibold text-gray-900">₹{property.perNightAfterWeekPrice}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">GST</span>
                          <span className="font-semibold text-gray-900">{property.gst}%</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Link
                          to={`/host/edit-listing/${property._id}`}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bookings Tab */}
        {!loading && !error && activeTab === 'bookings' && (
          <>
            {bookings.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">No bookings yet!</h2>
                <p className="mt-2 text-gray-500">
                  When guests book your properties, they'll appear here.
                </p>
              </div>
            ) : (
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

                        {/* Guest Information */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Guest Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span> {booking.guest?.name || 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span> {booking.guest?.email || 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span> {booking.guest?.phone || 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-500">Guests:</span> {booking.numberOfGuests}
                            </div>
                          </div>
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
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-semibold text-gray-900">₹{booking.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <Link
                            to={`/property/${booking.property?._id}`}
                            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center"
                          >
                            View Property
                          </Link>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmBooking(booking._id)}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              Confirm Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HostDashboard;