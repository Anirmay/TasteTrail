import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SavedRecipesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userRaw);
    const token = user.token;

    const fetchSaved = async () => {
      try {
        const res = await fetch('/api/users/saved', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        // Inspect content-type to avoid trying to parse HTML as JSON
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Request failed (${res.status})`);
        }

        if (!contentType.includes('application/json')) {
          const txt = await res.text();
          throw new Error('Expected JSON response but received HTML/text: ' + txt.slice(0, 200));
        }

        const data = await res.json();
        setRecipes(data.saved || []);
      } catch (e) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [navigate]);

  const handleRemove = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`/api/users/saved/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error('Failed to remove');

      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      alert('Could not remove recipe: ' + e.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Header />
      <div className="text-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading saved recipes...</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Saved Recipes</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-700 mb-4">You haven't saved any recipes yet.</p>
            <button onClick={() => navigate('/recipes')} className="bg-green-600 text-white py-2 px-4 rounded">Discover Recipes</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <div key={r._id} className="bg-white rounded-lg shadow overflow-hidden">
                <img src={r.image} alt={r.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{r.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{r.cuisine || r.dietaryTags?.join(', ')}</p>
                  <div className="flex gap-2">
                    <a href={`/recipes/${r._id}`} className="flex-1 text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 rounded">View</a>
                    <button onClick={() => handleRemove(r._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SavedRecipesPage;
