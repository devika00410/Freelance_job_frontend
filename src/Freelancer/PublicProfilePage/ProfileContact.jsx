import React, { useState } from 'react';
import { 
  FaEnvelope, FaGlobe, FaGithub, FaLinkedin, FaTwitter, 
  FaPaperPlane, FaPhone, FaCheckCircle, FaWhatsapp,
  FaSkype, FaCalendarAlt, FaClock
} from 'react-icons/fa';
import './ProfileContact.css';

const ProfileContact = ({ profile }) => {
  const { contactDetails, userInfo, stats } = profile;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedContact, setSelectedContact] = useState('message');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  // Format contact info
  const formatPhone = (phone) => {
    if (!phone) return null;
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Contact methods with icons
  const contactMethods = [
    {
      id: 'email',
      icon: <FaEnvelope />,
      label: 'Email',
      value: contactDetails?.emailAddress || userInfo?.email,
      link: `mailto:${contactDetails?.emailAddress || userInfo?.email}`,
      available: !!(contactDetails?.emailAddress || userInfo?.email)
    },
    {
      id: 'phone',
      icon: <FaPhone />,
      label: 'Phone',
      value: userInfo?.contactPhone,
      link: `tel:${userInfo?.contactPhone}`,
      available: !!userInfo?.contactPhone
    },
    {
      id: 'whatsapp',
      icon: <FaWhatsapp />,
      label: 'WhatsApp',
      value: userInfo?.whatsapp || userInfo?.contactPhone,
      link: `https://wa.me/${userInfo?.whatsapp?.replace(/\D/g, '') || userInfo?.contactPhone?.replace(/\D/g, '')}`,
      available: !!(userInfo?.whatsapp || userInfo?.contactPhone)
    },
    {
      id: 'skype',
      icon: <FaSkype />,
      label: 'Skype',
      value: userInfo?.skype,
      link: `skype:${userInfo?.skype}?chat`,
      available: !!userInfo?.skype
    },
    {
      id: 'website',
      icon: <FaGlobe />,
      label: 'Website',
      value: contactDetails?.personalWebsite,
      link: contactDetails?.personalWebsite,
      available: !!contactDetails?.personalWebsite,
      external: true
    }
  ];

  // Social profiles
  const socialProfiles = [
    { icon: <FaLinkedin />, link: contactDetails?.socialProfiles?.linkedin, label: 'LinkedIn' },
    { icon: <FaGithub />, link: contactDetails?.socialProfiles?.github, label: 'GitHub' },
    { icon: <FaTwitter />, link: contactDetails?.socialProfiles?.twitter, label: 'Twitter' }
  ].filter(item => item.link);

  return (
    <div className="profile-contact-container">
      {/* Header */}
      <div className="contact-header">
        <h2 className="contact-title">Get in Touch</h2>
        <p className="contact-subtitle">
          Have a project in mind? Let's discuss how I can help bring your ideas to life.
        </p>
        <div className="contact-stats">
          <div className="contact-stat">
            <FaClock />
            <span>Response Time: {userInfo?.responseTime || 'Within 24 hours'}</span>
          </div>
          <div className="contact-stat">
            <FaEnvelope />
            <span>Response Rate: {stats?.responseRate || '98%'}</span>
          </div>
        </div>
      </div>

      <div className="contact-layout">
        {/* Left Panel - Contact Info */}
        <div className="contact-info-panel">
          <div className="contact-info-card">
            <h3 className="contact-info-title">Contact Information</h3>
            
            {/* Contact Methods */}
            <div className="contact-methods-grid">
              {contactMethods
                .filter(method => method.available)
                .map((method) => (
                  <div key={method.id} className="contact-method-card">
                    <div className="contact-method-icon">{method.icon}</div>
                    <div className="contact-method-content">
                      <span className="contact-method-label">{method.label}</span>
                      {method.external ? (
                        <a 
                          href={method.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="contact-method-value"
                        >
                          {method.label === 'Website' ? 'Visit Website' : method.value}
                        </a>
                      ) : (
                        <a 
                          href={method.link} 
                          className="contact-method-value"
                        >
                          {method.value}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Social Profiles */}
            {socialProfiles.length > 0 && (
              <div className="contact-social-section">
                <h4 className="contact-social-title">Follow Me</h4>
                <div className="social-links-grid">
                  {socialProfiles.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link-card"
                      title={social.label}
                    >
                      {social.icon}
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="contact-availability">
              <h4 className="availability-title">
                <FaCalendarAlt /> Availability
              </h4>
              <div className="availability-status">
                <div className={`status-indicator ${userInfo?.workAvailability?.includes('Available') ? 'available' : 'busy'}`}>
                  <span className="status-dot"></span>
                  <span className="status-text">
                    {userInfo?.workAvailability || 'Available for new projects'}
                  </span>
                </div>
                <p className="availability-note">
                  I typically respond within {userInfo?.responseTime || '24 hours'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="contact-action-buttons">
            <button className="action-btn schedule-btn">
              <FaCalendarAlt />
              Schedule a Call
            </button>
            <button className="action-btn whatsapp-btn">
              <FaWhatsapp />
              Message on WhatsApp
            </button>
          </div>
        </div>

        {/* Right Panel - Contact Form */}
        <div className="contact-form-panel">
          {isSubmitted ? (
            <div className="contact-success-card">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h3 className="success-title">Message Sent Successfully!</h3>
              <p className="success-message">
                Thank you for your message. I'll review it and get back to you within 24 hours.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="success-action-btn"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="contact-form-card">
              <div className="form-header">
                <h3 className="form-title">Send a Message</h3>
                <p className="form-subtitle">Fill out the form below and I'll get back to you soon.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Job Opportunity">Job Opportunity</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="6"
                    required
                    placeholder="Tell me about your project, timeline, and budget..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                  <div className="form-note">
                    * Required fields
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContact;