import React, { useState, useRef } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaGlobe, 
  FaLinkedin, 
  FaTwitter, 
  FaGithub, 
  FaCamera,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaIndustry,
  FaUsers,
  FaBriefcase,
  FaUpload
} from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [profile, setProfile] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    timezone: 'UTC',
    address: '',
    dateOfBirth: '',
    profilePhoto: null,
    
    // Professional Information
    companyName: '',
    jobTitle: '',
    department: '',
    employeeId: '',
    industry: '',
    companySize: '',
    businessType: '',
    yearsOfExperience: '',
    
    // Social Links
    linkedin: '',
    website: '',
    twitter: '',
    github: '',
    
    // Verification Status
    emailVerified: false,
    phoneVerified: false,
    
    // Terms & Conditions
    acceptedTerms: false
  });

  const [verification, setVerification] = useState({
    emailCode: '',
    phoneCode: '',
    isVerifyingEmail: false,
    isVerifyingPhone: false
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'country', 
      'companyName', 'jobTitle', 'industry', 'companySize', 'businessType'
    ];
    
    const completedFields = requiredFields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length;
    
    // Add verification points
    const verificationPoints = (profile.emailVerified ? 1 : 0) + (profile.phoneVerified ? 1 : 0);
    const photoPoint = profile.profilePhoto ? 1 : 0;
    
    const totalPoints = completedFields + verificationPoints + photoPoint;
    const maxPoints = requiredFields.length + 3; // +3 for verifications and photo
    
    return Math.round((totalPoints / maxPoints) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'phone':
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else if (!isValidPhone(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'firstName':
      case 'lastName':
        if (!value) {
          newErrors[field] = 'This field is required';
        } else {
          delete newErrors[field];
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    validateField(field, value);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Please upload an image file (JPG, PNG, GIF)' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          profilePhoto: e.target.result
        }));
        setErrors(prev => ({ ...prev, profilePhoto: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const initiateEmailVerification = async () => {
    if (!isValidEmail(profile.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    setVerification(prev => ({ ...prev, isVerifyingEmail: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Verification code has been sent to your email address');
    } catch (error) {
      alert('Failed to send verification code. Please try again.');
    } finally {
      setVerification(prev => ({ ...prev, isVerifyingEmail: false }));
    }
  };

  const verifyEmail = async () => {
    if (!verification.emailCode) {
      alert('Please enter the verification code');
      return;
    }

    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProfile(prev => ({ ...prev, emailVerified: true }));
    setVerification(prev => ({ ...prev, emailCode: '' }));
    alert('Email address verified successfully!');
  };

  const initiatePhoneVerification = async () => {
    if (!isValidPhone(profile.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      return;
    }

    setVerification(prev => ({ ...prev, isVerifyingPhone: true }));
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Verification code has been sent to your phone via SMS');
    } catch (error) {
      alert('Failed to send verification code. Please try again.');
    } finally {
      setVerification(prev => ({ ...prev, isVerifyingPhone: false }));
    }
  };

  const verifyPhone = async () => {
    if (!verification.phoneCode) {
      alert('Please enter the verification code');
      return;
    }

    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProfile(prev => ({ ...prev, phoneVerified: true }));
    setVerification(prev => ({ ...prev, phoneCode: '' }));
    alert('Phone number verified successfully!');
  };

  const handleSaveProfile = async () => {
    // Final validation
    const finalErrors = {};
    if (!profile.firstName) finalErrors.firstName = 'First name is required';
    if (!profile.lastName) finalErrors.lastName = 'Last name is required';
    if (!profile.email) finalErrors.email = 'Email is required';
    if (!profile.phone) finalErrors.phone = 'Phone number is required';
    if (!profile.acceptedTerms) finalErrors.terms = 'Please accept the Terms and Conditions';

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      alert('Please complete all required fields before saving');
      return;
    }

    if (!profile.emailVerified) {
      alert('Please verify your email address before saving');
      return;
    }

    if (!profile.phoneVerified) {
      alert('Please verify your phone number before saving');
      return;
    }

    // Save profile data
    try {
      // await api.updateProfile(profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to save profile. Please try again.');
    }
  };

  const isEmailVerifyDisabled = !isValidEmail(profile.email) || verification.isVerifyingEmail;
  const isPhoneVerifyDisabled = !isValidPhone(profile.phone) || verification.isVerifyingPhone;

  const steps = [
    { id: 'personal', title: 'Personal Info', description: 'Basic details and contact information' },
    { id: 'professional', title: 'Professional', description: 'Work and company information' },
    { id: 'social', title: 'Social Links', description: 'Connect your social profiles' },
    { id: 'verification', title: 'Verification', description: 'Secure your account' }
  ];

  return (
    <div className="profile-page-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <h1>Complete Your Profile</h1>
          <p>Set up your account to start collaborating with top talent on WorkHub</p>
          <div className="completion-section">
            <div className="completion-bar">
              <div 
                className="completion-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="completion-text">{completionPercentage}% Complete</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* Left Sidebar - Navigation Steps */}
        <div className="profile-sidebar">
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`step ${activeSection === step.id ? 'active' : ''}`}
                onClick={() => setActiveSection(step.id)}
              >
                <div className="step-indicator">
                  <div className="step-number">{index + 1}</div>
                </div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="profile-main">
          {/* Profile Photo Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Photo</h2>
              <p>Add a professional photo to help team members recognize you</p>
            </div>
            
            <div className="photo-section">
              <div className="photo-upload-area">
                <div className="photo-preview">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="photo-placeholder">
                      <FaUser size={48} />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>
                
                <button 
                  className="upload-btn"
                  onClick={triggerFileInput}
                >
                  <FaUpload />
                  {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <p className="upload-hint">JPG, PNG or GIF - Max 5MB</p>
              </div>
              
              <div className="photo-guidelines">
                <h4>Photo Guidelines</h4>
                <ul>
                  <li>Square image recommended (1:1 ratio)</li>
                  <li>Optimal size: 500x500 pixels</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Supported formats: JPG, PNG, GIF</li>
                </ul>
                {errors.profilePhoto && (
                  <div className="error-message">{errors.profilePhoto}</div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {/* <br></br>
              <p>Tell us about yourself - this helps us personalize your experience</p> */}
            </div>
            
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'input-error' : ''}
                  />
                  {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'input-error' : ''}
                  />
                  {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Email Address *
                  </label>
                  <div className="verification-field">
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@company.com"
                      className={errors.email ? 'input-error' : ''}
                    />
                    <div className="verification-actions">
                      {profile.emailVerified ? (
                        <span className="verification-status verified">
                          <FaCheckCircle /> Verified
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className="verify-btn"
                          onClick={initiateEmailVerification}
                          disabled={isEmailVerifyDisabled}
                        >
                          {verification.isVerifyingEmail ? 'Sending...' : 'Verify Email'}
                        </button>
                      )}
                    </div>
                  </div>
                  {errors.email && <div className="error-message">{errors.email}</div>}
                  
                  {!profile.emailVerified && profile.email && isValidEmail(profile.email) && (
                    <div className="verification-code-section">
                      <input
                        type="text"
                        placeholder="Enter 6-digit verification code"
                        value={verification.emailCode}
                        onChange={(e) => setVerification(prev => ({ 
                          ...prev, 
                          emailCode: e.target.value 
                        }))}
                        className="code-input"
                        maxLength={6}
                      />
                      <button 
                        type="button" 
                        className="submit-code-btn"
                        onClick={verifyEmail}
                        disabled={!verification.emailCode}
                      >
                        Submit Code
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Phone Number *
                  </label>
                  <div className="verification-field">
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 000 00 00000"
                      className={errors.phone ? 'input-error' : ''}
                    />
                    <div className="verification-actions">
                      {profile.phoneVerified ? (
                        <span className="verification-status verified">
                          <FaCheckCircle /> Verified
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className="verify-btn"
                          onClick={initiatePhoneVerification}
                          disabled={isPhoneVerifyDisabled}
                        >
                          {verification.isVerifyingPhone ? 'Sending...' : 'Verify Phone'}
                        </button>
                      )}
                    </div>
                  </div>
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                  
                  {!profile.phoneVerified && profile.phone && isValidPhone(profile.phone) && (
                    <div className="verification-code-section">
                      <input
                        type="text"
                        placeholder="Enter 6-digit SMS code"
                        value={verification.phoneCode}
                        onChange={(e) => setVerification(prev => ({ 
                          ...prev, 
                          phoneCode: e.target.value 
                        }))}
                        className="code-input"
                        maxLength={6}
                      />
                      <button 
                        type="button" 
                        className="submit-code-btn"
                        onClick={verifyPhone}
                        disabled={!verification.phoneCode}
                      >
                        Submit Code
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Optional Fields */}
                <div className="form-group">
                  <label className="form-label">
                    <FaMapMarkerAlt className="label-icon" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt className="label-icon" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaGlobe className="label-icon" />
                    Country
                  </label>
                  <select
                    value={profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaGlobe className="label-icon" />
                    Time Zone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <button className="save-btn secondary">
              Save as Draft
            </button>
            <button 
              className="save-btn primary"
              onClick={handleSaveProfile}
              disabled={!profile.acceptedTerms || !profile.emailVerified || !profile.phoneVerified}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;