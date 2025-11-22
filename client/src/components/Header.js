import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsOpen(false);
    // Dispatch custom event for HomePage to listen
    window.dispatchEvent(new Event('user-logout'));
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-md shadow-lg' : 'py-4 bg-white/90 backdrop-blur-md shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 group-hover:from-green-700 group-hover:to-green-900 transition duration-300">TasteTrail</span>
          <span className="text-2xl group-hover:scale-125 transition duration-300">🍽️</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              <Link to="/" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Home</Link>
              <Link to="/recipes" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Recipes</Link>
              <Link to="/shopping-lists" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Shopping</Link>
              <Link to="/meal-planner" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Meal Planner</Link>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 font-semibold hover:text-green-600 transition duration-300">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300 transform origin-top">
                  <Link to="/profile" className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-t-lg transition duration-300">Profile</Link>
                  <Link to="/settings" className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition duration-300">Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg transition duration-300 font-semibold">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Home</Link>
              <a href="#features" className="text-gray-700 font-semibold hover:text-green-600 transition duration-300">Features</a>
              <Link to="/login" className="text-green-700 font-semibold hover:text-green-900 transition duration-300">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">Sign Up</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col space-y-1.5 p-2 hover:bg-gray-100 rounded-lg transition duration-300"
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-white border-t border-gray-200 animate-fade-in">
          <nav className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Home</Link>
                <Link to="/recipes" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Recipes</Link>
                <Link to="/shopping-lists" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Shopping</Link>
                <Link to="/meal-planner" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Meal Planner</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left text-red-600 font-semibold hover:text-red-700 py-2 transition duration-300">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Home</Link>
                <a href="#features" onClick={() => setIsOpen(false)} className="block text-gray-700 font-semibold hover:text-green-600 py-2 transition duration-300">Features</a>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-green-700 font-semibold hover:text-green-900 py-2 transition duration-300">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg shadow-lg transition duration-300">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </header>
  );
};

export default Header;
