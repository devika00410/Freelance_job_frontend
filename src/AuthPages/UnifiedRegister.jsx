import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./UnifiedRegister.css";

const UnifiedRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerUser, registerAdmin, loading } = useAuth();
  
  // Get role from URL parameter
  const queryParams = new URLSearchParams(location.search);
  const urlRole = queryParams.get('role') || '';
  
  const [selectedRole, setSelectedRole] = useState(urlRole || 'client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Redirect to role selection if no role specified
  useEffect(() => {
    if (!urlRole) {
      navigate('/role-selection');
    }
    setSelectedRole(urlRole);
  }, [urlRole, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (selectedRole === 'admin' && !formData.secretKey.trim()) {
      newErrors.secretKey = 'Admin security key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors above');
      return;
    }
    
    setMessage('');
    
    try {
      if (selectedRole === 'admin') {
        // Admin registration
        const result = await registerAdmin({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          secretKey: formData.secretKey
        });
        
        if (result.success) {
          setMessage('✅ Admin account created! Redirecting...');
          localStorage.removeItem('selectedRole');
          setTimeout(() => navigate('/admin/dashboard'), 1500);
        } else {
          setMessage(`❌ ${result.error}`);
        }
      } else {
        // Client/Freelancer registration
        const result = await registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: selectedRole
        });
        
        if (result.success) {
          setMessage(`✅ ${selectedRole} account created! Redirecting...`);
          localStorage.removeItem('selectedRole');
          setTimeout(() => {
            navigate(selectedRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
          }, 1500);
        } else {
          setMessage(`❌ ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('❌ Registration failed. Please try again.');
    }
  };

  const getRoleIcon = () => {
    switch(selectedRole) {
      case 'admin': return '🛡️';
      case 'client': return '👔';
      case 'freelancer': return '💻';
      default: return '👤';
    }
  };

  const getRoleTitle = () => {
    switch(selectedRole) {
      case 'admin': return 'Admin Registration';
      case 'client': return 'Client Registration';
      case 'freelancer': return 'Freelancer Registration';
      default: return 'Create Account';
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>FreelanceHub</h1>
          <div className="role-badge">
            <span className="role-icon">{getRoleIcon()}</span>
            <h2>{getRoleTitle()}</h2>
            <Link to="/role-selection" className="change-role-link">
              Change Role
            </Link>
          </div>
          <p className="register-subtitle">
            {selectedRole === 'admin' 
              ? 'Setup administrator account for platform management'
              : selectedRole === 'client'
              ? 'Create account to hire talented freelancers'
              : 'Create account to find projects and grow your career'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {selectedRole === 'admin' && (
            <div className="form-group">
              <label>Admin Security Key *</label>
              <input
                type="password"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleChange}
                placeholder="Enter admin security key"
                className={errors.secretKey ? 'error' : ''}
              />
              <small className="input-hint">
                Required for admin registration. Contact system administrator if you don't have it.
              </small>
              {errors.secretKey && <span className="error-text">{errors.secretKey}</span>}
            </div>
          )}

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Create ${selectedRole} Account`}
          </button>
        </form>

        {message && (
          <div className={`register-message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="register-footer">
          <p className="login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
          
          <div className="terms">
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;