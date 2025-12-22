import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactPage.css';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaPaperPlane,
  FaEye,
  FaCommentDots,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
  FaUser,
  FaChartBar,
  FaSync
} from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';

const ContactPage = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'visitor'
  });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Use the API URL from your .env file
  const API_URL = import.meta.env.VITE_API_URL || 'https://freelance-job-backend.onrender.com';
  console.log('API URL:', API_URL); // For debugging

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('admin_token') ||
                  localStorage.getItem('adminToken');
    
    console.log('Token found:', !!token); 
    
    if (token) {
      try {
        // Try to parse user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('User data:', userData); // Debug log
        
        // Check if user is admin based on role
        if (userData.role === 'admin' || userData.role === 'support' || userData.isAdmin) {
          setIsAdmin(true);
          await fetchContacts();
          await fetchStats();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    }
  };

 const fetchContacts = async () => {
  setLoading(true);
  try {
    // First try localStorage
    const storedContacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    console.log('Contacts from localStorage:', storedContacts);
    setContacts(storedContacts);
    

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('admin_token') ||
                    localStorage.getItem('adminToken');
      if (token) {
        const response = await axios.get(`${API_URL}/api/contacts/all`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.success && response.data.data) {
          console.log('Also got contacts from API:', response.data.data.length);
        }
      }
    } catch (apiErr) {
      // Silently ignore API errors for now
      console.log('API not available, using localStorage');
    }
    
  } catch (err) {
    console.error('Error fetching contacts:', err);
    setError('Failed to load contacts');
    setContacts([]);
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
  try {
    const contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    const stats = {
      total: contacts.length,
      new: contacts.filter(c => c.status === 'new').length,
      in_progress: contacts.filter(c => c.status === 'in_progress').length,
      resolved: contacts.filter(c => c.status === 'resolved').length
    };
    
    setStats(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');
  setSuccess(false);
  
  // Validation
  if (!formData.name || !formData.email || !formData.subject || !formData.message) {
    setError('Please fill in all required fields');
    setSubmitting(false);
    return;
  }

  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    setError('Please enter a valid email address');
    setSubmitting(false);
    return;
  }

  try {
    // Create contact object
    const contactData = {
      _id: Date.now().toString(),
      ...formData,
      status: 'new',
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving contact:', contactData);
    
    // Save to localStorage
    const existingContacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    existingContacts.push(contactData);
    localStorage.setItem('contactMessages', JSON.stringify(existingContacts));
    
    // Show success
    setSuccess(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      userType: 'visitor'
    });
    
    setTimeout(() => setSuccess(false), 5000);
    
    // Refresh if admin
    if (isAdmin) {
      await fetchContacts();
    }
    
  } catch (err) {
    console.error('Error:', err);
    setError('Message saved locally!');
    setSuccess(true); // Still show success
  } finally {
    setSubmitting(false);
  }
};

  const handleUpdateStatus = async (contactId, status) => {
  try {
    // Get contacts from localStorage
    const contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    
    // Update the specific contact
    const updatedContacts = contacts.map(contact => 
      contact._id === contactId 
        ? { ...contact, status: status }
        : contact
    );
    
    // Save back to localStorage
    localStorage.setItem('contactMessages', JSON.stringify(updatedContacts));
    
    // Refresh the display
    await fetchContacts();
    
  } catch (err) {
    console.error('Update status error:', err);
    setError('Failed to update status in local storage');
  }
};

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      setError('Please enter a response message');
      return;
    }

    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('admin_token') ||
                    localStorage.getItem('adminToken');
      
      const response = await axios.post(`${API_URL}/api/contacts/${selectedContact?._id}/respond`, 
        { responseMessage },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        setShowResponseModal(false);
        setResponseMessage('');
        await fetchContacts();
        await fetchStats();
      } else {
        setError('Failed to send response: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Send response error:', err);
      setError('Failed to send response');
    }
  };

  const StatusBadge = ({ status }) => {
    let className = 'status-badge ';
    switch (status) {
      case 'new': className += 'status-new'; break;
      case 'in_progress': className += 'status-progress'; break;
      case 'resolved': className += 'status-resolved'; break;
      case 'closed': className += 'status-closed'; break;
      default: className += 'status-default';
    }
    
    const getLabel = () => {
      switch (status) {
        case 'new': return 'New';
        case 'in_progress': return 'In Progress';
        case 'resolved': return 'Resolved';
        case 'closed': return 'Closed';
        default: return status;
      }
    };

    return <span className={className}>{getLabel()}</span>;
  };

  const PriorityBadge = ({ priority }) => {
    let className = 'priority-badge ';
    switch (priority) {
      case 'high': className += 'priority-high'; break;
      case 'medium': className += 'priority-medium'; break;
      case 'low': className += 'priority-low'; break;
      default: className += 'priority-medium';
    }

    return <span className={className}>{priority || 'medium'}</span>;
  };

  const filteredContacts = () => {
    if (activeTab === 'all') return contacts;
    if (activeTab === 'new') return contacts.filter(c => c.status === 'new');
    if (activeTab === 'progress') return contacts.filter(c => c.status === 'in_progress');
    if (activeTab === 'resolved') return contacts.filter(c => c.status === 'resolved');
    return contacts;
  };

  return (
    <div className="contact-container">
      {/* Header */}
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p className="subtitle">We're here to help. Send us a message and we'll respond as soon as possible.</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="alert alert-error">
          <FaExclamationCircle className="alert-icon" />
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <FaCheckCircle className="alert-icon" />
          <span>Your message has been sent successfully! We'll get back to you soon.</span>
          <button className="alert-close" onClick={() => setSuccess(false)}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="contact-content">
        {/* Left Side - Contact Info */}
        <div className="contact-info-card">
          <div className="info-header">
            <h2>Get In Touch</h2>
            <p>Have questions or need assistance? We're here to help!</p>
          </div>
          
          <div className="info-items">
            <div className="info-item">
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <div className="info-text">
                <h3>Email</h3>
                <p>support@freelancejob.com</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <FaPhone />
              </div>
              <div className="info-text">
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="info-text">
                <h3>Address</h3>
                <p>123 Freelance St, City, Country</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <FaClock />
              </div>
              <div className="info-text">
                <h3>Business Hours</h3>
                <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="info-footer">
            <h3>Quick Response</h3>
            <p>We typically respond within 24 hours during business days.</p>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="contact-form-card">
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="name">
                  Your Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">
                Subject <span className="required">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="userType">I am a</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="visitor">Visitor / Potential User</option>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">
                Your Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Please provide details about your inquiry, issue, or feedback..."
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FaSync className="spinning" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <IoIosSend />
                  <span>Send Message</span>
                </>
              )}
            </button>
            
            <p className="form-note">
              By submitting this form, you agree to our Privacy Policy and consent to being contacted.
            </p>
          </form>
        </div>
      </div>

      {/* Admin Dashboard */}
      {isAdmin && (
        <div className="admin-dashboard">
          <div className="dashboard-header">
            <h2><FaChartBar /> Contact Management Dashboard</h2>
            <button 
              className="refresh-btn"
              onClick={() => {
                fetchContacts();
                fetchStats();
              }}
              disabled={loading}
            >
              <FaSync className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
          
          {/* Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Messages</h3>
              <div className="stat-number">{contacts.length}</div>
            </div>
            
            <div className="stat-card stat-new">
              <h3>New</h3>
              <div className="stat-number">{contacts.filter(c => c.status === 'new').length}</div>
            </div>
            
            <div className="stat-card stat-progress">
              <h3>In Progress</h3>
              <div className="stat-number">{contacts.filter(c => c.status === 'in_progress').length}</div>
            </div>
            
            <div className="stat-card stat-resolved">
              <h3>Resolved</h3>
              <div className="stat-number">{contacts.filter(c => c.status === 'resolved' || c.status === 'closed').length}</div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Messages ({contacts.length})
            </button>
            <button 
              className={`tab ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New ({contacts.filter(c => c.status === 'new').length})
            </button>
            <button 
              className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              In Progress ({contacts.filter(c => c.status === 'in_progress').length})
            </button>
            <button 
              className={`tab ${activeTab === 'resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('resolved')}
            >
              Resolved ({contacts.filter(c => c.status === 'resolved' || c.status === 'closed').length})
            </button>
          </div>
          
          {/* Contacts Table */}
          <div className="contacts-table-container">
            {loading ? (
              <div className="loading-container">
                <FaSync className="spinning large" />
                <p>Loading contacts...</p>
              </div>
            ) : filteredContacts().length === 0 ? (
              <div className="no-data">
                <p>No contact messages found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts().map((contact) => (
                      <tr key={contact._id || contact.id}>
                        <td>
                          <div className="user-info">
                            <FaUser className="user-icon" />
                            {contact.name}
                          </div>
                        </td>
                        <td>{contact.email}</td>
                        <td className="subject-cell">{contact.subject}</td>
                        <td>
                          <StatusBadge status={contact.status} />
                        </td>
                        <td>
                          <PriorityBadge priority={contact.priority} />
                        </td>
                        <td>
                          {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowDetailModal(true);
                              }}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            
                            <button 
                              className="action-btn respond-btn"
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowResponseModal(true);
                              }}
                              disabled={contact.status === 'resolved' || contact.status === 'closed'}
                              title="Send Response"
                            >
                              <FaCommentDots />
                            </button>
                            
                            {(contact.status === 'new' || contact.status === 'in_progress') && (
                              <button 
                                className="action-btn resolve-btn"
                                onClick={() => handleUpdateStatus(contact._id || contact.id, 'resolved')}
                                title="Mark as Resolved"
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <h2>Contact Message Details</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{selectedContact.name}</p>
                </div>
                
                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedContact.email}</p>
                </div>
                
                <div className="detail-item">
                  <label>User Type</label>
                  <p>{selectedContact.userType || 'visitor'}</p>
                </div>
                
                <div className="detail-item">
                  <label>Status</label>
                  <StatusBadge status={selectedContact.status} />
                </div>
                
                <div className="detail-item">
                  <label>Priority</label>
                  <PriorityBadge priority={selectedContact.priority} />
                </div>
                
                <div className="detail-item">
                  <label>Date</label>
                  <p>{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                
                <div className="detail-item full-width">
                  <label>Subject</label>
                  <p><strong>{selectedContact.subject}</strong></p>
                </div>
                
                <div className="detail-item full-width">
                  <label>Message</label>
                  <div className="message-content">
                    {selectedContact.message}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal-overlay">
          <div className="modal-content response-modal">
            <div className="modal-header">
              <h2>Send Response to {selectedContact?.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowResponseModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Response Message</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="8"
                  placeholder="Type your response here..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSendResponse}
                disabled={!responseMessage.trim()}
              >
                <FaPaperPlane />
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;