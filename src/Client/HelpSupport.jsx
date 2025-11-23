import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpSupport.css';

const HelpSupport = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('faq');

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const faqItems = [
        {
            question: "How do I post a new job?",
            answer: "Click on 'Post New Job' in the dashboard, fill in the job details, set your budget, and publish the job."
        },
        {
            question: "How can I communicate with freelancers?",
            answer: "Use the workspace chat feature or project workspace to communicate directly with your hired freelancers."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We accept credit cards, debit cards, bank transfers, and popular digital payment methods."
        },
        {
            question: "How do I review proposals?",
            answer: "Go to the Proposals section to view all received proposals, filter by project, and compare freelancer profiles."
        }
    ];

    const contactMethods = [
        {
            method: "📧 Email Support",
            details: "support@freelanceplatform.com",
            response: "Response within 24 hours"
        },
        {
            method: "📞 Phone Support",
            details: "+1 (555) 123-HELP",
            response: "Available 9AM-6PM EST"
        },
        {
            method: "💬 Live Chat",
            details: "Click the chat icon in bottom right",
            response: "Available 24/7"
        }
    ];

    return (
        <div className="help-support-page">
            <header className="help-header">
                <button className="back-btn" onClick={handleBackToDashboard}>
                    ← Back to Dashboard
                </button>
                <h1>Help & Support</h1>
            </header>

            <div className="help-content">
                {/* Quick Help Cards */}
                <div className="quick-help-cards">
                    <div className="help-card">
                        <span className="help-icon">📚</span>
                        <h3>Knowledge Base</h3>
                        <p>Browse our comprehensive guides and tutorials</p>
                        <button className="btn-primary">Explore Guides</button>
                    </div>
                    <div className="help-card">
                        <span className="help-icon">🎥</span>
                        <h3>Video Tutorials</h3>
                        <p>Watch step-by-step video guides</p>
                        <button className="btn-primary">Watch Videos</button>
                    </div>
                    <div className="help-card">
                        <span className="help-icon">👥</span>
                        <h3>Community Forum</h3>
                        <p>Connect with other clients and experts</p>
                        <button className="btn-primary">Join Community</button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="help-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faq')}
                    >
                        ❓ FAQ
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        📞 Contact Support
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        📚 Resources
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'faq' && (
                        <div className="faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <div className="faq-list">
                                {faqItems.map((faq, index) => (
                                    <div key={index} className="faq-item">
                                        <h4>{faq.question}</h4>
                                        <p>{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="contact-section">
                            <h2>Contact Support</h2>
                            <div className="contact-methods">
                                {contactMethods.map((method, index) => (
                                    <div key={index} className="contact-method">
                                        <h4>{method.method}</h4>
                                        <p className="contact-detail">{method.details}</p>
                                        <p className="contact-response">{method.response}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="contact-form">
                                <h3>Send us a Message</h3>
                                <form>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input type="text" placeholder="What do you need help with?" />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea 
                                            rows="5" 
                                            placeholder="Please describe your issue in detail..."
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select>
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Urgent</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary">
                                        📧 Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="resources-section">
                            <h2>Helpful Resources</h2>
                            <div className="resources-grid">
                                <div className="resource-card">
                                    <h4>📋 Getting Started Guide</h4>
                                    <p>Learn how to make the most of our platform</p>
                                    <button className="btn-secondary">Download PDF</button>
                                </div>
                                <div className="resource-card">
                                    <h4>💰 Payment Guide</h4>
                                    <p>Understanding payments and billing</p>
                                    <button className="btn-secondary">Download PDF</button>
                                </div>
                                <div className="resource-card">
                                    <h4>👥 Hiring Best Practices</h4>
                                    <p>Tips for hiring the right freelancers</p>
                                    <button className="btn-secondary">Download PDF</button>
                                </div>
                                <div className="resource-card">
                                    <h4>⚖️ Legal & Terms</h4>
                                    <p>Platform terms and conditions</p>
                                    <button className="btn-secondary">View Terms</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;