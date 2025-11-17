import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const data = await userService.login({ email, password });
      setLoading(false);
      setMessage('Login successful!');
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      // Redirect to home page after 1 second
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      setLoading(false);
      const errorMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'An unexpected error occurred';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-yellow-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Login to TasteTrail</h1>
        {message && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-center border border-red-200">{message}</div>
        )}
        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-700 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
