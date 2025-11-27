import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import userService from '../services/userService';
import { Link, useNavigate } from 'react-router-dom';

const CollectionsPage = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await userService.getCollections();
      setCollections(data.collections || []);
    } catch (err) {
      console.error('Failed to load collections', err);
      // if not authenticated, send to login
      if (err.message && err.message.toLowerCase().includes('not authenticated')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await userService.deleteCollection(id);
      setCollections((c) => c.filter((col) => col._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Could not delete collection');
    }
  };

  const handleRemoveRecipe = async (collectionId, recipeId) => {
    try {
      await userService.removeRecipeFromCollection(collectionId, recipeId);
      setCollections((prev) =>
        prev.map((col) =>
          col._id === collectionId
            ? { ...col, recipes: (col.recipes || []).filter((r) => (r._id || r) !== recipeId) }
            : col
        )
      );
    } catch (err) {
      console.error('Remove recipe failed', err);
      alert('Could not remove recipe from collection');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">Loading collections...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Collections</h1>
          <Link to="/saved-recipes" className="text-orange-500">Back to Saved</Link>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-600">You have no collections yet.</p>
            <p className="mt-4 text-sm text-gray-500">Open a recipe and use "Add to Collection" to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {collections.map((col) => (
              <div key={col._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {editingId === col._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 border rounded"
                        />
                        <button
                          onClick={async () => {
                            const name = editName.trim();
                            if (!name) return alert('Name cannot be empty');
                            try {
                              console.log('[CollectionsPage] renaming', col._id, '->', name);
                              const data = await userService.renameCollection(col._id, name);
                              if (data.collections) setCollections(data.collections);
                              else if (data.collection) setCollections((prev) => prev.map((c) => (c._id === col._id ? data.collection : c)));
                              setEditingId(null);
                              setEditName('');
                            } catch (err) {
                              console.error('Rename failed', err.response || err);
                              const status = err?.response?.status;
                              const msg = err?.response?.data?.message || err?.message || 'Could not rename collection';
                              if (status === 404) {
                                try {
                                  const fresh = await userService.getCollections();
                                  setCollections(fresh.collections || []);
                                } catch (e) {
                                  console.error('Failed to refresh collections after 404', e.response || e);
                                }
                                alert('Collection not found on server — refreshed your collections. Please try again.');
                              } else {
                                alert(msg);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                          className="px-3 py-1 bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-lg">{col.name}</div>
                        <div className="text-sm text-gray-500">{(col.recipes || []).length} recipes</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded((e) => (e === col._id ? null : col._id))}
                      className="px-3 py-1 rounded bg-gray-100"
                    >
                      {expanded === col._id ? 'Hide' : 'View'}
                    </button>
                    {editingId !== col._id && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(col._id);
                            setEditName(col.name || '');
                          }}
                          className="px-3 py-1 rounded bg-blue-50 text-blue-700"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCollection(col._id)} className="px-3 py-1 rounded bg-red-100 text-red-700">Delete</button>
                      </>
                    )}
                  </div>
                </div>

                {expanded === col._id && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(col.recipes || []).length === 0 ? (
                      <div className="text-gray-600">No recipes in this collection.</div>
                    ) : (
                      (col.recipes || []).map((r) => {
                        const recipe = r._id ? r : r; // r may be populated object or id
                        return (
                          <div key={recipe._id || recipe} className="flex items-center gap-4 border rounded p-3">
                            <div className="w-20 h-12 bg-gray-200 overflow-hidden rounded">
                              <img
                                src={recipe.image || '/images/default_recipe.svg'}
                                alt={recipe.name || 'Recipe'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/default_recipe.svg';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{recipe.name || 'Recipe'}</div>
                              <div className="text-sm text-gray-500">{recipe.cuisine || ''}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/recipes/${recipe._id || recipe}`)}
                                className="px-3 py-1 rounded bg-white border"
                              >
                                Open
                              </button>
                              <button
                                onClick={() => handleRemoveRecipe(col._id, recipe._id || recipe)}
                                className="px-3 py-1 rounded bg-red-50 text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CollectionsPage;
