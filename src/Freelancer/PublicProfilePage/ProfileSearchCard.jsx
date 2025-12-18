import React from 'react';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaUser, 
  FaBookmark, 
  FaClock,
  FaCheck,
  FaCalendarAlt,
  FaRegBookmark
} from 'react-icons/fa';
import { FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './ProfileSearchCard.css';

const ProfileSearchCard = ({ freelancer, isFeatured = false, isPro = false }) => {
  const profile = freelancer.profile || {};
  const stats = freelancer.freelancerStats || {};
  const skills = freelancer.skills || [];

  // Format skills to show
  const displayedSkills = skills.slice(0, 4);
  const hasMoreSkills = skills.length > 4;

  return (
    <div className={`search-card-container ${isFeatured ? 'featured-card' : ''} ${isPro ? 'pro-card' : ''}`}>
      {/* Featured/Pro Badges */}
      <div className="card-badges">
        {isFeatured && (
          <span className="featured-badge">
            ⭐ Featured
          </span>
        )}
        {isPro && (
          <span className="pro-badge">
            PRO
          </span>
        )}
        {freelancer.isOnline && (
          <span className="online-badge">
            <span className="online-dot"></span>
            Online Now
          </span>
        )}
      </div>

      {/* Card Header */}
      <div className="card-header">
        {/* Avatar */}
        <div className="avatar-wrapper">
          <div className="avatar-container">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt={profile.name}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <FaUser size={28} />
              </div>
            )}
            
            {/* Verification Badge */}
            {freelancer.verification?.status === 'verified' && (
              <div className="verified-badge" title="Verified">
                <FaCheckCircle size={14} />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="quick-stat">
              <FaStar size={12} />
              <span>{stats.avgRating?.toFixed(1) || '4.5'}</span>
            </div>
            <div className="quick-stat">
              <FiUsers size={12} />
              <span>{stats.completedProjects || '0'}</span>
            </div>
            {stats.successRate > 90 && (
              <div className="quick-stat success">
                <FiTrendingUp size={12} />
                <span>{stats.successRate}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <div className="name-title">
            <h3 className="profile-name">
              {profile.name || 'Freelancer'}
              {freelancer.verification?.status === 'verified' && (
                <FaCheckCircle className="verified-icon" />
              )}
            </h3>
            <p className="profile-title">{profile.title || 'Professional Freelancer'}</p>
          </div>

          {/* Location & Rate */}
          <div className="location-rate">
            <div className="location">
              <FaMapMarkerAlt size={14} />
              <span>{profile.location || 'Remote'}</span>
            </div>
            {profile.hourlyRate > 0 && (
              <div className="hourly-rate">
                <strong>${profile.hourlyRate}</strong>
                <span>/hr</span>
              </div>
            )}
          </div>

          {/* Member Since */}
          {profile.memberSince && (
            <div className="member-since">
              <FaCalendarAlt size={14} />
              <span>Member since {new Date(profile.memberSince).getFullYear()}</span>
            </div>
          )}

          {/* Skills */}
          {displayedSkills.length > 0 && (
            <div className="skills-container">
              {displayedSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
              {hasMoreSkills && (
                <span className="more-skills">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Bio Preview */}
          {profile.bio && (
            <p className="bio-preview">
              {profile.bio.length > 120 
                ? profile.bio.substring(0, 120) + '...' 
                : profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon success">
            <FaCheck size={14} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.successRate || 95}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon time">
            <FaClock size={14} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.onTimeDelivery || 98}%</div>
            <div className="stat-label">On Time</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon projects">
            <FaCheck size={14} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedProjects || 0}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon repeat">
            <FiUsers size={14} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.repeatClients || 0}</div>
            <div className="stat-label">Repeat Clients</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <Link 
          to={`/profile/${freelancer._id}`} 
          className="primary-action-btn"
        >
          View Full Profile
        </Link>
        <button className="bookmark-btn" title="Save to favorites">
          <FaRegBookmark size={18} />
        </button>
        <button className="message-btn" title="Send message">
          Message
        </button>
      </div>
    </div>
  );
};

// Skeleton Loader Component
export const ProfileSearchCardSkeleton = () => {
  return (
    <div className="search-card-container skeleton-card">
      <div className="card-badges skeleton">
        <span className="skeleton-badge"></span>
        <span className="skeleton-badge"></span>
      </div>

      <div className="card-header">
        <div className="avatar-wrapper skeleton">
          <div className="avatar-container skeleton-avatar"></div>
        </div>

        <div className="profile-info skeleton">
          <div className="name-title">
            <div className="skeleton-line skeleton-name"></div>
            <div className="skeleton-line skeleton-title"></div>
          </div>

          <div className="location-rate">
            <div className="skeleton-line skeleton-location"></div>
            <div className="skeleton-line skeleton-rate"></div>
          </div>

          <div className="skills-container skeleton">
            <div className="skeleton-skill"></div>
            <div className="skeleton-skill"></div>
            <div className="skeleton-skill"></div>
          </div>
        </div>
      </div>

      <div className="stats-grid skeleton">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-item">
            <div className="skeleton-stat"></div>
          </div>
        ))}
      </div>

      <div className="card-actions skeleton">
        <div className="skeleton-action"></div>
        <div className="skeleton-action-small"></div>
      </div>
    </div>
  );
};

export default ProfileSearchCard;