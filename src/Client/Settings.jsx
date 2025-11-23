import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleDeleteAccount = () => {
        // Add actual delete account logic here
        console.log('Account deletion requested');
        setShowDeleteConfirm(false);
        // Redirect to home or login page after deletion
        navigate('/');
    };

    const menuItems = [
        { id: 'profile', label: 'Profile Settings', icon: '👤' },
        { id: 'notifications', label: 'Notification Preferences', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'billing', label: 'Billing & Payments', icon: '💳' },
        { id: 'privacy', label: 'Privacy', icon: '🛡️' },
        { id: 'integrations', label: 'Integrations', icon: '🔗' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'language', label: 'Language & Region', icon: '🌐' }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="settings-section">
                        <h2>Profile Information</h2>
                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="avatar-section">
                                    <div className="avatar">
                                        <span>👤</span>
                                    </div>
                                    <button className="avatar-upload-btn">
                                        📷 Change Photo
                                    </button>
                                </div>
                                <div className="profile-info">
                                    <h3>John Client</h3>
                                    <p className="account-type">Client Account</p>
                                    <p className="member-since">Member since December 2024</p>
                                    <div className="verification-badge">
                                        ✅ Email Verified
                                    </div>
                                </div>
                            </div>

                            <div className="profile-grid">
                                <div className="info-card">
                                    <div className="info-icon">👤</div>
                                    <div className="info-content">
                                        <label>Full Name</label>
                                        <p>John Client</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon">📧</div>
                                    <div className="info-content">
                                        <label>Email Address</label>
                                        <p>john.client@example.com</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon">🏢</div>
                                    <div className="info-content">
                                        <label>Company</label>
                                        <p>Tech Solutions Inc.</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon">📱</div>
                                    <div className="info-content">
                                        <label>Phone Number</label>
                                        <p>+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon">📍</div>
                                    <div className="info-content">
                                        <label>Location</label>
                                        <p>New York, USA</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon">🆔</div>
                                    <div className="info-content">
                                        <label>User ID</label>
                                        <p>USR_789456123</p>
                                    </div>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-primary" onClick={() => navigate('/profile/edit')}>
                                    ✏️ Edit Profile
                                </button>
                                <button className="btn-secondary">
                                    🔒 Change Password
                                </button>
                                <button className="btn-outline">
                                    📧 Change Email
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="settings-section">
                        <h2>Notification Preferences</h2>
                        <div className="preferences-grid">
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>📧 Email Notifications</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Receive updates about your projects and proposals via email</p>
                            </div>
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>🚀 Project Updates</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Get notified when freelancers submit work or send messages</p>
                            </div>
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>💰 Payment Reminders</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Receive payment due date reminders and invoices</p>
                            </div>
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>📢 Marketing Emails</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Receive tips, platform updates, and promotional offers</p>
                            </div>
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>🔔 Push Notifications</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Get real-time notifications in your browser</p>
                            </div>
                            <div className="preference-card">
                                <div className="preference-header">
                                    <h4>📊 Weekly Reports</h4>
                                    <label className="toggle-switch">
                                        <input type="checkbox" />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                <p>Receive weekly summaries of your project activities</p>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="settings-section">
                        <h2>Security Settings</h2>
                        <div className="security-grid">
                            <div className="security-card">
                                <div className="security-icon">🔒</div>
                                <div className="security-content">
                                    <h4>Password</h4>
                                    <p>Last changed 2 months ago</p>
                                    <button className="btn-outline">Change Password</button>
                                </div>
                            </div>
                            <div className="security-card">
                                <div className="security-icon">📱</div>
                                <div className="security-content">
                                    <h4>Two-Factor Authentication</h4>
                                    <p>Add an extra layer of security</p>
                                    <button className="btn-outline">Enable 2FA</button>
                                </div>
                            </div>
                            <div className="security-card">
                                <div className="security-icon">💻</div>
                                <div className="security-content">
                                    <h4>Active Sessions</h4>
                                    <p>3 devices currently active</p>
                                    <button className="btn-outline">Manage Sessions</button>
                                </div>
                            </div>
                            <div className="security-card">
                                <div className="security-icon">🛡️</div>
                                <div className="security-content">
                                    <h4>Privacy Settings</h4>
                                    <p>Control your visibility on the platform</p>
                                    <button className="btn-outline">Configure Privacy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'billing':
                return (
                    <div className="settings-section">
                        <h2>Billing & Payments</h2>
                        <div className="billing-grid">
                            <div className="billing-card">
                                <h4>💳 Payment Method</h4>
                                <p>Visa ending in 4242</p>
                                <button className="btn-outline">Update Payment Method</button>
                            </div>
                            <div className="billing-card">
                                <h4>🧾 Billing History</h4>
                                <p>View and download your invoices</p>
                                <button className="btn-outline">View History</button>
                            </div>
                            <div className="billing-card">
                                <h4>💰 Current Balance</h4>
                                <p className="balance">$0.00</p>
                                <button className="btn-outline">Add Funds</button>
                            </div>
                            <div className="billing-card">
                                <h4>📊 Subscription</h4>
                                <p>Free Plan</p>
                                <button className="btn-primary">Upgrade Plan</button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="settings-section">
                        <h2>{menuItems.find(item => item.id === activeSection)?.label}</h2>
                        <div className="coming-soon">
                            <div className="coming-soon-icon">🚧</div>
                            <h3>Coming Soon</h3>
                            <p>This section is under development and will be available soon.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div className="header-content">
                    <button className="back-btn" onClick={handleBackToDashboard}>
                        ← Back to Dashboard
                    </button>
                    <div className="header-title">
                        <h1>Account Settings</h1>
                        <p>Manage your account preferences and security</p>
                    </div>
                </div>
            </header>

            <div className="settings-content">
                <div className="settings-sidebar">
                    <div className="sidebar-header">
                        <h3>Settings</h3>
                    </div>
                    <ul className="settings-menu">
                        {menuItems.map(item => (
                            <li
                                key={item.id}
                                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="sidebar-footer">
                        <button 
                            className="delete-account-btn"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            🗑️ Delete Account
                        </button>
                    </div>
                </div>

                <div className="settings-main">
                    {renderContent()}

                    {/* Delete Account Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Delete Account</h3>
                                    <button 
                                        className="close-btn"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="warning-icon">⚠️</div>
                                    <h4>Are you sure you want to delete your account?</h4>
                                    <p>This action cannot be undone. All your data, projects, and history will be permanently deleted.</p>
                                    <div className="modal-actions">
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn-delete"
                                            onClick={handleDeleteAccount}
                                        >
                                            Yes, Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;