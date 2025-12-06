import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaGlobe, 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaPaperPlane, 
  FaPhone,
  FaCheckCircle
} from 'react-icons/fa';
import './ProfileContact.css'

const ProfileContact = ({ profile }) => {
  const { contactDetails, userInfo } = profile;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="contact-main-container">
      <div className="contact-header-section">
        <h3 className="contact-main-title">Contact Me</h3>
        <p className="contact-subtitle">Ready to start your project? Let's discuss your ideas.</p>
      </div>

      <div className="contact-layout-grid">
        <div className="contact-info-panel">
          <h4 className="contact-info-heading">Contact Details</h4>
          
          <div className="contact-methods-container">
            {contactDetails.emailAddress && (
              <div className="contact-method-card">
                <FaEnvelope className="contact-method-icon" />
                <div className="contact-method-details">
                  <span className="contact-method-label">Email</span>
                  <a href={`mailto:${contactDetails.emailAddress}`} className="contact-method-value">
                    {contactDetails.emailAddress}
                  </a>
                </div>
              </div>
            )}

            {userInfo.contactPhone && (
              <div className="contact-method-card">
                <FaPhone className="contact-method-icon" />
                <div className="contact-method-details">
                  <span className="contact-method-label">Phone</span>
                  <a href={`tel:${userInfo.contactPhone}`} className="contact-method-value">
                    {userInfo.contactPhone}
                  </a>
                </div>
              </div>
            )}

            {contactDetails.personalWebsite && (
              <div className="contact-method-card">
                <FaGlobe className="contact-method-icon" />
                <div className="contact-method-details">
                  <span className="contact-method-label">Website</span>
                  <a 
                    href={contactDetails.personalWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="contact-method-value">
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="contact-social-section">
            <h5 className="contact-social-title">Social Profiles</h5>
            <div className="contact-social-grid">
              {contactDetails.socialProfiles.github && (
                <a 
                  href={contactDetails.socialProfiles.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link">
                  <FaGithub />
                </a>
              )}
              {contactDetails.socialProfiles.linkedin && (
                <a 
                  href={contactDetails.socialProfiles.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link">
                  <FaLinkedin />
                </a>
              )}
              {contactDetails.socialProfiles.twitter && (
                <a 
                  href={contactDetails.socialProfiles.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link">
                  <FaTwitter />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          {isSubmitted ? (
            <div className="contact-success-panel">
              <FaCheckCircle className="contact-success-icon" />
              <h4 className="contact-success-title">Message Sent!</h4>
              <p className="contact-success-text">
                Thank you for reaching out. I'll respond to your message within 24 hours.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="contact-retry-btn">
                Send New Message
              </button>
            </div>
          ) : (
            <form className="contact-form-styled" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="name" className="contact-form-label">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-form-label">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="subject" className="contact-form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="contact-form-input"
                  required
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="contact-form-group">
                <label htmlFor="message" className="contact-form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="contact-form-textarea"
                  placeholder="Describe your project requirements and timeline..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="contact-submit-btn"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="contact-loading-spinner"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContact;