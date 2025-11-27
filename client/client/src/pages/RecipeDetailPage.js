import React, { useEffect, useState } from 'react';

// Minimal, compile-safe RecipeDetailPage
// Replace the placeholder logic and stubs with your real services later.

function RecipeDetailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipe, setRecipe] = useState({ reviews: [], image: '', name: '', description: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // placeholder data; replace with actual API call
    setRecipe({
      name: 'Sample Recipe',
      description: 'This is a placeholder recipe description.',
      image: '/images/default_recipe.svg',
      reviews: [
        { _id: 'r1', name: 'Alice', rating: 5, comment: 'Great!', photos: [], createdAt: Date.now(), user: 'u1' },
        { _id: 'r2', name: 'Bob', rating: 4, comment: 'Tasty!', photos: [], createdAt: Date.now(), user: 'u2' }
      ]
    });
  }, []);

  const handleDeleteReview = (id) => {
    if (!window.confirm('Delete your review?')) return;
    setRecipe((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r._id !== id) }));
  };

  const startEditReview = (review) => {
    alert('Edit review: ' + (review._id || review.id));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <p className="mt-4 text-gray-600">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <button onClick={() => window.history.back()} className="text-orange-500 hover:text-orange-600 mb-6 font-semibold">← Back</button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
            <p className="text-gray-700 mb-4">{recipe.description}</p>

            <div className="border-t-2 pt-6">
              <h2 className="text-2xl font-bold mb-4">My Review</h2>
              {user && recipe.reviews.some(r => r.user === (user._id || user.id)) ? (
                recipe.reviews.filter(r => r.user === (user._id || user.id)).map((review) => (
                  <div key={review._id} className="bg-gray-100 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{review.name}</p>
                        <p className="text-sm text-gray-600">{'⭐'.repeat(review.rating || 0)}</p>
                      </div>
                      <p className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => startEditReview(review)} className="px-3 py-1 bg-white border rounded">Edit</button>
                      <button onClick={() => handleDeleteReview(review._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">You haven't left a review yet.</p>
              )}
            </div>

            <div className="border-t-2 pt-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">All Reviews</h2>
              {recipe.reviews && recipe.reviews.length > 0 ? (
                <div className="space-y-4">
                  {recipe.reviews.map((review) => (
                    <div key={review._id} className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{review.name}</p>
                          <p className="text-sm text-gray-600">{'⭐'.repeat(review.rating || 0)}</p>
                        </div>
                        <p className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
