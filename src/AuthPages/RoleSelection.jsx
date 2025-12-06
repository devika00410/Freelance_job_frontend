import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RoleSelection.css";
import { useAuth } from "../Context/AuthContext";
import { FaUserTie, FaCode, FaUserShield } from "react-icons/fa";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [selected, setSelected] = useState(localStorage.getItem("selectedRole"));
  
  // Check if we're on admin port (5174)
  const isAdminPort = window.location.port === '5174';

  useEffect(() => {
    if (token && user) {
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
  
  // // Check if we're on admin port (5174)
  // const isAdminPort = window.location.port === '5174';
  
  if (isAdminPort && selected === 'admin') {
    navigate("/admin/register");  
  } else {
    navigate("/register");
  }
};

  return (
    <div className="role-container">
      <div className="role-card-wrapper">
        <h1 className="brand-title">FreelanceHub</h1>
        <p className="subtitle">
          {isAdminPort ? "Admin Portal Access" : "Join as a client or freelancer"}
        </p>

        <div className="roles-section">
          {/* Show admin role only on admin port */}
          {isAdminPort && (
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
          )}

          {/* Regular roles - show based on port */}
          {!isAdminPort && (
            <>
              <div
                className={`role-box ${selected === "client" ? "active-role" : ""}`}
                onClick={() => selectRole("client")}
              >
                <div className="icon-wrap client">
                  <FaUserTie size={35} />
                </div>
                <div>
                  <h3>I'm a client, hiring for a project</h3>
                  <p>Hire top talent for quality and speed</p>
                </div>
              </div>

              <div
                className={`role-box ${selected === "freelancer" ? "active-role" : ""}`}
                onClick={() => selectRole("freelancer")}
              >
                <div className="icon-wrap freelancer">
                  <FaCode size={35} />
                </div>
                <div>
                  <h3>I'm a freelancer, looking for work</h3>
                  <p>Get projects and grow your career</p>
                </div>
              </div>
            </>
          )}
        </div>

        <button className="cta-btn" onClick={handleCreateAccount}>
          {isAdminPort ? "Setup Admin Account" : "Create Account"}
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <Link to={isAdminPort ? "/admin/login" : "/login"}>
            {isAdminPort ? "Admin Login" : "Log In"}
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