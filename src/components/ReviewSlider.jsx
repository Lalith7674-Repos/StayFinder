import React, { useState, useRef, useEffect } from 'react';
import ReviewCard from './ReviewCard';

const ReviewSlider = ({ reviews, showViewAll = true, onViewAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);

  const reviewsPerView = 3;
  const totalSlides = Math.ceil(reviews.length / reviewsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getCurrentReviews = () => {
    const startIndex = currentIndex * reviewsPerView;
    return reviews.slice(startIndex, startIndex + reviewsPerView);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Be the first to review this property!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
          <p className="text-gray-600">{reviews.length} reviews</p>
        </div>
        {showViewAll && reviews.length > reviewsPerView && (
          <button
            onClick={onViewAll}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View all reviews →
          </button>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalSlides }, (_, slideIndex) => (
            <div
              key={slideIndex}
              className="flex space-x-6 min-w-full"
            >
              {reviews
                .slice(slideIndex * reviewsPerView, (slideIndex + 1) * reviewsPerView)
                .map((review, index) => (
                  <div key={review._id || index} className="flex-1">
                    <ReviewCard review={review} />
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 z-10"
              aria-label="Previous reviews"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 z-10"
              aria-label="Next reviews"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-indigo-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSlider; 