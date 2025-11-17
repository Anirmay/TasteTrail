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


const userService = {
  register,
  login,
};

export default userService;