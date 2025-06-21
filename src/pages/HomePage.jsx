import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import PropertyCard from '../components/PropertyCard';
import HeroSection from '../components/HeroSection';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  let suggestionTimeout = useRef();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch listings');
        const data = await response.json();
        const properties = Array.isArray(data.properties) ? data.properties : [];
        setListings(properties);
        setAllListings(properties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Fetch location suggestions from Nominatim API
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      setSuggestions([]); // Clear suggestions on error
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    clearTimeout(suggestionTimeout.current);
    suggestionTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // Debounce API call
  };

  const performSearch = async (city) => {
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const response = await fetch(`/api/properties?city=${encodeURIComponent(city)}`);
      if (!response.ok) throw new Error('Failed to search listings');
      const data = await response.json();
      setListings(Array.isArray(data.properties) ? data.properties : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.display_name.split(',')[0];
    setSearchQuery(city);
    performSearch(city);
  };
  
  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchButtonClick();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setListings(allListings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <HeroSection 
        searchQuery={searchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        isSearching={isSearching}
        isFetchingSuggestions={isFetchingSuggestions}
        onSearchChange={handleSearchInputChange}
        onSuggestionClick={handleSuggestionClick}
        onSearch={handleSearchButtonClick}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyPress={handleKeyPress}
      />

      {/* Listings Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {searchQuery && !isSearching ? `Properties in "${searchQuery}"` : "Explore Properties"}
          </h2>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              &larr; Back to all properties
            </button>
          )}
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {listings.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties available.</p>
            {searchQuery && <p className="text-gray-500 mt-2">Try searching for a different location.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;