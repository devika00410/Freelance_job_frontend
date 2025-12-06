import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import './AdminRegister.css'; // Reusing the same CSS

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { loginAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value)) error = 'Enter a valid email address';
    }

    if (name === 'password' && !value.trim()) {
      error = 'Password is required';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    validateField(name, value);
  };

  const isFormValid = Object.values(errors).every(e => e === '') && 
                     formData.email && 
                     formData.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isFormValid) {
      setMessage("Please fix the errors before submitting.");
      return;
    }

    const result = await loginAdmin(formData);

    if (result.success) {
      setMessage("✅ Admin login successful! Redirecting...");
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form admin-form">
        <h2>Admin Access</h2>
        <p className="form-subtitle">Administrator login portal</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange} 
              placeholder="admin@yourapp.com" 
              className={errors.email ? 'error' : ''}
              required 
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
              placeholder="Enter your password" 
              className={errors.password ? 'error' : ''}
              required 
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!isFormValid || loading}
          >
            {loading ? "Accessing..." : "Admin Login"}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <p className="auth-link">
          Need an admin account? <Link to="/admin/register">Setup Admin</Link>
        </p>

        <div className="debug-info">
          <small>Admin Portal - Port: {window.location.port}</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;