// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Groups from "./pages/Groups";
import Messaging from "./pages/Messaging";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />

      {/* Protected Student Pages - redirect to login if not authenticated */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging"
        element={
          <ProtectedRoute>
            <Messaging />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Hidden Admin Panel - only if isAdmin = true */}
      <Route path="/admin" element={<Admin />} />

      {/* Optional: After login, redirect root to dashboard */}
      {/* If you want logged-in users to go to dashboard when visiting / */}
      {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

      {/* Catch all unknown routes → Home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}