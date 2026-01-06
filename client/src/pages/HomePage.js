import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Listen for storage changes (logout from other tabs/windows)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      } else {
        setUser(null);
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-logout', handleLogout);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading...</p>
      </div>
    </div>;
  }

  // Guest HomePage
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 overflow-hidden">
        <Header />
        
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        {/* Hero Section */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
          <div style={{ transform: `translateY(${scrollY * 0.5}px)` }} className="transition-transform duration-300">
            <h2 className="text-7xl md:text-8xl font-bold mb-8 text-gray-900 leading-tight animate-fade-in">
              Discover. <span className="text-green-600">Plan.</span> Savor.
            </h2>
          </div>
          <p className="text-2xl md:text-3xl text-gray-700 mb-16 max-w-4xl leading-relaxed animate-fade-in-delay">
            Your personalized recipe discovery and meal planning companion. Tailored to your dietary needs, preferences, and lifestyle.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center mb-24">
            <a href="/register" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300 transform text-lg">
              Get Started for Free
            </a>
            <a href="/recipes" className="bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-green-800 font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300 text-lg">
              🍽️ Discover Recipes
            </a>
            <a href="#features" className="bg-white border-2 border-green-600 text-green-700 font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-2xl hover:bg-green-50 hover:scale-105 transition duration-300 text-lg">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-12 mb-20">
            <div className="text-center hover:scale-110 transition duration-300">
              <p className="text-5xl md:text-6xl font-bold text-green-600">1000+</p>
              <p className="text-gray-600 font-semibold text-lg mt-2">Recipes</p>
            </div>
            <div className="text-center hover:scale-110 transition duration-300">
              <p className="text-5xl md:text-6xl font-bold text-green-600">50+</p>
              <p className="text-gray-600 font-semibold text-lg mt-2">Cuisines</p>
            </div>
            <div className="text-center hover:scale-110 transition duration-300">
              <p className="text-5xl md:text-6xl font-bold text-green-600">10K+</p>
              <p className="text-gray-600 font-semibold text-lg mt-2">Users</p>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-5xl font-bold text-center mb-16 text-gray-900">Powerful Features</h3>
            <div className="grid md:grid-cols-3 gap-10">
                {[
                  { icon: "🍽️", title: "Smart Recipe Discovery", desc: "Find recipes tailored to your dietary preferences, allergies, and taste profile." },
                  { icon: "🗓️", title: "Drag-Drop Meal Planner", desc: "Plan your entire week with an intuitive calendar interface." },
                  { icon: "🛒", title: "Auto Shopping List", desc: "Generate organized shopping lists from your meal plan." },
                  { icon: "❤️", title: "Save & Collect", desc: "Organize recipes into custom collections." },
                  { icon: "👥", title: "Community Sharing", desc: "Share reviews, photos, and tips with other food lovers." },
                  { icon: "📊", title: "Nutrition Insights", desc: "Track nutritional information for your meal plans." }
                ].map((feature, idx) => {
                  const cardClass = "group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition duration-300 cursor-pointer border border-gray-100 hover:border-green-200";
                  const content = (
                    <>
                      <span className="text-6xl mb-4 block group-hover:scale-125 transition duration-300">{feature.icon}</span>
                      <h4 className="font-bold text-2xl mb-3 text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </>
                  );

                  // Make the Smart Recipe Discovery card a link to /recipes
                  if (feature.title === 'Smart Recipe Discovery') {
                    return (
                      <a key={idx} href="/recipes" className={cardClass}>
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div key={idx} className={cardClass}>
                      {content}
                    </div>
                  );
                })}
              </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative z-10 py-24 px-4 bg-gradient-to-r from-green-50 to-yellow-50 mt-20">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-5xl font-bold text-center mb-16 text-gray-900">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { num: "1", title: "Create Profile", desc: "Set your dietary preferences and tastes" },
                { num: "2", title: "Explore Recipes", desc: "Browse from 1000+ personalized recipes" },
                { num: "3", title: "Plan Meals", desc: "Organize your weekly meal plan" },
                { num: "4", title: "Shop Smart", desc: "Get auto-generated shopping lists" }
              ].map((step, idx) => (
                <div key={idx} className="text-center hover:scale-105 transition duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{step.num}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xl mb-2 text-gray-900">{step.title}</h4>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-24 px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white text-center shadow-2xl hover:shadow-3xl transition duration-300">
            <h3 className="text-5xl font-bold mb-6">Ready to Transform Your Cooking?</h3>
            <p className="text-xl mb-8 text-green-50">Join thousands of users discovering new recipes and eating healthier today.</p>
            <a href="/register" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
              Start Your Journey
            </a>
          </div>
        </section>

        <Footer />

        {/* CSS for animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s both; }
        `}</style>
      </div>
    );
  }

  // Logged-in User HomePage
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <Header />

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-[45vh] text-center px-4 pt-32">
        <h2 className="text-7xl md:text-8xl font-bold mb-8 text-gray-900 animate-fade-in">
          Welcome Back, <span className="text-green-600">{user.name}!</span>
        </h2>
        <p className="text-2xl md:text-3xl text-gray-700 mb-16 max-w-4xl animate-fade-in-delay">
          Let's make today's meals delicious and nutritious
        </p>
        <div className="flex flex-col md:flex-row gap-8 justify-center mb-12">
          <a href="/recipes" className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300 text-lg">
            🍽️ Discover Recipes
          </a>
          <a href="/meal-planner" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300 text-lg">
            🗓️ Plan Meals
          </a>
        </div>
      </main>

      {/* Dashboard Cards */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">Your Dashboard</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📝", title: "Your Profile", content: `Dietary: ${user.dietaryPreferences?.join(', ') || 'Not set'}`, link: "/profile" },
              { icon: "❤️", title: "Saved Recipes", content: "Manage your favorite recipes", link: "/saved-recipes" },
              { icon: "📚", title: "Collections", content: "Manage your recipe collections", link: "/collections" }
            ].map((card, idx) => (
              <a 
                key={idx}
                href={card.link}
                className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:-translate-y-2 transition duration-300 cursor-pointer border border-gray-100 hover:border-green-200"
              >
                <span className="text-5xl mb-4 block group-hover:scale-125 transition duration-300">{card.icon}</span>
                <h4 className="font-bold text-2xl mb-3 text-gray-900">{card.title}</h4>
                <p className="text-gray-600">{card.content}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-green-50 to-yellow-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition duration-300 border border-gray-100 hover:border-green-200">
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Today's Meal Ideas</h4>
              <p className="text-gray-600 mb-6">Get personalized recipe suggestions for your meals today</p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                View Ideas
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition duration-300 border border-gray-100 hover:border-green-200">
              <h4 className="text-2xl font-bold mb-4 text-gray-900">This Week's Plan</h4>
              <p className="text-gray-600 mb-6">See what you have planned for the rest of the week</p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                View Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s both; }
      `}</style>
    </div>
  );
};

export default HomePage;
