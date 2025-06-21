import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeartIcon from './HeartIcon';

const PropertyCard = ({ property }) => {
  const { user, isFavorited, addFavorite, removeFavorite } = useAuth();

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // Prevent navigating to property detail
    e.stopPropagation(); // Stop event bubbling
    
    if (!user) {
      // If user is not logged in, redirect to login
      window.location.href = '/login';
      return;
    }
    
    if (isFavorited(property._id)) {
      await removeFavorite(property._id);
    } else {
      await addFavorite(property._id);
    }
  };

  const imageUrl = property.coverPhoto || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80";

  return (
    <Link to={`/property/${property._id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-100">
        <div className="relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={property.title} 
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80';
            }}
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            aria-label="Toggle Favorite"
          >
            <HeartIcon isFavorited={isFavorited(property._id)} className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 bg-indigo-600 text-white px-3 py-1 text-sm font-bold rounded-tr-lg">
            ₹{property.perNightPrice}/night
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate text-gray-800 mb-1">{property.title}</h3>
          <p className="text-sm text-gray-600 truncate mb-2">{property.location}</p>
          {property.rating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm ml-1 font-semibold text-gray-700">{property.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;