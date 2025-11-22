import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getRecipes } from '../services/recipeService';
import { generateShoppingList } from '../services/shoppingListService';

const ShoppingListGeneratorPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [listName, setListName] = useState('My Shopping List');
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes({
          search: searchTerm,
        });
        setRecipes(data.recipes || []);
      } catch (err) {
        setError('Failed to load recipes');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchTerm]);

  const handleToggleRecipe = (recipeId) => {
    setSelectedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipes.length === recipes.length) {
      setSelectedRecipes([]);
    } else {
      setSelectedRecipes(recipes.map((r) => r._id));
    }
  };

  const handleGenerateList = async () => {
    if (selectedRecipes.length === 0) {
      alert('Please select at least one recipe');
      return;
    }

    try {
      setGenerating(true);
      const data = await generateShoppingList(
        selectedRecipes,
        listName,
        notes
      );
      alert('Shopping list created successfully!');
      navigate(`/shopping-list/${data.shoppingList._id}`);
    } catch (err) {
      alert('Error creating shopping list: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Shopping List Generator</h1>
          <p className="text-lg opacity-90">
            Select recipes to automatically generate an organized shopping list
          </p>
        </div>
      </div>

      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recipe Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Select Recipes</h2>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Select All Button */}
              <div className="mb-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-500 hover:text-blue-600 font-semibold"
                >
                  {selectedRecipes.length === recipes.length && recipes.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              {/* Recipe List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-gray-600">Loading recipes...</p>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No recipes found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <label
                      key={recipe._id}
                      className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipes.includes(recipe._id)}
                        onChange={() => handleToggleRecipe(recipe._id)}
                        className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">
                          {recipe.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {recipe.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>⏱️ {recipe.prepTime} min</span>
                          <span>🥘 {recipe.cuisine || 'Mixed'}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{selectedRecipes.length}</span> recipe
                  {selectedRecipes.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          </div>

          {/* Shopping List Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Shopping List Details</h2>

              {/* List Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Weekly Meal Prep"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or dietary notes..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateList}
                disabled={selectedRecipes.length === 0 || generating}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                {generating ? 'Generating...' : 'Generate Shopping List'}
              </button>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Select recipes you want to cook</li>
                  <li>2. Give your list a name</li>
                  <li>3. Click Generate</li>
                  <li>4. View items organized by category</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShoppingListGeneratorPage;
