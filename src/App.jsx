import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HostDashboard from './pages/HostDashboard';
import NewListing from './pages/NewListing';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import PropertyDetail from './pages/PropertyDetail';
import ReviewsPage from './pages/ReviewsPage';
import FavoritesPage from './pages/FavoritesPage';
import MyBookings from './pages/MyBookings';
import BookingConfirmation from './pages/BookingConfirmation';
import Notification from './components/Notification';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { notification } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/host/new-listing" element={<NewListing />} />
        <Route path="/host/edit-listing/:id" element={<EditListing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:propertyId/reviews" element={<ReviewsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/confirm-booking" element={<BookingConfirmation />} />
      </Routes>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => {}}
        />
      )}
    </>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;