import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              StayFinder
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              {isAuthenticated && (
                <>
                  <Link to="/favorites" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Favorites</Link>
                  <Link to="/my-bookings" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Bookings</Link>
                  <Link to="/host" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Properties</Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <Link to="/profile" className="flex items-center space-x-2 group">
                    <span className="text-gray-700 group-hover:text-indigo-600 text-sm font-medium transition-colors">{user.name}</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
          {/* Mobile menu button can be added here */}
        </div>
      </nav>
    </header>
  );
};

export default Header;