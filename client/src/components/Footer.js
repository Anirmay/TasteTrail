import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 relative">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-green-600 via-green-500 to-green-600"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <span className="text-2xl font-extrabold text-white group-hover:text-green-400 transition duration-300">TasteTrail</span>
              <span className="text-xl group-hover:scale-125 transition duration-300">🍽️</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your personalized recipe discovery and meal planning companion. Making cooking delicious and simple.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-white font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-white font-bold">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-white font-bold">📷</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition duration-300 transform hover:scale-110">
                <span className="text-white font-bold">in</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/recipes" className="text-gray-400 hover:text-green-400 transition duration-300">Browse Recipes</Link></li>
              <li><Link to="/meal-planner" className="text-gray-400 hover:text-green-400 transition duration-300">Meal Planner</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Shopping List</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Collections</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">GDPR</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-600/30 rounded-lg p-8 mb-12 hover:border-green-600/60 transition duration-300">
          <div className="max-w-md">
            <h4 className="text-white font-bold text-lg mb-2">Subscribe to Our Newsletter</h4>
            <p className="text-gray-400 mb-4 text-sm">Get weekly recipe ideas and meal planning tips.</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-green-600 focus:outline-none transition duration-300"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition duration-300 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Footer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {currentYear} TasteTrail. All rights reserved. | Making meal planning delicious and simple.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Sitemap</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Status</a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Help</a>
          </div>
        </div>
      </div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </div>
    </footer>
  );
};

export default Footer;
