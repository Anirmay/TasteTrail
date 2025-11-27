import React, { useEffect, useState } from 'react';
import userService from '../services/userService';

const CollectionsModal = ({ isOpen, onClose, recipeId }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const data = await userService.getCollections();
        setCollections(data.collections || []);
      } catch (err) {
        console.error('Failed to load collections', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isOpen]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const data = await userService.createCollection({ name });
      // server may return the full collections list or the created item
      if (data.collections) {
        setCollections(data.collections);
      } else if (data.collection) {
        setCollections((c) => [data.collection, ...c]);
      } else {
        // fallback: refetch
        const fresh = await userService.getCollections();
        setCollections(fresh.collections || []);
      }
      setNewName('');
    } catch (err) {
      console.error('Create collection failed', err);
      alert('Could not create collection');
    }
  };

  const toggleInCollection = async (collection) => {
    if (!recipeId) return;
    const has = (collection.recipes || []).some((r) => r === recipeId || r._id === recipeId);
    try {
      if (has) {
        await userService.removeRecipeFromCollection(collection._id, recipeId);
        setCollections((prev) =>
          prev.map((c) =>
            c._id === collection._id
              ? { ...c, recipes: (c.recipes || []).filter((r) => (r._id || r) !== recipeId) }
              : c
          )
        );
      } else {
        await userService.addRecipeToCollection(collection._id, recipeId);
        setCollections((prev) =>
          prev.map((c) =>
            c._id === collection._id ? { ...c, recipes: [...(c.recipes || []), recipeId] } : c
          )
        );
      }
    } catch (err) {
      console.error('Toggle collection failed', err);
      alert('Could not update collection');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Add to Collection</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Create new collection</label>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Weeknight Favorites"
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <button onClick={handleCreate} className="bg-orange-500 text-white px-4 py-2 rounded">Create</button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Your Collections</p>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : collections.length === 0 ? (
            <p className="text-sm text-gray-500">No collections yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {collections.map((col) => {
                const has = (col.recipes || []).some((r) => (r._id || r) === recipeId || r === recipeId);
                return (
                  <div key={col._id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        {editingId === col._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="px-2 py-1 border rounded"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                            <button
                              onClick={async () => {
                                const name = editName.trim();
                                if (!name) return alert('Name cannot be empty');
                                try {
                                  console.log('[CollectionsModal] renaming', col._id, '->', name);
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
                                    // If server reports not found, refresh collections to resync client state
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
                              className="px-2 py-1 bg-green-500 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditName('');
                              }}
                              className="px-2 py-1 bg-gray-100 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold">{col.name}</div>
                            <div className="text-xs text-gray-500">{(col.recipes || []).length} recipes</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleInCollection(col)}
                          className={`px-3 py-1 rounded ${has ? 'bg-orange-500 text-white' : 'bg-white border'}`}
                        >
                          {has ? 'Remove' : 'Add'}
                        </button>
                        {editingId !== col._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(col._id);
                                setEditName(col.name || '');
                              }}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm('Delete this collection?')) return;
                                try {
                                  await userService.deleteCollection(col._id);
                                  setCollections((prev) => prev.filter((c) => c._id !== col._id));
                                } catch (err) {
                                  console.error('Delete failed', err.response || err);
                                  const msg = err?.response?.data?.message || err?.message || 'Could not delete collection';
                                  alert(msg);
                                }
                              }}
                              className="px-2 py-1 rounded bg-red-50 text-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CollectionsModal;
