import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ShoppingListGeneratorPage from './pages/ShoppingListGeneratorPage';
import ShoppingListPage from './pages/ShoppingListPage';
import ShoppingListsPage from './pages/ShoppingListsPage';
import MealPlansListPage from './pages/MealPlansListPage';
import MealPlannerPage from './pages/MealPlannerPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import CollectionsPage from './pages/CollectionsPage';
import AdminRecipesPage from './pages/AdminRecipesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/shopping-list-generator" element={<ShoppingListGeneratorPage />} />
        <Route path="/shopping-lists" element={<ShoppingListsPage />} />
        <Route path="/shopping-list/:id" element={<ShoppingListPage />} />
        <Route path="/meal-plans" element={<MealPlansListPage />} />
        <Route path="/meal-planner/:id" element={<MealPlannerPage />} />
        <Route path="/saved-recipes" element={<SavedRecipesPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/admin/recipes" element={<AdminRecipesPage />} />
      </Routes>
    </Router>
  );
}

export default App;