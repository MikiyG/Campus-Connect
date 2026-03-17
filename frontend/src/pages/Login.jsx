// src/pages/Login.jsx
import "../styles/Login.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../utils/api";           // ← this line connects to backend

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Real backend call
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Persist token and set full user in context
      login(user, token);

      navigate("/dashboard");

    } catch (err) {
      // Try to show nice error from backend
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your email and password.";

      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="login-page">
        <section className="login-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>
          <div className="login-container">
            <h1>Log In to Campus Connect</h1>
            <p className="subtitle">Welcome back!</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p style={{ color: "#ff4d4d", margin: "12px 0", textAlign: "center" }}>{error}</p>}

              <div className="login-options">
                <label className="login-checkbox">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">Remember me</span>
                </label>
                <a href="#" className="forgot-link" onClick={(e)=>e.preventDefault()}>Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="signup-link-wrapper">
              <p className="signup-link">
                Don't have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </div>

            <div className="back-home-wrapper">
              <Link to="/" className="back-home-link">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}