import React from 'react';
import StarRating from './StarRating';

const ReviewCard = ({ review, showCategoryRatings = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {review.guest?.profilePicture ? (
              <img
                src={review.guest.profilePicture}
                alt={review.guest.name}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <span>{getInitials(review.guest?.name || 'User')}</span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.guest?.name || 'Anonymous'}</h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm font-medium text-gray-700">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Category Ratings */}
      {showCategoryRatings && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            {review.cleanliness && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cleanliness</span>
                <StarRating rating={review.cleanliness} size="sm" />
              </div>
            )}
            {review.communication && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <StarRating rating={review.communication} size="sm" />
              </div>
            )}
            {review.checkIn && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Check-in</span>
                <StarRating rating={review.checkIn} size="sm" />
              </div>
            )}
            {review.accuracy && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy</span>
                <StarRating rating={review.accuracy} size="sm" />
              </div>
            )}
            {review.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <StarRating rating={review.location} size="sm" />
              </div>
            )}
            {review.value && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Value</span>
                <StarRating rating={review.value} size="sm" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verified Badge */}
      {review.isVerified && (
        <div className="mt-4 flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-600 font-medium">Verified Stay</span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard; 