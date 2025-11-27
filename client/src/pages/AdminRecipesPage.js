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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ingredientsArr = form.ingredients.split('\n').map(s => s.trim()).filter(Boolean);
      const instructionsArr = form.instructions.split('\n').map(s => s.trim()).filter(Boolean);

      // Client-side validation for required fields
      if (!form.name || !form.description) {
        setError('Please provide recipe name and description.');
        setSubmitting(false);
        return;
      }
      if (ingredientsArr.length === 0 || instructionsArr.length === 0) {
        setError('Please provide at least one ingredient and one instruction (one per line).');
        setSubmitting(false);
        return;
      }

      const payload = {
        ...form,
        ingredients: ingredientsArr,
        instructions: instructionsArr,
        dietaryTags: form.dietaryTags ? form.dietaryTags.split(',').map(s => s.trim()) : [],
      };

      // If an image file is selected, submit as FormData so server multer can handle it
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('description', payload.description);
        formData.append('ingredients', payload.ingredients.join(','));
        formData.append('instructions', payload.instructions.join(','));
        formData.append('prepTime', payload.prepTime || '');
        formData.append('cookTime', payload.cookTime || '');
        formData.append('dietaryTags', payload.dietaryTags.join(','));
        formData.append('cuisine', payload.cuisine || '');
        formData.append('image', imageFile);

        // Debug: log FormData entries
        for (const pair of formData.entries()) {
          console.log('[AdminRecipesPage] formData entry:', pair[0], pair[1]);
        }
        if (editingId) {
          res = await updateRecipe(editingId, formData);
          setRecipes((r) => r.map(item => (item._id === editingId ? res.recipe : item)));
        } else {
          res = await createRecipe(formData);
          setRecipes((r) => [res.recipe, ...r]);
        }
      } else {
        console.log('[AdminRecipesPage] payload (no file):', payload);
        if (editingId) {
          res = await updateRecipe(editingId, payload);
          // update list
          setRecipes((r) => r.map(item => (item._id === editingId ? res.recipe : item)));
        } else {
          res = await createRecipe(payload);
          setRecipes((r) => [res.recipe, ...r]);
        }
      }

      setForm(emptyForm);
      setImageFile(null);
      setImagePreview('');
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
    setImageFile(null);
    setImagePreview(recipe.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    // open modal
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecipe(deleteTarget.id);
      setRecipes((r) => r.filter(x => x._id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting', err);
      setError(err.response?.data?.message || err.message || 'Delete failed');
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
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
              <input name="image" value={form.image} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <div className="mt-2">
                <label className="block font-semibold">Or upload image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="w-32 h-24 object-cover rounded mt-2" />
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">{submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Recipe')}</button>
              <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        </section>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Confirm delete</h3>
              <p className="text-gray-700 mb-4">Are you sure you want to delete the recipe "{deleteTarget?.name}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={cancelDelete} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        )}

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
                      <button onClick={() => handleDelete(r._id, r.name)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
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
