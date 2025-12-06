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

  return (
    <div className="basic-info-section">
      <div className="section-header">
        <h2>Basic Information</h2>
        <p className="section-description">Start with the basics - your name, photos, and contact information.</p>
      </div>

      <div className="form-content">
        {/* Images Section */}
        <div className="images-section">
          {/* Cover Photo */}
          <div className="form-group">
            <label className="form-label">
              <FaCamera className="label-icon" />
              Cover Photo
              <span className="optional">(Optional)</span>
            </label>
            <p className="field-description">This will be displayed at the top of your public profile (Recommended: 1200x300px)</p>
            <div className="image-upload-container cover-upload">
              {coverPreview || data.basicInfo.coverPhoto ? (
                <div className="image-preview cover-preview">
                  <img 
                    src={coverPreview || data.basicInfo.coverPhoto} 
                    alt="Cover preview" 
                  />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage('coverPhoto')}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <label className="image-upload-placeholder cover-placeholder">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange('coverPhoto', e.target.files[0])}
                  />
                  <FaCamera size={32} />
                  <span>Upload Cover Photo</span>
                  <small>Click to browse or drag and drop</small>
                  <small>PNG, JPG, GIF up to 10MB</small>
                </label>
              )}
            </div>
          </div>

          {/* Profile Photo */}
          <div className="form-group">
            <label className="form-label">
              <FaUser className="label-icon" />
              Profile Photo
              <span className="required">*</span>
            </label>
            <p className="field-description">This will be your main profile picture (Recommended: 400x400px)</p>
            <div className="image-upload-container profile-upload">
              {profilePreview || data.basicInfo.profilePhoto ? (
                <div className="image-preview profile-preview">
                  <img 
                    src={profilePreview || data.basicInfo.profilePhoto} 
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
        </div>

        {/* Personal Information Section */}
        <div className="personal-info-section">
          <h3 className="section-subtitle">Personal Information</h3>
          
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              <FaUser className="label-icon" />
              Full Name
              <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={data.basicInfo.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              required
            />
            <p className="field-help">This will be displayed on your public profile</p>
          </div>

          {/* Professional Headline */}
          <div className="form-group">
            <label className="form-label">
              Professional Headline
              <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={data.basicInfo.professionalHeadline}
              onChange={(e) => handleInputChange('professionalHeadline', e.target.value)}
              placeholder="e.g., Senior Web Developer, UI/UX Designer, Full Stack Engineer"
              required
            />
            <p className="field-help">Describe what you do in a few words</p>
          </div>

          <div className="form-row">
            {/* Location */}
            <div className="form-group">
              <label className="form-label">
                <FaMapMarkerAlt className="label-icon" />
                Location
                <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={data.basicInfo.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                required
              />
            </div>
            
            {/* Timezone */}
            <div className="form-group">
              <label className="form-label">
                Timezone
                <span className="optional">(Optional)</span>
              </label>
              <select
                className="form-input"
                value={data.basicInfo.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
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
          </div>

          <div className="form-row">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <FaEnvelope className="label-icon" />
                Email Address
                <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                value={data.basicInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                <FaPhone className="label-icon" />
                Phone Number
                <span className="optional">(Optional)</span>
              </label>
              <input
                type="tel"
                className="form-input"
                value={data.basicInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Website */}
          <div className="form-group">
            <label className="form-label">
              <FaGlobe className="label-icon" />
              Personal Website
              <span className="optional">(Optional)</span>
            </label>
            <input
              type="url"
              className="form-input"
              value={data.basicInfo.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
            <p className="field-help">Your portfolio, blog, or personal website</p>
          </div>

          {/* Social Links Section */}
          <div className="social-links-section">
            <h3 className="section-subtitle">Social Profiles</h3>
            <p className="section-description">Add your social profiles to help clients learn more about you</p>
            
            <div className="social-links-grid">
              {/* LinkedIn */}
              <div className="form-group">
                <label className="form-label">
                  <FaLinkedin className="label-icon linkedin" />
                  LinkedIn
                  <span className="optional">(Optional)</span>
                </label>
                <div className="social-input-group">
                  <span className="social-prefix">linkedin.com/in/</span>
                  <input
                    type="text"
                    className="form-input"
                    value={data.basicInfo.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="yourprofile"
                  />
                </div>
              </div>
              
              {/* GitHub */}
              <div className="form-group">
                <label className="form-label">
                  <FaGithub className="label-icon github" />
                  GitHub
                  <span className="optional">(Optional)</span>
                </label>
                <div className="social-input-group">
                  <span className="social-prefix">github.com/</span>
                  <input
                    type="text"
                    className="form-input"
                    value={data.basicInfo.socialLinks.github}
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>
              
              {/* Twitter */}
              <div className="form-group">
                <label className="form-label">
                  <FaTwitter className="label-icon twitter" />
                  Twitter
                  <span className="optional">(Optional)</span>
                </label>
                <div className="social-input-group">
                  <span className="social-prefix">twitter.com/</span>
                  <input
                    type="text"
                    className="form-input"
                    value={data.basicInfo.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>
              
              {/* Behance */}
              <div className="form-group">
                <label className="form-label">
                  <FaBehance className="label-icon behance" />
                  Behance
                  <span className="optional">(Optional)</span>
                </label>
                <div className="social-input-group">
                  <span className="social-prefix">behance.net/</span>
                  <input
                    type="text"
                    className="form-input"
                    value={data.basicInfo.socialLinks.behance}
                    onChange={(e) => handleSocialLinkChange('behance', e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Note */}
      <div className="required-fields-note">
        <span className="required">*</span> indicates required fields
      </div>
    </div>
  );
};

export default BasicInfoSection;