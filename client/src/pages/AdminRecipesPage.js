import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../services/recipeService';

const emptyForm = {
  name: '',
  description: '',
  ingredients: '',
  instructions: '',
  prepTime: '',
  cookTime: '',
  dietaryTags: '',
  cuisine: '',
  image: '',
};

const AdminRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await getRecipes();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error loading recipes', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.split('\n').filter(Boolean),
        instructions: form.instructions.split('\n').filter(Boolean),
        dietaryTags: form.dietaryTags ? form.dietaryTags.split(',').map(s => s.trim()) : [],
      };

      if (editingId) {
        const res = await updateRecipe(editingId, payload);
        // update list
        setRecipes((r) => r.map(item => (item._id === editingId ? res.recipe : item)));
      } else {
        const res = await createRecipe(payload);
        setRecipes((r) => [res.recipe, ...r]);
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving recipe', err);
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (recipe) => {
    setEditingId(recipe._id);
    setForm({
      name: recipe.name || '',
      description: recipe.description || '',
      ingredients: recipe.ingredients ? recipe.ingredients.join('\n') : '',
      instructions: recipe.instructions ? recipe.instructions.join('\n') : '',
      prepTime: recipe.prepTime || '',
      cookTime: recipe.cookTime || '',
      dietaryTags: recipe.dietaryTags ? recipe.dietaryTags.join(', ') : '',
      cuisine: recipe.cuisine || '',
      image: recipe.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      setRecipes((r) => r.filter(x => x._id !== id));
    } catch (err) {
      console.error('Error deleting', err);
      setError(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-grow max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Admin - Recipe Management</h1>

        <section className="mb-8 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{editingId ? 'Edit Recipe' : 'Add Recipe'}</h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-semibold">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border p-2 rounded" rows={3} required />
            </div>
            <div>
              <label className="block font-semibold">Ingredients (one per line)</label>
              <textarea name="ingredients" value={form.ingredients} onChange={handleChange} className="w-full border p-2 rounded" rows={4} />
            </div>
            <div>
              <label className="block font-semibold">Instructions (one per line)</label>
              <textarea name="instructions" value={form.instructions} onChange={handleChange} className="w-full border p-2 rounded" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Prep Time (min)</label>
                <input type="number" name="prepTime" value={form.prepTime} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold">Cook Time (min)</label>
                <input type="number" name="cookTime" value={form.cookTime} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Dietary Tags (comma separated)</label>
                <input name="dietaryTags" value={form.dietaryTags} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold">Cuisine</label>
                <input name="cuisine" value={form.cuisine} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
            </div>
            <div>
              <label className="block font-semibold">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Recipe')}</button>
              <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">All Recipes</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recipes.map(r => (
                <div key={r._id} className="bg-white p-4 rounded shadow flex items-start gap-4">
                  <img src={r.image || '/images/default_recipe.svg'} alt={r.name} className="w-28 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-sm text-gray-600">{r.cuisine} • {r.dietaryTags ? r.dietaryTags.join(', ') : ''}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => startEdit(r)} className="px-3 py-1 bg-white border rounded">Edit</button>
                      <button onClick={() => handleDelete(r._id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AdminRecipesPage;
