import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar,
  FaCheckCircle,
  FaUsers,
  FaDollarSign,
  FaClock,
  FaFilter,
  FaAngleDown,
  FaAngleUp,
  FaArrowRight,
  FaGlobe,
  FaTools,
  FaCalendarAlt,
  FaChartLine,
  FaLaptopCode,
  FaPalette,
  FaVideo,
  FaSearch,
  FaPenAlt,
  FaChartBar,
  FaMobileAlt,
  FaBullhorn,
  FaTimes,
  FaComment,
  FaRegSmile,
  FaRegCalendarAlt
} from 'react-icons/fa';
import dummyData from '../Data/dummyData.json';
import detailData from '../Data/detailsData.json';
import serviceData from '../Data/serviceData.json';
import './ServiceDetailPage.css';

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minRate: '',
    maxRate: '',
    experienceLevel: [],
    availability: '',
    verifiedOnly: false,
    sortBy: 'rating'
  });

  // Reviews data
  const reviews = [
    {
      id: 1,
      name: "John Smith",
      rating: 5,
      date: "2 weeks ago",
      comment: "Excellent service! The freelancer delivered exactly what we needed ahead of schedule.",
      project: "Social Media Campaign",
      verified: true
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 4,
      date: "1 month ago",
      comment: "Great communication and quality work. Would hire again for sure.",
      project: "SEO Optimization",
      verified: true
    },
    {
      id: 3,
      name: "Mike Wilson",
      rating: 5,
      date: "3 months ago",
      comment: "Professional and experienced. Helped us achieve our marketing goals efficiently.",
      project: "Content Strategy",
      verified: true
    },
    {
      id: 4,
      name: "Emma Davis",
      rating: 4,
      date: "2 months ago",
      comment: "Good results but delivery was slightly delayed. Overall satisfied.",
      project: "Google Ads Management",
      verified: false
    }
  ];

  // Map service IDs to categories
  const serviceCategoryMap = {
    'fsd-001': 'web-development',
    'mad-002': 'mobile-development',
    'uxd-003': 'ui-ux-design',
    'seo-004': 'seo-services',
    'dma-005': 'digital-marketing',
    'ved-006': 'video-editing',
    'grd-007': 'graphic-design',
    'cwr-008': 'content-writing',
    'wpd-009': 'web-development',
    'dat-010': 'analytics'
  };

  // Get service name
  const getServiceName = () => {
    const serviceNames = {
      'fsd-001': 'Full Stack Development',
      'mad-002': 'Mobile App Development',
      'uxd-003': 'UI/UX Design',
      'seo-004': 'SEO Services',
      'dma-005': 'Digital Marketing',
      'ved-006': 'Video Editing',
      'grd-007': 'Graphic Design',
      'cwr-008': 'Content Writing',
      'wpd-009': 'WordPress Development',
      'dat-010': 'Data Analytics'
    };
    return serviceNames[serviceId] || 'Service';
  };

  // Get service details
  const getServiceDetails = () => {
    const serviceFromData = serviceData.services.find(s => s.id === serviceId);
    
    if (serviceFromData) {
      return {
        name: serviceFromData.name,
        description: serviceFromData.description,
        detailedDescription: serviceFromData.detailedDescription || serviceFromData.description,
        stats: {
          successRate: serviceFromData.successRate || 95,
          avgDeliveryTime: serviceFromData.avgDeliveryTime || serviceFromData.delivery,
          clientSatisfaction: serviceFromData.rating || 4.5,
          projectsCompleted: serviceFromData.projectsCompleted || 1000,
          startingPrice: serviceFromData.price?.min || 25
        },
        popularSkills: serviceFromData.popularSkills || serviceFromData.tags || [],
        deliveryOptions: serviceFromData.deliveryOptions || ['Hourly', 'Fixed Price'],
        commonProjects: serviceFromData.commonProjects || ['Project 1', 'Project 2']
      };
    }
    
    const currentCategory = serviceCategoryMap[serviceId];
    
    if (detailData.serviceDetails && detailData.serviceDetails[currentCategory]) {
      return detailData.serviceDetails[currentCategory];
    }
    
    return {
      name: getServiceName(),
      description: 'Professional service with skilled freelancers',
      detailedDescription: 'Find experienced professionals ready to work on your project',
      stats: {
        successRate: 95,
        avgDeliveryTime: "2-4 weeks",
        clientSatisfaction: 4.5,
        projectsCompleted: 1000,
        startingPrice: 25
      },
      popularSkills: ['React', 'JavaScript', 'Design', 'Marketing'],
      deliveryOptions: ['Hourly', 'Fixed Price', 'Milestone-based'],
      commonProjects: ['Website Development', 'App Design', 'Content Creation']
    };
  };

  const serviceDetails = getServiceDetails();

  // Get service icon
  const getServiceIcon = () => {
    const category = serviceCategoryMap[serviceId] || '';
    if (category.includes('development') || category.includes('web')) return <FaLaptopCode />;
    if (category.includes('design')) return <FaPalette />;
    if (category.includes('mobile')) return <FaMobileAlt />;
    if (category.includes('marketing')) return <FaChartBar />;
    if (category.includes('writing')) return <FaPenAlt />;
    if (category.includes('video') || category.includes('creative')) return <FaVideo />;
    if (category.includes('analytics')) return <FaSearch />;
    return <FaLaptopCode />;
  };

  // Get service stats
  const getServiceStats = () => {
    const currentCategory = serviceCategoryMap[serviceId];
    const categoryFreelancers = dummyData.freelancers[currentCategory] || [];
    
    if (categoryFreelancers.length === 0) {
      return serviceDetails.stats;
    }

    const rates = categoryFreelancers.map(f => 
      parseInt(f.rate.replace('$', '').replace('/hr', ''))
    );
    const minRate = Math.min(...rates);
    const avgRating = (categoryFreelancers.reduce((sum, f) => sum + f.rating, 0) / categoryFreelancers.length).toFixed(1);
    const successRate = Math.round(categoryFreelancers.reduce((sum, f) => sum + f.completionRate, 0) / categoryFreelancers.length);

    return {
      minRate,
      successRate,
      freelancerCount: categoryFreelancers.length,
      avgRating,
      projectsCompleted: serviceDetails.stats.projectsCompleted,
      avgDeliveryTime: serviceDetails.stats.avgDeliveryTime
    };
  };

  // Load freelancers
  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      const currentCategory = serviceCategoryMap[serviceId];
      const categoryFreelancers = dummyData.freelancers[currentCategory] || [];
      setFreelancers(categoryFreelancers);
      setFilteredFreelancers(categoryFreelancers.slice(0, 6)); // Show first 6 freelancers
      setLoading(false);
    }, 500);
  }, [serviceId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...freelancers];

    // Filter by rate
    if (filters.minRate) {
      filtered = filtered.filter(f => {
        const rate = parseInt(f.rate.replace('$', '').replace('/hr', ''));
        return rate >= parseInt(filters.minRate);
      });
    }
    if (filters.maxRate) {
      filtered = filtered.filter(f => {
        const rate = parseInt(f.rate.replace('$', '').replace('/hr', ''));
        return rate <= parseInt(filters.maxRate);
      });
    }

    // Filter by experience
    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter(f => 
        filters.experienceLevel.includes(f.experienceLevel)
      );
    }

    // Filter by availability
    if (filters.availability) {
      filtered = filtered.filter(f => 
        f.availability.toLowerCase().includes(filters.availability)
      );
    }

    // Filter by verification
    if (filters.verifiedOnly) {
      filtered = filtered.filter(f => f.verified);
    }

    // Sort results
    switch(filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rate-low':
        filtered.sort((a, b) => {
          const rateA = parseInt(a.rate.replace('$', '').replace('/hr', ''));
          const rateB = parseInt(b.rate.replace('$', '').replace('/hr', ''));
          return rateA - rateB;
        });
        break;
      case 'rate-high':
        filtered.sort((a, b) => {
          const rateA = parseInt(a.rate.replace('$', '').replace('/hr', ''));
          const rateB = parseInt(b.rate.replace('$', '').replace('/hr', ''));
          return rateB - rateA;
        });
        break;
      case 'experience':
        const experienceOrder = { expert: 3, intermediate: 2, beginner: 1 };
        filtered.sort((a, b) => experienceOrder[b.experienceLevel] - experienceOrder[a.experienceLevel]);
        break;
      default:
        break;
    }

    setFilteredFreelancers(filtered.slice(0, 6)); // Limit to 6 for display
  }, [filters, freelancers]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      minRate: '',
      maxRate: '',
      experienceLevel: [],
      availability: '',
      verifiedOnly: false,
      sortBy: 'rating'
    });
  };

  // FIXED: View All navigation to search results page
  const handleViewAll = () => {
    const serviceName = getServiceName();
    navigate(`/search?service=${serviceId}&q=${encodeURIComponent(serviceName)}&category=${serviceCategoryMap[serviceId]}`);
  };

  const handleViewFreelancer = (freelancerId) => {
    navigate(`/freelancer/${freelancerId}`);
  };

  const handleViewAllReviews = () => {
    navigate(`/reviews?service=${serviceId}`);
  };

  const stats = getServiceStats();

  return (
    <div className="service-detail-page">
      {/* Service Header */}
      <div className="service-header">
        <div className="service-header-container">
          <div className="service-title-section">
            <div className="service-icon-wrapper">
              {getServiceIcon()}
            </div>
            <div>
              <h1 className="service-title">{serviceDetails.name}</h1>
              <p className="service-description">{serviceDetails.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="service-stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaDollarSign /></div>
              <div className="stat-content">
                <div className="stat-value">${stats.minRate}/hr</div>
                <div className="stat-label">Starting Rate</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.successRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaUsers /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.freelancerCount}</div>
                <div className="stat-label">Available Freelancers</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaStar /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.avgRating}</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Section */}
      <div className="service-details-section">
        <div className="details-container">
          <div className="details-content">
            <h2 className="section-title">Service Overview</h2>
            <p className="detailed-description">{serviceDetails.detailedDescription}</p>
            
            <div className="service-features-grid">
              <div className="feature-column">
                <h3 className="feature-title">
                  <FaTools />
                  Popular Skills
                </h3>
                <div className="skills-container">
                  {serviceDetails.popularSkills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="feature-column">
                <h3 className="feature-title">
                  <FaCalendarAlt />
                  Delivery Options
                </h3>
                <div className="delivery-options">
                  {serviceDetails.deliveryOptions.map((option, idx) => (
                    <div key={idx} className="delivery-option">
                      <FaCheckCircle />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="feature-column">
                <h3 className="feature-title">
                  <FaChartLine />
                  Common Projects
                </h3>
                <ul className="projects-list">
                  {serviceDetails.commonProjects.map((project, idx) => (
                    <li key={idx}>{project}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freelancers Section */}
      <div className="freelancers-main-section">
        <div className="freelancers-container">
          <div className="content-wrapper">
            {/* Filters Sidebar */}
            <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
              <div className="mobile-filters-header" onClick={() => setShowFilters(!showFilters)}>
                <div className="filters-toggle-content">
                  <FaFilter />
                  <span>Filters</span>
                  {Object.values(filters).some(v => 
                    (Array.isArray(v) && v.length > 0) || 
                    (typeof v === 'boolean' && v) || 
                    (typeof v === 'string' && v && v !== 'rating')
                  ) && (
                    <span className="filter-count-badge">•</span>
                  )}
                </div>
                {showFilters ? <FaAngleUp /> : <FaAngleDown />}
              </div>

              <div className="filters-content">
                <div className="filters-header">
                  <h3 className="filters-title">
                    <FaFilter />
                    Filter Results
                  </h3>
                  <button onClick={resetFilters} className="clear-filters-btn">
                    Clear All
                  </button>
                </div>

                {/* Price Range */}
                <div className="filter-section">
                  <h4 className="filter-title">
                    <FaDollarSign />
                    Hourly Rate
                  </h4>
                  <div className="price-inputs">
                    <input
                      type="number"
                      value={filters.minRate}
                      onChange={(e) => handleFilterChange({ minRate: e.target.value })}
                      placeholder="Min $"
                      className="price-input"
                    />
                    <input
                      type="number"
                      value={filters.maxRate}
                      onChange={(e) => handleFilterChange({ maxRate: e.target.value })}
                      placeholder="Max $"
                      className="price-input"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="filter-section">
                  <h4 className="filter-title">
                    <FaUsers />
                    Experience Level
                  </h4>
                  <div className="checkbox-group">
                    {['beginner', 'intermediate', 'expert'].map(level => (
                      <label key={level} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={filters.experienceLevel.includes(level)}
                          onChange={(e) => {
                            const newLevels = e.target.checked
                              ? [...filters.experienceLevel, level]
                              : filters.experienceLevel.filter(l => l !== level);
                            handleFilterChange({ experienceLevel: newLevels });
                          }}
                        />
                        <span className="checkbox-label">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="filter-section">
                  <h4 className="filter-title">
                    <FaClock />
                    Availability
                  </h4>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange({ availability: e.target.value })}
                    className="select-input"
                  >
                    <option value="">Any Availability</option>
                    <option value="full">Full Time</option>
                    <option value="part">Part Time</option>
                    <option value="available">Available</option>
                  </select>
                </div>

                {/* Verification */}
                <div className="filter-section">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked })}
                    />
                    <span className="checkbox-label">
                      <FaCheckCircle />
                      Verified Only
                    </span>
                  </label>
                </div>

                {/* Sort */}
                <div className="filter-section">
                  <h4 className="filter-title">
                    <FaFilter />
                    Sort By
                  </h4>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="select-input"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="rate-low">Price: Low to High</option>
                    <option value="rate-high">Price: High to Low</option>
                    <option value="experience">Most Experienced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Freelancers Content */}
            <div className="freelancers-content">
              {/* Section Header */}
              <div className="section-header">
                <div>
                  <h2 className="section-title">Top Freelancers</h2>
                  <p className="section-subtitle">
                    {filteredFreelancers.length} of {freelancers.length} freelancers matching your criteria
                  </p>
                </div>
                {freelancers.length > 3 && (
                  <button onClick={handleViewAll} className="view-all-btn">
                    View All {freelancers.length} Freelancers <FaArrowRight />
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading freelancers...</p>
                </div>
              )}

              {/* Freelancers Grid - Shows 3 or 6 freelancers */}
              {!loading && filteredFreelancers.length > 0 && (
                <>
                  <div className="freelancers-grid">
                    {filteredFreelancers.slice(0, 6).map(freelancer => (
                      <div key={freelancer.id} className="freelancer-card">
                        <div className="freelancer-header">
                          <img src={freelancer.image} alt={freelancer.name} className="freelancer-avatar" />
                          <div className="freelancer-info">
                            <h3 className="freelancer-name">{freelancer.name}</h3>
                            <p className="freelancer-title">{freelancer.title}</p>
                            <div className="freelancer-rating">
                              <FaStar />
                              <span>{freelancer.rating}</span>
                              <span className="rating-count">({freelancer.projects} projects)</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="freelancer-details">
                          <div className="detail-item">
                            <FaDollarSign />
                            <span>{freelancer.rate}</span>
                          </div>
                          <div className="detail-item">
                            <FaCheckCircle />
                            <span>{freelancer.completionRate}% Success</span>
                          </div>
                          <div className="detail-item">
                            <FaGlobe />
                            <span>{freelancer.location}</span>
                          </div>
                        </div>
                        
                        <div className="freelancer-skills">
                          {freelancer.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="skill-tag">{skill}</span>
                          ))}
                          {freelancer.skills.length > 3 && (
                            <span className="skill-tag more">+{freelancer.skills.length - 3}</span>
                          )}
                        </div>
                        
                        <div className="freelancer-actions">
                          <button 
                            className="profile-btn"
                            onClick={() => handleViewFreelancer(freelancer.id)}
                          >
                            View Profile
                          </button>
                          <button 
                            className="hire-btn"
                            onClick={() => navigate(`/hire/${freelancer.id}`)}
                          >
                            Hire Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Button */}
                  {freelancers.length > 6 && (
                    <div className="view-all-container">
                      <button onClick={handleViewAll} className="view-all-large-btn">
                        View All {freelancers.length} Freelancers <FaArrowRight />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* No Results */}
              {!loading && filteredFreelancers.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon">
                    <FaUsers />
                  </div>
                  <h3>No Freelancers Found</h3>
                  <p>Try adjusting your filters to see more results.</p>
                  <button onClick={resetFilters} className="reset-btn">
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - NEW */}
      <div className="reviews-section">
        <div className="freelancers-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <FaComment /> Client Reviews
              </h2>
              <p className="section-subtitle">
                What clients say about this service
              </p>
            </div>
            <button onClick={handleViewAllReviews} className="view-all-btn">
              View All Reviews <FaArrowRight />
            </button>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      <FaRegSmile />
                    </div>
                    <div>
                      <h4 className="reviewer-name">
                        {review.name}
                        {review.verified && <FaCheckCircle className="verified-badge" />}
                      </h4>
                      <div className="review-meta">
                        <span className="review-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? 'star-filled' : 'star-empty'} />
                          ))}
                        </span>
                        <span className="review-date">
                          <FaRegCalendarAlt /> {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-project">
                    <span className="project-tag">Project:</span>
                    <span className="project-name">{review.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
