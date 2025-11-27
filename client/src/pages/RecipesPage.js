import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getRecipes } from '../services/recipeService';
import CollectionsModal from '../components/CollectionsModal';

const RecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [showCollections, setShowCollections] = useState(false);
  const [selectedRecipeForCollection, setSelectedRecipeForCollection] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [maxPrepTime, setMaxPrepTime] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Available options
  const dietOptions = [
    'Vegan',
    'Vegetarian',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
  ];
  const cuisineOptions = [
    'Italian',
    'Mexican',
    'Indian',
    'Chinese',
    'Japanese',
    'Thai',
    'Mediterranean',
    'American',
  ];

  // Fetch recipes
  useEffect(() => {
    // fetch user's saved recipes if logged in
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const token = JSON.parse(userRaw).token;
      fetch('/api/users/saved', { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (!res.ok) return;
          const data = await res.json();
          const ids = new Set((data.saved || []).map((r) => r._id));
          setSavedIds(ids);
        })
        .catch(() => {});
    }

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError('');

        const filters = {
          search: searchTerm,
          dietaryTags: selectedDiets.length > 0 ? selectedDiets : undefined,
          cuisine: selectedCuisine || undefined,
          maxPrepTime: maxPrepTime || undefined,
          sortBy,
        };

        // Remove undefined values
        Object.keys(filters).forEach(
          (key) => filters[key] === undefined && delete filters[key]
        );

        const data = await getRecipes(filters);
        setRecipes(data.recipes || []);
      } catch (err) {
        setError('Failed to load recipes. Please try again later.');
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchTerm, selectedDiets, selectedCuisine, maxPrepTime, sortBy]);

  const toggleDietFilter = (diet) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDiets([]);
    setSelectedCuisine('');
    setMaxPrepTime('');
    setSortBy('createdAt');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Discover Recipes</h1>
          <p className="text-lg opacity-90">
            Explore thousands of delicious recipes tailored to your preferences
          </p>
        </div>
      </div>

      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Search Recipe
                </label>
                <input
                  type="text"
                  placeholder="Recipe name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Dietary Preferences */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Dietary Preferences
                </label>
                <div className="space-y-2">
                  {dietOptions.map((diet) => (
                    <label key={diet} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDiets.includes(diet)}
                        onChange={() => toggleDietFilter(diet)}
                        className="mr-2 w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="text-sm">{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cuisine */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Cuisine Type
                </label>
                <select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Cuisines</option>
                  {cuisineOptions.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prep Time */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Max Prep Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g., 30"
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="createdAt">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="prepTime">Quickest</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  <p className="mt-4 text-gray-600">Loading recipes...</p>
                </div>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No recipes found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe._id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
                  >
                    <div className="h-48 bg-gray-300 overflow-hidden relative">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default_recipe.svg';
                        }}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const userRaw = localStorage.getItem('user');
                            if (!userRaw) {
                              navigate('/login');
                              return;
                            }

                            const token = JSON.parse(userRaw).token;
                            const isSaved = savedIds.has(recipe._id);

                            // optimistic update
                            setSavedIds((prev) => {
                              const next = new Set(prev);
                              if (isSaved) next.delete(recipe._id);
                              else next.add(recipe._id);
                              return next;
                            });

                            // call API
                            fetch(`/api/users/saved/${recipe._id}`, {
                              method: isSaved ? 'DELETE' : 'POST',
                              headers: { Authorization: `Bearer ${token}` },
                            }).catch(() => {
                              // rollback on error
                              setSavedIds((prev) => {
                                const next = new Set(prev);
                                if (isSaved) next.add(recipe._id);
                                else next.delete(recipe._id);
                                return next;
                              });
                            });
                          }}
                          className={`p-2 rounded-full border shadow ${savedIds.has(recipe._id) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700'}`}
                          aria-label={savedIds.has(recipe._id) ? 'Unsave recipe' : 'Save recipe'}
                        >
                          {savedIds.has(recipe._id) ? '❤️' : '🤍'}
                        </button>

                        {/* Collections button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const userRaw = localStorage.getItem('user');
                            if (!userRaw) {
                              navigate('/login');
                              return;
                            }
                            setSelectedRecipeForCollection(recipe._id);
                            setShowCollections(true);
                          }}
                          className="p-2 rounded-full bg-white border text-gray-700 shadow"
                          aria-label="Add to collection"
                        >
                          📁
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {recipe.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {recipe.description}
                      </p>

                      {/* Tags */}
                      {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recipe.dietaryTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recipe Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex gap-4">
                          <span>⏱️ {recipe.prepTime} min</span>
                          <span>👨‍🍳 {recipe.cuisine || 'Mixed'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">
                            {recipe.rating
                              ? recipe.rating.toFixed(1)
                              : 'No rating'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <CollectionsModal isOpen={showCollections} onClose={() => setShowCollections(false)} recipeId={selectedRecipeForCollection} />
    </div>
  );
};

export default RecipesPage;
