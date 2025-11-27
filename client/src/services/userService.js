import axios from 'axios';

// Define the base URL for our backend API
const API_URL = 'http://localhost:5000/api/users';

// Register user
const register = async (userData) => {
  // Make the POST request to the '/register' endpoint
  const response = await axios.post(API_URL + '/register', userData);

  // If the request is successful, 'response.data' will contain the
  // user object and token from our backend controller
  if (response.data) {
    // We can also store the user in localStorage here,
    // but for now, we'll just return the data.
    console.log('User registered via API:', response.data);
  }

  return response.data;
};


// Login user
const login = async (userData) => {
  // Make the POST request to the '/login' endpoint
  const response = await axios.post(API_URL + '/login', userData);
  if (response.data) {
    // Optionally store user/token in localStorage here
    console.log('User logged in via API:', response.data);
  }
  return response.data;
};

// Collections API
const getCollections = async () => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const res = await axios.get(API_URL + '/collections', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const createCollection = async (payload) => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const res = await axios.post(API_URL + '/collections', payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const addRecipeToCollection = async (collectionId, recipeId) => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const res = await axios.put(API_URL + `/collections/${collectionId}/add/${recipeId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const removeRecipeFromCollection = async (collectionId, recipeId) => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const res = await axios.put(API_URL + `/collections/${collectionId}/remove/${recipeId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const deleteCollection = async (collectionId) => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const res = await axios.delete(API_URL + `/collections/${collectionId}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const renameCollection = async (collectionId, name) => {
  const userRaw = localStorage.getItem('user');
  if (!userRaw) throw new Error('Not authenticated');
  const token = JSON.parse(userRaw).token;
  const url = API_URL + `/collections/${collectionId}`;
  console.log('[userService] renameCollection ->', url, { name });
  const res = await axios.put(url, { name }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

const userService = {
  register,
  login,
  getCollections,
  createCollection,
  addRecipeToCollection,
  removeRecipeFromCollection,
  deleteCollection,
  renameCollection,
};

export default userService;