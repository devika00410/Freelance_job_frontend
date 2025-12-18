import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import './UnifiedAuthPage.css';

const UnifiedAuthPage = () => {
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: '',
        role: 'client'
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const { loginUser, registerUser, registerAdmin, loginAdmin } = useAuth();
    const navigate = useNavigate();
    const API_BASE = 'http://localhost:3000/api';

    // Toggle between User and Admin auth
    const toggleAuthType = () => {
        setIsAdminMode(!isAdminMode);
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            secretKey: '',
            role: isAdminMode ? 'client' : 'admin'
        });
        setMessage('');
        setErrors({});
    };

    // Check if email belongs to admin
    const checkAdminEmail = async (email) => {
        try {
            const response = await axios.post(`${API_BASE}/auth/check-admin-email`, { email });
            return response.data.isAdmin;
        } catch (error) {
            console.error('Error checking admin email:', error);
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (authMode === 'register') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
            
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
            
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            }
            
            if (authMode === 'register' && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
            
            if (isAdminMode && authMode === 'register' && !formData.secretKey.trim()) {
                newErrors.secretKey = 'Admin security key is required';
            }
        } else {
            // Login validation
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            if (!formData.password) newErrors.password = 'Password is required';
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
        
        setLoading(true);
        setMessage('');
        
        try {
            if (authMode === 'login') {
                // LOGIN HANDLING
                if (isAdminMode) {
                    // Admin login
                    const result = await loginAdmin({
                        email: formData.email,
                        password: formData.password
                    });
                    
                    if (result.success) {
                        setMessage('✅ Admin login successful! Redirecting...');
                        setTimeout(() => navigate('/admin/dashboard'), 1500);
                    } else {
                        setMessage(`❌ ${result.error}`);
                    }
                } else {
                    // User login (client/freelancer)
                    const result = await loginUser({
                        email: formData.email,
                        password: formData.password
                    });
                    
                    if (result.success) {
                        setMessage(`✅ Welcome back, ${result.user.name}!`);
                        setTimeout(() => {
                            if (result.user.role === 'client') {
                                navigate('/client/dashboard');
                            } else {
                                navigate('/freelancer/dashboard');
                            }
                        }, 1500);
                    } else {
                        setMessage(`❌ ${result.error}`);
                    }
                }
            } else {
                // REGISTRATION HANDLING
                if (isAdminMode) {
                    // Admin registration
                    const result = await registerAdmin({
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                        secretKey: formData.secretKey
                    });
                    
                    if (result.success) {
                        setMessage('✅ Admin account created! Redirecting...');
                        setTimeout(() => navigate('/admin/dashboard'), 1500);
                    } else {
                        setMessage(`❌ ${result.error}`);
                    }
                } else {
                    // User registration (client/freelancer)
                    const result = await registerUser({
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                        role: formData.role
                    });
                    
                    if (result.success) {
                        setMessage(`✅ ${formData.role} account created! Redirecting...`);
                        setTimeout(() => {
                            navigate(formData.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
                        }, 1500);
                    } else {
                        setMessage(`❌ ${result.error}`);
                    }
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            setMessage('❌ Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setAuthMode(prev => prev === 'login' ? 'register' : 'login');
        setMessage('');
        setErrors({});
        setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: '',
            secretKey: ''
        }));
    };

    return (
        <div className="unified-auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>FreelanceHub</h1>
                    <div className="auth-type-toggle">
                        <button 
                            className={`type-btn ${!isAdminMode ? 'active' : ''}`}
                            onClick={() => setIsAdminMode(false)}
                            type="button"
                        >
                            👤 User
                        </button>
                        <button 
                            className={`type-btn ${isAdminMode ? 'active' : ''}`}
                            onClick={() => setIsAdminMode(true)}
                            type="button"
                        >
                            🛡️ Admin
                        </button>
                    </div>
                    
                    <h2>
                        {isAdminMode 
                            ? `Admin ${authMode === 'login' ? 'Login' : 'Registration'}`
                            : `${authMode === 'login' ? 'Sign In' : 'Sign Up'}`
                        }
                    </h2>
                    <p className="auth-subtitle">
                        {isAdminMode
                            ? 'Platform administration portal'
                            : authMode === 'login'
                            ? 'Access your account'
                            : 'Create your account'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {authMode === 'register' && (
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={isAdminMode ? "admin@example.com" : "your.email@example.com"}
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
                            placeholder={authMode === 'login' ? 'Enter your password' : 'Create a password (min 6 characters)'}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    {authMode === 'register' && (
                        <>
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
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                            </div>

                            {!isAdminMode && (
                                <div className="form-group">
                                    <label>Account Type</label>
                                    <div className="role-selection">
                                        <label className="role-option">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="client"
                                                checked={formData.role === 'client'}
                                                onChange={handleChange}
                                            />
                                            <span className="role-label">
                                                <span className="role-icon">👔</span>
                                                <span className="role-text">
                                                    <strong>Client</strong>
                                                    <small>Hire freelancers</small>
                                                </span>
                                            </span>
                                        </label>
                                        
                                        <label className="role-option">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="freelancer"
                                                checked={formData.role === 'freelancer'}
                                                onChange={handleChange}
                                            />
                                            <span className="role-label">
                                                <span className="role-icon">💻</span>
                                                <span className="role-text">
                                                    <strong>Freelancer</strong>
                                                    <small>Find work</small>
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {isAdminMode && (
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
                                        Required for admin registration. Contact system administrator.
                                    </small>
                                    {errors.secretKey && <span className="error-text">{errors.secretKey}</span>}
                                </div>
                            )}
                        </>
                    )}

                    {authMode === 'login' && !isAdminMode && (
                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 
                         isAdminMode
                            ? authMode === 'login' ? 'Admin Login' : 'Create Admin Account'
                            : authMode === 'login' ? 'Sign In' : 'Sign Up'
                        }
                    </button>
                </form>

                {message && (
                    <div className={`auth-message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <div className="auth-footer">
                    <p className="auth-toggle">
                        {isAdminMode
                            ? authMode === 'login'
                                ? "Need a user account? "
                                : "Setting up user account? "
                            : authMode === 'login'
                                ? "Need admin access? "
                                : "Setting up admin? "
                        }
                        <button 
                            type="button" 
                            onClick={toggleAuthType}
                            className="toggle-btn"
                        >
                            Switch to {isAdminMode ? 'User' : 'Admin'}
                        </button>
                    </p>

                    <p className="auth-mode-toggle">
                        {authMode === 'login'
                            ? "Don't have an account? "
                            : "Already have an account? "
                        }
                        <button 
                            type="button" 
                            onClick={toggleAuthMode}
                            className="toggle-btn"
                        >
                            {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnifiedAuthPage;