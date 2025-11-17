import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('security'); // security, privacy, notifications
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    allowSuggestions: true,
    shareRecipes: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailUpdates: true,
    weeklyDigest: true,
    recipeRecommendations: true,
    mealReminders: false
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  // Password Change Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      setChangingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      showMessage('Password changed successfully!', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // Privacy Settings Handler
  const handlePrivacySetting = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showMessage('Privacy settings updated', 'success');
  };

  // Notification Settings Handler
  const handleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showMessage('Notification preferences updated', 'success');
  };

  // Account Deletion Handler
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      showMessage('Please enter your password to confirm', 'error');
      return;
    }

    setDeletingAccount(true);

    try {
      // Verify password first by attempting to login
      const token = localStorage.getItem('token');
      
      // Make delete request with password verification in backend
      await axios.delete(
        'http://localhost:5000/api/users/account',
        {
          data: { password: deleteConfirmPassword },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('user-logout'));
      
      setShowDeleteModal(false);
      navigate('/');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading settings...</p>
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
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 animate-fade-in">
            Settings
          </h1>
          <p className="text-xl text-gray-600 animate-fade-in-delay">
            Manage your account security and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg font-semibold text-center animate-fade-in ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Settings Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition duration-300 ${
                activeTab === 'security'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔒 Security
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition duration-300 ${
                activeTab === 'privacy'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              👁️ Privacy
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition duration-300 ${
                activeTab === 'notifications'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔔 Notifications
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600 mb-6">Update your password to keep your account secure</p>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your current password"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter a new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Confirm your new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50"
                    >
                      {changingPassword ? 'Updating...' : '🔐 Update Password'}
                    </button>
                  </form>
                </div>

                {/* Account Deletion */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Danger Zone</h2>
                  <p className="text-gray-600 mb-6">Permanently delete your account and all associated data</p>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                  >
                    ⚠️ Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

                  <div className="space-y-4">
                    {/* Show Profile */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Show My Profile</p>
                        <p className="text-sm text-gray-600">Allow others to view your public profile</p>
                      </div>
                      <button
                        onClick={() => handlePrivacySetting('showProfile')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          privacySettings.showProfile ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            privacySettings.showProfile ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Allow Suggestions */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Recipe Suggestions</p>
                        <p className="text-sm text-gray-600">Receive personalized recipe recommendations</p>
                      </div>
                      <button
                        onClick={() => handlePrivacySetting('allowSuggestions')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          privacySettings.allowSuggestions ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            privacySettings.allowSuggestions ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Share Recipes */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Share My Recipes</p>
                        <p className="text-sm text-gray-600">Allow community to see your saved recipes</p>
                      </div>
                      <button
                        onClick={() => handlePrivacySetting('shareRecipes')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          privacySettings.shareRecipes ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            privacySettings.shareRecipes ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-4">
                    {/* Email Updates */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Email Updates</p>
                        <p className="text-sm text-gray-600">Receive important account updates via email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSetting('emailUpdates')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notificationSettings.emailUpdates ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notificationSettings.emailUpdates ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Weekly Digest */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Weekly Digest</p>
                        <p className="text-sm text-gray-600">Get a weekly summary of recipes and tips</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSetting('weeklyDigest')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notificationSettings.weeklyDigest ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notificationSettings.weeklyDigest ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Recipe Recommendations */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Recipe Recommendations</p>
                        <p className="text-sm text-gray-600">Get personalized recipe suggestions</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSetting('recipeRecommendations')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notificationSettings.recipeRecommendations ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notificationSettings.recipeRecommendations ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Meal Reminders */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Meal Reminders</p>
                        <p className="text-sm text-gray-600">Get reminders about your planned meals</p>
                      </div>
                      <button
                        onClick={() => handleNotificationSetting('mealReminders')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          notificationSettings.mealReminders ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            notificationSettings.mealReminders ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            {/* Warning Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Delete Account?</h2>
            </div>

            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold text-sm">
                This action is <span className="font-bold">PERMANENT</span> and cannot be undone. All your data, saved recipes, meal plans, and account information will be permanently deleted.
              </p>
            </div>

            {/* Account Info Display */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-gray-600 text-xs font-semibold mb-2">ACCOUNT EMAIL</p>
              <p className="text-gray-900 font-semibold">{user?.email}</p>
            </div>

            {/* Password Confirmation */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Enter Your Password to Confirm
              </label>
              <input
                type="password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmPassword('');
                }}
                disabled={deletingAccount}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || !deleteConfirmPassword}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 disabled:opacity-50"
              >
                {deletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default SettingsPage;
