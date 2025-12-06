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
  FaBriefcase
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

  // Debug: Check what image data we have
  console.log('🖼️ Profile image data:', {
    profilePicture: userInfo.profilePicture,
    coverPhoto: userInfo.coverPhoto,
    hasProfilePicture: !!userInfo.profilePicture,
    hasCoverPhoto: !!userInfo.coverPhoto,
    profilePictureType: typeof userInfo.profilePicture,
    coverPhotoType: typeof userInfo.coverPhoto,
    fullUserInfo: userInfo
  });

  // Simple function to get image URL - data URLs should work directly
  const getImageUrl = (image, defaultImage) => {
    if (!image) {
      console.log(`📸 Using default image: ${defaultImage}`);
      return defaultImage;
    }
    
    // If it's a data URL (starts with data:image/), use it directly
    if (typeof image === 'string' && image.startsWith('data:image/')) {
      console.log(`📸 Using data URL for image (length: ${image.length})`);
      return image;
    }
    
    // If it's a regular URL, use it
    if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'))) {
      console.log(`📸 Using URL for image: ${image}`);
      return image;
    }
    
    // Check if it's in the profile data structure
    if (typeof image === 'string' && image.length > 0) {
      console.log(`📸 Using string image: ${image.substring(0, 50)}...`);
      return image;
    }
    
    console.log(`📸 Falling back to default image: ${defaultImage}`);
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
      'part-time': 'Available for part-time',
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

  return (
    <div className="header-main-container">
      {/* Cover Section */}
      <div className="header-cover-section">
        <img 
          src={coverPhotoUrl} 
          alt="Cover" 
          className="header-cover-image"
          onError={(e) => {
            console.error('❌ Cover image failed to load:', coverPhotoUrl);
            e.target.src = '/default-cover.jpg';
            // If default also fails, use gradient background
            e.target.onerror = null;
            e.target.style.background = 'linear-gradient(135deg, #0a1a3c 0%, #1e3a8a 100%)';
            e.target.style.display = 'flex';
            e.target.style.alignItems = 'center';
            e.target.style.justifyContent = 'center';
            e.target.style.color = 'white';
            e.target.innerHTML = '<span>Cover Image</span>';
          }}
        />
        <div className="header-cover-overlay"></div>
      </div>
      
      {/* Main Content */}
      <div className="header-content-wrapper">
        {/* Avatar */}
        <div className="header-avatar-container">
          <img 
            src={profilePictureUrl} 
            alt={userInfo.fullName || 'User'}
            className="header-avatar-image"
            onError={(e) => {
              console.error('❌ Profile image failed to load:', profilePictureUrl);
              e.target.src = '/default-avatar.jpg';
              // If default also fails, show user icon
              e.target.onerror = null;
              e.target.style.display = 'none';
              // Create fallback div
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = 'header-avatar-fallback';
              fallbackDiv.innerHTML = '<FaUser size={48} color="#64748b" />';
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
          {verificationStatus?.isIdentityVerified && (
            <div className="header-verified-badge" title="Identity Verified">
              <FaCheckCircle size={14} />
            </div>
          )}
        </div>
        
        {/* Details Section */}
        <div className="header-details-section">
          <div className="header-info-section">
            <div className="header-name-section">
              <h1 className="header-name">
                {userInfo.fullName || 'Devik'}
                {verificationStatus?.isIdentityVerified && (
                  <FaCheckCircle color="#10b981" size={24} title="Verified" />
                )}
              </h1>
              {verificationStatus?.isEmailVerified && (
                <span className="header-email-verified" title="Email Verified">
                  <FaEnvelope size={16} />
                  Email Verified
                </span>
              )}
            </div>
            
            <h2 className="header-title">{userInfo.professionalTitle || 'Freelancer'}</h2>
            
            {/* Quick Stats */}
            <div className="header-stats-row">
              <div className="header-stat-item">
                <FaStar color="#f59e0b" />
                <span className="rating-value">{getUserRating()}</span>
                <span className="rating-count">({getCompletedProjects()} projects)</span>
              </div>
              
              {userInfo.currentLocation && userInfo.currentLocation !== 'Location not specified' && (
                <div className="header-stat-item">
                  <FaMapMarkerAlt color="#ef4444" />
                  <span>{userInfo.currentLocation}</span>
                </div>
              )}

              {userInfo.memberSince && (
                <div className="header-stat-item">
                  <FaCalendar color="#8b5cf6" />
                  <span>Member since {formatMemberSince(userInfo.memberSince)}</span>
                </div>
              )}

              {userInfo.ratePerHour > 0 && (
                <div className="header-stat-item">
                  <FaClock color="#1e3a8a" />
                  <span>${userInfo.ratePerHour}/hr</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="header-actions-section">
            <button className="header-primary-btn">
              <FaEnvelope />
              Contact Me
            </button>
            <button className="header-secondary-btn">
              <FaBookmark />
              Save Profile
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="header-stats-grid">
        <div className="header-stat-card">
          <div className="header-stat-number">{calculateExperienceYears()}</div>
          <div className="header-stat-label">Years Experience</div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-number success-rate">{getSuccessRate()}%</div>
          <div className="header-stat-label">Success Rate</div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-text">{userInfo.responseTime || 'Within 24 hours'}</div>
          <div className="header-stat-label">Avg Response</div>
        </div>
        
        <div className="header-stat-card">
          <div className="header-stat-number">{getCompletedProjects()}</div>
          <div className="header-stat-label">Projects Done</div>
        </div>

        <div className="header-stat-card">
          <div className="header-stat-text availability">
            <span className={`availability-dot ${userInfo.workAvailability?.toLowerCase().includes('not available') ? 'unavailable' : 'available'}`}></span>
            {getAvailabilityDisplay(userInfo.workAvailability)}
          </div>
          <div className="header-stat-label">Availability</div>
        </div>

        {userInfo.ratePerHour > 0 && (
          <div className="header-stat-card">
            <div className="header-stat-number rate">${userInfo.ratePerHour}/hr</div>
            <div className="header-stat-label">Hourly Rate</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;