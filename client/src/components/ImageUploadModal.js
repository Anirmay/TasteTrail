import React, { useState } from 'react';
import imageService from '../services/imageService';

const ImageUploadModal = ({ recipeId, onSuccess, onClose }) => {
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setPreview(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (uploadMethod === 'file') {
        if (!file) {
          setError('Please select a file');
          setLoading(false);
          return;
        }
        const response = await imageService.uploadRecipeImage(recipeId, file);
        onSuccess(response.image);
      } else {
        if (!imageUrl) {
          setError('Please enter an image URL');
          setLoading(false);
          return;
        }
        const response = await imageService.updateRecipeImageUrl(recipeId, imageUrl);
        onSuccess(response.image);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Update Recipe Image</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Upload Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setUploadMethod('file');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                uploadMethod === 'file'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => {
                setUploadMethod('url');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                uploadMethod === 'url'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paste URL
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mb-6">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={() => setPreview('')}
              />
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit}>
            {uploadMethod === 'file' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported: JPEG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
