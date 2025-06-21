import React, { useState, useEffect } from 'react';

const backgroundImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
];

const HeroSection = ({
  searchQuery,
  suggestions,
  showSuggestions,
  isSearching,
  isFetchingSuggestions,
  onSearchChange,
  onSuggestionClick,
  onSearch,
  onFocus,
  onBlur,
  onKeyPress
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[500px] bg-gray-900 text-white overflow-hidden">
      {backgroundImages.map((imgUrl, index) => (
        <div
          key={imgUrl}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${imgUrl})`,
            opacity: index === currentImageIndex ? 1 : 0,
            zIndex: 1
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      <div className="relative flex flex-col items-center justify-center h-full z-20 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-center text-shadow">
          Find Your Perfect Stay
        </h1>
        <p className="text-lg sm:text-xl text-center mb-8 text-shadow">
          Discover unique places to stay around the world
        </p>

        {/* Search Bar with Suggestions */}
        <div className="w-full max-w-2xl relative">
          <div className="bg-white rounded-lg shadow-2xl p-2 flex items-center">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={onSearchChange}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyPress={onKeyPress}
              className="flex-1 p-3 border-none focus:outline-none focus:ring-0 text-gray-800"
            />
            <button
              onClick={onSearch}
              disabled={isSearching}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Search'}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (searchQuery.length > 0 || isFetchingSuggestions) && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg mt-1 border-t border-gray-200 z-30">
              {isFetchingSuggestions ? (
                <div className="p-4 text-gray-500">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <div
                    key={s.place_id}
                    onMouseDown={() => onSuggestionClick(s)}
                    className="p-3 cursor-pointer hover:bg-indigo-50 text-gray-800 transition-colors duration-200"
                  >
                    {s.display_name}
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-500">No suggestions found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 