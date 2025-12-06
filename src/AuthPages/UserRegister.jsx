// UserRegister.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaCheck,
  FaBriefcase,
  FaGoogle,
  FaTwitter,
} from "react-icons/fa";
import "./UserRegister.css";

const UserRegister = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
    workEmail: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const { registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const isClient = formData.role === "client";

  useEffect(() => {
    const selectedRole = localStorage.getItem("selectedRole");
    if (selectedRole) {
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    } else {
      navigate("/role-selection");
    }
  }, [navigate]);

  // VALIDATION FUNCTION
  const validateField = (name, value) => {
    let error = "";

    if (name === "name" && value.trim().length < 3) {
      error = "Full name must be at least 3 characters.";
    }

    if (name === "email" && !isClient) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value)) error = "Enter a valid email address.";
    }

    if (name === "workEmail" && isClient) {
      if (!value.trim()) error = "Work email is required for clients.";
    }

    if (name === "password") {
      if (value.length < 6) {
        error = "Password must be at least 6 characters.";
      } else if (!/\d/.test(value)) {
        error = "Password must include at least one number.";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid =
    Object.values(errors).every((e) => e === "") &&
    (isClient ? formData.workEmail : formData.email) &&
    formData.password &&
    formData.name.length >= 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage("Please fix the errors before submitting.");
      return;
    }

    setMessage("");

    const submitData = {
      name: formData.name,
      password: formData.password,
      role: formData.role,
      email: isClient ? formData.workEmail : formData.email,
    };

    const result = await registerUser(submitData);

   if (result.success) {
  setMessage("Registration successful! Redirecting...");
  localStorage.removeItem("selectedRole");
  // After successful login/register
localStorage.setItem('userId', data.user._id);
localStorage.setItem('userName', data.user.name);  
localStorage.setItem('userEmail', data.user.email);
localStorage.setItem('userRole', data.user.role);

  const dashboardPath = formData.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
  setTimeout(() => navigate(dashboardPath), 1500);
}
  };

  return (
    <div className="container">
      <div className="left-panel">
        <div className="logo">
          <FaBriefcase className="logo-icon" />
          FreelanceHub
        </div>

        <h1 className="titles">Create account</h1>
        <p className="subtitles">
          Join our 100% free creative network.
        </p>

        <div className="auth-buttons">
          <button className="auth-button google" type="button">
            <FaGoogle className="auth-icon google-icon" />
            Sign up with Google
          </button>
          <button className="auth-button x" type="button">
            <FaTwitter className="auth-icon" />
            Sign up with X
          </button>
        </div>

        <div className="or-separator">OR</div>

        <form onSubmit={handleSubmit} noValidate>
          {/* NAME */}
          <div className="input-box">
            <label htmlFor="name" className="input-label">
              <FaUser className="input-icon" />
              Name*
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className={errors.name ? "invalid" : ""}
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          {/* EMAIL / WORK EMAIL */}
          {isClient ? (
            <div className="input-box">
              <label htmlFor="workEmail" className="input-label">
                <FaBuilding className="input-icon" />
                Work Email*
              </label>
              <input
                id="workEmail"
                type="email"
                name="workEmail"
                className={errors.workEmail ? "invalid" : ""}
                placeholder="your@company.com"
                value={formData.workEmail}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              {errors.workEmail && (
                <p className="error-text">{errors.workEmail}</p>
              )}
            </div>
          ) : (
            <div className="input-box">
              <label htmlFor="email" className="input-label">
                <FaEnvelope className="input-icon" />
                Email*
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={errors.email ? "invalid" : ""}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
          )}

          {/* PASSWORD */}
          <div className="input-box">
            <label htmlFor="password" className="input-label">
              <FaLock className="input-icon" />
              Password*
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className={errors.password ? "invalid" : ""}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="signup-btn"
            disabled={!isFormValid || loading}
            aria-disabled={!isFormValid || loading}
          >
            {loading ? (
              <>Creating Account...</>
            ) : (
              <>
                <FaCheck className="btn-icon" />
                Sign up
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`alert ${
              message.includes("successful") ? "ok" : "fail"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="terms">
          By creating an account, you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            terms of use
          </a>
          .
        </div>

        <div className="annotation">
          <p className="annotation-text">Annotated corrections</p>
          <p className="copyright">© Cortes Martin</p>
        </div>
      </div>

      <div className="right-panel">
        <img
          src="https://static.vecteezy.com/system/resources/previews/003/492/119/large_2x/woman-working-on-laptop-in-the-office-looking-at-the-screen-and-typing-image-free-photo.jpg"
          alt="Professional freelancer working"
        />

        <div className="tooltip amelia" aria-label="Amelia, UI Designer, Sydney Australia">
          Amelia, UI Designer
        </div>
        <div className="tooltip alex" aria-label="Alex, Full Stack Developer, Melbourne Australia">
          Alex, Full Stack Developer
        </div>

        <div className="overlay-text">
          Join the world's largest network of designers and digital creatives.
        </div>

        <div className="action-buttons">
          <button type="button">
            <FaBriefcase />
            Explore Projects
          </button>
          <button type="button">
            <FaUser />
            Find Talent
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;