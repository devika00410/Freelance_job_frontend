import React, { useState } from 'react';
import { FaCamera, FaTimes, FaUser, FaMapMarkerAlt, FaGlobe, FaPhone, FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaBehance } from 'react-icons/fa';
import './BasicInfoSection.css';

const BasicInfoSection = ({ data, updateData }) => {
  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  // Convert file to data URL for localStorage storage
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (field, file) => {
    if (file) {
      try {
        // Create preview
        const previewUrl = URL.createObjectURL(file);

        if (field === 'profilePhoto') {
          setProfilePreview(previewUrl);
        } else {
          setCoverPreview(previewUrl);
        }

        // Convert to data URL for localStorage storage
        const dataUrl = await fileToDataURL(file);

        // Update form data with the data URL (not the file object)
        updateData('basicInfo', {
          ...data.basicInfo,
          [field]: dataUrl
        });

        console.log(`✅ ${field} converted to data URL:`, dataUrl.substring(0, 50) + '...');

      } catch (error) {
        console.error(`Error converting ${field}:`, error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const removeImage = (field) => {
    if (field === 'profilePhoto') {
      setProfilePreview('');
    } else {
      setCoverPreview('');
    }

    updateData('basicInfo', {
      ...data.basicInfo,
      [field]: null
    });
  };

  const handleInputChange = (field, value) => {
    updateData('basicInfo', {
      ...data.basicInfo,
      [field]: value
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    updateData('basicInfo', {
      ...data.basicInfo,
      socialLinks: {
        ...data.basicInfo.socialLinks,
        [platform]: value
      }
    });
  };

  // FIX: Ensure data has proper structure
  const basicInfo = data?.basicInfo || {};

  // Add language handling
  const [newLanguage, setNewLanguage] = useState('');
  const [languageLevel, setLanguageLevel] = useState('fluent');

  // FIX: Ensure languages is always an array
  const languages = Array.isArray(basicInfo.languages) ? basicInfo.languages : [];

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const updatedLanguages = [...languages, {
        language: newLanguage.trim(),
        level: languageLevel
      }];
      updateData('basicInfo', {
        ...basicInfo,
        languages: updatedLanguages
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    updateData('basicInfo', {
      ...basicInfo,
      languages: updatedLanguages
    });
  };

  return (
    <div className="basic-info-section">
      <div className="section-header">
        <h2>Basic Information</h2>
        <p className="section-description">Identity, trust, and verification. Complete mandatory fields to become searchable.</p>
        <div className="points-info">
          <span className="points-badge">20 Points</span>
          <span className="points-description">(15 mandatory, 5 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Profile Photo - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            <FaUser className="label-icon" />
            Profile Photo
          </label>
          <p className="field-help mandatory">Required for verification and trust</p>
          <div className="image-upload-container profile-upload">
            {profilePreview || basicInfo.profilePhoto ? (
              <div className="image-preview profile-preview">
                <img
                  src={profilePreview || basicInfo.profilePhoto}
                  alt="Profile preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage('profilePhoto')}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <label className="image-upload-placeholder profile-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('profilePhoto', e.target.files[0])}
                />
                <FaUser size={32} />
                <span>Upload Profile Photo</span>
                <small>Click to browse or drag and drop</small>
                <small>PNG, JPG, GIF up to 10MB</small>
              </label>
            )}
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="personal-info-section">
          <h3 className="section-subtitle">Personal Information</h3>

          {/* Full Name - MANDATORY */}
          <div className="form-group">
            <label className="form-label mandatory-label">
              <FaUser className="label-icon" />
              Full Name
            </label>
            <input
              type="text"
              className="form-input"
              value={basicInfo.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
            <p className="field-help mandatory">Your legal name for verification</p>
          </div>

          {/* Display Name - RECOMMENDED */}
          <div className="form-group">
            <label className="form-label recommended-label">
              Display Name
            </label>
            <input
              type="text"
              className="form-input"
              value={basicInfo.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="How you want to appear to clients"
            />
            <p className="field-help">Shown instead of full name to clients</p>
          </div>

          {/* Country - MANDATORY */}
          <div className="form-group">
            <label className="form-label mandatory-label">
              <FaMapMarkerAlt className="label-icon" />
              Country
            </label>
            <select
              className="form-input"
              value={basicInfo.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
            >
              <option value="">Select your country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Timezone - MANDATORY */}
          <div className="form-group">
            <label className="form-label mandatory-label">
              Timezone
            </label>
            <select
              className="form-input"
              value={basicInfo.timezone || ''}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              required
            >
              <option value="">Select your timezone</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="GMT">Greenwich Mean Time (GMT)</option>
              <option value="CET">Central European Time (CET)</option>
              <option value="IST">Indian Standard Time (IST)</option>
              <option value="AEST">Australian Eastern Time (AEST)</option>
            </select>
          </div>

          {/* Email - MANDATORY */}
          <div className="form-group">
            <label className="form-label mandatory-label">
              <FaEnvelope className="label-icon" />
              Professional Email
            </label>
            <input
              type="email"
              className="form-input"
              value={basicInfo.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
            <p className="field-help mandatory">Will be verified before publishing</p>
          </div>

          {/* Phone - MANDATORY */}
          <div className="form-group">
            <label className="form-label mandatory-label">
              <FaPhone className="label-icon" />
              Phone Number
            </label>
            <input
              type="tel"
              className="form-input"
              value={basicInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              required
            />
            <p className="field-help mandatory">Will be verified for security</p>
          </div>

          {/* Languages - RECOMMENDED */}
          <div className="form-group">
            <label className="form-label recommended-label">
              Languages Spoken
            </label>
            <div className="languages-input-group">
              <input
                type="text"
                className="form-input"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language (e.g., English, Spanish)"
              />
              <select
                className="form-select"
                value={languageLevel}
                onChange={(e) => setLanguageLevel(e.target.value)}
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="fluent">Fluent</option>
                <option value="native">Native</option>
              </select>
              <button
                type="button"
                onClick={addLanguage}
                className="add-language-btn"
                disabled={!newLanguage.trim()}
              >
                Add
              </button>
            </div>
            <div className="languages-list">
              {languages.map((lang, index) => ( 
                <div key={index} className="language-tag">
                  <span>{lang.language} ({lang.level})</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="remove-language-btn">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Availability - RECOMMENDED */}
          <div className="form-group">
            <label className="form-label recommended-label">
              Availability Status
            </label>
            <select
              className="form-input"
              value={basicInfo.availability || 'available'}
              onChange={(e) => handleInputChange('availability', e.target.value)}
            >
              <option value="available">🟢 Available for projects</option>
              <option value="busy">🟡 Busy (limited availability)</option>
              <option value="unavailable">🔴 Not available</option>
            </select>
          </div>

          {/* Headline - RECOMMENDED */}
          <div className="form-group">
            <label className="form-label recommended-label">
              Short Headline Tagline
            </label>
            <input
              type="text"
              className="form-input"
              value={basicInfo.headline || ''}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              placeholder="e.g., Senior Web Developer specializing in React"
              maxLength="80"
            />
            <p className="field-help">
              Appears next to your name in search results
              {/* FIX LINE 362: Add optional chaining */}
              <span className="char-count">{basicInfo.headline?.length || 0}/80</span>
            </p>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="completion-status">
        <div className="status-row">
          <span className="status-label">Mandatory Fields:</span>
          <span className="status-count">
            {(() => {
              const mandatoryFields = [
                basicInfo.profilePhoto,
                basicInfo.fullName,
                basicInfo.country,
                basicInfo.timezone,
                basicInfo.email,
                basicInfo.phone
              ];
              const completed = mandatoryFields.filter(field =>
                field && field.toString().trim().length > 0
              ).length;
              return `${completed}/6 completed`;
            })()}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Recommended Fields:</span>
          <span className="status-count">
            {(() => {
              // FIX: Use optional chaining for languages
              const recommendedFields = [
                languages.length > 0,
                basicInfo.availability,
                basicInfo.headline
              ];
              const completed = recommendedFields.filter(Boolean).length;
              return `${completed}/3 completed`;
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;