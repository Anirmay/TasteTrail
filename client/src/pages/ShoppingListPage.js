import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  toggleItemChecked,
} from '../services/shoppingListService';

const ShoppingListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchShoppingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const data = await getShoppingListById(id);
      setShoppingList(data.shoppingList);
      setEditName(data.shoppingList.name);
      setEditNotes(data.shoppingList.notes);
    } catch (err) {
      setError('Failed to load shopping list');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemIndex) => {
    try {
      // Optimistic UI: update local state immediately to avoid full-page loading
      setShoppingList((prev) => {
        if (!prev) return prev;
        const cloned = { ...prev };
        cloned.ingredients = cloned.ingredients.map((ing, idx) =>
          idx === itemIndex ? { ...ing, checked: !ing.checked } : ing
        );
        return cloned;
      });

      // perform server update in background
      await toggleItemChecked(id, itemIndex);
    } catch (err) {
      // if server fails, re-fetch to restore authoritative state and notify user
      alert('Error updating item: ' + (err.response?.data?.message || err.message));
      try {
        await fetchShoppingList();
      } catch (e) {
        console.error('Error refetching shopping list after failed toggle:', e);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      const data = await updateShoppingList(id, {
        name: editName,
        notes: editNotes,
      });
      setShoppingList(data.shoppingList);
      setEditMode(false);
    } catch (err) {
      alert('Error updating list: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) {
      return;
    }

    try {
      await deleteShoppingList(id);
      alert('Shopping list deleted');
      navigate('/shopping-lists');
    } catch (err) {
      alert('Error deleting list: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const groupedIngredients = shoppingList
    ? shoppingList.ingredients.reduce((groups, ingredient, index) => {
        const category = ingredient.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push({ ...ingredient, index });
        return groups;
      }, {})
    : {};

  const checkedCount = shoppingList
    ? shoppingList.ingredients.filter((item) => item.checked).length
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading shopping list...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !shoppingList) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Shopping list not found'}</p>
            <button
              onClick={() => navigate('/shopping-lists')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Back to Lists
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/shopping-lists')}
            className="text-blue-500 hover:text-blue-600 mb-4 font-semibold"
          >
            ← Back to Lists
          </button>

          {editMode ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={updating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{shoppingList.name}</h1>
                  {shoppingList.notes && (
                    <p className="text-gray-600 mb-2">{shoppingList.notes}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Created: {new Date(shoppingList.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 print:hidden"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 print:hidden"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteList}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 print:hidden"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {checkedCount} / {shoppingList.ingredients.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (checkedCount / shoppingList.ingredients.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recipes Used */}
        {shoppingList.recipes && shoppingList.recipes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Recipes Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shoppingList.recipes.map((recipe) => (
                <div key={recipe._id} className="border border-gray-200 rounded-lg p-3">
                  <img
                        src={recipe.image}
                        alt={recipe.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default_recipe.svg';
                        }}
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                  <h3 className="font-semibold text-sm">{recipe.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List Items Grouped by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
          {Object.entries(groupedIngredients).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4 border-b-2 border-blue-500 pb-2">
                {category}
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <label
                    key={item.index}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition print:border-0 print:p-1"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleItem(item.index)}
                      className="mr-3 w-5 h-5 text-blue-600 rounded print:hidden"
                    />
                    {item.checked && (
                      <span className="mr-3 text-green-600 font-bold print:hidden">✓</span>
                    )}
                    <div className="flex-grow">
                      <span
                        className={`font-medium ${
                          item.checked
                            ? 'line-through text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {item.quantity} {item.unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      <style>{`
        @media print {
          body {
            background-color: white;
          }
          .print:hidden {
            display: none;
          }
          .print:grid-cols-1 {
            grid-template-columns: 1fr;
          }
          header,
          footer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ShoppingListPage;
