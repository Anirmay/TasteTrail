import axios from 'axios';

const API_URL = 'http://localhost:5000/api/recipes';

// Get all recipes with filtering
export const getRecipes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.dietaryTags) {
      if (Array.isArray(filters.dietaryTags)) {
        filters.dietaryTags.forEach((tag) => params.append('dietaryTags', tag));
      } else {
        params.append('dietaryTags', filters.dietaryTags);
      }
    }
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.maxPrepTime) params.append('maxPrepTime', filters.maxPrepTime);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

// Get a single recipe by ID
export const getRecipeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// Create a new recipe
export const createRecipe = async (recipeData) => {
  try {
    const token = localStorage.getItem('token');
    const isForm = typeof FormData !== 'undefined' && recipeData instanceof FormData;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    const config = { headers };

    const response = await axios.post(API_URL, recipeData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

// Update a recipe
export const updateRecipe = async (id, recipeData) => {
  try {
    const token = localStorage.getItem('token');
    const isForm = typeof FormData !== 'undefined' && recipeData instanceof FormData;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    const config = { headers };

    const response = await axios.put(`${API_URL}/${id}`, recipeData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// Delete a recipe
export const deleteRecipe = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Add a review to a recipe
export const addReview = async (id, reviewData) => {
  try {
    // Token may be stored as JSON user object or simple token depending on code paths
    const stored = localStorage.getItem('user') || localStorage.getItem('token');
    let token = null;
    try {
      token = stored ? JSON.parse(stored).token : null;
    } catch (e) {
      token = stored;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // If reviewData is FormData (contains photo), let axios set Content-Type automatically
    const isForm = typeof FormData !== 'undefined' && reviewData instanceof FormData;
    const config = { headers: { ...headers } };

    const response = await axios.post(`${API_URL}/${id}/reviews`, reviewData, config);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Edit an existing review (supports FormData with photo)
export const editReview = async (recipeId, reviewId, reviewData) => {
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('token');
    let token = null;
    try {
      token = stored ? JSON.parse(stored).token : null;
    } catch (e) {
      token = stored;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const config = { headers: { ...headers } };

    const response = await axios.put(`${API_URL}/${recipeId}/reviews/${reviewId}`, reviewData, config);
    return response.data;
  } catch (error) {
    console.error('Error editing review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (recipeId, reviewId) => {
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('token');
    let token = null;
    try {
      token = stored ? JSON.parse(stored).token : null;
    } catch (e) {
      token = stored;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const config = { headers: { ...headers } };

    const response = await axios.delete(`${API_URL}/${recipeId}/reviews/${reviewId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
