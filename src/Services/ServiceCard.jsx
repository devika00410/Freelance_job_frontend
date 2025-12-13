import React from "react";
import { 
  FaStar, 
  FaClock, 
  FaDollarSign, 
  FaUsers,
  FaChevronRight,
  FaRegBookmark,
  FaCode,
  FaPalette,
  FaPenNib,
  FaBullhorn,
  FaMobileAlt,
  FaVideo,
  FaChartLine,
  FaLaptopCode
} from "react-icons/fa";
import "./ServiceCard.css";

const getServiceIcon = (category) => {
  switch(category.toLowerCase()) {
    case 'development':
      return <FaLaptopCode className="service-icon" />;
    case 'design':
      return <FaPalette className="service-icon" />;
    case 'writing':
      return <FaPenNib className="service-icon" />;
    case 'marketing':
      return <FaBullhorn className="service-icon" />;
    case 'creative':
      return <FaVideo className="service-icon" />;
    case 'analytics':
      return <FaChartLine className="service-icon" />;
    case 'mobile':
      return <FaMobileAlt className="service-icon" />;
    default:
      return <FaCode className="service-icon" />;
  }
};

export default function ServiceCard({ service, onBrowseTalent }) {
  const handleBrowseClick = () => {
    if (onBrowseTalent) {
      onBrowseTalent(service.id, service.name);
    }
  };

  return (
    <div className="service-card">
      {/* Card Header with Icon */}
      <div className="card-header">
        <div className="icon-container">
          {getServiceIcon(service.category)}
        </div>
        <div className="header-meta">
          <span className="category-tag">{service.category}</span>
          <div className="rating-badge">
            <FaStar className="star-icon" />
            <span className="rating-value">{service.rating}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="service-name">{service.name}</h3>
        <p className="service-description">{service.desc}</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat">
          <div className="stat-icon">
            <FaDollarSign />
          </div>
          <div className="stat-details">
            <div className="stat-label">Rate/Hour</div>
            <div className="stat-value">${service.price.min} - ${service.price.max}</div>
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-details">
            <div className="stat-label">Delivery</div>
            <div className="stat-value">24-48 hrs</div>
          </div>
        </div>
        
        <div className="stat">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <div className="stat-label">Available</div>
            <div className="stat-value">50+ Talents</div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <button className="primary-btn" onClick={handleBrowseClick}>
          Browse Talent
          <FaChevronRight className="arrow-icon" />
        </button>
        <button className="secondary-btn">
          <FaRegBookmark className="save-icon" />
          Save
        </button>
      </div>
    </div>
  );
}