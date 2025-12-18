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
  FaGraduationCap,
  FaFileAlt,
  FaTrophy,
  FaPercent,
  FaEnvelope,
  FaPhone,
  FaCertificate,
  FaLanguage
} from 'react-icons/fa';
import './ProfileAbout.css';

const ProfileAbout = ({ profile }) => {
  const { userInfo, contactDetails, verificationStatus } = profile;

  // Calculate member years
  const joinedDate = new Date(userInfo.memberSince);
  const yearsMember = new Date().getFullYear() - joinedDate.getFullYear();

  // Stats for performance metrics
  const performanceStats = [
    {
      icon: FaBriefcase,
      title: "Projects",
      value: `${userInfo.totalProjects || 0}+`,
      description: "Completed successfully",
      color: "#3b82f6"
    },
    {
      icon: FaStar,
      title: "Rating",
      value: `${userInfo.averageRating || 0}/5`,
      description: "Client satisfaction",
      color: "#f59e0b"
    },
    {
      icon: FaPercent,
      title: "Success",
      value: `${userInfo.successPercentage || 95}%`,
      description: "On-time delivery",
      color: "#10b981"
    },
    {
      icon: FaTrophy,
      title: "Experience",
      value: `${userInfo.yearsOfExperience || '1'}+ years`,
      description: "Professional expertise",
      color: "#8b5cf6"
    }
  ];

  // Format availability
  const getAvailabilityStatus = () => {
    const availability = userInfo.workAvailability || 'Available';
    const isAvailable = availability.toLowerCase().includes('available') && 
                       !availability.toLowerCase().includes('not');
    
    return {
      text: isAvailable ? 'Available for work' : 'Currently busy',
      isAvailable,
      dotColor: isAvailable ? '#10b981' : '#ef4444',
      bgColor: isAvailable ? '#d1fae5' : '#fee2e2',
      textColor: isAvailable ? '#065f46' : '#991b1b'
    };
  };

  const availability = getAvailabilityStatus();

  // Languages with proficiency
  const languages = [
    { name: 'English', level: 'Native/Fluent', proficiency: 100 },
    { name: 'Spanish', level: 'Professional', proficiency: 80 },
    { name: 'French', level: 'Intermediate', proficiency: 60 }
  ];

  return (
    <div className="profile-about-container">
      {/* Main Content Grid */}
      <div className="about-layout-grid">
        {/* Left Column - Main Bio */}
        <div className="about-main-column">
          {/* Bio Card */}
          <div className="about-bio-card">
            <div className="card-header">
              <div className="header-left">
                <FaUser size={20} color="#0a1f3d" />
                <h3>Professional Summary</h3>
              </div>
              <button className="download-cv-btn">
                <FaFileAlt size={14} />
                Download CV
              </button>
            </div>
            
            <div className="bio-content">
              <p className="bio-text">
                {userInfo.biography || "Highly skilled professional with extensive experience in delivering high-quality projects. Committed to excellence and client satisfaction."}
              </p>
              
              {/* Quick Facts */}
              <div className="quick-facts-grid">
                <div className="quick-fact">
                  <div className="fact-icon">
                    <FaBriefcase size={18} />
                  </div>
                  <div className="fact-content">
                    <div className="fact-label">Specialization</div>
                    <div className="fact-value">{userInfo.professionalTitle}</div>
                  </div>
                </div>
                
                <div className="quick-fact">
                  <div className="fact-icon">
                    <FaMapMarkerAlt size={18} />
                  </div>
                  <div className="fact-content">
                    <div className="fact-label">Location</div>
                    <div className="fact-value">{userInfo.currentLocation}</div>
                  </div>
                </div>
                
                <div className="quick-fact">
                  <div className="fact-icon">
                    <FaCalendarAlt size={18} />
                  </div>
                  <div className="fact-content">
                    <div className="fact-label">Member Since</div>
                    <div className="fact-value">{joinedDate.getFullYear()}</div>
                  </div>
                </div>
                
                <div className="quick-fact">
                  <div className="fact-icon">
                    <FaClock size={18} />
                  </div>
                  <div className="fact-content">
                    <div className="fact-label">Response Time</div>
                    <div className="fact-value">{userInfo.responseTime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="performance-metrics">
            <h3 className="section-title">
              <FaTrophy size={20} color="#0a1f3d" />
              Performance Metrics
            </h3>
            
            <div className="metrics-grid">
              {performanceStats.map((stat, index) => (
                <div key={index} className="metric-card">
                  <div className="metric-icon" style={{ background: `${stat.color}15` }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="metric-title">{stat.title}</div>
                    <div className="metric-description">{stat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="about-sidebar-column">
          {/* Availability Card */}
          <div className="availability-card sidebar-card">
            <div className="card-header">
              <div className="header-left">
                <FaClock size={18} color="#0a1f3d" />
                <h4>Availability</h4>
              </div>
              <div className="status-dot" style={{ background: availability.dotColor }}></div>
            </div>
            
            <div className="availability-content">
              <div 
                className="availability-badge" 
                style={{ 
                  background: availability.bgColor,
                  color: availability.textColor,
                  borderColor: availability.dotColor
                }}
              >
                <div className="dot" style={{ background: availability.dotColor }}></div>
                {availability.text}
              </div>
              
              <div className="response-info">
                <FaClock size={14} />
                <span>Response time: {userInfo.responseTime}</span>
              </div>
              
              {userInfo.ratePerHour > 0 && (
                <div className="rate-info">
                  <span className="rate-label">Hourly Rate:</span>
                  <span className="rate-value">${userInfo.ratePerHour}/hr</span>
                </div>
              )}
            </div>
          </div>

          {/* Languages Card */}
          <div className="languages-card sidebar-card">
            <div className="card-header">
              <FaLanguage size={18} color="#0a1f3d" />
              <h4>Languages</h4>
            </div>
            
            <div className="languages-list">
              {languages.map((lang, index) => (
                <div key={index} className="language-item">
                  <div className="language-header">
                    <span className="language-name">{lang.name}</span>
                    <span className="language-level">{lang.level}</span>
                  </div>
                  <div className="proficiency-bar">
                    <div 
                      className="proficiency-fill" 
                      style={{ 
                        width: `${lang.proficiency}%`,
                        background: `linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Card */}
          <div className="education-card sidebar-card">
            <div className="card-header">
              <FaGraduationCap size={18} color="#0a1f3d" />
              <h4>Education</h4>
            </div>
            
            <div className="education-content">
              <div className="degree">{userInfo.educationBackground || 'Bachelor\'s Degree'}</div>
              <div className="institution">{userInfo.educationInstitution || 'University'}</div>
              <div className="duration">Graduated {userInfo.graduationYear || '2018'}</div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="contact-card sidebar-card">
            <div className="card-header">
              <FaUser size={18} color="#0a1f3d" />
              <h4>Contact Info</h4>
            </div>
            
            <div className="contact-info">
              {verificationStatus?.isEmailVerified && contactDetails?.emailAddress && (
                <div className="contact-item verified">
                  <FaEnvelope size={14} />
                  <span>{contactDetails.emailAddress}</span>
                  <FaCheckCircle size={12} className="verified-icon" />
                </div>
              )}
              
              {verificationStatus?.isPhoneVerified && userInfo.contactPhone && (
                <div className="contact-item verified">
                  <FaPhone size={14} />
                  <span>{userInfo.contactPhone}</span>
                  <FaCheckCircle size={12} className="verified-icon" />
                </div>
              )}
              
              {contactDetails?.personalWebsite && (
                <div className="contact-item">
                  <FaGlobe size={14} />
                  <a href={contactDetails.personalWebsite} target="_blank" rel="noopener noreferrer">
                    {contactDetails.personalWebsite.replace('https://', '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAbout;