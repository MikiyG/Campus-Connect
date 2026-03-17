// src/pages/Home.jsx
import "../styles/Home.css";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import backgroundImg from "../assets/groups_of_students.jpg";

export default function Home() {
  const { user } = useAuth();
  
  // Redirect logged-in users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <>
      <TopNavbar />
      <div className="home" style={{ paddingTop: "100px" }}>
        {/* Hero Section with background image */}
        <section
          className="hero"
          style={{
            backgroundImage: `url(${backgroundImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            minHeight: "90vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Dark overlay for text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.45)",
            }}
          />

          {/* Hero Content */}
          <div className="hero-content" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <h1 className="hero-title">
              <span className="title-campus">Campus </span>
              <span className="title-connect">Connect</span>
            </h1>

            <p className="hero-subtitle">Thrive in Your School</p>

            {/* The Quote */}
            <blockquote className="hero-quote">
              “Learning thrives when connections are made—students grow faster when they share,
              collaborate, and engage with peers.”
            </blockquote>

            {/* Buttons with REAL navigation - EQUAL SIZE */}
            <div className="hero-actions">
              <Link to="/signup">
                <button className="btn-primary hero-btn">Sign Up</button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary hero-btn">Login</button>
              </Link>
            </div>
          </div>

          <div className="accent-glow"></div>
          <div className="accent-glow-2"></div>
        </section>

      </div>
      <Footer />
    </>
  );
}