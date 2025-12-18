import React, { useState } from 'react';
import './PricingAvailabilitySection.css';

const PricingAvailabilitySection = ({ data, updateData }) => {
const pricingAvailability = data?.pricingAvailability || {};

  const [rateType, setRateType] = useState('hourly'); 

  const handleInputChange = (field, value) => {
    updateData('pricingAvailability', { [field]: value });
  };

  const handleCommunicationChannelToggle = (channel) => {
    const currentChannels = [...pricingAvailability.communicationChannels];
    const index = currentChannels.indexOf(channel);
    
    if (index > -1) {
      currentChannels.splice(index, 1);
    } else {
      currentChannels.push(channel);
    }
    
    handleInputChange('communicationChannels', currentChannels);
  };

  const communicationOptions = [
    'Email', 'Video Calls', 'Chat/Messaging', 'Phone Calls', 
    'Project Management Tools', 'Regular Status Updates'
  ];

  const projectSizeOptions = [
    'Small (< $1,000)',
    'Medium ($1,000 - $5,000)',
    'Large ($5,000 - $20,000)',
    'Enterprise ($20,000+)',
    'No preference'
  ];

  return (
    <div className="pricing-availability-section">
      <div className="section-header">
        <h2>Pricing & Availability</h2>
        <p className="section-description">
          Set your rates, availability, and communication preferences to attract the right clients.
        </p>
        <div className="points-info">
          <span className="points-badge">10 Points</span>
          <span className="points-description">(8 mandatory, 2 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Pricing Type - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Pricing Type
          </label>
          <div className="pricing-options">
            <label className={`pricing-option ${pricingAvailability.pricingType === 'hourly' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="pricingType"
                value="hourly"
                checked={pricingAvailability.pricingType === 'hourly'}
                onChange={(e) => handleInputChange('pricingType', e.target.value)}
                className="option-radio"
              />
              <div className="option-content">
                <div className="option-icon">⏱️</div>
                <div className="option-details">
                  <strong className="option-title">Hourly Rate</strong>
                  <p className="option-description">Charge by the hour for ongoing work</p>
                </div>
              </div>
              <div className="option-check">✓</div>
            </label>
            
            <label className={`pricing-option ${pricingAvailability.pricingType === 'fixed' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="pricingType"
                value="fixed"
                checked={pricingAvailability.pricingType === 'fixed'}
                onChange={(e) => handleInputChange('pricingType', e.target.value)}
                className="option-radio"
              />
              <div className="option-content">
                <div className="option-icon">💰</div>
                <div className="option-details">
                  <strong className="option-title">Fixed Project Rate</strong>
                  <p className="option-description">Charge per project with clear scope</p>
                </div>
              </div>
              <div className="option-check">✓</div>
            </label>
          </div>
        </div>

        {/* Rate - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            {pricingAvailability.pricingType === 'hourly' ? 'Hourly Rate (USD)' : 'Project Rate (USD)'}
          </label>
          <div className="rate-input-group">
            <span className="rate-prefix">$</span>
            <input
              type="number"
              className="form-input rate-input"
              value={pricingAvailability.rate}
              onChange={(e) => handleInputChange('rate', e.target.value)}
              placeholder={pricingAvailability.pricingType === 'hourly' ? '50' : '1000'}
              min="0"
              step={pricingAvailability.pricingType === 'hourly' ? "5" : "100"}
            />
            <span className="rate-suffix">
              {pricingAvailability.pricingType === 'hourly' ? '/hour' : '/project'}
            </span>
          </div>
          <p className="field-help">
            {pricingAvailability.pricingType === 'hourly' 
              ? 'Your standard hourly rate for projects' 
              : 'Your typical rate for complete projects'}
          </p>
        </div>

        {/* Availability Type - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Availability
          </label>
          <div className="availability-options">
            <label className={`availability-option ${pricingAvailability.availabilityType === 'full-time' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="availabilityType"
                value="full-time"
                checked={pricingAvailability.availabilityType === 'full-time'}
                onChange={(e) => handleInputChange('availabilityType', e.target.value)}
                className="option-radio"
              />
              <div className="option-content">
                <div className="option-icon">💼</div>
                <div className="option-details">
                  <strong className="option-title">Full-time</strong>
                  <p className="option-description">40+ hours per week available</p>
                </div>
              </div>
              <div className="option-check">✓</div>
            </label>
            
            <label className={`availability-option ${pricingAvailability.availabilityType === 'part-time' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="availabilityType"
                value="part-time"
                checked={pricingAvailability.availabilityType === 'part-time'}
                onChange={(e) => handleInputChange('availabilityType', e.target.value)}
                className="option-radio"
              />
              <div className="option-content">
                <div className="option-icon">📅</div>
                <div className="option-details">
                  <strong className="option-title">Part-time</strong>
                  <p className="option-description">Up to 30 hours per week</p>
                </div>
              </div>
              <div className="option-check">✓</div>
            </label>
          </div>
        </div>

        {/* Weekly Hours - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Weekly Hours Available
          </label>
          <div className="hours-input-group">
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={pricingAvailability.weeklyHours || 20}
              onChange={(e) => handleInputChange('weeklyHours', e.target.value)}
              className="hours-slider"
            />
            <div className="hours-display">
              <span className="hours-value">{pricingAvailability.weeklyHours || 20}</span>
              <span className="hours-label">hours per week</span>
            </div>
            <div className="hours-labels">
              <span>10h</span>
              <span>35h</span>
              <span>60h</span>
            </div>
          </div>
        </div>

        {/* Preferred Project Size - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Preferred Project Size
          </label>
          <select
            className="form-input"
            value={pricingAvailability.preferredProjectSize}
            onChange={(e) => handleInputChange('preferredProjectSize', e.target.value)}
          >
            <option value="">Select preferred project size</option>
            {projectSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Communication Channels - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Preferred Communication Channels
          </label>
          <p className="field-help">Select all that apply</p>
          <div className="communication-grid">
            {communicationOptions.map(channel => (
              <label key={channel} className="communication-option">
                <input
                  type="checkbox"
                  checked={pricingAvailability.communicationChannels.includes(channel)}
                  onChange={() => handleCommunicationChannelToggle(channel)}
                  className="channel-checkbox"
                />
                <span className="checkmark"></span>
                <span className="channel-label">{channel}</span>
              </label>
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
                  pricingAvailability.pricingType,
                  pricingAvailability.rate,
                  pricingAvailability.availabilityType
                ].filter(Boolean).length;
                return `${completed}/3 completed`;
              })()}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Recommended Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  pricingAvailability.weeklyHours,
                  pricingAvailability.preferredProjectSize,
                  pricingAvailability.communicationChannels.length > 0
                ].filter(Boolean).length;
                return `${completed}/3 completed`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAvailabilitySection;