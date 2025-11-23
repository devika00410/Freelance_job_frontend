import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaStar, 
  FaClock, 
  FaCheckCircle, 
  FaPlus, 
  FaSearch, 
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import './HirePreviousFreelancer.css';

const HirePreviousFreelancers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [previousFreelancers, setPreviousFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data - replace with real API later
  const dummyFreelancers = [
    {
      freelancerId: "1",
      name: "Sarah Johnson",
      profilePhoto: "",
      skills: ["React", "Node.js", "TypeScript", "UI/UX", "MongoDB"],
      hourlyRate: 75,
      rating: 4.8,
      completedProjects: 3,
      lastProject: "E-commerce Website Development",
      lastProjectDate: "2024-02-15",
      availability: "available",
      avgDeliveryTime: "2 days early",
      successRate: 95
    },
    {
      freelancerId: "2",
      name: "Mike Chen",
      profilePhoto: "",
      skills: ["UI/UX Design", "Figma", "Adobe XD", "Prototyping", "Wireframing"],
      hourlyRate: 65,
      rating: 4.9,
      completedProjects: 2,
      lastProject: "Mobile App UI/UX Design",
      lastProjectDate: "2024-01-20",
      availability: "available",
      avgDeliveryTime: "on time",
      successRate: 98
    },
    {
      freelancerId: "3",
      name: "Emily Davis",
      profilePhoto: "",
      skills: ["SEO", "Content Strategy", "Google Analytics", "Marketing", "SEM"],
      hourlyRate: 55,
      rating: 4.7,
      completedProjects: 1,
      lastProject: "SEO Optimization Package",
      lastProjectDate: "2023-12-10",
      availability: "busy",
      avgDeliveryTime: "1 day early",
      successRate: 92
    },
    {
      freelancerId: "4",
      name: "Alex Rodriguez",
      profilePhoto: "",
      skills: ["Python", "Django", "Data Analysis", "Machine Learning", "AWS"],
      hourlyRate: 85,
      rating: 4.6,
      completedProjects: 4,
      lastProject: "Data Analytics Dashboard",
      lastProjectDate: "2024-03-01",
      availability: "available",
      avgDeliveryTime: "3 days early",
      successRate: 94
    }
  ];

  // Simulate API call with dummy data
  useEffect(() => {
    const simulateAPICall = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use dummy data
        setPreviousFreelancers(dummyFreelancers);
        
      } catch (err) {
        setError('Failed to load freelancers. Using demo data.');
        // Fallback to dummy data even on error
        setPreviousFreelancers(dummyFreelancers);
      } finally {
        setLoading(false);
      }
    };

    simulateAPICall();
  }, []);

  // Get all unique skills from freelancers
  const allSkills = [...new Set(dummyFreelancers.flatMap(f => f.skills || []))];

  // Filter freelancers based on search and selected skills
  const filteredFreelancers = previousFreelancers.filter(freelancer => {
    const matchesSearch = 
      freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => 
        freelancer.skills?.includes(skill)
      );
    
    return matchesSearch && matchesSkills;
  });

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleHireFreelancer = (freelancerId) => {
    console.log('Initiating hire process for freelancer:', freelancerId);
    alert(`Ready to hire freelancer! This would open project creation for freelancer ID: ${freelancerId}`);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="hpf-modal-container">
        <div className="hpf-loading-state">
          <FaSpinner className="hpf-spinner-icon" />
          <h3 className="hpf-loading-title">Loading Previous Freelancers</h3>
          <p className="hpf-loading-text">Fetching your trusted professionals...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && previousFreelancers.length === 0) {
    return (
      <div className="hpf-modal-container">
        <div className="hpf-error-state">
          <FaExclamationTriangle className="hpf-error-icon" />
          <h3 className="hpf-error-title">Unable to Load Freelancers</h3>
          <p className="hpf-error-text">{error}</p>
          <button 
            className="hpf-retry-button"
            onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hpf-modal-container">
      <div className="hpf-modal-header">
        <h2 className="hpf-modal-title">Hire Previous Freelancers</h2>
        <p className="hpf-modal-subtitle">Re-hire trusted professionals you've worked with before</p>
        
        {error && (
          <div className="hpf-warning-banner">
            <FaExclamationTriangle className="hpf-warning-icon" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="hpf-filters-section">
        <div className="hpf-search-container">
          <FaSearch className="hpf-search-icon" />
          <input
            type="text"
            placeholder="Search by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hpf-search-input"
          />
        </div>

        {allSkills.length > 0 && (
          <div className="hpf-skills-filter">
            <label className="hpf-filter-label">Filter by Skills:</label>
            <div className="hpf-skills-tags-container">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  className={`hpf-skill-filter-tag ${selectedSkills.includes(skill) ? 'hpf-skill-selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="hpf-results-info">
        <span className="hpf-results-count">
          {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
          {selectedSkills.length > 0 && ` matching ${selectedSkills.length} skill${selectedSkills.length !== 1 ? 's' : ''}`}
        </span>
        {(searchTerm || selectedSkills.length > 0) && (
          <button 
            className="hpf-clear-filters-button"
            onClick={clearAllFilters}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Freelancers Grid */}
      <div className="hpf-freelancers-grid">
        {filteredFreelancers.map(freelancer => (
          <div key={freelancer.freelancerId} className="hpf-freelancer-card">
            {/* Header */}
            <div className="hpf-card-header">
              <div className="hpf-avatar-container">
                {freelancer.profilePhoto ? (
                  <img src={freelancer.profilePhoto} alt={freelancer.name} className="hpf-avatar-image" />
                ) : (
                  <div className="hpf-avatar-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>
              <div className="hpf-freelancer-info">
                <h3 className="hpf-freelancer-name">{freelancer.name}</h3>
                <div className="hpf-rating-container">
                  <FaStar className="hpf-star-icon" />
                  <span className="hpf-rating-value">{freelancer.rating}</span>
                  <span className="hpf-reviews-count">
                    ({freelancer.completedProjects} project{(freelancer.completedProjects || 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
              <div className={`hpf-availability-badge hpf-availability-${freelancer.availability}`}>
                {freelancer.availability === 'available' ? 'Available' : 'Busy'}
              </div>
            </div>

            {/* Skills */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="hpf-skills-section">
                <label className="hpf-section-label">Skills:</label>
                <div className="hpf-skills-display">
                  {freelancer.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="hpf-skill-display-tag">
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <span className="hpf-more-skills-text">
                      +{freelancer.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Performance Stats */}
            <div className="hpf-performance-stats">
              <div className="hpf-stat-item">
                <FaCheckCircle className="hpf-stat-icon" />
                <span className="hpf-stat-text">{freelancer.successRate}% Success</span>
              </div>
              <div className="hpf-stat-item">
                <FaClock className="hpf-stat-icon" />
                <span className="hpf-stat-text">{freelancer.avgDeliveryTime}</span>
              </div>
            </div>

            {/* Project History */}
            <div className="hpf-project-history">
              <label className="hpf-section-label">Last Project:</label>
              <div className="hpf-project-info">
                <span className="hpf-project-name">
                  {freelancer.lastProject}
                </span>
                {freelancer.lastProjectDate && (
                  <span className="hpf-project-date">
                    {new Date(freelancer.lastProjectDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Rate and Action */}
            <div className="hpf-card-footer">
              <div className="hpf-rate-container">
                <span className="hpf-hourly-rate">
                  ${freelancer.hourlyRate}/hr
                </span>
              </div>
              <button 
                className={`hpf-hire-button ${freelancer.availability === 'busy' ? 'hpf-button-disabled' : ''}`}
                onClick={() => handleHireFreelancer(freelancer.freelancerId)}
                disabled={freelancer.availability === 'busy'}
              >
                <FaPlus className="hpf-button-icon" />
                {freelancer.availability === 'busy' ? 'Currently Busy' : 'Hire Again'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Filter Results */}
      {filteredFreelancers.length === 0 && previousFreelancers.length > 0 && (
        <div className="hpf-no-results">
          <h4 className="hpf-no-results-title">No freelancers found</h4>
          <p className="hpf-no-results-text">Try adjusting your search or filters</p>
          <button 
            className="hpf-clear-search-button"
            onClick={clearAllFilters}
          >
            Clear search and filters
          </button>
        </div>
      )}
    </div>
  );
};

export default HirePreviousFreelancers;