# Food Delivery App

This project is a full-stack food delivery application built using the MERN stack (MongoDB, Express.js, React, Node.js). The application allows users to browse restaurants, place orders, and make payments. Admins can manage restaurants, orders, and users.

## Table of Contents

- Features
- Technologies Used
- Project Structure
- Frontend
- Backend
- Environment Variables
- Getting Started
- Conclusion

## Features

- User authentication (register, login)
- Browse restaurants and menu items
- Add items to cart and place orders
- Payment processing (card, UPI, cash on delivery)
- Admin dashboard for managing restaurants, orders, and users
- Responsive design

## Technologies Used

### Frontend

- React
- React Router
- Axios
- Context API for state management
- CSS for styling
- React Icons

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- CORS for cross-origin requests

## Project Structure

```
food-delivery-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── .env.production
│   ├── package.json
│   └── .gitignore
├── .gitignore
└── README.md
```

## Frontend

### Pages

- **HomePage**: Displays a list of restaurants and categories.
- **RestaurantPage**: Shows menu items for a selected restaurant.
- **CartPage**: Displays items added to the cart.
- **PaymentPage**: Handles payment processing.
- **LoginPage**: User login form.
- **RegisterPage**: User registration form.
- **AdminDashboard**: Admin interface for managing restaurants, orders, and users.

### Components

- **Navbar**: Navigation bar.
- **RestaurantCard**: Displays restaurant information.
- **MenuItemCard**: Displays menu item information.
- **CartItem**: Displays cart item information.

### Context

- **CartContext**: Manages cart state.

### Services

- **api.js**: Handles API calls to the backend.

## Backend

### Models

- **User**: User schema and model.
- **Restaurant**: Restaurant schema and model.
- **MenuItem**: Menu item schema and model.
- **Order**: Order schema and model.

### Controllers

- **authController**: Handles user authentication.
- **restaurantController**: Manages restaurant data.
- **menuItemController**: Manages menu items.
- **orderController**: Manages orders.

### Routes

- **authRoutes**: Routes for user authentication.
- **restaurantRoutes**: Routes for restaurant data.
- **menuItemRoutes**: Routes for menu items.
- **orderRoutes**: Routes for orders.

### Configuration

- **server.js**: Main server file.
- **config.js**: Configuration for MongoDB and other settings.



## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Anirudh0314m/food-delivery-app.git
cd food-delivery-app
```

2. Install dependencies for frontend and backend:

```bash
cd frontend
npm install
cd ../backend
npm install
```

3. Set up environment variables as described above.

### Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`.

## Conclusion

This project demonstrates a full-stack food delivery application using the MERN stack. It covers user authentication, restaurant browsing, order placement, and payment processing. The admin dashboard allows for managing restaurants, orders, and users.

Feel free to explore the code and customize it to fit your needs. Happy coding!



---



