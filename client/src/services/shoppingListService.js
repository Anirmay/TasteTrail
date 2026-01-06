import axios from 'axios';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/shopping-lists';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Generate shopping list from recipes
export const generateShoppingList = async (recipeIds, name, notes) => {
  try {
    const response = await axios.post(
      `${API_URL}/generate`,
      { recipeIds, name, notes },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating shopping list:', error);
    throw error;
  }
};

// Get all shopping lists for user
export const getShoppingLists = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Get a single shopping list by ID
export const getShoppingListById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw error;
  }
};

// Update shopping list
export const updateShoppingList = async (id, updateData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updateData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating shopping list:', error);
    throw error;
  }
};

// Delete shopping list
export const deleteShoppingList = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
};

// Toggle item checked status
export const toggleItemChecked = async (shoppingListId, itemIndex) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${shoppingListId}/items/${itemIndex}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling item:', error);
    throw error;
  }
};
