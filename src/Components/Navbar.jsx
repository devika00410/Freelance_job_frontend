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
          <Link to="/" className="brand-text">Freelance</Link>
        </div>

        {/* Mobile Toggle */}
        <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>

          {/* MAIN NAVIGATION */}
          <li><Link to="/how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</Link></li>
          <li><Link to="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
          <li><Link to="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link></li>
          <li><Link to="/community" onClick={() => setIsMenuOpen(false)}>Community</Link></li>
          <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>

          {/* RIGHT SIDE SECTION */}
          <div className="right-section">

            {/* White bubble */}
            <div className="email-bubble">
              {!token ? (
                <Link to="/signup" className="email-bubble-link">Signup</Link>
              ) : (
                <div
                  onClick={() => {
                    const userRole = localStorage.getItem("userRole");
                    if (userRole === "client") navigate("/client/dashboard");
                    else if (userRole === "freelancer") navigate("/freelancer/dashboard");
                    else navigate("/dashboard");
                  }}
                  className="email-bubble-clickable"
                >
                  {user?.email || "Dashboard"}
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
