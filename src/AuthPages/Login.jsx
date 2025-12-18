import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import './Login.css'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const { loginUser, loading } = useAuth('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // Clear any existing role data before login
        const roleKeys = ['client', 'freelancer', 'admin'];
        roleKeys.forEach(role => {
            localStorage.removeItem(`${role}_token`);
            localStorage.removeItem(`${role}_user`);
        });
        
        const result = await loginUser(formData);

        if (result.success) {
            setMessage(`✅ Login successful! Welcome ${result.user.profile?.name || result.user.name}`);
            localStorage.removeItem('selectedRole');
            
            setTimeout(() => navigate('/dashboard'), 2000);
        } else {
            setMessage(`❌ ${result.error}`);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-content">
                <div className="brand-header">
                    <div className="brand-logo">⚡</div>
                    <h1 className="brand-name">FreelanceHub</h1>
                </div>
                <h2 className="login-title">Welcome back</h2>
                <p className="login-subtitle">Sign in to your account to continue</p>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label className="field-label">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange} 
                            placeholder="your.email@example.com" 
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label className="field-label">Password</label>
                        <input 
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password" 
                            required 
                            minLength='6' 
                        />
                        <small className="input-hint">Must be at least 6 characters</small>
                        
                        {/* ADD THIS FORGOT PASSWORD LINK */}
                        <div className="forgot-password-link">
                            <Link to="/forgot-password" className="redirect-link">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign in'}
                    </button>
                </form>
                {message && (
                    <div className={`status-message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
                <div className="auth-redirect">
                    <p>Don't have an account? <Link to='/register' className="redirect-link">Sign up</Link></p>
                </div>
            </div>
            <div className="login-graphics">
                <div className="graphics-overlay">
                    <div className="overlay-content">
                        <h3 className="graphics-text">Join thousands of satisfied users</h3>
                        <p className="graphics-subtext">Secure, fast, and reliable authentication</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;