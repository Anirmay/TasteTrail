# TasteTrail 🍽️

A modern full-stack web application for recipe discovery, meal planning, and personalized dining experiences.

**Live Demo:**
- 🌐 **Frontend**: [animay-tastetrail.netlify.app](https://animay-tastetrail.netlify.app)
- 🔌 **Backend API**: [tastetrail-f3gc.onrender.com](https://tastetrail-f3gc.onrender.com)

---

## Features

### 🔐 Authentication & User Management
- User registration with dietary preferences
- Secure login with JWT authentication
- User profile management
- Account settings (password change, account deletion)
- Privacy and notification preferences

### 👤 User Profile
- View and edit dietary preferences
- Manage allergies and favorite cuisines
- Personal account information

### ⚙️ Settings
- **Security**: Change password with verification
- **Privacy**: Control profile visibility and data sharing
- **Notifications**: Manage email and alert preferences
- **Account**: Delete account with password confirmation

### 🏠 Home Page
- Dual UI for guest and logged-in users
- Animated hero section with gradient backgrounds
- Feature showcase
- Call-to-action sections

### 📱 Responsive Design
- Mobile-friendly interface
- Sticky navigation header
- Adaptive layouts for all screen sizes

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Tailwind CSS 3.3.3** - Styling
- **Axios** - HTTP client
- **localStorage** - Client-side auth state

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Mongoose** - ODM

## Project Structure

```
TasteTrail/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── controllers/      # Route handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration
│   ├── server.js
│   └── package.json
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/TasteTrail.git
cd TasteTrail
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npx nodemon server.js
```

3. **Setup Frontend**
```bash
cd ../client
npm install
npm start
```

The app will open at `http://localhost:3000` (or next available port)

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### User Profile
- `PUT /api/users/profile` - Update profile (requires auth)
- `PUT /api/users/password` - Change password (requires auth)
- `DELETE /api/users/account` - Delete account (requires auth)

## Usage

1. **Register** - Create a new account with your dietary preferences
2. **Login** - Sign in with your credentials
3. **View Profile** - Manage your preferences and allergies
4. **Settings** - Update password, privacy, and notification preferences
5. **Logout** - Sign out from your account

## Features Coming Soon

- 🍳 Recipe Discovery Page
- 🗓️ Meal Planner (drag-and-drop calendar)
- 🛒 Shopping List Generator
- ⭐ Save Favorite Recipes
- 👥 Community Sharing
- 📊 Admin Panel

## Deployment

### Frontend (Netlify)
The React frontend is deployed on **Netlify** with automatic deployments from the `main` branch.

**Deploy Config** (`netlify.toml`):
- Build command: `npm install --prefix client && npm run build --prefix client`
- Publish directory: `client/build`
- Environment variable: `REACT_APP_API_URL=https://tastetrail-f3gc.onrender.com/api`

**Steps to Deploy:**
1. Push to `main` branch on GitHub
2. Netlify automatically triggers build and deployment
3. View at: https://animay-tastetrail.netlify.app

### Backend (Render)
The Node.js backend is deployed on **Render** as a Web Service.

**Deploy Config:**
- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`
- Runtime: Node
- Region: Singapore

**Steps to Deploy:**
1. Create Web Service on Render
2. Connect GitHub repository
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Render auto-deploys on push to `main`
5. View at: https://tastetrail-f3gc.onrender.com

---

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes` - Create recipe (admin)
- `PUT /api/recipes/:id` - Update recipe (admin)
- `DELETE /api/recipes/:id` - Delete recipe (admin)

### Meal Plans
- `GET /api/meal-plans` - Get user's meal plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/meal-plans/:id` - Get meal plan details
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Shopping Lists
- `GET /api/shopping-lists` - Get user's shopping lists
- `POST /api/shopping-lists` - Create shopping list
- `GET /api/shopping-lists/:id` - Get shopping list details
- `PUT /api/shopping-lists/:id` - Update shopping list
- `DELETE /api/shopping-lists/:id` - Delete shopping list

## Environment Variables

### Server (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tastetrail
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

### Frontend (.env)
```
REACT_APP_API_URL=https://tastetrail-f3gc.onrender.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Created with ❤️ by Anirmay Khan

## Support

For support, email anirmay.05khan@gmail.com or open an issue on GitHub.

---

**Happy Cooking! 🍽️**
