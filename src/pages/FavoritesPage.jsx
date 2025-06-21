import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('/api/favorites');
      if (response.data.success) {
        setFavorites(response.data.data);
      } else {
        setError('Failed to fetch favorites');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRefresh = () => {
    fetchFavorites();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Your Favorite Properties</h1>
              <p className="mt-2 text-lg text-gray-600">The places you love, all in one spot.</p>
            </div>
            {!loading && favorites.length > 0 && (
              <button
                onClick={handleRefresh}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your favorites...</p>
          </div>
        )}

        {error && (
          <div className="text-center bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto border border-gray-100">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet!</h2>
              <p className="text-gray-600 text-lg">
                Start exploring amazing properties and click the heart icon to save the ones you love.
              </p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Properties
            </Link>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage; 