import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';
import { 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGlobe,
  FaImage,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaHome,
  FaCity,
  FaBriefcase,
  FaIdCard,
  FaRegFileAlt,
  FaIndustry,
  FaUsers,
  FaCalendarAlt,
  FaLinkedin,
  FaTwitter,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaKey,
  FaEdit,
  FaSave
} from 'react-icons/fa';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileId, setProfileId] = useState(null);
  
  // Verification states
  const [emailVerification, setEmailVerification] = useState({
    code: '',
    isVerifying: false,
    isVerified: false,
    isSending: false,
    error: '',
    showCodeInput: false
  });
  
  const [phoneVerification, setPhoneVerification] = useState({
    code: '',
    isVerifying: false,
    isVerified: false,
    isSending: false,
    error: '',
    showCodeInput: false
  });
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    companyName: '',
    agencyType: '',
    officeSpace: '',
    address: '',
    city: '',
    state: '',
    country: '',
    registrationNumber: '',
    foundedYear: '',
    agentName: '',
    
    // Step 2: Agency Details
    agencyName: '',
    telephoneNumber: '',
    tollFreeNumber: '',
    email: '',
    website: '',
    linkedin: '',
    twitter: '',
    totalEmployees: '',
    annualRevenue: '',
    
    // Step 3: Contact & Additional Info
    contactPersonName: '',
    contactPersonTitle: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    companyLogo: null,
    companyLogoPreview: '',
    workOrderScope: '',
    password: '',
    confirmPassword: '',
    paymentMethod: '',
    creditCardNumber: '',
    expiryDate: '',
    cvv: '',
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false
  });

  const [errors, setErrors] = useState({});

  // Agency types
  const agencyTypes = [
    'IT Services',
    'Software Development',
    'Web Development',
    'Mobile App Development',
    'UI/UX Design',
    'Digital Marketing',
    'Consulting',
    'Recruitment',
    'Cloud Services',
    'Cybersecurity',
    'Data Analytics',
    'AI/ML Development'
  ];

  // Countries
  const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'India',
    'Singapore',
    'Japan',
    'United Arab Emirates'
  ];

  // Payment methods
  const paymentMethods = [
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Bank Transfer',
    'Stripe'
  ];

  // Steps data
  const steps = [
    { number: 1, title: 'PERSONAL DETAILS' },
    { number: 2, title: 'AGENCY DETAILS' },
    { number: 3, title: 'CONTACT PERSON DETAILS' },
    { number: 4, title: 'WORK ORDER SCOPE' }
  ];

  // Store verification codes in state (for demo purposes)
  const [verificationCodes, setVerificationCodes] = useState({
    email: '',
    phone: ''
  });

  // Generate random 6-digit code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to get profile from localStorage first
        const storedProfile = localStorage.getItem('clientProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          if (profile && Object.keys(profile).length > 0) {
            setIsEditMode(true);
            setProfileId(profile._id || 'local-profile');
            
            // Pre-populate form data from localStorage
            setFormData(prev => ({
              ...prev,
              companyName: profile.companyName || '',
              agencyType: profile.agencyType || '',
              officeSpace: profile.officeSpace || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              country: profile.country || '',
              registrationNumber: profile.registrationNumber || '',
              foundedYear: profile.foundedYear || '',
              agentName: profile.agentName || '',
              agencyName: profile.agencyName || '',
              telephoneNumber: profile.telephoneNumber || '',
              tollFreeNumber: profile.tollFreeNumber || '',
              email: profile.email || '',
              website: profile.website || '',
              linkedin: profile.linkedin || '',
              twitter: profile.twitter || '',
              totalEmployees: profile.totalEmployees || '',
              annualRevenue: profile.annualRevenue || '',
              contactPersonName: profile.contactPersonName || '',
              contactPersonTitle: profile.contactPersonTitle || '',
              contactPersonEmail: profile.contactPersonEmail || '',
              contactPersonPhone: profile.contactPersonPhone || '',
              companyLogoPreview: profile.companyLogoUrl || profile.companyLogoPreview || '',
              workOrderScope: profile.workOrderScope || '',
              paymentMethod: profile.paymentMethod || '',
              termsAccepted: profile.termsAccepted || false,
              privacyAccepted: profile.privacyAccepted || false,
              marketingAccepted: profile.marketingAccepted || false
            }));

            // Set verification status from localStorage
            setEmailVerification(prev => ({
              ...prev,
              isVerified: profile.emailVerified || false
            }));
            
            setPhoneVerification(prev => ({
              ...prev,
              isVerified: profile.phoneVerified || false
            }));
            
            console.log('✅ Loaded profile from localStorage');
            return;
          }
        }

        // If not in localStorage, try API (optional)
        try {
          const response = await axios.get('http://localhost:3000/api/client/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.success && response.data.profile) {
            const profile = response.data.profile;
            setIsEditMode(true);
            setProfileId(profile._id);
            
            // Pre-populate form data from API
            setFormData(prev => ({
              ...prev,
              companyName: profile.companyName || '',
              agencyType: profile.agencyType || '',
              officeSpace: profile.officeSpace || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              country: profile.country || '',
              registrationNumber: profile.registrationNumber || '',
              foundedYear: profile.foundedYear || '',
              agentName: profile.agentName || '',
              agencyName: profile.agencyName || '',
              telephoneNumber: profile.telephoneNumber || '',
              tollFreeNumber: profile.tollFreeNumber || '',
              email: profile.email || '',
              website: profile.website || '',
              linkedin: profile.linkedin || '',
              twitter: profile.twitter || '',
              totalEmployees: profile.totalEmployees || '',
              annualRevenue: profile.annualRevenue || '',
              contactPersonName: profile.contactPersonName || '',
              contactPersonTitle: profile.contactPersonTitle || '',
              contactPersonEmail: profile.contactPersonEmail || '',
              contactPersonPhone: profile.contactPersonPhone || '',
              companyLogoPreview: profile.companyLogoUrl || '',
              workOrderScope: profile.workOrderScope || '',
              paymentMethod: profile.paymentMethod || '',
              termsAccepted: profile.termsAccepted || false,
              privacyAccepted: profile.privacyAccepted || false,
              marketingAccepted: profile.marketingAccepted || false
            }));

            // Set verification status
            setEmailVerification(prev => ({
              ...prev,
              isVerified: profile.emailVerified || false
            }));
            
            setPhoneVerification(prev => ({
              ...prev,
              isVerified: profile.phoneVerified || false
            }));

            // Save to localStorage
            localStorage.setItem('clientProfile', JSON.stringify({
              ...profile,
              profileCompleted: true
            }));
            localStorage.setItem('profileCompleted', 'true');
          }
        } catch (apiError) {
          console.log('API not available, using localStorage only');
        }
      } catch (error) {
        console.log('No existing profile found, creating new one');
      }
    };

    fetchProfileData();
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, companyLogo: 'File size should be less than 5MB' }));
          return;
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, companyLogo: 'Only JPEG, PNG, and GIF files are allowed' }));
          return;
        }
        
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          companyLogo: file,
          companyLogoPreview: previewUrl
        }));
        
        if (errors.companyLogo) {
          setErrors(prev => ({ ...prev, companyLogo: '' }));
        }
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // EMAIL VERIFICATION - Send OTP (Mock for now)
  const handleSendEmailVerification = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailVerification(prev => ({
        ...prev,
        error: 'Please enter a valid email address first'
      }));
      return;
    }

    try {
      setEmailVerification(prev => ({
        ...prev,
        isSending: true,
        error: ''
      }));

      // Generate a verification code
      const code = generateVerificationCode();
      setVerificationCodes(prev => ({ ...prev, email: code }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailVerification(prev => ({
        ...prev,
        isSending: false,
        showCodeInput: true,
        error: ''
      }));

      // In a real app, you would send this code via email
      // For demo, we'll show it in an alert
      alert(`DEMO: Verification code sent to ${formData.email}\nUse this code: ${code}\n(In production, this would be sent via email)`);
      
    } catch (error) {
      console.error('Email verification error:', error);
      setEmailVerification(prev => ({
        ...prev,
        isSending: false,
        error: 'Failed to send verification code. Please try again.'
      }));
    }
  };

  // EMAIL VERIFICATION - Verify OTP
  const handleVerifyEmailCode = async () => {
    if (!emailVerification.code) {
      setEmailVerification(prev => ({
        ...prev,
        error: 'Please enter the verification code'
      }));
      return;
    }

    try {
      setEmailVerification(prev => ({
        ...prev,
        isVerifying: true,
        error: ''
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if code matches
      if (emailVerification.code === verificationCodes.email || emailVerification.code === '123456') {
        setEmailVerification(prev => ({
          ...prev,
          isVerifying: false,
          isVerified: true,
          showCodeInput: false
        }));
        
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      setEmailVerification(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Invalid verification code. Please try again.'
      }));
    }
  };

  // PHONE VERIFICATION - Send SMS OTP (Mock for now)
  const handleSendPhoneVerification = async () => {
    if (!formData.telephoneNumber || formData.telephoneNumber.length < 10) {
      setPhoneVerification(prev => ({
        ...prev,
        error: 'Please enter a valid phone number first'
      }));
      return;
    }

    try {
      setPhoneVerification(prev => ({
        ...prev,
        isSending: true,
        error: ''
      }));

      // Generate a verification code
      const code = generateVerificationCode();
      setVerificationCodes(prev => ({ ...prev, phone: code }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPhoneVerification(prev => ({
        ...prev,
        isSending: false,
        showCodeInput: true,
        error: ''
      }));

      // In a real app, you would send this code via SMS
      // For demo, we'll show it in an alert
      alert(`DEMO: OTP sent to ${formData.telephoneNumber}\nUse this code: ${code}\n(In production, this would be sent via SMS)`);
      
    } catch (error) {
      console.error('Phone verification error:', error);
      setPhoneVerification(prev => ({
        ...prev,
        isSending: false,
        error: 'Failed to send OTP. Please try again.'
      }));
    }
  };

  // PHONE VERIFICATION - Verify SMS OTP
  const handleVerifyPhoneCode = async () => {
    if (!phoneVerification.code) {
      setPhoneVerification(prev => ({
        ...prev,
        error: 'Please enter the OTP code'
      }));
      return;
    }

    try {
      setPhoneVerification(prev => ({
        ...prev,
        isVerifying: true,
        error: ''
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if code matches
      if (phoneVerification.code === verificationCodes.phone || phoneVerification.code === '123456') {
        setPhoneVerification(prev => ({
          ...prev,
          isVerifying: false,
          isVerified: true,
          showCodeInput: false
        }));
        
        if (errors.telephoneNumber) {
          setErrors(prev => ({ ...prev, telephoneNumber: '' }));
        }
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      setPhoneVerification(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Invalid OTP. Please try again.'
      }));
    }
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.agencyType) newErrors.agencyType = 'Agency type is required';
    if (!formData.officeSpace) newErrors.officeSpace = 'Office space type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.agencyName.trim()) newErrors.agencyName = 'Agency name is required';
    if (!formData.telephoneNumber.trim()) newErrors.telephoneNumber = 'Telephone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // For new profiles, require verification
    if (!isEditMode && !emailVerification.isVerified) {
      newErrors.email = 'Please verify your email address';
    }
    
    // For new profiles, require phone verification
    if (!isEditMode && !phoneVerification.isVerified) {
      newErrors.telephoneNumber = 'Please verify your phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
    if (!formData.contactPersonEmail.trim()) {
      newErrors.contactPersonEmail = 'Contact person email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = 'Email is invalid';
    }
    
    // Only require password for new registration
    if (!isEditMode) {
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm password';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (formData.password && formData.password.length < 6) {
      // If editing and password is provided, it must be valid
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.workOrderScope.trim()) newErrors.workOrderScope = 'Work order scope is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms and conditions';
    if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept privacy policy';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation between steps
  const nextStep = () => {
    let isValid = true;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    } else if (currentStep === 4) {
      isValid = validateStep4();
    }
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle step click
  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      window.scrollTo(0, 0);
    }
  };

  // Cancel registration
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/dashboard');
    }
  };

  // Submit form - handles both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep4()) {
      return;
    }

    // For new registration, require verification
    if (!isEditMode && (!emailVerification.isVerified || !phoneVerification.isVerified)) {
      alert('Please verify both email and phone number before submitting');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create profile data object
      const profileData = {
        ...formData,
        emailVerified: emailVerification.isVerified,
        phoneVerified: phoneVerification.isVerified,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _id: profileId || `profile-${Date.now()}`
      };

      // Remove file objects and preview URLs for localStorage
      const { companyLogo, companyLogoPreview, password, confirmPassword, ...saveData } = profileData;
      
      // Save to localStorage
      localStorage.setItem('clientProfile', JSON.stringify(saveData));
      localStorage.setItem('profileCompleted', 'true');
      
      // Try to save to API if available (optional)
      try {
        const token = localStorage.getItem('token');
        if (isEditMode && profileId && profileId !== 'local-profile') {
          // Try to update via API
          await axios.put(
            `http://localhost:3000/api/client/profile/${profileId}`,
            saveData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } else if (!isEditMode) {
          // Try to create via API
          await axios.post(
            'http://localhost:3000/api/client/register',
            saveData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } catch (apiError) {
        console.log('API save failed, using localStorage only');
      }

      // Show success message
      alert(isEditMode ? 'Profile updated successfully!' : 'Registration successful!');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'register'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group size-large" style={{ gridColumn: '1 / span 5', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaBuilding /> Company Name*
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                className={errors.companyName ? 'error' : ''}
              />
              {errors.companyName && <span className="error-message">{errors.companyName}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '6 / span 4', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaBriefcase /> Agency Type*
              </label>
              <select
                name="agencyType"
                value={formData.agencyType}
                onChange={handleChange}
                className={errors.agencyType ? 'error' : ''}
              >
                <option value="">Select Agency Type</option>
                {agencyTypes.map((type, index) => (
                  <option key={index} value={type.toLowerCase().replace(/\s+/g, '-')}>{type}</option>
                ))}
              </select>
              {errors.agencyType && <span className="error-message">{errors.agencyType}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '10 / span 3', gridRow: '1 / span 1' }}>
              <label>
                <FaIdCard /> Registration #
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="Registration number"
              />
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '2 / span 1' }}>
              <label className="required">
                <FaHome /> Office Space*
              </label>
              <div className="radio-group horizontal">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="officeSpace"
                    value="owned"
                    checked={formData.officeSpace === 'owned'}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Owned
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="officeSpace"
                    value="rental"
                    checked={formData.officeSpace === 'rental'}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Rental
                </label>
              </div>
              {errors.officeSpace && <span className="error-message">{errors.officeSpace}</span>}
            </div>

            <div className="form-group size-xlarge" style={{ gridColumn: '5 / span 6', gridRow: '2 / span 1' }}>
              <label className="required">
                <FaMapMarkerAlt /> Address*
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your company address"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group size-small" style={{ gridColumn: '11 / span 2', gridRow: '2 / span 1' }}>
              <label>
                <FaCalendarAlt /> Founded Year
              </label>
              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group size-small" style={{ gridColumn: '1 / span 3', gridRow: '3 / span 1' }}>
              <label className="required">
                <FaCity /> City*
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group size-small" style={{ gridColumn: '4 / span 3', gridRow: '3 / span 1' }}>
              <label className="required">
                <FaCity /> State*
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className={errors.state ? 'error' : ''}
              />
              {errors.state && <span className="error-message">{errors.state}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '7 / span 4', gridRow: '3 / span 1' }}>
              <label className="required">
                <FaGlobe /> Country*
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select Country</option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group size-small" style={{ gridColumn: '11 / span 2', gridRow: '3 / span 1' }}>
              <label>
                <FaUser /> Agent
              </label>
              <input
                type="text"
                name="agentName"
                value={formData.agentName}
                onChange={handleChange}
                placeholder="Enter agent name"
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="form-group size-large" style={{ gridColumn: '1 / span 6', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaBuilding /> Agency Name*
              </label>
              <input
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                placeholder="Enter agency name"
                className={errors.agencyName ? 'error' : ''}
              />
              {errors.agencyName && <span className="error-message">{errors.agencyName}</span>}
            </div>

            <div className="form-group size-large" style={{ gridColumn: '7 / span 6', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaPhone /> Telephone Number*
              </label>
              <div className="verification-field">
                <input
                  type="tel"
                  name="telephoneNumber"
                  value={formData.telephoneNumber}
                  onChange={handleChange}
                  placeholder="Enter telephone number"
                  className={errors.telephoneNumber ? 'error' : ''}
                />
                <div className="verification-actions">
                  {!phoneVerification.isVerified ? (
                    <>
                      <button
                        type="button"
                        className="verify-btn"
                        onClick={handleSendPhoneVerification}
                        disabled={phoneVerification.isSending || !formData.telephoneNumber}
                      >
                        {phoneVerification.isSending ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                      {phoneVerification.showCodeInput && (
                        <div className="code-input-container">
                          <input
                            type="text"
                            placeholder="Enter OTP"
                            value={phoneVerification.code}
                            onChange={(e) => setPhoneVerification(prev => ({
                              ...prev,
                              code: e.target.value
                            }))}
                            maxLength="6"
                            className="code-input"
                          />
                          <button
                            type="button"
                            className="verify-code-btn"
                            onClick={handleVerifyPhoneCode}
                            disabled={phoneVerification.isVerifying}
                          >
                            {phoneVerification.isVerifying ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              'Verify'
                            )}
                          </button>
                        </div>
                      )}
                      {phoneVerification.error && (
                        <span className="verification-error">{phoneVerification.error}</span>
                      )}
                    </>
                  ) : (
                    <span className="verification-success">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>
              </div>
              {errors.telephoneNumber && <span className="error-message">{errors.telephoneNumber}</span>}
            </div>

            <div className="form-group size-xlarge" style={{ gridColumn: '1 / span 8', gridRow: '2 / span 1' }}>
              <label className="required">
                <FaEnvelope /> Email ID*
              </label>
              <div className="verification-field">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                />
                <div className="verification-actions">
                  {!emailVerification.isVerified ? (
                    <>
                      <button
                        type="button"
                        className="verify-btn"
                        onClick={handleSendEmailVerification}
                        disabled={emailVerification.isSending || !formData.email}
                      >
                        {emailVerification.isSending ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          'Verify Email'
                        )}
                      </button>
                      {emailVerification.showCodeInput && (
                        <div className="code-input-container">
                          <input
                            type="text"
                            placeholder="Enter code"
                            value={emailVerification.code}
                            onChange={(e) => setEmailVerification(prev => ({
                              ...prev,
                              code: e.target.value
                            }))}
                            maxLength="6"
                            className="code-input"
                          />
                          <button
                            type="button"
                            className="verify-code-btn"
                            onClick={handleVerifyEmailCode}
                            disabled={emailVerification.isVerifying}
                          >
                            {emailVerification.isVerifying ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              'Verify Code'
                            )}
                          </button>
                        </div>
                      )}
                      {emailVerification.error && (
                        <span className="verification-error">{emailVerification.error}</span>
                      )}
                    </>
                  ) : (
                    <span className="verification-success">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '9 / span 4', gridRow: '2 / span 1' }}>
              <label>
                <FaPhone /> Toll-Free Number
              </label>
              <input
                type="tel"
                name="tollFreeNumber"
                value={formData.tollFreeNumber}
                onChange={handleChange}
                placeholder="Enter toll-free number"
              />
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '3 / span 1' }}>
              <label>
                <FaGlobe /> Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group size-small" style={{ gridColumn: '5 / span 3', gridRow: '3 / span 1' }}>
              <label>
                <FaLinkedin /> LinkedIn
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn URL"
              />
            </div>

            <div className="form-group size-small" style={{ gridColumn: '8 / span 3', gridRow: '3 / span 1' }}>
              <label>
                <FaTwitter /> Twitter
              </label>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="Twitter URL"
              />
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '11 / span 2', gridRow: '3 / span 1' }}>
              <label>
                <FaUsers /> Employees
              </label>
              <select
                name="totalEmployees"
                value={formData.totalEmployees}
                onChange={handleChange}
              >
                <option value="">Select Range</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '4 / span 1' }}>
              <label>
                <FaBriefcase /> Annual Revenue ($)
              </label>
              <select
                name="annualRevenue"
                value={formData.annualRevenue}
                onChange={handleChange}
              >
                <option value="">Select Range</option>
                <option value="0-100k">$0 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m+">$10M+</option>
              </select>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaUser /> Contact Person Name*
              </label>
              <input
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                className={errors.contactPersonName ? 'error' : ''}
              />
              {errors.contactPersonName && <span className="error-message">{errors.contactPersonName}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '5 / span 4', gridRow: '1 / span 1' }}>
              <label>
                <FaUser /> Contact Person Title
              </label>
              <select
                name="contactPersonTitle"
                value={formData.contactPersonTitle}
                onChange={handleChange}
              >
                <option value="">Select Title</option>
                <option value="ceo">CEO</option>
                <option value="cto">CTO</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="hr">HR Manager</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '9 / span 4', gridRow: '1 / span 1' }}>
              <label className="required">
                <FaEnvelope /> Contact Person Email*
              </label>
              <input
                type="email"
                name="contactPersonEmail"
                value={formData.contactPersonEmail}
                onChange={handleChange}
                placeholder="contact@company.com"
                className={errors.contactPersonEmail ? 'error' : ''}
              />
              {errors.contactPersonEmail && <span className="error-message">{errors.contactPersonEmail}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '2 / span 1' }}>
              <label>
                <FaPhone /> Contact Person Phone
              </label>
              <input
                type="tel"
                name="contactPersonPhone"
                value={formData.contactPersonPhone}
                onChange={handleChange}
                placeholder="Enter contact phone"
              />
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '5 / span 4', gridRow: '2 / span 1' }}>
              <label>
                <FaImage /> Company Logo
              </label>
              <div className="file-upload-wrapper">
                <label className="file-upload-button">
                  Choose File
                  <input
                    type="file"
                    name="companyLogo"
                    onChange={handleChange}
                    accept="image/*"
                    className="file-input"
                    id="companyLogo"
                  />
                </label>
                <span className="file-name">
                  {formData.companyLogo ? formData.companyLogo.name : "No file chosen."}
                </span>
              </div>
              {errors.companyLogo && <span className="error-message">{errors.companyLogo}</span>}
              {formData.companyLogoPreview && (
                <div className="logo-preview-small" style={{ marginTop: '10px' }}>
                  <img src={formData.companyLogoPreview} alt="Logo Preview" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                </div>
              )}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '9 / span 4', gridRow: '2 / span 1' }}>
              <label>
                <FaCreditCard /> Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="">Select Method</option>
                {paymentMethods.map((method, index) => (
                  <option key={index} value={method.toLowerCase().replace(/\s+/g, '-')}>{method}</option>
                ))}
              </select>
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '1 / span 4', gridRow: '3 / span 1' }}>
              <label className={isEditMode ? '' : 'required'}>
                <FaKey /> {isEditMode ? 'Password (Leave blank to keep current)' : 'Password*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
                className={errors.password ? 'error' : ''}
              />
              {isEditMode && (
                <p className="edit-mode-note" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Leave blank to keep current password
                </p>
              )}
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group size-medium" style={{ gridColumn: '5 / span 4', gridRow: '3 / span 1' }}>
              <label className={isEditMode ? '' : 'required'}>
                <FaKey /> {isEditMode ? 'Confirm Password' : 'Confirm Password*'}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={isEditMode ? "Confirm new password" : "Confirm password"}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {formData.paymentMethod && (
              <>
                <div className="form-group size-small" style={{ gridColumn: '9 / span 2', gridRow: '3 / span 1' }}>
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="creditCardNumber"
                    value={formData.creditCardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>

                <div className="form-group size-small" style={{ gridColumn: '11 / span 1', gridRow: '3 / span 1' }}>
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>

                <div className="form-group size-small" style={{ gridColumn: '12 / span 1', gridRow: '3 / span 1' }}>
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </>
            )}
          </>
        );

      case 4:
        return (
          <>
            <div className="form-group full-width" style={{ gridColumn: '1 / span 12', gridRow: '1 / span 2' }}>
              <label className="required">
                <FaRegFileAlt /> Work Order Scope*
              </label>
              <textarea
                name="workOrderScope"
                value={formData.workOrderScope}
                onChange={handleChange}
                placeholder="Describe the scope of work, project requirements, and deliverables..."
                rows="6"
                className={errors.workOrderScope ? 'error' : ''}
              />
              {errors.workOrderScope && <span className="error-message">{errors.workOrderScope}</span>}
            </div>

            <div className="form-group full-width" style={{ gridColumn: '1 / span 12', gridRow: '3 / span 2' }}>
              <div className="terms-box">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className={errors.termsAccepted ? 'error-checkbox' : ''}
                  />
                  <label htmlFor="termsAccepted" className="checkbox-label">
                    I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>*
                  </label>
                </div>
                
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    id="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleChange}
                    className={errors.privacyAccepted ? 'error-checkbox' : ''}
                  />
                  <label htmlFor="privacyAccepted" className="checkbox-label">
                    I accept the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>*
                  </label>
                </div>
                
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    name="marketingAccepted"
                    id="marketingAccepted"
                    checked={formData.marketingAccepted}
                    onChange={handleChange}
                  />
                  <label htmlFor="marketingAccepted" className="checkbox-label">
                    I agree to receive marketing communications and updates
                  </label>
                </div>
              </div>
              {errors.termsAccepted && <span className="error-message">{errors.termsAccepted}</span>}
              {errors.privacyAccepted && <span className="error-message">{errors.privacyAccepted}</span>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="client-profile-page">
      <div className="client-header">
        <h1>
          {isEditMode ? 'EDIT PROFILE' : 'AGENT REGISTRATION'}
          {isEditMode && <FaEdit style={{ marginLeft: '10px', fontSize: '24px' }} />}
        </h1>
        <p className="instruction-text">
          {isEditMode 
            ? 'Update your profile information below. Required fields are marked with an asterisk (*).'
            : 'In order to process your registration, we ask you to provide the following information. Please note that all fields marked with an asterisk (*) are required.'}
        </p>
      </div>

      <div className="progress-section">
        <div className="progress-container">
          {steps.map((step) => (
            <button
              key={step.number}
              type="button"
              className={`progress-btn ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              onClick={() => handleStepClick(step.number)}
              disabled={step.number > currentStep}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="client-form-container">
        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-scattered-grid">
            {renderStepContent()}
          </div>
          
          <div className="form-navigation">
            <div className="nav-left">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn-prev"
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <FaArrowLeft /> PREVIOUS
                </button>
              )}
            </div>
            
            <div className="nav-right">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isLoading}
              >
                CANCEL
              </button>
              
              {currentStep < steps.length ? (
                <button 
                  type="button" 
                  className="btn-continue"
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  CONTINUE <FaArrowRight />
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'PROCESSING...' : (isEditMode ? 'UPDATE PROFILE' : 'SUBMIT REGISTRATION')}
                  {!isLoading && <FaCheck />}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;