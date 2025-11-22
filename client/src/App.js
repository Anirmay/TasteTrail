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
      </Routes>
    </Router>
  );
}

export default App;