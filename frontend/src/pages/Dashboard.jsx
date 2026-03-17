// src/pages/Dashboard.jsx
import "../styles/Dashboard.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user && (user.role === 'super_admin' || user.role === 'university_admin' || !!user.isAdmin);

  return (
    <>
      <TopNavbar />
      <div className="dashboard-page">
        <section className="dashboard-hero">
          <div className="overlay" />
          <div className="glow-accent"></div>
          <div className="glow-accent-2"></div>

          <div className="dashboard-hub">
            <div className="hub-header">
              <h1>Welcome back!</h1>
              <p className="subtitle">Your campus connection hub</p>
            </div>

            <div className="hub-cards">
              <Link to="/events" className="hub-card events-card">
                <div className="card-glow"></div>
                <span className="card-icon">📅</span>
                <h3>Events</h3>
                <p>Discover workshops, parties & fairs</p>
              </Link>

              <Link to="/groups" className="hub-card groups-card">
                <div className="card-glow"></div>
                <span className="card-icon">👥</span>
                <h3>Groups</h3>
                <p>Join study teams & clubs</p>
              </Link>

              <Link to="/messaging" className="hub-card messaging-card">
                <div className="card-glow"></div>
                <span className="card-icon">💬</span>
                <h3>Messaging</h3>
                <p>Chat with peers instantly</p>
              </Link>

              <Link to="/profile" className="hub-card profile-card">
                <div className="card-glow"></div>
                <span className="card-icon">👤</span>
                <h3>Profile</h3>
                <p>Manage your connections</p>
              </Link>
            </div>

            <div className="hub-actions">
              {isAdmin && (
                <Link to="/admin">
                  <button className="btn-primary admin-btn">Admin Panel</button>
                </Link>
              )}
              <button onClick={logout} className="btn-primary logout-btn">
                Log Out
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}