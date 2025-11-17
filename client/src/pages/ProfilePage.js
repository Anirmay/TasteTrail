import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dietary: '',
    allergies: '',
    favoriteCuisines: ''
  });

  const dietaryOptions = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Halal', 'Kosher'];
  const cuisineOptions = ['Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican', 'Thai', 'French', 'Mediterranean', 'Korean', 'Spanish'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Convert arrays to comma-separated strings for form display
    const allergiesStr = Array.isArray(parsedUser.allergies) 
      ? parsedUser.allergies.join(', ') 
      : (parsedUser.allergies || '');
    
    const cuisinesStr = Array.isArray(parsedUser.favoriteCuisines) 
      ? parsedUser.favoriteCuisines.join(', ') 
      : (parsedUser.favoriteCuisines || '');
    
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      dietary: parsedUser.dietary || 'None',
      allergies: allergiesStr,
      favoriteCuisines: cuisinesStr
    });
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Log what we're sending
      console.log('Sending profile update:', {
        dietary: formData.dietary,
        allergies: formData.allergies,
        favoriteCuisines: formData.favoriteCuisines,
        token: token ? 'present' : 'missing'
      });
      
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          dietary: formData.dietary,
          allergies: formData.allergies,
          favoriteCuisines: formData.favoriteCuisines
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setEditing(false);
      setMessageType('success');
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 animate-fade-in">
            My Profile
          </h1>
          <p className="text-xl text-gray-600 animate-fade-in-delay">
            Manage your preferences and account settings
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg font-semibold text-center animate-fade-in ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          {/* User Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {!editing ? (
            <>
              {/* Display Mode */}
              <div className="space-y-6 mb-8">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-gray-600 text-sm font-semibold mb-2">NAME</p>
                  <p className="text-2xl text-gray-900 font-semibold">{user.name}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <p className="text-gray-600 text-sm font-semibold mb-2">EMAIL</p>
                  <p className="text-2xl text-gray-900 font-semibold">{user.email}</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <p className="text-gray-600 text-sm font-semibold mb-2">DIETARY PREFERENCE</p>
                  <p className="text-2xl text-gray-900 font-semibold">{user.dietary || 'None'}</p>
                </div>

                {user.allergies && (
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-gray-600 text-sm font-semibold mb-2">ALLERGIES</p>
                    <p className="text-lg text-gray-900">
                      {Array.isArray(user.allergies) ? user.allergies.join(', ') : user.allergies}
                    </p>
                  </div>
                )}

                {user.favoriteCuisines && (
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">FAVORITE CUISINES</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user.favoriteCuisines) 
                        ? user.favoriteCuisines 
                        : user.favoriteCuisines.split(',')).map((cuisine, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                          {typeof cuisine === 'string' ? cuisine.trim() : cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
              >
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <form onSubmit={handleSave} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-sm mt-1">Name cannot be changed</p>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold cursor-not-allowed"
                  />
                  <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Dietary Preference</label>
                  <select
                    name="dietary"
                    value={formData.dietary}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {dietaryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Allergies (comma-separated)</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g., peanuts, shellfish, dairy"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows="3"
                  />
                </div>

                {/* Favorite Cuisines */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Favorite Cuisines (comma-separated)</label>
                  <textarea
                    name="favoriteCuisines"
                    value={formData.favoriteCuisines}
                    onChange={handleChange}
                    placeholder="e.g., Italian, Chinese, Japanese"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        dietary: user.dietary || 'None',
                        allergies: user.allergies || '',
                        favoriteCuisines: user.favoriteCuisines || ''
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white/60 rounded-xl p-6 text-center">
          <p className="text-gray-600 text-sm">
            Account created with email: <span className="font-semibold text-gray-800">{user.email}</span>
          </p>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(10px); }
          50% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-delay { animation: fade-in-delay 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
