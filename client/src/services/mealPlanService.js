import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Create a new meal plan
export const createMealPlan = async (name, startDate, notes = '') => {
  try {
    const response = await axios.post(
      `${API_URL}/meal-plans`,
      { name, startDate, notes },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all meal plans for the user
export const getMealPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/meal-plans`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get a single meal plan by ID
export const getMealPlanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/meal-plans/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add recipe to a specific day
export const addRecipeToDay = async (mealPlanId, day, recipeId) => {
  try {
    const response = await axios.post(
      `${API_URL}/meal-plans/${mealPlanId}/add-recipe`,
      { day, recipeId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove recipe from a specific day
export const removeRecipeFromDay = async (mealPlanId, day, recipeId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/meal-plans/${mealPlanId}/remove-recipe`,
      {
        data: { day, recipeId },
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update meal plan (name, notes)
export const updateMealPlan = async (id, name, notes) => {
  try {
    const response = await axios.put(
      `${API_URL}/meal-plans/${id}`,
      { name, notes },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a meal plan
export const deleteMealPlan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/meal-plans/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Generate shopping list from meal plan
export const generateShoppingListFromMealPlan = async (mealPlanId) => {
  try {
    const response = await axios.post(
      `${API_URL}/meal-plans/${mealPlanId}/generate-shopping-list`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const mealPlanService = {
  createMealPlan,
  getMealPlans,
  getMealPlanById,
  addRecipeToDay,
  removeRecipeFromDay,
  updateMealPlan,
  deleteMealPlan,
  generateShoppingListFromMealPlan,
};

export default mealPlanService;
