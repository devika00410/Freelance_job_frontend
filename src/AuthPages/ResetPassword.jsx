import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        // Get email and token from navigation state
        const { email: locEmail, verificationToken: locToken } = location.state || {};
        
        if (locEmail && locToken) {
            setEmail(locEmail);
            setVerificationToken(locToken);
        } else {
            // No data found, redirect to forgot password
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    useEffect(() => {
        // Calculate password strength
        let strength = 0;
        if (newPassword.length >= 8) strength += 25;
        if (/[A-Z]/.test(newPassword)) strength += 25;
        if (/[0-9]/.test(newPassword)) strength += 25;
        if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
        setPasswordStrength(strength);
    }, [newPassword]);

    const validatePassword = () => {
        if (newPassword.length < 6) {
            return 'Password must be at least 6 characters';
        }
        if (newPassword !== confirmPassword) {
            return 'Passwords do not match';
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const validationError = validatePassword();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/auth/password/reset-password`, {
                email,
                newPassword,
                confirmPassword,
                verificationToken
            });

            if (response.data.success) {
                setMessage('✅ Your password has been successfully reset.');
                
                // Clear localStorage
                localStorage.removeItem('resetEmail');
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Password reset successful. Please login with your new password.',
                            email 
                        }
                    });
                }, 2000);
            } else {
                setError(response.data.error || 'Failed to reset password');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength >= 75) return '#4CAF50';
        if (passwordStrength >= 50) return '#FF9800';
        return '#F44336';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength >= 75) return 'Strong';
        if (passwordStrength >= 50) return 'Medium';
        if (passwordStrength >= 25) return 'Weak';
        return 'Very Weak';
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Create a new password for {email}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            disabled={loading}
                            minLength="6"
                        />
                        {newPassword && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div 
                                        className="strength-fill"
                                        style={{
                                            width: `${passwordStrength}%`,
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    ></div>
                                </div>
                                <span className="strength-text">
                                    Strength: {getPasswordStrengthText()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            disabled={loading}
                            minLength="6"
                        />
                        {confirmPassword && newPassword === confirmPassword && (
                            <div className="password-match">
                                ✓ Passwords match
                            </div>
                        )}
                    </div>

                    <div className="password-requirements">
                        <p className="requirements-title">Password Requirements:</p>
                        <ul>
                            <li className={newPassword.length >= 6 ? 'met' : ''}>
                                ✓ At least 6 characters
                            </li>
                            <li className={newPassword.length >= 8 ? 'met' : ''}>
                                ✓ 8+ characters recommended
                            </li>
                            <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>
                                ✓ Include uppercase letter
                            </li>
                            <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>
                                ✓ Include number
                            </li>
                        </ul>
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
                        disabled={loading || !newPassword || !confirmPassword}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>

                    <div className="auth-links">
                        <button 
                            type="button" 
                            className="btn-link"
                            onClick={() => navigate('/verify-code')}
                            disabled={loading}
                        >
                            ← Back to verify code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;