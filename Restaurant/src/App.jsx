import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import { wakeBackend } from "./Services/api";

import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Contact from "./Pages/Contact";
import Cart from "./Pages/Cart";
import Orders from "./Pages/Orders";
import OrderHistory from "./Pages/OrderHistory";
import Checkout from "./Pages/Checkout";
import Payment from "./Pages/Payment";
import Profile from "./Pages/Profile";

import Dashboard from "./Pages/Dashboard";
import FoodManagement from "./Pages/FoodManagement";
import AddFood from "./Pages/AddFood";
import UserLogins from "./Pages/UserLogins";
import ForgotPassword from "./Pages/ForgotPassword";

import ProtectedRoute from "./Components/protectedRoute";
import AdminRoute from "./Components/AdminRoute";

function App() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    wakeBackend();
  }, []);

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" 
        element={<Home cart={cart} setCart={setCart}/>} />
        <Route path="/menu" element={<Menu cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Cart */}
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-history" element={<OrderHistory />} />

        {/* Checkout */}
        <Route
          path="/checkout"
          element={<Checkout cart={cart} setCart={setCart} />}
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/food-management"
          element={
            <AdminRoute>
              <FoodManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/add-food"
          element={
            <AdminRoute>
              <AddFood />
            </AdminRoute>
          }
        />

        <Route
          path="/user-logins"
          element={
            <AdminRoute>
              <UserLogins />
            </AdminRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;