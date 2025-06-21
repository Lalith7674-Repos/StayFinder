import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

const ReviewsPage = () => {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    fetchProperty();
    fetchReviews();
    fetchStats();
    if (user) {
      checkCanReview();
    }
  }, [propertyId, currentPage, filterRating]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();
      if (response.ok) {
        setProperty(data);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      const response = await fetch(`/api/reviews/property/${propertyId}?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats/${propertyId}`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await fetch(`/api/reviews/can-review/${propertyId}`, {
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

  const handleReviewSubmit = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    setCanReview(false);
    fetchStats(); // Refresh stats
  };

  const filteredReviews = filterRating > 0 
    ? reviews.filter(review => review.rating === filterRating)
    : reviews;

  const getRatingPercentage = (rating) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return ((stats.ratingDistribution[rating] || 0) / stats.totalReviews * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Property
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reviews for {property?.title}
              </h1>
              <p className="text-gray-600">{property?.location}</p>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              {/* Overall Rating */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                </div>
                <StarRating 
                  rating={stats?.averageRating || 0} 
                  size="lg" 
                  showValue={false}
                />
                <p className="text-gray-600 mt-2">
                  {stats?.totalReviews || 0} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <span className="text-sm text-gray-600 w-8">{rating}</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getRatingPercentage(rating)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {stats?.ratingDistribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>

              {/* Category Averages */}
              {stats?.categoryAverages && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Category Averages</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.categoryAverages).map(([category, rating]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category}
                        </span>
                        <StarRating rating={rating} size="sm" showValue={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Content */}
          <div className="lg:col-span-3">
            {showReviewForm ? (
              <ReviewForm
                propertyId={propertyId}
                bookingId={bookingId}
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <>
                {/* Filter */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(Number(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>All Ratings</option>
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <ReviewCard 
                        key={review._id} 
                        review={review} 
                        showCategoryRatings={true}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                      <p className="text-gray-600">No reviews found.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage; 