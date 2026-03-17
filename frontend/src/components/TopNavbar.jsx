import "../styles/TopNavbar.css";
import { Facebook, Instagram, Youtube, Twitter, Search } from "lucide-react";
import Logo from "../assets/logo.png";
import { Link } from "react-router-dom";   // ← This enables real navigation
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user && (user.role === 'super_admin' || user.role === 'university_admin' || !!user.isAdmin);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      if (!isLoggedIn) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await api.get('/messages/unread-count');
        const n = res.data?.unread ?? 0;
        setUnreadCount(n);
      } catch (err) {
        setUnreadCount(0);
      }
    };
    loadUnread();
  }, [isLoggedIn]);

  return (
    <header className="topnav">
      <div className="topnav-container">
        {/* Logo - clicks to home */}
        <div className="brand-wrapper">
          <Link to="/" className="brand">
            <img src={Logo} alt="Campus Connect Logo" className="brand-logo" />
            <span className="brand-text">Campus Connect</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="right-section">
          {/* Social Icons + Search */}
          <div className="top-row">
            <div className="socials">
              <a href="#" onClick={(e)=>e.preventDefault()} className="social-circle"><Facebook size={19} strokeWidth={2.8} /></a>
              <a href="#" onClick={(e)=>e.preventDefault()} className="social-circle"><Instagram size={19} strokeWidth={2.8} /></a>
              <a href="#" onClick={(e)=>e.preventDefault()} className="social-circle"><Youtube size={19} strokeWidth={2.8} /></a>
              <a href="#" onClick={(e)=>e.preventDefault()} className="social-circle"><Twitter size={19} strokeWidth={2.8} /></a>
            </div>
            <div className="search-wrapper">
              <input type="text" placeholder="Search..." className="search-input" />
              <Search className="search-icon" size={18} />
            </div>
          </div>

          {/* Navigation Links - NOW WITH REAL ROUTING */}
          <nav className="bottom-nav">
            {!isLoggedIn && (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/features" className="nav-link">Features</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
                <Link to="/signup" className="nav-link">Sign Up</Link>
                <Link to="/login" className="nav-link">Login</Link>
              </>
            )}

            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/events" className="nav-link">Events</Link>
                <Link to="/groups" className="nav-link">Groups</Link>
                <Link to="/messaging" className="nav-link">
                  Messaging
                  {unreadCount > 0 && (
                    <span className="nav-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {!isAdmin && <Link to="/profile" className="nav-link">Profile</Link>}
                {isAdmin && <Link to="/admin" className="nav-link">Admin Pannel</Link>}
                <button className="nav-link logout-button" onClick={() => logout()}>Log Out</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}