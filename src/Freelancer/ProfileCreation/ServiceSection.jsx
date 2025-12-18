import React, { useState } from 'react';
import {
  FaCode,
  FaMobileAlt,
  FaPaintBrush,
  FaSearch,
  FaChartLine,
  FaPenFancy,
  FaVideo,
  FaCheck,
  FaGlobe,
  FaLaptop,
  FaStar,
  FaBullhorn,
  FaPalette,
  FaEdit,
  FaCamera,
  FaDatabase,
  FaServer,
  FaInfinity,
  FaCloud,
  FaCog
} from 'react-icons/fa';
import './ServiceSection.css';

const ServiceSection = ({ data, updateData, allowedServices }) => {
  // SAFE data extraction - handle both MainProfile and EditProfile structures
  const getProfessionalData = () => {
    // Try MainProfile structure first (professionalService)
    if (data?.professionalService) {
      return data.professionalService;
    }
    // Try EditProfile structure (professional)
    if (data?.professional) {
      return data.professional;
    }
    // Default empty structure
    return {
      professionalTitle: '',
      primaryService: '',
      secondaryServices: [],
      industryFocus: []
    };
  };

  const professionalData = getProfessionalData();

  // Determine which update field to use based on data structure
  const getUpdateField = () => {
    if (data?.professionalService) return 'professionalService';
    if (data?.professional) return 'professional';
    return 'professionalService'; // Default
  };

  const updateField = getUpdateField();

  const handleInputChange = (field, value) => {
    updateData(updateField, { [field]: value });
  };

  const handleServiceChange = (service, isPrimary = false) => {
    if (isPrimary) {
      handleInputChange('primaryService', service);
    } else {
      const currentServices = [...(professionalData.secondaryServices || [])];
      const index = currentServices.indexOf(service);
      
      if (index > -1) {
        currentServices.splice(index, 1);
      } else if (currentServices.length < 2) {
        currentServices.push(service);
      }
      
      handleInputChange('secondaryServices', currentServices);
    }
  };

  const toggleIndustryFocus = (industry) => {
    const currentFocus = [...(professionalData.industryFocus || [])];
    const index = currentFocus.indexOf(industry);
    
    if (index > -1) {
      currentFocus.splice(index, 1);
    } else {
      currentFocus.push(industry);
    }
    
    handleInputChange('industryFocus', currentFocus);
  };

  const industryOptions = [
    'SaaS', 'E-commerce', 'Startups', 'Finance', 'Healthcare',
    'Education', 'Technology', 'Marketing', 'Media', 'Non-profit'
  ];

  // Get service icon component
  const getServiceIcon = (service) => {
    switch (service) {
      case 'Web Development':
        return <FaCode className="service-icon-react" />;
      case 'Mobile App Development':
        return <FaMobileAlt className="service-icon-react" />;
      case 'UI / UX Design':
        return <FaPaintBrush className="service-icon-react" />;
      case 'SEO':
        return <FaSearch className="service-icon-react" />;
      case 'Digital Marketing':
        return <FaChartLine className="service-icon-react" />;
      case 'Content Writing':
        return <FaPenFancy className="service-icon-react" />;
      case 'Graphic Designing':
        return <FaPaintBrush className="service-icon-react" />;
      case 'Video Editing':
        return <FaVideo className="service-icon-react" />;
      case 'Software Development':
        return <FaCode className="service-icon-react" />;
      case 'App Development':
        return <FaMobileAlt className="service-icon-react" />;
      case 'Frontend Development':
        return <FaCode className="service-icon-react" />;
      case 'Backend Development':
        return <FaServer className="service-icon-react" />;
      case 'Full Stack Development':
        return <FaLaptop className="service-icon-react" />;
      default:
        return <FaCog className="service-icon-react" />;
    }
  };

  // Ensure allowedServices is always an array
  const servicesList = Array.isArray(allowedServices) ? allowedServices : [
    'Web Development',
    'Mobile App Development',
    'UI / UX Design',
    'SEO',
    'Digital Marketing',
    'Content Writing',
    'Graphic Designing',
    'Video Editing'
  ];

  return (
    <div className="professional-service-section">
      <div className="section-header">
        <h2>Professional Title & Service Selection</h2>
        <p className="section-description">
          Define your professional identity and select the services you offer.
          This helps clients find you for relevant projects.
        </p>
        <div className="points-info">
          <span className="points-badge">15 Points</span>
          <span className="points-description">(12 mandatory, 3 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Professional Title */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Professional Title
          </label>
          <input
            type="text"
            className="form-input"
            value={professionalData.professionalTitle || ''}
            onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
            placeholder="e.g., Full-Stack Web Developer | React & Node.js"
            maxLength="80"
            required
          />
          <p className="field-help">
            This is your main professional identity. Be specific about your expertise.
            <span className="char-count">{(professionalData.professionalTitle || '').length}/80</span>
          </p>
        </div>

        {/* Primary Service */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Primary Service (Select ONE)
          </label>
          <p className="field-help mandatory">
            You must select one primary service. This determines your main category.
          </p>
          <div className="services-grid">
            {servicesList.map(service => (
              <label 
                key={service} 
                className={`service-card ${
                  professionalData.primaryService === service ? 'selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="primaryService"
                  value={service}
                  checked={professionalData.primaryService === service}
                  onChange={() => handleServiceChange(service, true)}
                  className="service-radio"
                />
                <div className="service-content">
                  <div className="service-icon">
                    {getServiceIcon(service)}
                  </div>
                  <span className="service-name">{service}</span>
                  {professionalData.primaryService === service && (
                    <div className="service-check">
                      <FaCheck />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Secondary Services */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Secondary Services (Max 2)
          </label>
          <p className="field-help">
            Optional: Select up to 2 additional services you can provide
          </p>
          <div className="services-grid secondary">
            {servicesList
              .filter(service => service !== professionalData.primaryService)
              .map(service => (
                <label 
                  key={service} 
                  className={`service-card secondary ${
                    (professionalData.secondaryServices || []).includes(service) ? 'selected' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(professionalData.secondaryServices || []).includes(service)}
                    onChange={() => handleServiceChange(service, false)}
                    disabled={
                      (professionalData.secondaryServices || []).length >= 2 && 
                      !(professionalData.secondaryServices || []).includes(service)
                    }
                    className="service-checkbox"
                  />
                  <div className="service-content">
                    <div className="service-icon">
                      {getServiceIcon(service)}
                    </div>
                    <span className="service-name">{service}</span>
                    {(professionalData.secondaryServices || []).includes(service) && (
                      <div className="service-check">
                        <FaCheck />
                      </div>
                    )}
                  </div>
                </label>
              ))}
          </div>
          {(professionalData.secondaryServices || []).length >= 2 && (
            <p className="field-help warning">
              Maximum 2 secondary services selected
            </p>
          )}
        </div>

        {/* Industry Focus */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Industry Focus
          </label>
          <p className="field-help">
            Select industries you specialize in (optional)
          </p>
          <div className="industry-tags">
            {industryOptions.map(industry => (
              <button
                key={industry}
                type="button"
                className={`industry-tag ${
                  (professionalData.industryFocus || []).includes(industry) ? 'selected' : ''
                }`}
                onClick={() => toggleIndustryFocus(industry)}
              >
                {industry}
                {(professionalData.industryFocus || []).includes(industry) && (
                  <span className="tag-check">
                    <FaCheck />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Completion Status */}
        <div className="completion-status">
          <div className="status-row">
            <span className="status-label">Mandatory Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  (professionalData.professionalTitle || '').trim(),
                  professionalData.primaryService
                ].filter(Boolean).length;
                return `${completed}/2 completed`;
              })()}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Recommended Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  (professionalData.secondaryServices || []).length > 0,
                  (professionalData.industryFocus || []).length > 0
                ].filter(Boolean).length;
                return `${completed}/2 completed`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSection;