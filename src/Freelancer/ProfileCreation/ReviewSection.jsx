import React from 'react';
import './ReviewSection.css';

const ReviewSection = ({ data, onSubmit, isSubmitting = false }) => {
  const { basicInfo, professional, skills, portfolio, experience, services } = data;

  const calculateCompletion = () => {
    const sections = [basicInfo, professional, skills, portfolio, experience, services];
    let completedFields = 0;
    let totalFields = 0;

    sections.forEach(section => {
      Object.values(section).forEach(value => {
        if (Array.isArray(value)) {
          totalFields++;
          if (value.length > 0) completedFields++;
        } else if (typeof value === 'object') {
          Object.values(value).forEach(subValue => {
            totalFields++;
            if (subValue && subValue.toString().length > 0) completedFields++;
          });
        } else {
          totalFields++;
          if (value && value.toString().length > 0) completedFields++;
        }
      });
    });

    return Math.round((completedFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handlePublish = () => {
    console.log('Publishing profile with data:', data);
    
    // Validate minimum requirements
    if (!basicInfo.fullName || !basicInfo.professionalHeadline || !professional.bio) {
      alert('Please complete all required fields: Full Name, Professional Headline, and Bio');
      return;
    }

    if (completionPercentage < 50) {
      const confirmPublish = window.confirm(
        `Your profile is only ${completionPercentage}% complete. Are you sure you want to publish?`
      );
      if (!confirmPublish) return;
    }

    // Call the onSubmit prop passed from parent
    if (onSubmit) {
      onSubmit();
    } else {
      console.log('Profile data ready for submission:', data);
      alert('Profile is ready! Connect this to your backend API.');
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', data);
    alert('Draft saved successfully!');
  };

  return (
    <div className="review-section">
      <h2>Review Your Profile</h2>
      <p className="section-description">
        Review all your information before publishing your profile.
      </p>

      {/* Profile Completion */}
      <div className="completion-card">
        <div className="completion-header">
          <h3>Profile Completion</h3>
          <div className="completion-percentage">{completionPercentage}%</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="completion-message">
          {completionPercentage >= 80 
            ? 'Great! Your profile is ready to publish.'
            : completionPercentage >= 50
            ? 'Good start! Consider adding more information.'
            : 'Your profile needs more information to attract clients.'
          }
        </p>
      </div>

      {/* Profile Preview Sections */}
      <div className="preview-sections">
        {/* Basic Info Preview */}
        <div className="preview-section">
          <h3>Basic Information</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Name:</strong> {basicInfo.fullName || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Headline:</strong> {basicInfo.professionalHeadline || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Location:</strong> {basicInfo.location || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Contact:</strong> {basicInfo.email || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Profile Photo:</strong> 
              {basicInfo.profilePhoto ? (
                <span style={{color: 'green'}}>✓ Uploaded</span>
              ) : (
                <span style={{color: 'red'}}>Not uploaded</span>
              )}
            </div>
            <div className="preview-row">
              <strong>Cover Photo:</strong> 
              {basicInfo.coverPhoto ? (
                <span style={{color: 'green'}}>✓ Uploaded</span>
              ) : (
                <span style={{color: 'red'}}>Not uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Preview */}
        <div className="preview-section">
          <h3>Professional Overview</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Title:</strong> {professional.professionalTitle || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Experience:</strong> {professional.yearsOfExperience || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Availability:</strong> {professional.availability || 'Not provided'}
            </div>
            <div className="preview-row">
              <strong>Bio:</strong> 
              <p className="bio-preview">
                {professional.bio || 'No bio provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Skills Preview */}
        <div className="preview-section">
          <h3>Skills & Expertise</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Technical Skills:</strong>
              <div className="skills-preview">
                {skills.technicalSkills.length > 0 
                  ? skills.technicalSkills.map(skill => (
                      <span key={skill.name} className="skill-preview-tag">
                        {skill.name} ({skill.level})
                      </span>
                    ))
                  : 'No skills added'
                }
              </div>
            </div>
            <div className="preview-row">
              <strong>Service Categories:</strong>
              <div className="categories-preview">
                {skills.serviceCategories.length > 0 
                  ? skills.serviceCategories.join(', ')
                  : 'No categories selected'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Preview */}
        <div className="preview-section">
          <h3>Portfolio</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Projects:</strong> {portfolio.projects.length} projects added
            </div>
            {portfolio.projects.slice(0, 3).map(project => (
              <div key={project.id} className="project-preview">
                <strong>{project.title}</strong>
                <p>{project.description ? project.description.substring(0, 100) + '...' : 'No description'}</p>
                {project.images && project.images.length > 0 && (
                  <small>{project.images.length} image(s) attached</small>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Experience Preview */}
        <div className="preview-section">
          <h3>Experience & Education</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Work Experience:</strong> {experience.workExperience.length} positions
            </div>
            <div className="preview-row">
              <strong>Education:</strong> {experience.education.length} entries
            </div>
            <div className="preview-row">
              <strong>Certifications:</strong> {experience.certifications.length} certifications
            </div>
          </div>
        </div>

        {/* Services Preview */}
        <div className="preview-section">
          <h3>Services & Pricing</h3>
          <div className="preview-content">
            <div className="preview-row">
              <strong>Pricing Model:</strong> {services.pricingModel}
            </div>
            <div className="preview-row">
              <strong>Service Packages:</strong> {services.servicePackages.length} packages
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="review-actions">
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
          disabled={completionPercentage < 20 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Publishing...
            </>
          ) : completionPercentage < 20 ? (
            'Complete More Fields to Publish'
          ) : (
            'Publish Profile'
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <p>
          <strong>Note:</strong> Your profile will be visible to potential clients. 
          You can always edit your profile later from your dashboard.
        </p>
        {completionPercentage < 50 && (
          <p style={{marginTop: '8px', fontSize: '0.8rem'}}>
            <strong>Tip:</strong> Profiles with 50%+ completion get 3x more views!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;