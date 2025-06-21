import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({ propertyId, bookingId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    cleanliness: 0,
    communication: 0,
    checkIn: 0,
    accuracy: 0,
    location: 0,
    value: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRatingChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: value
    }));
    
    // Clear error for this category
    if (errors[category]) {
      setErrors(prev => ({
        ...prev,
        [category]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.rating) newErrors.rating = 'Overall rating is required';
    if (!formData.comment.trim()) newErrors.comment = 'Review comment is required';
    if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          propertyId,
          bookingId,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      onSubmit(data);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'communication', label: 'Communication' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h2>
        <p className="text-gray-600">Share your experience with this property</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Overall Rating *
          </label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(value) => handleRatingChange('rating', value)}
            size="xl"
            interactive={true}
            showValue={true}
          />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Category Ratings */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Category Ratings
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">{category.label}</span>
                <StarRating
                  rating={formData[category.key]}
                  onRatingChange={(value) => handleRatingChange(category.key, value)}
                  size="md"
                  interactive={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="comment" className="block text-lg font-semibold text-gray-900 mb-3">
            Your Review *
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, comment: e.target.value }));
              if (errors.comment) {
                setErrors(prev => ({ ...prev, comment: null }));
              }
            }}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Share your experience with this property..."
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.rating || !formData.comment.trim()}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 