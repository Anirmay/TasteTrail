import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getRecipeById, addReview } from '../services/recipeService';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch recipe details
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const data = await getRecipeById(id);
        setRecipe(data.recipe);
      } catch (err) {
        setError('Failed to load recipe details.');
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const data = await addReview(id, { rating: Number(rating), comment });
      setRecipe(data.recipe);
      setComment('');
      setRating(5);
      setShowReviewForm(false);
    } catch (err) {
      alert('Error adding review: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Recipe not found'}</p>
            <button
              onClick={() => navigate('/recipes')}
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
              Back to Recipes
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

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes')}
          className="text-orange-500 hover:text-orange-600 mb-6 font-semibold"
        >
          ← Back to Recipes
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Image */}
          <div className="h-96 bg-gray-300">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            {/* Recipe Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{recipe.name}</h1>
              <p className="text-gray-700 text-lg mb-4">{recipe.description}</p>

              {/* Recipe Meta */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-sm text-gray-600">Prep Time</p>
                    <p className="font-bold">{recipe.prepTime} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍳</span>
                  <div>
                    <p className="text-sm text-gray-600">Cook Time</p>
                    <p className="font-bold">{recipe.cookTime} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="text-sm text-gray-600">Cuisine</p>
                    <p className="font-bold">{recipe.cuisine || 'Mixed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-bold">
                      {recipe.rating ? recipe.rating.toFixed(1) : 'No rating'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dietary Tags */}
              {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {recipe.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-orange-500 pb-2">
                  Ingredients
                </h2>
                <ul className="space-y-3">
                  {recipe.ingredients &&
                    recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-orange-500 mr-3">✓</span>
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-orange-500 pb-2">
                  Instructions
                </h2>
                <ol className="space-y-4">
                  {recipe.instructions &&
                    recipe.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-gray-700 pt-1">{instruction}</p>
                      </li>
                    ))}
                </ol>
              </div>
            </div>

            {/* Chef Info */}
            {recipe.user && (
              <div className="bg-gray-100 p-4 rounded-lg mb-10">
                <p className="text-sm text-gray-600">Recipe by</p>
                <p className="font-bold text-lg">{recipe.user.name}</p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t-2 pt-8">
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>

              {user ? (
                <div className="mb-8">
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                  >
                    {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>

                  {showReviewForm && (
                    <form
                      onSubmit={handleAddReview}
                      className="mt-4 bg-gray-100 p-6 rounded-lg"
                    >
                      <div className="mb-4">
                        <label className="block font-semibold mb-2">
                          Rating
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {[5, 4, 3, 2, 1].map((num) => (
                            <option key={num} value={num}>
                              {'⭐'.repeat(num)} {num} / 5
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block font-semibold mb-2">
                          Comment
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts about this recipe..."
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 mb-8">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-orange-500 font-semibold hover:underline"
                  >
                    Login
                  </button>{' '}
                  to write a review
                </p>
              )}

              {/* Reviews List */}
              {recipe.reviews && recipe.reviews.length > 0 ? (
                <div className="space-y-4">
                  {recipe.reviews.map((review, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 p-4 rounded-lg border-l-4 border-orange-500"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{review.name}</p>
                          <p className="text-sm text-gray-600">
                            {'⭐'.repeat(review.rating)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecipeDetailPage;
