import React from 'react';
import './ReviewSection.css';

const ReviewSection = ({ data, completionScore, onSubmit, canPublish, isSubmitting = false }) => {
  // Safely destructure with default empty objects to prevent undefined errors
  const { 
    basicInfo = {}, 
    professionalService = {}, 
    skillsTools = {}, 
    professionalOverview = {}, 
    experiencePortfolio = {}, 
    pricingAvailability = {}, 
    educationCertifications = {} 
  } = data || {};

  // Ensure nested objects have default values
  const safeBasicInfo = {
    fullName: '',
    country: '',
    email: '',
    phone: '',
    profilePhoto: null,
    ...basicInfo
  };

  const safeProfessionalService = {
    professionalTitle: '',
    primaryService: '',
    ...professionalService
  };

  const safeSkillsTools = {
    yearsOfExperience: '',
    skills: [],
    ...skillsTools
  };

  const safeProfessionalOverview = {
    summary: '',
    ...professionalOverview
  };

  const safeExperiencePortfolio = {
    experiences: [],
    portfolioItems: [],
    ...experiencePortfolio
  };

  const safePricingAvailability = {
    pricingType: '',
    rate: null,
    availabilityType: '',
    ...pricingAvailability
  };

  const safeEducationCertifications = {
    ...educationCertifications
  };

  const getVisibilityLevel = (score) => {
    if (score < 50) return { level: 'hidden', label: 'Hidden', color: '#dc3545', description: 'Profile will be hidden from search' };
    if (score < 70) return { level: 'basic', label: 'Basic', color: '#ffc107', description: 'Low visibility in search results' };
    if (score < 85) return { level: 'good', label: 'Good', color: '#198754', description: 'Normal visibility' };
    if (score < 100) return { level: 'strong', label: 'Strong', color: '#0d6efd', description: 'Boosted visibility' };
    return { level: 'excellent', label: 'Excellent', color: '#6610f2', description: 'Priority visibility in search results' };
  };

  const visibility = getVisibilityLevel(completionScore);

  const handlePublish = () => {
    if (!canPublish) {
      alert('Cannot publish profile. Please complete all mandatory fields:\n\n• Profile photo\n• Basic information\n• Professional title & service\n• 250+ word overview\n• 2+ portfolio projects\n• Pricing information');
      return;
    }

    if (completionScore < 60) {
      const confirmPublish = window.confirm(
        `Your profile is only ${completionScore}% complete (minimum 60% required for publishing).\n\nProfiles with higher completion get more visibility.\n\nAre you sure you want to publish now?`
      );
      if (!confirmPublish) return;
    }

    if (onSubmit) {
      onSubmit();
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', data);
    alert('Draft saved successfully! You can continue editing later.');
  };

  const calculateSectionScore = (section) => {
    switch(section) {
      case 'basicInfo':
        return Math.min(20, completionScore >= 20 ? 20 : completionScore);
      case 'professionalService':
        return Math.min(15, Math.max(0, completionScore - 20));
      case 'skillsTools':
        return Math.min(15, Math.max(0, completionScore - 35));
      case 'professionalOverview':
        return Math.min(15, Math.max(0, completionScore - 50));
      case 'experiencePortfolio':
        return Math.min(20, Math.max(0, completionScore - 65));
      case 'pricingAvailability':
        return Math.min(10, Math.max(0, completionScore - 85));
      case 'educationCertifications':
        return Math.min(5, Math.max(0, completionScore - 95));
      default:
        return 0;
    }
  };

  const sections = [
    { key: 'basicInfo', title: 'Basic Information', maxPoints: 20, icon: '👤' },
    { key: 'professionalService', title: 'Service & Title', maxPoints: 15, icon: '🎯' },
    { key: 'skillsTools', title: 'Skills & Tools', maxPoints: 15, icon: '💡' },
    { key: 'professionalOverview', title: 'Professional Overview', maxPoints: 15, icon: '📝' },
    { key: 'experiencePortfolio', title: 'Experience & Portfolio', maxPoints: 20, icon: '💼' },
    { key: 'pricingAvailability', title: 'Pricing & Availability', maxPoints: 10, icon: '💰' },
    { key: 'educationCertifications', title: 'Education & Certifications', maxPoints: 5, icon: '🎓' }
  ];

  const wordCount = safeProfessionalOverview.summary.trim().split(/\s+/).length;

  return (
    <div className="review-publish-section">
      <div className="section-header">
        <h2>Review & Publish Your Profile</h2>
        <p className="section-description">
          Review all information before publishing. Your profile visibility depends on completion score.
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="summary-card">
        <div className="summary-header">
          <div className="summary-title">
            <h3>Profile Summary</h3>
            <div className="visibility-badge" style={{ backgroundColor: visibility.color }}>
              {visibility.label} Visibility
            </div>
          </div>
          <div className="completion-display">
            <div className="completion-circle">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecef" strokeWidth="12" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={visibility.color} strokeWidth="12" 
                  strokeDasharray={`${(completionScore / 100) * 339.292} 339.292`} 
                  strokeLinecap="round" transform="rotate(-90 60 60)" />
                <text x="60" y="65" textAnchor="middle" fill={visibility.color} fontSize="28" fontWeight="bold">
                  {completionScore}%
                </text>
              </svg>
            </div>
            <div className="completion-details">
              <p className="visibility-description">{visibility.description}</p>
              <div className="score-breakdown">
                <span className="score-label">Total Score:</span>
                <span className="score-value">{completionScore}/100 points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="sections-breakdown">
          {sections.map(section => {
            const score = calculateSectionScore(section.key);
            const percentage = Math.round((score / section.maxPoints) * 100);
            
            return (
              <div key={section.key} className="section-score">
                <div className="section-header">
                  <span className="section-icon">{section.icon}</span>
                  <span className="section-name">{section.title}</span>
                  <span className="section-points">{section.maxPoints} pts</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: percentage >= 100 ? '#198754' : 
                                     percentage >= 80 ? '#0d6efd' : 
                                     percentage >= 60 ? '#ffc107' : '#dc3545'
                    }}
                  ></div>
                </div>
                <div className="score-details">
                  <span className="score-percentage">{percentage}%</span>
                  <span className="score-achieved">{score}/{section.maxPoints} points</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Preview */}
      <div className="preview-card">
        <h3>Profile Preview</h3>
        <div className="preview-content">
          {/* Basic Info Preview */}
          <div className="preview-section">
            <h4>👤 Basic Information</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Name:</strong> {safeBasicInfo.fullName || 'Not provided'}
              </div>
              <div className="preview-item">
                <strong>Location:</strong> {safeBasicInfo.country || 'Not provided'}
              </div>
              <div className="preview-item">
                <strong>Email:</strong> {safeBasicInfo.email || 'Not provided'}
              </div>
              <div className="preview-item">
                <strong>Profile Photo:</strong> 
                {safeBasicInfo.profilePhoto ? '✓ Uploaded' : '❌ Missing'}
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="preview-section">
            <h4>🎯 Professional Details</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Title:</strong> {safeProfessionalService.professionalTitle || 'Not provided'}
              </div>
              <div className="preview-item">
                <strong>Primary Service:</strong> {safeProfessionalService.primaryService || 'Not selected'}
              </div>
              <div className="preview-item">
                <strong>Experience:</strong> {safeSkillsTools.yearsOfExperience || 'Not specified'}
              </div>
              <div className="preview-item">
                <strong>Skills:</strong> {safeSkillsTools.skills?.length || 0} skill(s) added
              </div>
            </div>
          </div>

          {/* Portfolio & Experience */}
          <div className="preview-section">
            <h4>💼 Work & Portfolio</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Work Experience:</strong> {safeExperiencePortfolio.experiences?.length || 0} position(s)
                {safeExperiencePortfolio.experiences?.length < 1 && ' ⚠️'}
              </div>
              <div className="preview-item">
                <strong>Portfolio Projects:</strong> {safeExperiencePortfolio.portfolioItems?.length || 0} project(s)
                {safeExperiencePortfolio.portfolioItems?.length < 2 && ' ⚠️'}
              </div>
              <div className="preview-item">
                <strong>Professional Summary:</strong> 
                {wordCount >= 250 ? '✓ Complete' : `❌ Too short (${wordCount}/250 words)`}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="preview-section">
            <h4>💰 Pricing & Availability</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <strong>Pricing Type:</strong> {safePricingAvailability.pricingType || 'Not set'}
              </div>
              <div className="preview-item">
                <strong>Rate:</strong> {safePricingAvailability.rate ? `$${safePricingAvailability.rate}` : 'Not set'}
              </div>
              <div className="preview-item">
                <strong>Availability:</strong> {safePricingAvailability.availabilityType || 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Requirements */}
      <div className="requirements-card">
        <h3>Publishing Requirements</h3>
        <div className="requirements-list">
          <div className={`requirement-item ${safeBasicInfo.profilePhoto ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{safeBasicInfo.profilePhoto ? '✓' : '!'}</span>
            <span className="requirement-text">Profile photo uploaded</span>
          </div>
          <div className={`requirement-item ${safeBasicInfo.fullName && safeBasicInfo.email && safeBasicInfo.phone ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{safeBasicInfo.fullName && safeBasicInfo.email && safeBasicInfo.phone ? '✓' : '!'}</span>
            <span className="requirement-text">Basic information complete</span>
          </div>
          <div className={`requirement-item ${safeProfessionalService.professionalTitle && safeProfessionalService.primaryService ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{safeProfessionalService.professionalTitle && safeProfessionalService.primaryService ? '✓' : '!'}</span>
            <span className="requirement-text">Professional title & service selected</span>
          </div>
          <div className={`requirement-item ${wordCount >= 250 ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{wordCount >= 250 ? '✓' : '!'}</span>
            <span className="requirement-text">250+ word professional overview</span>
          </div>
          <div className={`requirement-item ${safeExperiencePortfolio.portfolioItems?.length >= 2 ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{safeExperiencePortfolio.portfolioItems?.length >= 2 ? '✓' : '!'}</span>
            <span className="requirement-text">2+ portfolio projects</span>
          </div>
          <div className={`requirement-item ${safePricingAvailability.pricingType && safePricingAvailability.rate ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{safePricingAvailability.pricingType && safePricingAvailability.rate ? '✓' : '!'}</span>
            <span className="requirement-text">Pricing information complete</span>
          </div>
          <div className={`requirement-item ${completionScore >= 60 ? 'met' : 'not-met'}`}>
            <span className="requirement-check">{completionScore >= 60 ? '✓' : '!'}</span>
            <span className="requirement-text">Minimum 60% profile completion</span>
          </div>
        </div>
        
        <div className="requirements-summary">
          <p>
            {canPublish ? (
              <span className="summary-success">✅ All publishing requirements met!</span>
            ) : (
              <span className="summary-error">⚠️ Some requirements are not met. Complete all mandatory fields to publish.</span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          type="button" 
          className="btn-secondary"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
        >
          Save as Draft
        </button>
        <button 
          type="button" 
          className="btn-primary"
          onClick={handlePublish}
          disabled={isSubmitting || !canPublish}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Publishing...
            </>
          ) : !canPublish ? (
            'Complete Requirements to Publish'
          ) : (
            `Publish Profile (${visibility.label} Visibility)`
          )}
        </button>
      </div>

      {/* Important Notes */}
      <div className="important-notes">
        <h4>Important Notes</h4>
        <ul>
          <li>Your profile will be visible to potential clients based on your visibility level</li>
          <li>You can edit your profile anytime from your dashboard</li>
          <li>Profiles with higher completion scores (85%+) get 3x more views</li>
          <li>Email and phone verification will be required after publishing</li>
          <li>You can upgrade your visibility by completing recommended fields</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewSection;