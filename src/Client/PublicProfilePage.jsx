import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaUsers,
  FaCalendarAlt,
  FaBriefcase,
  FaIdCard,
  FaRegFileAlt,
  FaEdit,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaProjectDiagram,
  FaFileContract,
  FaMoneyBillWave,
  FaShieldAlt
} from 'react-icons/fa';
import './PublicProfilePage.css';

const PublicProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    totalSpent: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Check if viewing own profile
      const isOwnProfile = !profileId || profileId === 'my-profile';
      const token = localStorage.getItem('token');
      
      let profileData;

      if (isOwnProfile) {
        // Get own profile from localStorage
        const storedProfile = localStorage.getItem('clientProfile');
        if (!storedProfile) {
          throw new Error('Profile not found');
        }
        profileData = JSON.parse(storedProfile);
      } else {
        // Get public profile by ID from API
        const response = await axios.get(`http://localhost:3000/api/public/profile/${profileId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!response.data.success) {
          throw new Error('Profile not found');
        }
        profileData = response.data.profile;
      }

      setProfile(profileData);
      
      // Fetch additional stats if it's the user's own profile
      if (isOwnProfile && token) {
        await fetchDashboardStats(token);
      }
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Unable to load profile. The profile may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/api/client/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAgencyTypeDisplay = (agencyType) => {
    if (!agencyType) return 'Not specified';
    return agencyType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile information...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="public-profile-error">
        <div className="error-icon">
          <FaTimesCircle />
        </div>
        <h2>Profile Not Found</h2>
        <p>{error || 'The profile you are looking for does not exist.'}</p>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  const isOwnProfile = !profileId || profileId === 'my-profile' || profile._id === localStorage.getItem('profileId');

  return (
    <div className="public-profile-page">
      {/* Header Navigation */}
      <div className="profile-navigation">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        {isOwnProfile && (
          <Link to="/client/profile/edit" className="btn-edit-profile">
            <FaEdit /> Edit Profile
          </Link>
        )}
      </div>

      {/* Hero Section */}
      <div className="profile-hero">
        <div className="profile-avatar-container">
          {profile.companyLogoPreview ? (
            <img 
              src={profile.companyLogoPreview} 
              alt={profile.companyName || profile.agencyName} 
              className="company-logo"
            />
          ) : (
            <div className="avatar-placeholder">
              <FaBuilding />
            </div>
          )}
        </div>
        
        <div className="profile-header">
          <h1 className="profile-title">{profile.companyName || profile.agencyName}</h1>
          <p className="profile-subtitle">{getAgencyTypeDisplay(profile.agencyType)}</p>
          
          <div className="profile-location">
            <FaMapMarkerAlt />
            <span>
              {profile.city && `${profile.city}, `}
              {profile.state && `${profile.state}, `}
              {profile.country}
            </span>
          </div>

          {/* Stats Grid for Own Profile */}
          {isOwnProfile && (
            <div className="profile-stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalProjects}</div>
                <div className="stat-label">Total Projects</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.completedProjects}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.activeProjects}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{formatCurrency(stats.totalSpent)}</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="content-grid">
          {/* Company Details */}
          <div className="profile-card">
            <div className="card-header">
              <FaBuilding className="card-icon" />
              <h3>Company Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Registration Number</label>
                  <p>{profile.registrationNumber || 'Not provided'}</p>
                </div>
                <div className="info-item">
                  <label>Office Space</label>
                  <p>{profile.officeSpace ? profile.officeSpace.charAt(0).toUpperCase() + profile.officeSpace.slice(1) : 'Not specified'}</p>
                </div>
                <div className="info-item">
                  <label>Founded Year</label>
                  <p>{profile.foundedYear || 'Not provided'}</p>
                </div>
                <div className="info-item full-width">
                  <label>Address</label>
                  <p className="address-text">
                    {profile.address ? `${profile.address}, ${profile.city}, ${profile.state}, ${profile.country}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="profile-card">
            <div className="card-header">
              <FaPhone className="card-icon" />
              <h3>Contact Details</h3>
            </div>
            <div className="card-body">
              <div className="contact-grid">
                <div className="contact-item">
                  <label>Primary Contact</label>
                  <p className="contact-name">{profile.contactPersonName || 'Not specified'}</p>
                  {profile.contactPersonTitle && (
                    <span className="contact-title">{profile.contactPersonTitle}</span>
                  )}
                </div>
                
                <div className="contact-methods">
                  {profile.telephoneNumber && (
                    <div className="contact-method">
                      <FaPhone />
                      <div>
                        <span className="method-label">Telephone</span>
                        <span className="method-value">{profile.telephoneNumber}</span>
                        {profile.phoneVerified && (
                          <span className="verification-badge">
                            <FaCheckCircle /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profile.email && (
                    <div className="contact-method">
                      <FaEnvelope />
                      <div>
                        <span className="method-label">Email</span>
                        <span className="method-value">{profile.email}</span>
                        {profile.emailVerified && (
                          <span className="verification-badge">
                            <FaCheckCircle /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {profile.tollFreeNumber && (
                    <div className="contact-method">
                      <FaPhone />
                      <div>
                        <span className="method-label">Toll-Free</span>
                        <span className="method-value">{profile.tollFreeNumber}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="profile-card">
            <div className="card-header">
              <FaBriefcase className="card-icon" />
              <h3>Business Overview</h3>
            </div>
            <div className="card-body">
              <div className="business-info">
                {profile.totalEmployees && (
                  <div className="business-item">
                    <FaUsers />
                    <div>
                      <label>Company Size</label>
                      <p>{profile.totalEmployees} Employees</p>
                    </div>
                  </div>
                )}
                
                {profile.annualRevenue && (
                  <div className="business-item">
                    <FaMoneyBillWave />
                    <div>
                      <label>Annual Revenue</label>
                      <p>
                        {profile.annualRevenue === '0-100k' && '$0 - $100,000'}
                        {profile.annualRevenue === '100k-500k' && '$100,000 - $500,000'}
                        {profile.annualRevenue === '500k-1m' && '$500,000 - $1M'}
                        {profile.annualRevenue === '1m-5m' && '$1M - $5M'}
                        {profile.annualRevenue === '5m-10m' && '$5M - $10M'}
                        {profile.annualRevenue === '10m+' && '$10M+'}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile.foundedYear && (
                  <div className="business-item">
                    <FaCalendarAlt />
                    <div>
                      <label>Established</label>
                      <p>{profile.foundedYear}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Online Presence */}
          {(profile.website || profile.linkedin || profile.twitter) && (
            <div className="profile-card">
              <div className="card-header">
                <FaGlobe className="card-icon" />
                <h3>Online Presence</h3>
              </div>
              <div className="card-body">
                <div className="social-links">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="social-link">
                      <FaExternalLinkAlt /> Website
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      <FaExternalLinkAlt /> LinkedIn
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                      <FaExternalLinkAlt /> Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Work Order Scope */}
          {profile.workOrderScope && (
            <div className="profile-card full-width">
              <div className="card-header">
                <FaRegFileAlt className="card-icon" />
                <h3>Work Scope & Capabilities</h3>
              </div>
              <div className="card-body">
                <div className="work-scope-content">
                  <p>{profile.workOrderScope}</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Status */}
          <div className="profile-card">
            <div className="card-header">
              <FaShieldAlt className="card-icon" />
              <h3>Profile Status</h3>
            </div>
            <div className="card-body">
              <div className="status-info">
                <div className={`status-indicator ${profile.profileCompleted ? 'complete' : 'incomplete'}`}>
                  {profile.profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                </div>
                {profile.createdAt && (
                  <div className="profile-meta">
                    <span>Created: {formatDate(profile.createdAt)}</span>
                  </div>
                )}
                {profile.termsAccepted && (
                  <div className="verification-status">
                    <FaCheckCircle /> Terms & Conditions Accepted
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {isOwnProfile ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="action-btn primary">
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/projects/new')} className="action-btn secondary">
                <FaProjectDiagram /> Start New Project
              </button>
              <button onClick={() => navigate('/client/profile/edit')} className="action-btn outline">
                <FaEdit /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate(`/messages?to=${profile._id}`)} className="action-btn primary">
                <FaEnvelope /> Send Message
              </button>
              <button onClick={() => navigate(`/projects/new?client=${profile._id}`)} className="action-btn secondary">
                <FaBriefcase /> Hire for Project
              </button>
              <button onClick={() => navigate(`/contracts/new?client=${profile._id}`)} className="action-btn outline">
                <FaFileContract /> Create Contract
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;