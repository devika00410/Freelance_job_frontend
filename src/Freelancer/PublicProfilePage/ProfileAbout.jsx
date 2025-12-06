import React from 'react';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaGlobe, 
  FaCheckCircle, 
  FaClock,
  FaBriefcase,
  FaStar,
  FaGraduationCap
} from 'react-icons/fa';
import './ProfileAbout.css'

const ProfileAbout = ({ profile }) => {
  const { userInfo } = profile;

  const joinedDate = new Date(userInfo.memberSince);
  const currentYear = new Date().getFullYear();
  const joinedYear = joinedDate.getFullYear();
  const yearsMember = currentYear - joinedYear;

  const statsData = [
    {
      icon: FaBriefcase,
      title: "Projects Completed",
      value: `${userInfo.totalProjects}+`,
      description: "Successful deliveries"
    },
    {
      icon: FaStar,
      title: "Client Rating",
      value: `${userInfo.averageRating}/5`,
      description: "Average feedback score"
    },
    {
      icon: FaCheckCircle,
      title: "Success Rate",
      value: `${userInfo.successPercentage}%`,
      description: "Project completion rate"
    }
  ];

  return (
    <div className="about-section-container">
      <div className="about-layout-grid">
        <div className="about-bio-card">
          <h3 className="about-section-heading">Professional Bio</h3>
          <div className="about-bio-text">
            <p>{userInfo.biography}</p>
          </div>
        </div>

        <div className="about-sidebar">
          <div className="about-info-card about-availability-card">
            <div className="about-card-header">
              <FaClock className="about-card-icon" />
              <h4 className="about-card-title">Availability</h4>
            </div>
            <div className="about-availability-status">
              <span className="about-status-indicator"></span>
              {userInfo.workAvailability}
            </div>
            <div className="about-response-info">
              <FaClock className="about-response-icon" />
              Avg. response: {userInfo.responseTime}
            </div>
          </div>

          <div className="about-info-card">
            <div className="about-card-header">
              <FaUser className="about-card-icon" />
              <h4 className="about-card-title">Profile Details</h4>
            </div>
            <div className="about-info-list">
              <div className="about-info-item">
                <FaMapMarkerAlt className="about-item-icon" />
                <div className="about-item-details">
                  <span className="about-item-label">Location</span>
                  <span className="about-item-value">{userInfo.currentLocation}</span>
                </div>
              </div>
              
              <div className="about-info-item">
                <FaCalendarAlt className="about-item-icon" />
                <div className="about-item-details">
                  <span className="about-item-label">Member Since</span>
                  <span className="about-item-value">{joinedYear} ({yearsMember} year{yearsMember !== 1 ? 's' : ''})</span>
                </div>
              </div>
              
              <div className="about-info-item">
                <FaCheckCircle className="about-item-icon" />
                <div className="about-item-details">
                  <span className="about-item-label">Success Rate</span>
                  <span className="about-item-value about-item-highlight">{userInfo.successPercentage}%</span>
                </div>
              </div>

              {userInfo.ratePerHour > 0 && (
                <div className="about-info-item">
                  <FaClock className="about-item-icon" />
                  <div className="about-item-details">
                    <span className="about-item-label">Hourly Rate</span>
                    <span className="about-item-value about-item-highlight">${userInfo.ratePerHour}/hr</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {userInfo.spokenLanguages && userInfo.spokenLanguages.length > 0 && (
            <div className="about-info-card">
              <div className="about-card-header">
                <FaGlobe className="about-card-icon" />
                <h4 className="about-card-title">Languages</h4>
              </div>
              <div className="about-languages-grid">
                {userInfo.spokenLanguages.map((language, index) => (
                  <div key={index} className="about-language-tag">
                    {language}
                  </div>
                ))}
              </div>
            </div>
          )}

          {userInfo.educationBackground && (
            <div className="about-info-card">
              <div className="about-card-header">
                <FaGraduationCap className="about-card-icon" />
                <h4 className="about-card-title">Education</h4>
              </div>
              <div className="about-education-text">
                <p>{userInfo.educationBackground}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="about-stats-section">
        <h3 className="about-section-heading">Performance Metrics</h3>
        <div className="about-stats-grid">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="about-stat-card">
                <div className="about-stat-icon">
                  <IconComponent />
                </div>
                <div className="about-stat-content">
                  <h4>{stat.title}</h4>
                  <p><strong>{stat.value}</strong> {stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileAbout;