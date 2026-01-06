import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import mealPlanService from '../services/mealPlanService.js';
import { getRecipes } from '../services/recipeService.js';
import { generateShoppingList } from '../services/shoppingListService.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Draggable recipe item used in the modal
const DraggableRecipe = ({ recipe, onAdd }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'RECIPE',
    item: { recipeId: recipe._id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag}
      className={"flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition " + (isDragging ? 'opacity-50' : '')}
    >
      <div>
        <p className="font-semibold">{recipe.name}</p>
        <p className="text-sm text-gray-600">{recipe.cuisine}</p>
      </div>
      <button
        onClick={() => onAdd(recipe._id)}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
};

// Drop target for a day cell
const DayCell = ({ day, index, children, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'RECIPE',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  return (
    <div ref={drop} className={isOver ? 'ring-2 ring-orange-400' : ''}>
      {children}
    </div>
  );
};

// Draggable recipe already placed in a day (to move between days)
const DraggableDayRecipe = ({ recipe, day, onRemove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'RECIPE',
    item: { recipeId: recipe._id, fromDay: day },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={drag}
      className={"relative bg-blue-50 p-3 rounded border border-blue-200 flex flex-col items-start " + (isDragging ? 'opacity-50' : '')}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }}
        aria-label="Remove recipe"
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow"
      >
        ✕
      </button>

      <div className="flex-1 w-full">
        <p className="font-semibold text-blue-900">{recipe.name}</p>
        {recipe.image && (
          <img src={recipe.image} alt={recipe.name} className="w-full h-20 object-cover rounded mt-2" onError={(e) => { e.target.onerror = null; e.target.src = '/images/default_recipe.svg'; }} />
        )}
      </div>
    </div>
  );
};

const MealPlannerPage = () => {
  const navigate = useNavigate();
  const { id: mealPlanId } = useParams();
  
  const [mealPlan, setMealPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
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

  // Handle recipe dropped onto a day cell
  const handleDropRecipe = async (toDay, item) => {
    try {
      // If item has fromDay, it's a move between days
      if (item && item.fromDay) {
        // Add to new day first
        const addRes = await mealPlanService.addRecipeToDay(mealPlanId, toDay, item.recipeId);
        setMealPlan(addRes.mealPlan);

        // If fromDay is different, remove from original day
        if (item.fromDay !== toDay) {
          const removeRes = await mealPlanService.removeRecipeFromDay(mealPlanId, item.fromDay, item.recipeId);
          setMealPlan(removeRes.mealPlan);
        }
      } else if (item && item.recipeId) {
        // Dropped from modal (no fromDay)
        const result = await mealPlanService.addRecipeToDay(mealPlanId, toDay, item.recipeId);
        setMealPlan(result.mealPlan);
      }
    } catch (err) {
      alert(`Error adding/moving recipe: ${err.message}`);
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
      // note: generateShoppingList expects (recipeIds, name, notes)
      const shoppingListRes = await generateShoppingList(
        result.recipeIds,
        `Shopping List - ${mealPlanName}`
      );

      alert('Shopping list generated! Redirecting...');
      navigate(`/shopping-list/${shoppingListRes.shoppingList._id}`);
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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Meal Planner</h1>
            <p className="text-lg opacity-90">Plan your meals and generate shopping lists</p>
          </div>
        </div>

        <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-lg mb-4">No meal plan selected</p>
            <button
              onClick={() => navigate('/meal-plans')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Meal Plans
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Small subcomponents to keep JSX flatter and easier to parse
  const PlannerHeader = () => (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{mealPlanName}</h1>
          <p className="text-lg opacity-90">Plan your week and generate shopping lists</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mealPlanName}
                  onChange={(e) => setMealPlanName(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
                <button onClick={handleUpdateName} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">Cancel</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{mealPlanName}</h2>
                <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-blue-500 hover:text-blue-700">✎</button>
              </>
            )}
          </div>

          <button onClick={handleGenerateShoppingList} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">📋 Generate Shopping List</button>
        </div>
      </div>
    </>
  );

  const PlannerCalendar = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day, index) => (
          <DayCell key={day} day={day} index={index} onDrop={(item) => handleDropRecipe(day, item)}>
            <div className="bg-white rounded-lg shadow p-4 min-h-96">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">{dayLabels[index]}</h3>
              </div>

              <div className="space-y-2 mb-4">
                {mealPlan.meals[day] && mealPlan.meals[day].length > 0 ? (
                  mealPlan.meals[day].map((recipe, idx) => (
                    <div key={idx}>
                      <DraggableDayRecipe recipe={recipe} day={day} onRemove={() => handleRemoveRecipe(recipe._id, day)} />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No meals planned</p>
                )}
              </div>

              <button onClick={() => { setSelectedDay(day); setShowRecipeModal(true); }} className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">+ Add Recipe</button>
            </div>
          </DayCell>
        ))}
      </div>
    </div>
  );

  const RecipeModal = () => (
    showRecipeModal ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xl font-bold">Select Recipe for {selectedDay ? dayLabels[days.indexOf(selectedDay)] : ''}</h4>
            <button onClick={() => setShowRecipeModal(false)} className="text-2xl text-gray-600 hover:text-gray-800">✕</button>
          </div>

          <div className="space-y-2">
            {recipes.map((recipe) => (
              <DraggableRecipe key={recipe._id} recipe={recipe} onAdd={handleAddRecipe} />
            ))}
          </div>
        </div>
      </div>
    ) : null
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <PlannerHeader />
        <PlannerCalendar />
        <RecipeModal />
        <Footer />
      </div>
    </DndProvider>
  );
};

export default MealPlannerPage;
