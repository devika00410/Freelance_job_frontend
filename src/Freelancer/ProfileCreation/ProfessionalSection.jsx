import React from 'react';
import './ProfessionalSection.css';

const ProfessionalSection = ({ data, updateData }) => {
  const { professional } = data;

  const handleInputChange = (field, value) => {
    updateData('professional', { [field]: value });
  };

  const getCharacterCountClass = (length) => {
    if (length > 900) return 'professional-section__character-count--error';
    if (length > 800) return 'professional-section__character-count--warning';
    return '';
  };

  const getAvailabilityDotClass = (availability) => {
    switch (availability) {
      case 'available': return 'professional-section__availability-dot--available';
      case 'full-time': return 'professional-section__availability-dot--full-time';
      case 'part-time': return 'professional-section__availability-dot--part-time';
      case 'not-available': return 'professional-section__availability-dot--not-available';
      default: return 'professional-section__availability-dot--available';
    }
  };

  const getAvailabilityText = (availability) => {
    switch (availability) {
      case 'available': return 'Available for projects';
      case 'full-time': return 'Available full-time';
      case 'part-time': return 'Available part-time';
      case 'not-available': return 'Not available';
      default: return 'Available for projects';
    }
  };

  const getResponseTimeText = (responseTime) => {
    switch (responseTime) {
      case '2h': return 'Within 2 hours';
      case '6h': return 'Within 6 hours';
      case '24h': return 'Within 24 hours';
      case '48h': return 'Within 48 hours';
      default: return 'Within 24 hours';
    }
  };

  return (
    <div className="professional-section">
      <h2 className="professional-section__title">Professional Overview</h2>
      <p className="professional-section__description">
        Craft your professional identity. Share your expertise, availability, and what makes you the ideal choice for clients seeking your skills and experience.
      </p>

      <div className="professional-section__form-grid">
        <div className="professional-section__form-group professional-section__form-group--full">
          <label htmlFor="professionalTitle" className="professional-section__label professional-section__required">
            Professional Title
          </label>
          <input
            type="text"
            id="professionalTitle"
            className="professional-section__input"
            value={professional.professionalTitle}
            onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
            placeholder="e.g., Senior Full-Stack Developer & UI/UX Designer | React & Node.js Specialist"
            required
          />
          <small className="professional-section__help-text">
            This is the main headline that appears on your profile. Make it compelling and specific.
          </small>
        </div>

        <div className="professional-section__form-group">
          <label htmlFor="yearsOfExperience" className="professional-section__label professional-section__required">
            Years of Experience
          </label>
          <select
            id="yearsOfExperience"
            className="professional-section__select"
            value={professional.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
            required
          >
            <option value="">Select your experience level</option>
            <option value="0-1">0-1 years (Entry Level)</option>
            <option value="1-3">1-3 years (Junior)</option>
            <option value="3-5">3-5 years (Mid-Level)</option>
            <option value="5-10">5-10 years (Senior)</option>
            <option value="10+">10+ years (Expert)</option>
          </select>
        </div>

        <div className="professional-section__form-group">
          <label htmlFor="availability" className="professional-section__label professional-section__required">
            Availability
          </label>
          <select
            id="availability"
            className="professional-section__select"
            value={professional.availability}
            onChange={(e) => handleInputChange('availability', e.target.value)}
            required
          >
            <option value="available">Available for projects</option>
            <option value="full-time">Available full-time</option>
            <option value="part-time">Available part-time</option>
            <option value="not-available">Not available</option>
          </select>
          {professional.availability && (
            <div className="professional-section__availability-preview">
              <div className={`professional-section__availability-dot ${getAvailabilityDotClass(professional.availability)}`}></div>
              <span>{getAvailabilityText(professional.availability)}</span>
            </div>
          )}
        </div>

        <div className="professional-section__form-group professional-section__rate-group">
          <label htmlFor="hourlyRate" className="professional-section__label">
            Hourly Rate (USD)
          </label>
          <input
            type="number"
            id="hourlyRate"
            className="professional-section__input professional-section__rate-input"
            value={professional.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            placeholder="50"
            min="0"
            step="5"
          />
          <small className="professional-section__help-text">
            Your standard hourly rate for projects
          </small>
        </div>

        <div className="professional-section__form-group">
          <label htmlFor="responseTime" className="professional-section__label">
            Typical Response Time
          </label>
          <select
            id="responseTime"
            className="professional-section__select"
            value={professional.responseTime}
            onChange={(e) => handleInputChange('responseTime', e.target.value)}
          >
            <option value="2h">Within 2 hours</option>
            <option value="6h">Within 6 hours</option>
            <option value="24h">Within 24 hours</option>
            <option value="48h">Within 48 hours</option>
          </select>
          {professional.responseTime && (
            <div className="professional-section__response-preview">
              <span className="professional-section__response-icon">⏱</span>
              {getResponseTimeText(professional.responseTime)}
            </div>
          )}
        </div>

        <div className="professional-section__form-group professional-section__form-group--full">
          <label htmlFor="bio" className="professional-section__label professional-section__required">
            Professional Bio
          </label>
          <textarea
            id="bio"
            className="professional-section__textarea"
            value={professional.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Describe your professional journey, key expertise areas, notable achievements, and what sets you apart. Share your passion for your work and how you help clients succeed. Mention specific technologies, methodologies, or industries you specialize in."
            rows="6"
            maxLength="1000"
            required
          />
          <div className={`professional-section__character-count ${getCharacterCountClass(professional.bio.length)}`}>
            {professional.bio.length}/1000 characters
            {professional.bio.length > 800 && (
              <span style={{marginLeft: '8px'}}>
                {professional.bio.length > 900 ? ' - Near limit!' : ' - Getting long'}
              </span>
            )}
          </div>
          <small className="professional-section__help-text">
            This is your chance to make a great first impression. Be specific about your skills, experience, and how you can deliver value to clients.
          </small>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSection;