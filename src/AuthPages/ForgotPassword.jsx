import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_BASE = 'http://localhost:3000/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Basic email validation
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/auth/password/forgot-password`, {
                email
            });

            if (response.data.success) {
                setMessage('✅ A verification code has been sent to your email.');
                
                // Navigate to verify code page after 2 seconds
                setTimeout(() => {
                    navigate('/verify-code', { state: { email } });
                }, 2000);
            } else {
                setError(response.data.error || 'Failed to send reset code');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a reset code</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block"
                        disabled={loading || !email}
                    >
                        {loading ? 'Sending Code...' : 'Send Reset Code'}
                    </button>

                    <div className="auth-links">
                        <button 
                            type="button" 
                            className="btn-link"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                        >
                            ← Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;