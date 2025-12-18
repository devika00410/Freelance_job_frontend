import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./UnifiedLogin.css";

const UnifiedLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const { loginUser, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!validateForm()) {
            setMessage('Please fix the errors above');
            return;
        }
        
        // The backend will automatically detect if it's admin or user
        const result = await loginUser(formData);

        if (result.success) {
            setMessage(`✅ Login successful! Welcome ${result.user.name || result.user.profile?.name}`);
            
            // Redirect based on role
            setTimeout(() => {
                switch(result.user.role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'client':
                        navigate('/client/dashboard');
                        break;
                    case 'freelancer':
                        navigate('/freelancer/dashboard');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }, 1500);
        } else {
            setMessage(`❌ ${result.error}`);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="brand-logo">⚡</div>
                    <h1 className="brand-name">FreelanceHub</h1>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your account to continue</p>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
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
                        <label className="form-label">Password</label>
                        <input 
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password" 
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                        
                        <div className="forgot-password">
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                
                {message && (
                    <div className={`login-message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                
                <div className="login-footer">
                    <p className="signup-link">
                        Don't have an account? <Link to="/role-selection" className="signup-redirect">Sign Up</Link>
                    </p>
                    
                    <div className="role-info">
                        <small>
                            This login works for all account types: Admin, Client, and Freelancer.
                        </small>
                    </div>
                </div>
            </div>
            
            <div className="login-graphics">
                <div className="graphics-overlay">
                    <div className="overlay-content">
                        <h3 className="graphics-text">One Login for All Roles</h3>
                        <p className="graphics-subtext">Admin, Client, and Freelancer - All in one place</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedLogin;