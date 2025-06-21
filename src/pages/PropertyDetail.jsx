import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeartIcon from '../components/HeartIcon';
import ReviewSlider from '../components/ReviewSlider';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyDetail = () => {
  const { id } = useParams();
  const { user, isFavorited, addFavorite, removeFavorite } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const navigate = useNavigate();

  // Calculate nights
  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  useEffect(() => {
    if (!property) return;
    const nights = getNights();
    let base = 0;
    if (nights > 7) {
      base = property.perNightPrice * 7 + property.perNightAfterWeekPrice * (nights - 7);
    } else {
      base = property.perNightPrice * nights;
    }
    const gstAmount = (base * property.gst) / 100;
    setTotal(base + gstAmount);
  }, [checkIn, checkOut, property]);

  const handleReserve = async () => {
    if (!user) {
      alert('Please log in to book this property');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Check availability before proceeding
    try {
      const availabilityResponse = await fetch(`/api/properties/${property._id}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn,
          checkOut
        }),
      });

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json();
        alert(errorData.message || 'Property is not available for these dates');
        return;
      }

      const availabilityData = await availabilityResponse.json();
      if (!availabilityData.available) {
        alert('Property is not available for the selected dates. Please choose different dates.');
        return;
      }

      // If available, proceed with booking
      const bookingDetails = {
        property,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        total
      };

      navigate('/confirm-booking', { state: { bookingDetails } });
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Error checking availability. Please try again.');
    }
  };

  const handleFavoriteClick = async () => {
    if (isFavorited(property._id)) {
      await removeFavorite(property._id);
    } else {
      await addFavorite(property._id);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch property');
        }
        // No need to fix image URLs here, backend already returns correct URLs
        setProperty(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch property details');
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/property/${id}?limit=6`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchReviewStats = async () => {
      try {
        const response = await fetch(`/api/reviews/stats/${id}`);
        const data = await response.json();
        if (response.ok) {
          setReviewStats(data);
        }
      } catch (error) {
        console.error('Error fetching review stats:', error);
      }
    };

    const checkCanReview = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/reviews/can-review/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setCanReview(data.canReview);
          if (data.canReview) {
            setBookingId(data.bookingId);
          }
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };

    fetchProperty();
    fetchReviews();
    fetchReviewStats();
    checkCanReview();
  }, [id, user]);

  const handleReviewSubmit = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    setCanReview(false);
    // Refresh review stats
    fetch(`/api/reviews/stats/${id}`)
      .then(res => res.json())
      .then(data => setReviewStats(data))
      .catch(error => console.error('Error refreshing stats:', error));
  };

  const handleViewAllReviews = () => {
    navigate(`/property/${id}/reviews`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

  // Default coordinates if not available
  const defaultLat = 19.076;
  const defaultLng = 72.8777;
  const latitude = property.coordinates?.lat || property.latitude || defaultLat;
  const longitude = property.coordinates?.lng || property.longitude || defaultLng;

  // Helper to get the main image for the gallery
  const getMainImage = () => {
    if (selectedImage === 0) {
      return property.coverPhoto || '';
    }
    if (property.images && property.images.length > 0) {
      return property.images[selectedImage - 1] || '';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Image Gallery */}
        <div className="mb-12">
          <div className="relative h-[500px] rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img 
              src={getMainImage()} 
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* Cover photo thumbnail */}
            <button
              type="button"
              onClick={() => setSelectedImage(0)}
              className={`relative h-24 rounded-xl overflow-hidden transition-all duration-200 ${
                selectedImage === 0 ? 'ring-2 ring-indigo-500' : 'hover:opacity-80'
              }`}
            >
              <img 
                src={property.coverPhoto || ''} 
                alt={`${property.title} cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
                }}
              />
            </button>
            {/* Additional images thumbnails */}
            {property.images && property.images.map((image, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setSelectedImage(index + 1)}
                className={`relative h-24 rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedImage === index + 1 ? 'ring-2 ring-indigo-500' : 'hover:opacity-80'
                }`}
              >
                <img 
                  src={image || ''} 
                  alt={`${property.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-xl text-gray-600">{property.location}</p>
                {/* Rating Display */}
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center mt-2">
                    <StarRating rating={reviewStats.averageRating} size="sm" showValue={true} />
                    <span className="text-gray-600 ml-2">({reviewStats.totalReviews} reviews)</span>
                  </div>
                )}
              </div>
              {user && (
                <button
                  onClick={handleFavoriteClick}
                  className="bg-white rounded-full p-4 text-red-500 hover:text-red-600 transition-colors border border-gray-200 hover:border-red-300 shadow-lg hover:shadow-xl"
                  aria-label="Toggle Favorite"
                >
                  <HeartIcon isFavorited={isFavorited(property._id)} className="w-6 h-6" />
                </button>
              )}
            </div>
            
            {/* Host Information */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <img 
                  src={property.host?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80'} 
                  alt={property.host?.name || 'Host'}
                  className="w-16 h-16 rounded-full mr-4 border-2 border-indigo-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
                  }}
                />
                <div>
                  <p className="text-lg font-semibold text-gray-900">Hosted by {property.host?.name || 'Host'}</p>
                  <p className="text-gray-600">Superhost • Professional</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About this place</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="mr-3 text-indigo-600 text-lg">✓</span>
                      <span className="text-gray-700 font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100">
              {showReviewForm ? (
                <ReviewForm
                  propertyId={property._id}
                  bookingId={bookingId}
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
                      {reviewStats && (
                        <div className="flex items-center mt-2">
                          <StarRating rating={reviewStats.averageRating} size="md" showValue={true} />
                          <span className="text-gray-600 ml-2">({reviewStats.totalReviews} reviews)</span>
                        </div>
                      )}
                    </div>
                    {canReview && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                  
                  <ReviewSlider 
                    reviews={reviews} 
                    showViewAll={reviews.length > 3}
                    onViewAll={handleViewAllReviews}
                  />
                </>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
              <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
                <MapContainer 
                  center={[latitude, longitude]} 
                  zoom={13} 
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-between items-baseline mb-6">
                <p className="text-3xl font-bold text-gray-900">₹{property.perNightPrice}</p>
                <span className="text-gray-600 text-lg">/ night</span>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="check-in" className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                    <input 
                      type="date" 
                      id="check-in" 
                      value={checkIn} 
                      onChange={e => setCheckIn(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="check-out" className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                    <input 
                      type="date" 
                      id="check-out" 
                      value={checkOut} 
                      onChange={e => setCheckOut(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="guests" className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                  <input 
                    type="number" 
                    id="guests" 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)} 
                    min="1" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {user && user._id === property.host._id ? (
                <div className="text-center bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <p className="font-semibold text-gray-700 mb-2">You cannot book your own property</p>
                  <p className="text-sm text-gray-500">This is one of your listings</p>
                </div>
              ) : (
                <button
                  onClick={handleReserve}
                  disabled={!checkIn || !checkOut}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Reserve
                </button>
              )}
              
              <div className="space-y-3 mt-6 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">₹{property.perNightPrice} x {getNights()} nights</span>
                  <span className="font-semibold">₹{property.perNightPrice * getNights()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">GST ({property.gst}%)</span>
                  <span className="font-semibold">₹{((property.perNightPrice * getNights() * property.gst) / 100).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail; 