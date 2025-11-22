import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getShoppingLists, deleteShoppingList } from '../services/shoppingListService';

const ShoppingListsPage = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    fetchLists();
  }, [navigate]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }
      const data = await getShoppingLists();
      setLists(data.shoppingLists || []);
    } catch (err) {
      console.error('Error details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load shopping lists';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) {
      return;
    }

    try {
      await deleteShoppingList(id);
      setLists(lists.filter((list) => list._id !== id));
    } catch (err) {
      alert('Error deleting list: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Shopping Lists</h1>
          <p className="text-lg opacity-90">
            View and manage all your shopping lists
          </p>
        </div>
      </div>

      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Create New Button */}
        <div className="mb-8">
          <Link
            to="/shopping-list-generator"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300 inline-block"
          >
            + Create New Shopping List
          </Link>
        </div>

        {/* Lists Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading shopping lists...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg mb-4">
              No shopping lists yet. Create your first one!
            </p>
            <Link
              to="/shopping-list-generator"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Create Shopping List
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const checkedCount = list.ingredients.filter(
                (item) => item.checked
              ).length;
              const totalCount = list.ingredients.length;
              const progressPercent =
                totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

              return (
                <div
                  key={list._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                    <h3 className="text-lg font-bold mb-1">{list.name}</h3>
                    <p className="text-sm opacity-90">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {checkedCount}/{totalCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Recipes Count */}
                    {list.recipes && list.recipes.length > 0 && (
                      <p className="text-sm text-gray-600 mb-3">
                        📋 {list.recipes.length} recipe
                        {list.recipes.length !== 1 ? 's' : ''}
                      </p>
                    )}

                    {/* Items Count */}
                    <p className="text-sm text-gray-600 mb-4">
                      🛒 {totalCount} item{totalCount !== 1 ? 's' : ''}
                    </p>

                    {/* Notes Preview */}
                    {list.notes && (
                      <p className="text-xs text-gray-600 mb-4 line-clamp-2 italic">
                        "{list.notes}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/shopping-list/${list._id}`}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center font-semibold hover:bg-blue-700 transition duration-300 text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteList(list._id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShoppingListsPage;
