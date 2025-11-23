import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import mealPlanService from '../services/mealPlanService.js';
import { getRecipes } from '../services/recipeService.js';
import { generateShoppingList } from '../services/shoppingListService.js';

const MealPlannerPage = () => {
  const navigate = useNavigate();
  const { id: mealPlanId } = useParams();
  
  const [mealPlan, setMealPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mealPlanName, setMealPlanName] = useState('Weekly Meal Plan');
  const [isEditing, setIsEditing] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load meal plan and recipes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (mealPlanId) {
          const mealPlanRes = await mealPlanService.getMealPlanById(mealPlanId);
          setMealPlan(mealPlanRes.mealPlan);
          setMealPlanName(mealPlanRes.mealPlan.name);
        }

        const recipesRes = await getRecipes();
        setRecipes(recipesRes.recipes || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mealPlanId]);

  // Add recipe to a day
  const handleAddRecipe = async (recipeId) => {
    try {
      if (!mealPlanId) {
        alert('Please create or select a meal plan first');
        return;
      }

      const result = await mealPlanService.addRecipeToDay(mealPlanId, selectedDay, recipeId);
      setMealPlan(result.mealPlan);
      setShowRecipeModal(false);
      setSelectedDay(null);
    } catch (err) {
      alert(`Error adding recipe: ${err.message}`);
    }
  };

  // Remove recipe from a day
  const handleRemoveRecipe = async (recipeId, day) => {
    try {
      const result = await mealPlanService.removeRecipeFromDay(mealPlanId, day, recipeId);
      setMealPlan(result.mealPlan);
    } catch (err) {
      alert(`Error removing recipe: ${err.message}`);
    }
  };

  // Generate shopping list
  const handleGenerateShoppingList = async () => {
    try {
      const result = await mealPlanService.generateShoppingListFromMealPlan(mealPlanId);
      
      if (result.recipeIds.length === 0) {
        alert('No recipes in meal plan to generate shopping list');
        return;
      }

      // Create shopping list with all recipes from the meal plan
      const shoppingListRes = await generateShoppingList(
        `Shopping List - ${mealPlanName}`,
        result.recipeIds
      );

      alert('Shopping list generated! Redirecting...');
      navigate('/shopping');
    } catch (err) {
      alert(`Error generating shopping list: ${err.message}`);
    }
  };

  // Update meal plan name
  const handleUpdateName = async () => {
    try {
      await mealPlanService.updateMealPlan(mealPlanId, mealPlanName, mealPlan?.notes || '');
      setIsEditing(false);
      alert('Meal plan updated!');
    } catch (err) {
      alert(`Error updating meal plan: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">No meal plan selected</p>
          <button
            onClick={() => navigate('/meal-planner')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Meal Planner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mealPlanName}
                    onChange={(e) => setMealPlanName(e.target.value)}
                    className="px-3 py-2 border rounded"
                  />
                  <button
                    onClick={handleUpdateName}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{mealPlanName}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 text-blue-500 hover:text-blue-700"
                  >
                    ✎
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleGenerateShoppingList}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              📋 Generate Shopping List
            </button>
          </div>
        </div>

        {/* Calendar View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map((day, index) => (
            <div key={day} className="bg-white rounded-lg shadow p-4 min-h-96">
              {/* Day Header */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">{dayLabels[index]}</h2>
              </div>

              {/* Recipes for this day */}
              <div className="space-y-2 mb-4">
                {mealPlan.meals[day] && mealPlan.meals[day].length > 0 ? (
                  mealPlan.meals[day].map((recipe, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-50 p-3 rounded border border-blue-200 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">{recipe.name}</p>
                        {recipe.image && (
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-20 object-cover rounded mt-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/default_recipe.svg';
                            }}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveRecipe(recipe._id, day)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove recipe"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No meals planned</p>
                )}
              </div>

              {/* Add Recipe Button */}
              <button
                onClick={() => {
                  setSelectedDay(day);
                  setShowRecipeModal(true);
                }}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                + Add Recipe
              </button>
            </div>
          ))}
        </div>

        {/* Recipe Selection Modal */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Recipe for {dayLabels[days.indexOf(selectedDay)]}</h3>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="text-2xl text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{recipe.name}</p>
                      <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                    </div>
                    <button
                      onClick={() => handleAddRecipe(recipe._id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;
