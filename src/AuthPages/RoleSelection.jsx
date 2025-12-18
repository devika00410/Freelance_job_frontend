import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RoleSelection.css";
import { useAuth } from "../Context/AuthContext";
import { FaUserTie, FaCode, FaUserShield } from "react-icons/fa";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [selected, setSelected] = useState(localStorage.getItem("selectedRole") || "");

  useEffect(() => {
    if (token && user) {
      // Redirect to appropriate dashboard if already logged in
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(dashboardPath);
    }
  }, [token, user, navigate]);

  const selectRole = (role) => {
    setSelected(role);
    localStorage.setItem("selectedRole", role);
  };

  const handleCreateAccount = () => {
    if (!selected) return alert("Please select your role first");
    
    // Navigate to registration page with role parameter
    navigate(`/register?role=${selected}`);
  };

  const handleLogin = () => {
    // Always go to same login page
    navigate("/login");
  };

  return (
    <div className="role-container">
      <div className="role-card-wrapper">
        <h1 className="brand-title">FreelanceHub</h1>
        <p className="subtitle">
          Choose your account type to get started
        </p>

        <div className="roles-section">
          {/* Admin Role */}
          <div
            className={`role-box ${selected === "admin" ? "active-role" : ""}`}
            onClick={() => selectRole("admin")}
          >
            <div className="icon-wrap admin">
              <FaUserShield size={35} />
            </div>
            <div>
              <h3>Administrator</h3>
              <p>Platform management and oversight</p>
            </div>
          </div>

          {/* Client Role */}
          <div
            className={`role-box ${selected === "client" ? "active-role" : ""}`}
            onClick={() => selectRole("client")}
          >
            <div className="icon-wrap client">
              <FaUserTie size={35} />
            </div>
            <div>
              <h3>I'm a Client, hiring for a project</h3>
              <p>Hire top talent for quality and speed</p>
            </div>
          </div>

          {/* Freelancer Role */}
          <div
            className={`role-box ${selected === "freelancer" ? "active-role" : ""}`}
            onClick={() => selectRole("freelancer")}
          >
            <div className="icon-wrap freelancer">
              <FaCode size={35} />
            </div>
            <div>
              <h3>I'm a Freelancer, looking for work</h3>
              <p>Get projects and grow your career</p>
            </div>
          </div>
        </div>

        <button className="cta-btn" onClick={handleCreateAccount}>
          Create {selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : ""} Account
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" onClick={handleLogin}>
            Log In
          </Link>
        </p>

        <div className="footer-links">
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;