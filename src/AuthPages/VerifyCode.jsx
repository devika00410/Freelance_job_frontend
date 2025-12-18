import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const VerifyCode = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    const API_BASE = 'http://localhost:3000/api';

    useEffect(() => {
        // Get email from navigation state or localStorage
        const locationEmail = location.state?.email;
        const storedEmail = localStorage.getItem('resetEmail') || '';
        
        if (locationEmail) {
            setEmail(locationEmail);
            localStorage.setItem('resetEmail', locationEmail);
        } else if (storedEmail) {
            setEmail(storedEmail);
        } else {
            // No email found, redirect to forgot password
            navigate('/forgot-password');
        }
    }, [location, navigate]);

    useEffect(() => {
        // Countdown timer for resend
        if (resendTimer > 0 && !canResend) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
    }, [resendTimer, canResend]);

    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are filled
        if (index === 5 && value && newCode.every(digit => digit !== '')) {
            handleVerify();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbers = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        
        const newCode = [...code];
        numbers.forEach((num, index) => {
            if (index < 6) {
                newCode[index] = num;
            }
        });
        
        setCode(newCode);
        
        // Focus the last filled input
        const lastFilledIndex = numbers.length - 1;
        if (lastFilledIndex < 6) {
            inputRefs.current[lastFilledIndex]?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');
        
        if (verificationCode.length !== 6) {
            setError('Please enter all 6 digits of the code');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE}/auth/password/verify-reset-code`, {
                email,
                resetCode: verificationCode
            });

            if (response.data.success) {
                setMessage('✅ Code verified successfully!');
                
                // Navigate to reset password page
                setTimeout(() => {
                    navigate('/reset-password', { 
                        state: { 
                            email, 
                            verificationToken: response.data.verificationToken 
                        }
                    });
                }, 1500);
            } else {
                setError(response.data.error || 'Invalid verification code');
                // Clear code on error
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            console.error('Verify code error:', err);
            setError(err.response?.data?.error || 'Failed to verify code. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE}/auth/password/forgot-password`, { email });

            if (response.data.success) {
                setMessage('✅ New code sent to your email');
                setResendTimer(60);
                setCanResend(false);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError('Failed to resend code. Please try again.');
            }
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Verify Code</h2>
                    <p>Enter the 6-digit code sent to {email}</p>
                </div>

                <div className="code-input-container">
                    <div className="code-inputs">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                disabled={loading}
                                className="code-input"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                    <p className="code-hint">Enter the 6-digit verification code</p>
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

                <div className="button-group">
                    <button
                        onClick={handleVerify}
                        className="btn btn-primary btn-block"
                        disabled={loading || code.join('').length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <button
                        onClick={handleResendCode}
                        className="btn btn-secondary btn-block"
                        disabled={loading || !canResend}
                    >
                        {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </button>

                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="btn-link"
                        disabled={loading}
                    >
                        ← Use different email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;