import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RoleSelection.css";
import { useAuth } from "../Context/AuthContext";
import { FaUserTie, FaCode } from "react-icons/fa";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [selected, setSelected] = useState(localStorage.getItem("selectedRole"));

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  const selectRole = (role) => {
    setSelected(role);
    localStorage.setItem("selectedRole", role);
  };

  const handleCreateAccount = () => {
    if (!selected) return alert("Please select your role first");
    navigate("/register");
  };

  return (
    <div className="role-container">
      <div className="role-card-wrapper">
        <h1 className="brand-title">FreelanceHub</h1>
        <p className="subtitle">Join as a client or freelancer</p>

        <div className="roles-section">

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

        </div>

        <button className="cta-btn" onClick={handleCreateAccount}>
          Create Account
        </button>

        <p className="login-text">
          Already have an account? <Link to="/login">Log In</Link>
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
