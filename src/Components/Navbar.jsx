// Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* Brand */}
        <div className="brand">
          <Link to="/" className="brand-text">Freelumo</Link>
        </div>

        {/* Mobile Toggle */}
        <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Nav Items */}
        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li><Link to="/how-it-works">How it Works</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/contact">Contact</Link></li>

          {/* Right side user section */}
          <div className="right-section">

            {/* White bubble */}
          <div className="email-bubble">
  {!token ? (
    <Link to="/signup" className="email-bubble-link">Signup</Link>
  ) : (
    <div
      onClick={() => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'client') {
          navigate('/client-dashboard');
        } else if (userRole === 'freelancer') {
          navigate('/freelancer-dashboard');
        } else {
          navigate('/dashboard');
        }
      }}
      className="email-bubble-clickable"
      style={{cursor: 'pointer'}}
    >
      {user?.email || 'Dashboard'}
    </div>
  )}
</div>
            {/* Login or Logout */}
            {!token ? (
              <Link to="/login" className="login-btn">Login</Link>
            ) : (
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
