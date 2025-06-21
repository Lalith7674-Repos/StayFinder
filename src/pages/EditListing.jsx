import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    perNightPrice: '',
    perNightAfterWeekPrice: '',
    gst: '',
    coverPhoto: '',
    images: []
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        
        const data = await response.json();
        setProperty(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          location: data.location || '',
          perNightPrice: data.perNightPrice || '',
          perNightAfterWeekPrice: data.perNightAfterWeekPrice || '',
          gst: data.gst || '',
          coverPhoto: data.coverPhoto || '',
          images: data.images || []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }

      navigate('/host');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <p>Please log in to edit properties.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/host')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Edit Property</h1>
                <p className="mt-2 text-gray-500">Update your property details and pricing.</p>
              </div>
              <button
                onClick={() => navigate('/host')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to My Properties
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Property Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter property title"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe your property..."
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter property location"
                  />
                </div>

                {/* Per Night Price */}
                <div>
                  <label htmlFor="perNightPrice" className="block text-sm font-medium text-gray-700">Per Night Price (₹)</label>
                  <input
                    type="number"
                    id="perNightPrice"
                    name="perNightPrice"
                    value={formData.perNightPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>

                {/* Per Night After Week Price */}
                <div>
                  <label htmlFor="perNightAfterWeekPrice" className="block text-sm font-medium text-gray-700">Per Night After Week (₹)</label>
                  <input
                    type="number"
                    id="perNightAfterWeekPrice"
                    name="perNightAfterWeekPrice"
                    value={formData.perNightAfterWeekPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>

                {/* GST */}
                <div>
                  <label htmlFor="gst" className="block text-sm font-medium text-gray-700">GST (%)</label>
                  <input
                    type="number"
                    id="gst"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>

                {/* Cover Photo URL */}
                <div>
                  <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700">Cover Photo URL</label>
                  <input
                    type="url"
                    id="coverPhoto"
                    name="coverPhoto"
                    value={formData.coverPhoto}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/host')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing; 