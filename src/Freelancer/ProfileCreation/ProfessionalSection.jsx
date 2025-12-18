import React from 'react';
import './ProfessionalSection.css';

const ProfessionalSection = ({ data, updateData }) => {
  // SAFE destructuring with default values
  const professionalOverview = data?.professionalOverview || {
    summary: '',
    videoIntroduction: '',
    communicationStyle: ''
  };

  const handleInputChange = (field, value) => {
    updateData('professionalOverview', { [field]: value });
  };

  // SAFE word count calculation
  const wordCount = professionalOverview?.summary 
    ? professionalOverview.summary.trim().split(/\s+/).filter(word => word.length > 0).length
    : 0;
  
  const isMinimumMet = wordCount >= 250;
  const isNearLimit = wordCount > 900;
  const isWarning = wordCount > 800;

  const getCharacterCountClass = () => {
    if (isNearLimit) return 'character-count-error';
    if (isWarning) return 'character-count-warning';
    return '';
  };

  const getWordCountMessage = () => {
    const summary = professionalOverview?.summary || '';
    if (!summary.trim()) return 'Start typing your professional summary';
    if (wordCount < 50) return 'Add more details about your experience';
    if (wordCount < 150) return 'Good start, add more about your approach';
    if (wordCount < 250) return `Almost there! Need ${250 - wordCount} more words`;
    return '✓ Minimum requirement met! Consider adding more details';
  };

  return (
    <div className="professional-overview-section">
      <div className="section-header">
        <h2>Professional Overview</h2>
        <p className="section-description">
          Craft your professional story. Share who you are, what problems you solve, and why clients should hire you.
        </p>
        <div className="points-info">
          <span className="points-badge">15 Points</span>
          <span className="points-description">(12 mandatory, 3 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Professional Summary - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Professional Summary (Minimum 250 words)
          </label>
          <p className="field-help mandatory">
            {getWordCountMessage()}
          </p>
          <div className="summary-editor">
            <textarea
              className="summary-textarea"
              value={professionalOverview?.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder={`Write your professional story here...
• Who you are as a professional
• What specific problems you solve for clients
• Your approach and methodology
• Key achievements and successes
• Why clients should choose you over others
• Your passion for your work
• Technologies, industries, or niches you specialize in

Be specific, professional, and authentic. This is your chance to make a great first impression.`}
              rows="12"
            />
            <div className="summary-stats">
              <div className={`word-count ${getCharacterCountClass()}`}>
                <span className="count-number">{wordCount}</span>
                <span className="count-label">words</span>
                <span className="count-requirement">/ 250 minimum</span>
              </div>
              <div className="summary-tips">
                <div className="tip">
                  <span className="tip-icon">💡</span>
                  <span className="tip-text">Be specific about results and outcomes</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">🎯</span>
                  <span className="tip-text">Mention your unique approach or methodology</span>
                </div>
                <div className="tip">
                  <span className="tip-icon">✨</span>
                  <span className="tip-text">Share what makes you different from others</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Introduction - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Video Introduction (Optional)
          </label>
          <p className="field-help">
            Add a short video (30-90 seconds) introducing yourself (YouTube, Vimeo, or Loom link)
          </p>
          <input
            type="url"
            className="form-input"
            value={professionalOverview?.videoIntroduction || ''}
            onChange={(e) => handleInputChange('videoIntroduction', e.target.value)}
            placeholder="https://youtube.com/your-video or https://loom.com/share/..."
          />
        </div>

        {/* Communication Style - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Communication Style Preference
          </label>
          <select
            className="form-input"
            value={professionalOverview?.communicationStyle || ''}
            onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
          >
            <option value="">Select your preference</option>
            <option value="detailed">Detailed written updates</option>
            <option value="brief">Brief and concise updates</option>
            <option value="regular">Regular check-in calls</option>
            <option value="async">Async communication preferred</option>
            <option value="flexible">Flexible based on project needs</option>
          </select>
        </div>

        {/* Preview */}
        <div className="preview-card">
          <h4>Summary Preview</h4>
          <div className="preview-content">
            <div className="preview-text">
              {professionalOverview?.summary ? (
                <>
                  {professionalOverview.summary.substring(0, 200)}
                  {professionalOverview.summary.length > 200 ? '...' : ''}
                </>
              ) : (
                <p className="preview-placeholder">Your summary will appear here</p>
              )}
            </div>
            <div className="preview-stats">
              <div className="preview-stat">
                <span className="stat-label">Words:</span>
                <span className={`stat-value ${isMinimumMet ? 'stat-success' : 'stat-warning'}`}>
                  {wordCount}
                </span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">Status:</span>
                <span className={`stat-value ${isMinimumMet ? 'stat-success' : 'stat-warning'}`}>
                  {isMinimumMet ? '✓ Ready' : 'Needs more'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Status */}
        <div className="completion-status">
          <div className="status-row">
            <span className="status-label">Mandatory Fields:</span>
            <span className="status-count">
              {isMinimumMet ? '1/1 completed' : '0/1 completed'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Recommended Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  professionalOverview?.videoIntroduction,
                  professionalOverview?.communicationStyle
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

export default ProfessionalSection;