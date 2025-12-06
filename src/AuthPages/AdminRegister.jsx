import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import './AdminRegister.css';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    secretKey: ''
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { registerAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';

    if (name === 'name' && value.trim().length < 2) {
      error = 'Name must be at least 2 characters';
    }

    if (name === 'email') {
      // SIMPLIFIED EMAIL VALIDATION - just check if it has @ and .
      if (!value.includes('@') || !value.includes('.')) {
        error = 'Please enter a valid email address';
      }
    }

    if (name === 'password' && value.length < 8) {
      error = 'Password must be at least 8 characters';
    }

    if (name === 'secretKey' && !value.trim()) {
      error = 'Security key is required';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Remove real-time validation to avoid annoying errors
    // validateField(name, value);
  };

  // Simple validation on submit only
  const isFormValid = formData.name && 
                     formData.email && 
                     formData.password && 
                     formData.secretKey;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Simple validation on submit
    const submitErrors = {};
    
    if (!formData.name.trim()) {
      submitErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      submitErrors.email = 'Email is required';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      submitErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      submitErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      submitErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.secretKey.trim()) {
      submitErrors.secretKey = 'Security key is required';
    }

    setErrors(submitErrors);

    if (Object.keys(submitErrors).length > 0) {
      setMessage("Please fix the errors before submitting.");
      return;
    }

    const result = await registerAdmin(formData);

    if (result.success) {
      setMessage("✅ Admin account created! Redirecting to dashboard...");
      localStorage.removeItem("selectedRole");
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form admin-form">
        <h2>Setup Admin Account</h2>
        <p className="form-subtitle">Create administrator account for platform management</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Name *</label>
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
            <label>Admin Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange} 
              placeholder="admin@example.com" 
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Admin Password *</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 8 characters)" 
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Security Key *</label>
            <input
              type="password"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Enter installation security key"
              className={errors.secretKey ? 'error' : ''}
            />
            {errors.secretKey && <span className="error-text">{errors.secretKey}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Setting Up Admin..." : "Setup Admin Account"}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <p className="auth-link">
          Already have an admin account? <Link to="/admin/login">Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;