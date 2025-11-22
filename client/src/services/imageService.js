import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const imageService = {
  // Upload image file to a recipe
  uploadRecipeImage: async (recipeId, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.put(
        `${API_URL}/recipes/${recipeId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Update recipe image with URL
  updateRecipeImageUrl: async (recipeId, imageUrl) => {
    try {
      const response = await axios.put(
        `${API_URL}/recipes/${recipeId}/image`,
        { imageUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating image URL:', error);
      throw error;
    }
  },
};

export default imageService;
