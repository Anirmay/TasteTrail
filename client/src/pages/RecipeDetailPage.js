import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getRecipeById, addReview, editReview, deleteReview } from '../services/recipeService';
import CollectionsModal from '../components/CollectionsModal';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showCollections, setShowCollections] = useState(false);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  // Edit existing review states
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editPhotoFiles, setEditPhotoFiles] = useState([]); // new files to add
  const [editRemovePhotos, setEditRemovePhotos] = useState([]); // URLs to remove
  const [editingSubmitting, setEditingSubmitting] = useState(false);

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
        // check saved status
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const token = JSON.parse(userRaw).token;
          fetch('/api/users/saved', { headers: { Authorization: `Bearer ${token}` } })
            .then(async (res) => {
              if (!res.ok) return;
              const d = await res.json();
              const ids = (d.saved || []).map((r) => r._id);
              setIsSaved(ids.includes(id));
            })
            .catch(() => {});
        }
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
      let payload;
      if (photoFile) {
        payload = new FormData();
        payload.append('rating', Number(rating));
        payload.append('comment', comment);
        payload.append('photo', photoFile);
      } else {
        payload = { rating: Number(rating), comment };
      }

      const data = await addReview(id, payload);
      setRecipe(data.recipe);
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      setPhotoFile(null);
    } catch (err) {
      alert('Error adding review: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditReview = (review) => {
    if (!user) return navigate('/login');
    setEditingReviewId(review._id || review.id);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || '');
    setEditPhotoFiles([]);
    setEditRemovePhotos([]);
    setShowReviewForm(false);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
    setEditPhotoFiles([]);
    setEditRemovePhotos([]);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!editingReviewId) return;

    try {
      setEditingSubmitting(true);
      let payload;
      if (editPhotoFiles.length > 0) {
        payload = new FormData();
        payload.append('rating', Number(editRating));
        payload.append('comment', editComment);
        editPhotoFiles.forEach((file, idx) => {
          payload.append('photos', file);
        });
        if (editRemovePhotos.length > 0) {
          payload.append('removePhoto', JSON.stringify(editRemovePhotos));
        }
      } else {
        payload = { rating: Number(editRating), comment: editComment };
        if (editRemovePhotos.length > 0) payload.removePhoto = JSON.stringify(editRemovePhotos);
      }

      const data = await editReview(id, editingReviewId, payload);
      setRecipe(data.recipe);
      cancelEdit();
    } catch (err) {
      alert('Error editing review: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user) return navigate('/login');
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    console.log('[RecipeDetailPage] deleteReview called with:', reviewId);
    try {
      const data = await deleteReview(id, reviewId);
      setRecipe(data.recipe);
      if (editingReviewId === reviewId) cancelEdit();
    } catch (err) {
      console.error('[RecipeDetailPage] deleteReview error:', err);
      alert('Error deleting review: ' + (err.response?.data?.message || err.message));
    }
  };

  // Compute current user's review (used in the UI)
  const currentUserId = user && (user._id || user.id);
  const myReview = recipe && recipe.reviews && user
    ? recipe.reviews.find(r => String(r.user) === String(currentUserId))
    : null;

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

      {/* Floating actions placed at the top-right of the viewport (below header) */}
      {recipe && (
        <div className="fixed top-20 right-8 z-40 flex flex-col gap-3">
          <button
            onClick={() => {
              const userRaw = localStorage.getItem('user');
              if (!userRaw) return navigate('/login');

              const token = JSON.parse(userRaw).token;
              // optimistic toggle
              setIsSaved((s) => !s);

              fetch(`/api/users/saved/${id}`, {
                method: isSaved ? 'DELETE' : 'POST',
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => setIsSaved((s) => !s));
            }}
            className={`px-3 py-2 rounded shadow ${isSaved ? 'bg-red-500 text-white' : 'bg-white border'}`}
          >
            {isSaved ? '❤️ Saved' : '🤍 Save'}
          </button>

          <button
            onClick={() => {
              const userRaw = localStorage.getItem('user');
              if (!userRaw) return navigate('/login');
              setShowCollections(true);
            }}
            className="px-3 py-2 rounded bg-white border shadow"
          >
            📁 Add to Collection
          </button>
        </div>
      )}

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes')}
          className="text-orange-500 hover:text-orange-600 mb-6 font-semibold"
        >
          ← Back to Recipes
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
          {/* Recipe Image */}
          <div className="h-96 bg-gray-300">
            <img
              src={recipe.image}
              alt={recipe.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default_recipe.svg';
              }}
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
              </div>

              {/* Your Review management section */}
              {myReview && (
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold mb-3">Your Review</h3>
                          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold">{myReview.name}</p>
                                <p className="text-sm text-gray-600">{'⭐'.repeat(myReview.rating)}</p>
                              </div>
                              <p className="text-xs text-gray-500">{new Date(myReview.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-gray-700">{myReview.comment}</p>
                            {myReview.photos && myReview.photos.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {myReview.photos.map((url, idx) => (
                                  <img key={url} src={url} alt={`My review ${idx+1}`} className="w-48 h-36 object-cover rounded" />
                                ))}
                              </div>
                            )}

                            <div className="mt-3 flex gap-2">
                              <button onClick={() => startEditReview(myReview)} className="px-3 py-1 bg-white border rounded">Edit</button>
                              <button onClick={() => handleDeleteReview(myReview._id || myReview.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                            </div>

                            {/* Edit form for user's review */}
                            {editingReviewId && (editingReviewId === (myReview._id || myReview.id)) && (
                              <form onSubmit={handleSubmitEdit} className="mt-4 bg-gray-50 p-4 rounded">
                                <div className="mb-2">
                                  <label className="block text-sm font-semibold mb-1">Rating</label>
                                  <select value={editRating} onChange={(e) => setEditRating(e.target.value)} className="w-full px-2 py-1 border rounded">
                                    {[5,4,3,2,1].map((n)=> (
                                      <option key={n} value={n}>{'⭐'.repeat(n)} {n} / 5</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="mb-2">
                                  <label className="block text-sm font-semibold mb-1">Comment</label>
                                  <textarea value={editComment} onChange={(e)=>setEditComment(e.target.value)} rows="3" className="w-full px-2 py-1 border rounded"></textarea>
                                </div>
                                <div className="mb-2">
                                  <label className="block text-sm font-semibold mb-1">Photos</label>
                                  <div className="flex gap-2 flex-wrap mb-2">
                                    {myReview.photos && myReview.photos.filter(url => !editRemovePhotos.includes(url)).map((url, idx) => (
                                      <div key={url} className="relative w-24 h-20">
                                        <img src={url} alt="Review" className="w-full h-full object-cover rounded" />
                                        <button type="button" onClick={() => setEditRemovePhotos([...editRemovePhotos, url])} className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 shadow hover:bg-red-100" title="Remove photo">&times;</button>
                                      </div>
                                    ))}
                                    {editPhotoFiles.map((file, idx) => (
                                      <div key={idx} className="relative w-24 h-20">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded" />
                                        <button type="button" onClick={() => setEditPhotoFiles(editPhotoFiles.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 shadow hover:bg-red-100" title="Remove selected photo">&times;</button>
                                      </div>
                                    ))}
                                    {(myReview.photos ? myReview.photos.filter(url => !editRemovePhotos.includes(url)).length : 0) + editPhotoFiles.length < 5 && (
                                      <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-orange-300 rounded cursor-pointer hover:bg-orange-50">
                                        <span className="text-2xl text-orange-500">+</span>
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files && e.target.files[0]) setEditPhotoFiles([...editPhotoFiles, e.target.files[0]]); }} />
                                      </label>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button type="submit" disabled={editingSubmitting} className="px-3 py-1 bg-orange-500 text-white rounded">{editingSubmitting ? 'Saving...' : 'Save'}</button>
                                  <button type="button" onClick={cancelEdit} className="px-3 py-1 bg-white border rounded">Cancel</button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                      )}

              {/* Add / Write a Review (only for logged in users) */}
              {user ? (
                // Only show the Write Review button/form when the logged-in user has NOT already written a review
                !myReview ? (
                  <div className="mb-8">
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>

                    {showReviewForm && (
                      <form onSubmit={handleAddReview} className="mt-4 bg-gray-100 p-6 rounded-lg">
                        <div className="mb-4">
                          <label className="block font-semibold mb-2">Rating</label>
                          <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            {[5,4,3,2,1].map((num) => (
                              <option key={num} value={num}>{'⭐'.repeat(num)} {num} / 5</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block font-semibold mb-2">Comment</label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this recipe..."
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          ></textarea>
                        </div>

                        <div className="mb-4">
                          <label className="block font-semibold mb-2">Photo (optional)</label>
                          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} className="w-full" />
                        </div>

                        <button type="submit" disabled={submittingReview} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                ) : null
              ) : (
                <p className="text-gray-600 mb-8">
                  <button onClick={() => navigate('/login')} className="text-orange-500 font-semibold hover:underline">Login</button>{' '}to write a review
                </p>
              )}

              {/* Reviews List */}
              {recipe.reviews && recipe.reviews.length > 0 ? (
                <div className="space-y-4">
                  {recipe.reviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-100 p-4 rounded-lg border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{review.name}</p>
                          <p className="text-sm text-gray-600">{'⭐'.repeat(review.rating)}</p>
                        </div>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.photos && review.photos.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {review.photos.map((url, idx) => (
                            <img key={url} src={url} alt={`Review ${idx+1}`} className="w-48 h-36 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <CollectionsModal isOpen={showCollections} onClose={() => setShowCollections(false)} recipeId={id} />
    </div>
  );
};

export default RecipeDetailPage;
