import React from 'react';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaClock, 
  FaUser,
  FaEnvelope,
  FaBookmark,
  FaCalendar,
  FaBriefcase,
  FaPhone,
  FaShareAlt,
  FaDownload
} from 'react-icons/fa';
import './ProfileHeader.css';

const ProfileHeader = ({ profile }) => {
  if (!profile || !profile.userInfo) {
    return (
      <div className="header-main-container">
        <div className="header-error-state">
          <p>Profile data unavailable</p>
        </div>
      </div>
    );
  }

  const { userInfo, verificationStatus } = profile;

  // Simple function to get image URL
  const getImageUrl = (image, defaultImage) => {
    if (!image) return defaultImage;
    
    if (typeof image === 'string' && image.startsWith('data:image/')) {
      return image;
    }
    
    if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) {
      return image;
    }
    
    if (typeof image === 'string' && image.length > 0) {
      return image;
    }
    
    return defaultImage;
  };

  const coverPhotoUrl = getImageUrl(userInfo.coverPhoto, '/default-cover.jpg');
  const profilePictureUrl = getImageUrl(userInfo.profilePicture, '/default-avatar.jpg');

  const calculateExperienceYears = () => {
    if (userInfo.yearsOfExperience) {
      return `${userInfo.yearsOfExperience}+`;
    }
    if (!userInfo.memberSince) return '1+';
    const joinedDate = new Date(userInfo.memberSince);
    const currentDate = new Date();
    const yearsDifference = currentDate.getFullYear() - joinedDate.getFullYear();
    return yearsDifference > 0 ? `${yearsDifference}+` : '1+';
  };

  const getAvailabilityDisplay = (availability) => {
    const availabilityOptions = {
      'full-time': 'Available for full-time',
      'part-time': 'Available part-time',
      'not-available': 'Not available',
      'available': 'Available',
      'busy': 'Currently busy'
    };
    return availabilityOptions[availability] || 'Available';
  };

  const getSuccessRate = () => {
    return userInfo.successPercentage || 95;
  };

  const getCompletedProjects = () => {
    return userInfo.totalProjects || 0;
  };

  const getUserRating = () => {
    return userInfo.averageRating || 4.5;
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Recently joined';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch (error) {
      return 'Recently joined';
    }
  };

  // Format rate with proper display
  const formatRate = () => {
    if (!userInfo.ratePerHour || userInfo.ratePerHour === 0) return 'Rate not set';
    return `$${userInfo.ratePerHour}/hr`;
  };

  // Check if profile is verified
  const isVerified = verificationStatus?.isIdentityVerified || verificationStatus?.isEmailVerified;

  return (
    <div className="header-main-container">
      {/* Cover Section */}
      <div className="header-cover-section">
        <img 
          src={coverPhotoUrl} 
          alt="Cover" 
          className="header-cover-image"
          onError={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0a1f3d 0%, #08182f 100%)';
            e.target.style.display = 'flex';
            e.target.style.alignItems = 'center';
            e.target.style.justifyContent = 'center';
            e.target.style.color = 'white';
            e.target.innerHTML = '<span style="font-size: 24px; font-weight: 600;">Professional Profile</span>';
          }}
        />
        <div className="header-cover-overlay"></div>
        
        {/* Cover Action Buttons */}
        <div className="header-cover-actions">
          <button className="cover-action-btn share-btn">
            <FaShareAlt size={16} />
            Share
          </button>
          <button className="cover-action-btn download-btn">
            <FaDownload size={16} />
            Download CV
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="header-content-wrapper">
        {/* Avatar Container */}
        <div className="header-avatar-wrapper">
          <div className="header-avatar-container">
            <img 
              src={profilePictureUrl} 
              alt={userInfo.fullName || 'User'}
              className="header-avatar-image"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'header-avatar-fallback';
                fallbackDiv.innerHTML = '<FaUser size={48} color="#3b82f6" />';
                fallbackDiv.style.width = '100%';
                fallbackDiv.style.height = '100%';
                fallbackDiv.style.display = 'flex';
                fallbackDiv.style.alignItems = 'center';
                fallbackDiv.style.justifyContent = 'center';
                fallbackDiv.style.background = '#f8fafc';
                fallbackDiv.style.borderRadius = '16px';
                e.target.parentNode.appendChild(fallbackDiv);
              }}
            />
            
            {/* Verified Badge */}
            {isVerified && (
              <div className="header-verified-badge" title="Verified Professional">
                <FaCheckCircle size={20} />
                <span>Verified</span>
              </div>
            )}
          </div>
          
          {/* Quick Contact Info */}
          <div className="header-contact-info">
            {userInfo.contactPhone && (
              <div className="contact-info-item">
                <FaPhone size={14} />
                <span>{userInfo.contactPhone}</span>
              </div>
            )}
            {userInfo.email && (
              <div className="contact-info-item">
                <FaEnvelope size={14} />
                <span>{userInfo.email}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="header-details-section">
          <div className="header-info-section">
            {/* Name and Title */}
            <div className="header-name-section">
              <h1 className="header-name">
                {userInfo.fullName || 'Professional Freelancer'}
                <span className="header-pro-badge">PRO</span>
              </h1>
              <h2 className="header-title">
                {userInfo.professionalTitle || 'Freelance Professional'}
              </h2>
            </div>
            
            {/* Location and Rating */}
            <div className="header-location-rating">
              <div className="location-section">
                <FaMapMarkerAlt size={16} />
                <span className="location-text">
                  {userInfo.currentLocation || 'Location not specified'}
                </span>
                <span className="member-since">
                  • Member since {formatMemberSince(userInfo.memberSince)}
                </span>
              </div>
              
              <div className="rating-section">
                <div className="stars-container">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      size={16} 
                      className={`star-icon ${i < Math.floor(getUserRating()) ? 'filled' : 'empty'}`}
                    />
                  ))}
                </div>
                <span className="rating-value">{getUserRating().toFixed(1)}</span>
                <span className="rating-count">({getCompletedProjects()} reviews)</span>
              </div>
            </div>
            
            {/* Availability Badge */}
            <div className="availability-badge">
              <span className={`status-dot ${userInfo.workAvailability?.includes('Available') ? 'available' : 'busy'}`}></span>
              <span className="status-text">
                {getAvailabilityDisplay(userInfo.workAvailability)}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="header-actions-section">
            <button className="header-primary-btn">
              <FaEnvelope />
              Send Message
            </button>
            <button className="header-secondary-btn">
              <FaBookmark />
              Save Profile
            </button>
            <button className="header-cta-btn">
              <FaBriefcase />
              Hire Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="header-stats-grid">
        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaBriefcase size={24} />
          </div>
          <div className="header-stat-content">
            <div className="header-stat-number">{calculateExperienceYears()}</div>
            <div className="header-stat-label">Years Experience</div>
          </div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaCheckCircle size={24} />
          </div>
          <div className="header-stat-content">
            <div className="header-stat-number success-rate">{getSuccessRate()}%</div>
            <div className="header-stat-label">Success Rate</div>
          </div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaClock size={24} />
          </div>
          <div className="header-stat-content">
            <div className="header-stat-text">{userInfo.responseTime || 'Within 24h'}</div>
            <div className="header-stat-label">Avg Response</div>
          </div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaStar size={24} />
          </div>
          <div className="header-stat-content">
            <div className="header-stat-number">{getCompletedProjects()}+</div>
            <div className="header-stat-label">Projects Done</div>
          </div>
        </div>

        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaEnvelope size={24} />
          </div>
          <div className="header-stat-content">
            <div className="availability-display">
              <span className={`availability-dot ${userInfo.workAvailability?.toLowerCase().includes('available') ? 'active' : 'inactive'}`}></span>
              {userInfo.workAvailability?.includes('Available') ? 'Available' : 'Busy'}
            </div>
            <div className="header-stat-label">Availability</div>
          </div>
        </div>

        <div className="header-stat-card">
          <div className="header-stat-icon">
            <FaClock size={24} />
          </div>
          <div className="header-stat-content">
            <div className="header-stat-number rate">{formatRate()}</div>
            <div className="header-stat-label">Hourly Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;