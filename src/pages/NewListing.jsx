import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useNavigate, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const DEFAULT_AMENITIES = [
  'WiFi',
  'Pool',
  'Kitchen',
  'Parking',
  'Air Conditioning',
  'TV',
  'Heating',
  'Washer',
  'Dryer',
  'Smoke Alarm',
  'First Aid Kit',
];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const NewListing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    perNightPrice: '',
    perNightAfterWeekPrice: '',
    gst: '',
    images: [],
    coverPhoto: null, // Add cover photo field
  });
  const [error, setError] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default: India center
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapRef = useRef();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  let suggestionTimeout = useRef();

  const handleChange = e => {
    if (e.target.name === 'images') {
      const files = Array.from(e.target.files);
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setError('Please upload only image files');
        return;
      }
      setFormData({ ...formData, images: files });
      setError('');
    } else if (e.target.name === 'coverPhoto') {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Cover photo must be an image file');
        return;
      }

      // Create an image element to check dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Check if image meets minimum dimensions (1200x800)
        if (img.width < 1200 || img.height < 800) {
          setError('Cover photo must be at least 1200x800 pixels');
          URL.revokeObjectURL(objectUrl);
          return;
        }

        // Create a canvas to resize the image if needed
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set desired dimensions (16:9 aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to file
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          setFormData({ ...formData, coverPhoto: resizedFile });
          setError('');
        }, 'image/jpeg', 0.9);

        URL.revokeObjectURL(objectUrl);
      };

      img.onerror = () => {
        setError('Error loading cover photo');
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setError('');
    }
  };

  const handleAmenityChange = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity)) {
      setAmenities([...amenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    setLoadingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
        // Pan map
        if (mapRef.current) {
          mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 13);
        }
      }
    } catch (err) {
      // Optionally handle error
    }
    setLoadingLocation(false);
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lon) => {
    setLoadingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData((prev) => ({ ...prev, location: data.display_name }));
      }
    } catch (err) {
      // Optionally handle error
    }
    setLoadingLocation(false);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=7`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleLocationInput = (e) => {
    setFormData({ ...formData, location: e.target.value });
    setShowSuggestions(true);
    clearTimeout(suggestionTimeout.current);
    const value = e.target.value;
    suggestionTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, location: suggestion.display_name });
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setPosition([lat, lng]);
    setCoordinates({ lat, lng });
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
    setShowSuggestions(false);
  };

  const handleLocationBlur = async () => {
    setShowSuggestions(false);
    if (formData.location && !coordinates.lat) {
      await geocodeAddress(formData.location);
    }
  };

  const handleMapPosition = (pos) => {
    setPosition([pos.lat, pos.lng]);
    setCoordinates({ lat: pos.lat, lng: pos.lng });
    reverseGeocode(pos.lat, pos.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to create a listing');
      return;
    }

    if (!formData.coverPhoto) {
      setError('Please upload a cover photo');
      return;
    }

    if (amenities.length === 0) {
      setError('Please select at least one amenity');
      return;
    }

    // Validate coordinates
    if (!coordinates.lat || !coordinates.lng) {
      setError('Please select a location on the map or enter a valid address');
      return;
    }

    try {
      setError('');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('perNightPrice', formData.perNightPrice);
      formDataToSend.append('perNightAfterWeekPrice', formData.perNightAfterWeekPrice);
      formDataToSend.append('gst', formData.gst);
      formDataToSend.append('amenities', JSON.stringify(amenities));
      formDataToSend.append('coordinates', JSON.stringify(coordinates));
      
      // Append cover photo
      if (formData.coverPhoto) {
        formDataToSend.append('coverPhoto', formData.coverPhoto);
      }
      
      // Append additional images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      alert('Property listed successfully!');
      navigate('/host');
    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 bg-white shadow-sm rounded-lg p-6">
            {/* Cover Photo Upload */}
            <div>
              <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo (Minimum 1200x800 pixels) *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="coverPhoto" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-blue hover:text-sky-blue focus-within:outline-none">
                      <span>Upload a cover photo</span>
                      <input
                        id="coverPhoto"
                        name="coverPhoto"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB (Minimum 1200x800 pixels)</p>
                </div>
              </div>
              {formData.coverPhoto && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Cover photo selected: {formData.coverPhoto.name}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-blue"
                placeholder="Enter property title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-blue"
                rows="4"
                placeholder="Describe your property"
                required
              />
            </div>

            <div>
              <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {DEFAULT_AMENITIES.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      name={`amenity-${amenity}`}
                      checked={amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="mr-2"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  id="custom-amenity"
                  name="custom-amenity"
                  value={customAmenity}
                  onChange={e => setCustomAmenity(e.target.value)}
                  className="p-2 border rounded-md flex-1 mr-2"
                  placeholder="Add custom amenity"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="bg-sky-blue text-white px-3 py-1 rounded-md"
                >
                  Add
                </button>
              </div>
              {amenities.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="mr-2">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-gray-50 border border-sky-blue rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Pricing</h2>
              <div className="mb-2">
                <label htmlFor="perNightPrice" className="block text-sm font-medium text-gray-700 mb-1">Per Night Price (up to 1 week)</label>
                <input
                  type="number"
                  id="perNightPrice"
                  name="perNightPrice"
                  value={formData.perNightPrice}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter per night price"
                  min="1"
                  required
                />
              </div>
              <div className="mb-2">
                <label htmlFor="perNightAfterWeekPrice" className="block text-sm font-medium text-gray-700 mb-1">Per Night Price (after 1 week)</label>
                <input
                  type="number"
                  id="perNightAfterWeekPrice"
                  name="perNightAfterWeekPrice"
                  value={formData.perNightAfterWeekPrice}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter per night price after 1 week"
                  min="1"
                  required
                />
              </div>
              <div>
                <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">GST (%)</label>
                <input
                  type="number"
                  id="gst"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter GST percentage"
                  min="0"
                  max="28"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload up to 5 images (PNG, JPG)
                </p>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationInput}
                  onBlur={handleLocationBlur}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-blue mb-2"
                  placeholder="Enter property address or city"
                  required
                  disabled={loadingLocation}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-56 overflow-y-auto rounded shadow-md mt-1">
                    {suggestions.map((s, idx) => (
                      <li
                        key={s.place_id}
                        className="px-4 py-2 cursor-pointer hover:bg-sky-blue hover:text-white text-sm"
                        onMouseDown={() => handleSuggestionClick(s)}
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                  whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={position} setPosition={handleMapPosition} />
                </MapContainer>
              </div>
              {coordinates.lat && coordinates.lng && (
                <p className="text-xs text-gray-500 mt-1">Selected: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/host')}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-blue text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Create Listing
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewListing; 