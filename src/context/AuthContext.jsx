import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { safeParseUser } from '../utils/helpers';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsedUser = safeParseUser(userData);
        if (parsedUser) {
          setUser(parsedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await fetchFavorites();
        } else {
          logout();
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data);
      setError(null);
      await fetchFavorites();
      showNotification('Successfully logged in!');
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { 
        name, 
        username: name.toLowerCase().replace(/\s+/g, ''), // Use name as username
        email, 
        password 
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data);
      setError(null);
      showNotification('Successfully registered!');
      // No need to fetch favorites for a new user, they won't have any
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setFavorites([]);
    showNotification('Successfully logged out!');
    navigate('/');
  };

  const fetchFavorites = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await axios.get('/api/favorites');
      if (res.data.success) {
        const favoritePropertyIds = res.data.data.map(favProperty => favProperty._id);
        setFavorites(favoritePropertyIds);
      }
    } catch (err) {
      console.error('Failed to fetch favorites', err);
      // Silently fail is okay here, user might not be logged in or session expired
    }
  };

  const addFavorite = async (propertyId) => {
    try {
      await axios.post('/api/favorites', { propertyId });
      setFavorites(prev => [...prev, propertyId]);
      showNotification('Added to favorites!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to add favorite', err);
      showNotification('Failed to add to favorites', 'error');
      return false;
    }
  };

  const removeFavorite = async (propertyId) => {
    try {
      await axios.delete(`/api/favorites/${propertyId}`);
      setFavorites(prev => prev.filter(id => id !== propertyId));
      showNotification('Removed from favorites!', 'success');
      return true;
    } catch (err) {
      console.error('Failed to remove favorite', err);
      showNotification('Failed to remove from favorites', 'error');
      return false;
    }
  };

  const isFavorited = (propertyId) => {
    return favorites.includes(propertyId);
  };

  const updateUser = async (userData) => {
    try {
      const res = await axios.put('/api/auth/profile', userData);
      const updatedUser = res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setError(null);
      showNotification('Profile updated successfully!');
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        favorites,
        notification,
        login,
        logout,
        register,
        setUser,
        updateUser,
        addFavorite,
        removeFavorite,
        isFavorited,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 