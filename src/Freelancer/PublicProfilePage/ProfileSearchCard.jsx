import React from 'react';
import { FaStar, FaMapMarkerAlt, FaCheckCircle, FaUser, FaBookmark } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ProfileSearchCard.css';

const ProfileSearchCard = ({ freelancer, isFeatured = false }) => {
  const profile = freelancer.profile;
  const stats = freelancer.freelancerStats;

  return (
    <div className="search-card-container">
      {/* Featured Badge */}
      {isFeatured && (
        <div className="search-featured-badge">
          Featured
        </div>
      )}
      
      {/* Online Status */}
      {freelancer.isOnline && (
        <div className="search-online-status">
          <div className="search-status-dot"></div>
          Online
        </div>
      )}

      <div className="search-card-header">
        <div className="search-avatar-container">
          {profile.avatar ? (
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="search-card-avatar"
            />
          ) : (
            <div className="search-card-avatar search-avatar-placeholder">
              <FaUser />
            </div>
          )}
          
          {freelancer.verification?.status === 'verified' && (
            <div className="search-verified-badge">
              <FaCheckCircle />
            </div>
          )}
        </div>

        <div className="search-card-content">
          <h3 className="search-card-name">{profile.name}</h3>
          <p className="search-card-title">{profile.title}</p>
          
          <div className="search-rating-container">
            <FaStar className="search-star-icon" />
            <span className="search-rating-value">{stats?.avgRating || 0}</span>
            <span className="search-rating-count">({stats?.completedProjects || 0} projects)</span>
          </div>

          <div className="search-location-container">
            <FaMapMarkerAlt className="search-location-icon" />
            <span>{profile.location}</span>
          </div>

          {profile.hourlyRate > 0 && (
            <div className="search-rate-container">
              <strong className="search-rate-amount">${profile.hourlyRate}/hr</strong>
            </div>
          )}

          {/* Stats */}
          <div className="search-stats-container">
            <div className="search-stat-item">
              <span className="search-stat-value">{stats?.successRate || 0}%</span>
              <span className="search-stat-label">Success</span>
            </div>
            <div className="search-stat-item">
              <span className="search-stat-value">{stats?.onTimeDelivery || 0}%</span>
              <span className="search-stat-label">On Time</span>
            </div>
            <div className="search-stat-item">
              <span className="search-stat-value">{stats?.completedProjects || 0}</span>
              <span className="search-stat-label">Projects</span>
            </div>
          </div>

          {/* Skills */}
          {freelancer.skills && freelancer.skills.length > 0 && (
            <div className="search-skills-container">
              {freelancer.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="search-skill-tag">
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 3 && (
                <span className="search-skill-more">
                  +{freelancer.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="search-actions-container">
        <Link 
          to={`/profile/${freelancer._id}`} 
          className="search-primary-btn"
        >
          View Profile
        </Link>
        <button className="search-secondary-btn">
          <FaBookmark />
        </button>
      </div>
    </div>
  );
};

// Skeleton Loader
export const ProfileSearchCardSkeleton = () => {
  return (
    <div className="search-card-container search-skeleton-card">
      <div className="search-skeleton-header">
        <div className="search-skeleton-avatar"></div>
        <div className="search-skeleton-content">
          <div className="search-skeleton-line search-skeleton-long"></div>
          <div className="search-skeleton-line search-skeleton-medium"></div>
          <div className="search-skeleton-line search-skeleton-short"></div>
          <div className="search-skeleton-line search-skeleton-medium"></div>
        </div>
      </div>
      <div className="search-skeleton-actions">
        <div className="search-skeleton-line search-skeleton-long" style={{ height: '44px', borderRadius: '10px' }}></div>
      </div>
    </div>
  );
};

export default ProfileSearchCard;