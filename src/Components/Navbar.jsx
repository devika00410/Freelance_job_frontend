import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo/Brand */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          Your Logo
        </Link>

        {/* Mobile menu button */}
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Public links - always visible */}
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>

          {/* Conditional links based on authentication */}
          {!token ? (
            // Show these when user is not logged in
            <>
              <li className="nav-item">
                <Link to="/role-selection" className="nav-link" onClick={closeMenu}>
                  Get Started
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
            </>
          ) : (
            // Show these when user is logged in
            <>
              {/* Role-specific dashboard links */}
              {user?.role === 'client' && (
                <li className="nav-item">
                  <Link to="/client/dashboard" className="nav-link" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              {user?.role === 'freelancer' && (
                <li className="nav-item">
                  <Link to="/freelancer/dashboard" className="nav-link" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>
                    Admin Dashboard
                  </Link>
                </li>
              )}

              {/* User profile and logout */}
              <li className="nav-item user-info">
                <span className="user-welcome">
                  Welcome, {user?.name || user?.email}
                </span>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link logout-btn" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;