import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mealPlanService from '../services/mealPlanService.js';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MealPlansListPage = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDate, setNewPlanDate] = useState('');

  // Load meal plans
  useEffect(() => {
    const loadMealPlans = async () => {
      try {
        setLoading(true);
        const result = await mealPlanService.getMealPlans();
        setMealPlans(result.mealPlans || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };

    loadMealPlans();
  }, []);

  // Create new meal plan
  const handleCreateMealPlan = async () => {
    try {
      if (!newPlanDate) {
        alert('Please select a start date');
        return;
      }

      const result = await mealPlanService.createMealPlan(
        newPlanName || 'Weekly Meal Plan',
        newPlanDate
      );

      setMealPlans([result.mealPlan, ...mealPlans]);
      setNewPlanName('');
      setNewPlanDate('');
      setShowCreateModal(false);

      // Navigate to the new meal plan
      navigate(`/meal-planner/${result.mealPlan._id}`);
    } catch (err) {
      alert(`Error creating meal plan: ${err.message}`);
    }
  };

  // Delete meal plan
  const handleDeleteMealPlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await mealPlanService.deleteMealPlan(id);
      setMealPlans(mealPlans.filter((plan) => plan._id !== id));
    } catch (err) {
      alert(`Error deleting meal plan: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Meal Plans</h1>
          <p className="text-lg opacity-90">Create and manage weekly meal plans</p>
        </div>
      </div>

      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + New Meal Plan
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Meal Plans List */}
        {mealPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No meal plans yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Your First Meal Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealPlans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-gray-600 mb-4">
                    Start Date: {new Date(plan.startDate).toLocaleDateString()}
                  </p>

                  {/* Days Summary */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Recipes planned:</p>
                    <div className="text-sm">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].reduce(
                        (total, day) => total + (plan.meals[day]?.length || 0),
                        0
                      )}{' '}
                      recipes across 7 days
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/meal-planner/${plan._id}`)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit Plan
                    </button>
                    <button
                      onClick={() => handleDeleteMealPlan(plan._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Meal Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Meal Plan</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g., Weekly Plan - Nov 23"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newPlanDate}
                    onChange={(e) => setNewPlanDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleCreateMealPlan}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MealPlansListPage;
