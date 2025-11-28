import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const getToken = () => {
  const stored = localStorage.getItem('user') || localStorage.getItem('token');
  try {
    return stored ? JSON.parse(stored).token : stored;
  } catch (e) {
    return stored;
  }
};

export const getUsers = async (params = {}) => {
  try {
    const token = getToken();
    const config = { headers: {} };
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const response = await axios.get(API_URL, { params, ...config });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (id, role) => {
  try {
    const token = getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}/role`, { role }, config);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const toggleUserDisabled = async (id, disabled) => {
  try {
    const token = getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}/disable`, { disabled }, config);
    return response.data;
  } catch (error) {
    console.error('Error toggling disabled:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const token = getToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// merged module: removed duplicate default export and duplicate imports/constants

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