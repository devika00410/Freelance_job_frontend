import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar, FaMapMarkerAlt, FaClock, FaCheckCircle,
  FaGlobe, FaLinkedin, FaGithub, FaTwitter, FaBehance,
  FaEnvelope, FaFileDownload, FaShareAlt,
  FaBriefcase, FaGraduationCap, FaAward, FaCode,
  FaPaintBrush, FaChartLine, FaPenFancy, FaVideo,
  FaMobileAlt, FaSearch, FaLanguage, FaCalendar,
  FaCheck, FaUserCheck, FaTrophy, FaPercent,
  FaDollarSign, FaRegHeart, FaRegBookmark, FaUsers, FaDownload,
  FaCrown, FaExternalLinkAlt, FaFolder, FaCertificate,
  FaTools, FaUniversity, FaBook, FaClock as FaClockIcon,
  FaProjectDiagram, FaMedal, FaHeart, FaComment,
  FaPaperPlane, FaEdit, FaTrash, FaUserCircle,
  FaStarHalfAlt, FaRegStar, FaArrowRight
} from 'react-icons/fa';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
  FiMessageSquare, FiDollarSign, FiUsers, FiTrendingUp,
  FiMail, FiGlobe, FiBriefcase, FiUser, FiFolder,
  FiTool, FiBook, FiAward, FiCheckCircle
} from 'react-icons/fi';
import './PublicProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    projectType: '',
    wouldRecommend: true
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  // Dummy reviews data
  const [reviews, setReviews] = useState([
    {
      id: 1,
      clientName: "Sarah Johnson",
      clientRole: "Project Manager at TechCorp",
      rating: 5,
      date: "2024-02-15",
      title: "Exceptional Web Developer!",
      comment: "John delivered our e-commerce website ahead of schedule. His attention to detail and communication skills were outstanding. Will definitely hire again!",
      projectType: "E-commerce Website",
      verified: true
    },
    {
      id: 2,
      clientName: "Michael Chen",
      clientRole: "Startup Founder",
      rating: 5,
      date: "2024-01-28",
      title: "Great React Developer",
      comment: "Built a complex dashboard with multiple integrations. Very professional and responsive. Highly recommended!",
      projectType: "Admin Dashboard",
      verified: true
    },
    {
      id: 3,
      clientName: "Emily Rodriguez",
      clientRole: "Marketing Director",
      rating: 4,
      date: "2023-12-10",
      title: "Reliable and Skilled",
      comment: "Worked on our mobile app project. Good technical skills and met all deadlines. Would work with again.",
      projectType: "Mobile Application",
      verified: true
    },
    {
      id: 4,
      clientName: "David Wilson",
      clientRole: "CEO at DesignStudio",
      rating: 5,
      date: "2023-11-22",
      title: "Outstanding UI/UX Work",
      comment: "Transformed our entire user interface. Users love the new design. Great collaboration throughout.",
      projectType: "UI/UX Redesign",
      verified: true
    }
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let targetId = id;

        if (!targetId) {
          targetId = localStorage.getItem('profileId');
          if (!targetId) {
            setError('No profile ID found');
            setLoading(false);
            return;
          }
        }

        const savedProfile = localStorage.getItem('freelancerProfile');
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setProfileData(transformProfileData(profileData));
        } else {
          setError('Profile not found. Please create a profile first.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const transformProfileData = (data) => {
    const currentYear = new Date().getFullYear();


    let profilePhoto = '/default-avatar.png';

    if (data.basicInfo?.profilePhoto) {
      if (typeof data.basicInfo.profilePhoto === 'string') {
        // Check if it's a valid image string
        if (data.basicInfo.profilePhoto.startsWith('data:image') ||
          data.basicInfo.profilePhoto.startsWith('/') ||
          data.basicInfo.profilePhoto.startsWith('http')) {
          profilePhoto = data.basicInfo.profilePhoto;
        }
      } else if (typeof data.basicInfo.profilePhoto === 'object' && data.basicInfo.profilePhoto.url) {
        // Handle file object with URL
        profilePhoto = data.basicInfo.profilePhoto.url;
      }
    }

    // FIX: Handle languages - ensure it's always an array
    const languages = Array.isArray(data.basicInfo?.languages)
      ? data.basicInfo.languages.map(lang => {
        if (typeof lang === 'object') return { language: lang.language || lang.name || 'Unknown', level: lang.level || 'Fluent' };
        return { language: lang, level: 'Fluent' };
      })
      : [{ language: 'English', level: 'Fluent' }];



    // FIX: Handle skills array - extract names if they are objects
    const skillsArray = data.skillsTools?.skills || [];
    const skills = skillsArray.map(skill => {
      if (typeof skill === 'object') return skill.name || skill.skill || 'Unknown Skill';
      return skill;
    });

    // FIX: Handle certifications - extract names if they are objects
    const certsArray = [
      ...(data.skillsTools?.certifications || []),
      ...(data.educationCertifications?.certifications || [])
    ];

    const certifications = certsArray.map(cert => {
      if (typeof cert === 'object') return cert.name || cert.title || 'Unknown Certification';
      return cert;
    });

    // FIX: Handle tools array
    const toolsArray = data.skillsTools?.toolsTechnologies || [];
    const tools = toolsArray.map(tool => {
      if (typeof tool === 'object') return tool.name || tool.tool || 'Unknown Tool';
      return tool;
    });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      user: {
        name: data.basicInfo?.fullName || 'Anonymous',
        title: data.professionalService?.professionalTitle || 'Freelancer',
        avatar: profilePhoto, // FIX: Use the fixed profile photo
        cover: '/default-cover.jpg',
        location: data.basicInfo?.country || 'Location not specified',
        country: data.basicInfo?.country || '',
        memberSince: currentYear,
        isVerified: data.isVerified || false,
        isPro: data.isProMember || false,
        isAvailable: data.basicInfo?.availability === 'available',
      },

      stats: {
        rating: avgRating,
        totalReviews: reviews.length,
        completedJobs: reviews.length * 2,
        repeatClients: 2,
        successRate: 95,
        responseRate: 98,
        responseTime: '1 hour',
        totalEarnings: data.pricingAvailability?.rate ? data.pricingAvailability.rate * 100 : 0,
        totalHours: 500,
      },

      about: {
        bio: data.professionalOverview?.summary || 'No bio available',
        experience: data.skillsTools?.yearsOfExperience
          ? `${data.skillsTools.yearsOfExperience}+ years`
          : 'Not specified',
        languages: languages,
        education: data.educationCertifications?.highestEducation?.degree
          ? `${data.educationCertifications.highestEducation.degree} at ${data.educationCertifications.highestEducation.institution}`
          : 'Not specified',
        industry: data.professionalService?.industryFocus?.[0] || 'Not specified',
        company: 'Self-employed',
      },

      skills: {
        primary: skills, // FIX: Use processed skills array
        categories: [
          data.professionalService?.primaryService,
          ...(data.professionalService?.secondaryServices || [])
        ].filter(Boolean),
        expertiseLevel: data.skillsTools?.yearsOfExperience > 5 ? 'Expert' : data.skillsTools?.yearsOfExperience > 2 ? 'Intermediate' : 'Beginner',
        tools: tools, // FIX: Use processed tools array
        specializations: data.skillsTools?.specializations || [],
        certifications: certifications, // FIX: Use processed certifications array
      },

      portfolio: {
        featured: data.experiencePortfolio?.portfolioItems || [],
        totalProjects: data.experiencePortfolio?.portfolioItems?.length || 0,
      },

      experience: data.experiencePortfolio?.experiences || [],

      services: {
        hourlyRate: data.pricingAvailability?.rate || 0,
        pricingModel: data.pricingAvailability?.pricingType || 'hourly',
        minBudget: data.pricingAvailability?.rate || 0,
        maxBudget: data.pricingAvailability?.rate ? data.pricingAvailability.rate * 5 : 0,
        availability: {
          type: data.pricingAvailability?.availabilityType || 'full-time',
          hoursPerWeek: data.pricingAvailability?.weeklyHours || 'Not specified',
          preferredProjectSize: data.pricingAvailability?.preferredProjectSize || 'Not specified',
          communicationChannels: data.pricingAvailability?.communicationChannels || []
        }
      },

      education: {
        highestEducation: data.educationCertifications?.highestEducation || {},
        certifications: certifications,
        courses: data.educationCertifications?.courses || [],
      },

      reviews: {
        average: avgRating,
        total: reviews.length,
        list: reviews,
      },

      contact: {
        email: data.basicInfo?.email || 'Not provided',
        phone: data.basicInfo?.phone || 'Not provided',
        website: '',
        social: {}
      },

      _id: data._id || data.profileId,
      userId: data.userId || localStorage.getItem('userId'),
      createdAt: data.publishedAt,
      updatedAt: data.lastUpdated,
      completionScore: data.completionScore || 0,
    };
  };

  // Service icons mapping
  const serviceIcons = {
    'Web Development': <FaCode />,
    'Mobile App Development': <FaMobileAlt />,
    'UI/UX Design': <FaPaintBrush />,
    'SEO': <FaSearch />,
    'Digital Marketing': <FaChartLine />,
    'Content Writing': <FaPenFancy />,
    'Graphic Design': <FaPaintBrush />,
    'Video Editing': <FaVideo />,
    'Software Development': <FaCode />,
    'App Development': <FaMobileAlt />,
    'Frontend Development': <FaCode />,
    'Backend Development': <FaCode />,
    'Full Stack Development': <FaCode />,
  };

  // Handle contact action
  const handleContact = () => {
    if (profileData?.contact?.email !== 'Not provided') {
      window.location.href = `mailto:${profileData.contact.email}?subject=Project Inquiry&body=Hello ${profileData.user.name}, I would like to discuss a project with you.`;
    } else {
      alert('Contact email not available');
    }
  };

  // Handle download CV
  const handleDownloadCV = () => {
    // This would typically fetch CV from backend
    alert('CV download feature would be implemented with backend integration');
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newReview = {
        id: reviews.length + 1,
        clientName: "You",
        clientRole: "Client",
        rating: reviewData.rating,
        date: new Date().toISOString().split('T')[0],
        title: reviewData.title,
        comment: reviewData.comment,
        projectType: reviewData.projectType,
        verified: false
      };

      setReviews([newReview, ...reviews]);

      // Reset form
      setReviewData({
        rating: 5,
        title: '',
        comment: '',
        projectType: '',
        wouldRecommend: true
      });

      setShowReviewForm(false);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle review input change
  const handleReviewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[...Array(5)].map((_, index) => (
          <span key={index} className="star-icon">
            {index < Math.floor(rating) ? (
              <FaStar className="filled" />
            ) : index < rating ? (
              <FaStarHalfAlt className="filled" />
            ) : (
              <FaRegStar className="empty" />
            )}
          </span>
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <div className="public-profile-container">
        <div className="container">
          <div className="profile-error-state">
            <h2>Profile Not Found</h2>
            <p>{error || "This profile doesn't exist or has been removed."}</p>
            <button className="btn-primary-action" onClick={() => navigate('/')}>
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-container">
      {/* ===== HEADER SECTION ===== */}
      <div className="profile-header-wrapper">
        <div className="header-cover">
          <div className="cover-overlay-gradient"></div>
        </div>

        <div className="header-content-wrapper">
          <div className="profile-header-main">
            <div className="profile-avatar-section">
              <div className="avatar-container-large">
                <img
                  src={profileData.user.avatar}
                  alt={profileData.user.name}
                  className="profile-avatar-img"
                  onError={(e) => {
                    console.log('Avatar failed to load, using default');
                    e.target.src = '/default-avatar.png';
                    e.target.onerror = null; 
                  }}
                />
                <div className="avatar-badges">
                  {profileData.user.isVerified && (
                    <div className="verified-badge-pro">
                      <FaCheckCircle /> Verified Pro
                    </div>
                  )}
                  {profileData.user.isPro && (
                    <div className="top-rated-badge">
                      <FaCrown /> Top Rated
                    </div>
                  )}
                </div>
              </div>

              <div className="header-action-buttons">
                <button className="btn-hire-now" onClick={handleContact}>
                  <FiMessageSquare /> Hire Me
                </button>
                <button className="btn-send-message" onClick={handleContact}>
                  <FiMail /> Message
                </button>
                <button className="btn-save-profile">
                  <FaRegBookmark />
                </button>
              </div>
            </div>

            <div className="profile-header-info">
              <div className="profile-title-section">
                <h1 className="profile-name">{profileData.user.name}</h1>
                <h2 className="profile-tagline">{profileData.user.title}</h2>

                <div className="profile-meta-info">
                  <span className="meta-item">
                    <FaMapMarkerAlt /> {profileData.user.location}
                  </span>
                  <span className="meta-item">
                    <FaStar /> {profileData.stats.rating > 0 ? profileData.stats.rating.toFixed(1) : 'N/A'} ({profileData.stats.totalReviews || 0} reviews)
                  </span>
                  <span className="meta-item">
                    <FaCheckCircle /> {profileData.stats.successRate || 0}% Job Success
                  </span>
                </div>
              </div>

              <div className="profile-stats-grid">
                <div className="stat-box">
                  <div className="stat-value">{profileData.stats.completedJobs || 0}</div>
                  <div className="stat-label">Jobs Completed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{profileData.stats.repeatClients || 0}</div>
                  <div className="stat-label">Repeat Clients</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{profileData.about.experience}</div>
                  <div className="stat-label">Experience</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">${profileData.services.hourlyRate}/hr</div>
                  <div className="stat-label">Hourly Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="profile-main-wrapper">
        <div className="profile-content-grid">
          {/* LEFT SIDEBAR */}
          <div className="profile-sidebar">
            {/* About Me Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <FiUser /> About Me
              </h3>
              <div className="about-preview">
                <p>{profileData.about.bio.substring(0, 120)}...</p>
                <button className="btn-read-more">Read more</button>
              </div>

              <div className="sidebar-details">
                <div className="detail-row">
                  <FaBriefcase />
                  <div>
                    <div className="detail-label">Experience</div>
                    <div className="detail-value">{profileData.about.experience}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <FaGraduationCap />
                  <div>
                    <div className="detail-label">Education</div>
                    <div className="detail-value">{profileData.about.education}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <FaUsers />
                  <div>
                    <div className="detail-label">Clients</div>
                    <div className="detail-value">{profileData.stats.repeatClients || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <FaLanguage /> Languages
              </h3>
              <div className="languages-list">
                {profileData.about.languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <span className="language-name">{lang.language || lang}</span>
                    <span className="language-level">{lang.level || 'Fluent'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Skills Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Top Skills</h3>
              <div className="skills-container">
                {profileData.skills.primary.slice(0, 6).map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                  </span>
                ))}
              </div>
              {profileData.skills.primary.length > 6 && (
                <button className="btn-view-more-skills">
                  +{profileData.skills.primary.length - 6} more
                </button>
              )}
            </div>

            {/* Tools & Technologies Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <FaTools /> Tools & Technologies
              </h3>
              <div className="tools-container">
                {profileData.skills.tools.slice(0, 8).map((tool, index) => (
                  <span key={index} className="tool-tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications Section */}
            {profileData.skills.certifications.length > 0 && (
              <div className="sidebar-section">
                <h3 className="sidebar-title">
                  <FaCertificate /> Certifications
                </h3>
                <div className="certifications-list">
                  {profileData.skills.primary.slice(0, 6).map((skill, index) => (
                    <span key={index} className="skill-badge">
                      {typeof skill === 'string' ? skill : skill.name || 'Skill'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info Section */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Contact Info</h3>
              <div className="contact-info">
                {profileData.contact.email && (
                  <a href={`mailto:${profileData.contact.email}`} className="contact-link">
                    <FiMail /> {profileData.contact.email}
                  </a>
                )}
                {profileData.contact.phone && (
                  <div className="contact-item">
                    <FaEnvelope /> {profileData.contact.phone}
                  </div>
                )}
                <button className="btn-contact-me" onClick={handleContact}>
                  <FiMessageSquare /> Contact Me
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="profile-main-content">
            <div className="content-tabs">
              <div className="tab-nav">
                <button
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
                  onClick={() => setActiveTab('portfolio')}
                >
                  Portfolio ({profileData.portfolio.totalProjects})
                </button>
                <button
                  className={`tab-button ${activeTab === 'experience' ? 'active' : ''}`}
                  onClick={() => setActiveTab('experience')}
                >
                  Experience
                </button>
                <button
                  className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  Services & Pricing
                </button>
                <button
                  className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
                  onClick={() => setActiveTab('education')}
                >
                  Education
                </button>
                <button
                  className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews ({profileData.reviews.total})
                </button>
              </div>

              <div className="tab-panels">
                {/* OVERVIEW TAB */}
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="tab-panel active">
                    <div className="overview-container">

                      {/* Overview Header */}
                      <div className="overview-header">
                        <h3>Professional Overview</h3>
                        <p>A detailed introduction to my professional expertise and services</p>
                      </div>

                      {/* Bio with Read More */}
                      <div className="bio-section">
                        <div className="bio-preview">
                          <div className={`bio-preview-content ${showFullBio ? 'expanded' : ''}`}>
                            {profileData.about.bio.split('\n').map((paragraph, idx) => (
                              <p key={idx}>{paragraph}</p>
                            ))}
                          </div>
                          <button
                            className={`btn-read-more-toggle ${showFullBio ? 'expanded' : ''}`}
                            onClick={() => setShowFullBio(!showFullBio)}
                          >
                            {showFullBio ? 'Show Less' : 'Read More'}
                            <span className="toggle-icon">
                              {showFullBio ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div className="key-highlights">
                        <h4>
                          <FaStar /> Key Highlights
                        </h4>
                        <div className="highlights-grid">
                          <div className="highlight-card">
                            <div className="highlight-icon">
                              <FaMedal />
                            </div>
                            <h5>Top Rated</h5>
                            <p>{profileData.stats.successRate}% job success rate</p>
                          </div>
                          <div className="highlight-card">
                            <div className="highlight-icon">
                              <FaClock />
                            </div>
                            <h5>Fast Response</h5>
                            <p>Responds within {profileData.stats.responseTime}</p>
                          </div>
                          <div className="highlight-card">
                            <div className="highlight-icon">
                              <FaUsers />
                            </div>
                            <h5>Client Focused</h5>
                            <p>{profileData.stats.repeatClients} repeat clients</p>
                          </div>
                          <div className="highlight-card">
                            <div className="highlight-icon">
                              <FaCheckCircle />
                            </div>
                            <h5>Quality Work</h5>
                            <p>{profileData.stats.completedJobs} projects completed</p>
                          </div>
                        </div>
                      </div>

                      {/* Services Showcase - Horizontal */}
                      <div className="services-showcase">
                        <h4>
                          <FaCode /> Services I Offer
                        </h4>
                        <div className="services-showcase-grid">
                          {profileData.skills.categories.map((service, index) => (
                            <div key={index} className="service-showcase-card">
                              <div className="service-showcase-icon">
                                {serviceIcons[service] || <FaCode />}
                              </div>
                              <h5>{service}</h5>
                              <p>Expert solutions tailored to your needs</p>
                              <div className="service-price-tag">
                                ${profileData.services.hourlyRate}/hr
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expertise Summary */}
                      <div className="expertise-summary">
                        <h4>
                          <FaChartLine /> Expertise Summary
                        </h4>
                        <div className="expertise-stats">
                          <div className="stat-card">
                            <div className="stat-icon">
                              <FaBriefcase />
                            </div>
                            <span className="stat-number">{profileData.about.experience}</span>
                            <span className="stat-label">Experience</span>
                            <p className="stat-desc">Professional industry experience</p>
                          </div>
                          <div className="stat-card">
                            <div className="stat-icon">
                              <FaTrophy />
                            </div>
                            <span className="stat-number">{profileData.stats.successRate}%</span>
                            <span className="stat-label">Success Rate</span>
                            <p className="stat-desc">Project completion success</p>
                          </div>
                          <div className="stat-card">
                            <div className="stat-icon">
                              <FaClock />
                            </div>
                            <span className="stat-number">{profileData.stats.responseRate}%</span>
                            <span className="stat-label">Response Rate</span>
                            <p className="stat-desc">Client communication response</p>
                          </div>
                          <div className="stat-card">
                            <div className="stat-icon">
                              <FaUserCheck />
                            </div>
                            <span className="stat-number">{profileData.stats.repeatClients}</span>
                            <span className="stat-label">Repeat Clients</span>
                            <p className="stat-desc">Satisfied returning clients</p>
                          </div>
                        </div>
                      </div>

                      {/* Why Choose Me */}
                      <div className="why-choose-me">
                        <h4>Why Choose Me?</h4>
                        <div className="why-points">
                          <div className="why-point">
                            <div className="why-point-header">
                              <div className="why-point-icon">
                                <FaCheckCircle />
                              </div>
                              <h5>Quality Guarantee</h5>
                            </div>
                            <p>I deliver high-quality work with attention to detail and thorough testing.</p>
                          </div>
                          <div className="why-point">
                            <div className="why-point-header">
                              <div className="why-point-icon">
                                <FaClock />
                              </div>
                              <h5>On-Time Delivery</h5>
                            </div>
                            <p>I respect deadlines and ensure timely delivery of all projects.</p>
                          </div>
                          <div className="why-point">
                            <div className="why-point-header">
                              <div className="why-point-icon">
                                <FiMessageSquare />
                              </div>
                              <h5>Clear Communication</h5>
                            </div>
                            <p>Regular updates and transparent communication throughout the project.</p>
                          </div>
                          <div className="why-point">
                            <div className="why-point-header">
                              <div className="why-point-icon">
                                <FaUsers />
                              </div>
                              <h5>Client Collaboration</h5>
                            </div>
                            <p>I work closely with clients to ensure their vision is perfectly realized.</p>
                          </div>
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="overview-cta">
                        <h4>Ready to Start Your Project?</h4>
                        <p>Let's discuss how I can help bring your ideas to life with professional expertise and dedicated support.</p>
                        <div className="overview-cta-buttons">
                          <button className="btn-cta-primary-large" onClick={handleContact}>
                            <FiMessageSquare /> Start a Conversation
                          </button>
                          <button className="btn-cta-outline-large" onClick={() => setActiveTab('portfolio')}>
                            <FaExternalLinkAlt /> View My Portfolio
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* PORTFOLIO TAB */}
                {activeTab === 'portfolio' && (
                  <div className="tab-panel">
                    <div className="panel-header">
                      <h3>Portfolio ({profileData.portfolio.totalProjects})</h3>
                      <button className="btn-view-all">
                        View All <FaExternalLinkAlt />
                      </button>
                    </div>

                    {profileData.portfolio.featured.length > 0 ? (
                      <div className="portfolio-grid">
                        {profileData.portfolio.featured.map((project, index) => {
                          const projectTitle = project.projectTitle || project.title || `Project ${index + 1}`;
                          const projectDesc = project.projectDescription || project.description || 'No description available';
                          const projectImage = project.projectImage || project.image || '/default-project.jpg';
                          const technologies = project.technologies || project.tools || project.skills || [];

                          return (
                            <div key={index} className="project-card">
                              <div className="project-image">
                                <img
                                  src={projectImage}
                                  alt={projectTitle}
                                  onError={(e) => {
                                    e.target.src = '/default-project.jpg';
                                  }}
                                />
                                <div className="project-overlay">
                                  <button className="btn-view-project">View Details</button>
                                </div>
                              </div>
                              <div className="project-info">
                                <div className="project-header">
                                  <h4>{projectTitle}</h4>
                                  {project.year && (
                                    <span className="project-year">{project.year}</span>
                                  )}
                                </div>
                                <p>{projectDesc.substring(0, 100)}...</p>
                                {project.link && (
                                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                                    View Live Project <FaExternalLinkAlt />
                                  </a>
                                )}
                                <div className="project-tags">
                                  {technologies.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="tech-tag">{tech}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <FiFolder size={48} />
                        <h4>No portfolio projects yet</h4>
                        <p>This freelancer hasn't added any projects to their portfolio.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* EXPERIENCE TAB */}
                {activeTab === 'experience' && (
                  <div className="tab-panel">
                    <div className="panel-header">
                      <h3>Work Experience</h3>
                    </div>

                    {profileData.experience.length > 0 ? (
                      <div className="experience-timeline">
                        {profileData.experience.map((exp, index) => (
                          <div key={index} className="experience-item">
                            <div className="exp-period">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </div>
                            <div className="exp-details">
                              <div className="exp-header">
                                <h4>{exp.jobTitle || exp.position}</h4>
                                <div className="exp-company">{exp.company}</div>
                              </div>
                              <div className="exp-type">{exp.employmentType}</div>
                              <p className="exp-description">{exp.description}</p>
                              {exp.responsibilities && (
                                <div className="exp-responsibilities">
                                  <strong>Responsibilities:</strong>
                                  <ul>
                                    {exp.responsibilities.slice(0, 3).map((resp, i) => (
                                      <li key={i}>{resp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {exp.achievements && (
                                <div className="exp-achievements">
                                  <strong>Achievements:</strong> {exp.achievements}
                                </div>
                              )}
                              {exp.skills && (
                                <div className="exp-skills">
                                  <strong>Skills Used:</strong>
                                  <div className="skills-tags">
                                    {exp.skills.slice(0, 5).map((skill, i) => (
                                      <span key={i} className="skill-mini-tag">{skill}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <FaBriefcase size={48} />
                        <h4>No work experience listed</h4>
                        <p>This freelancer hasn't added their work experience yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SERVICES TAB */}
                {activeTab === 'services' && (
                  <div className="tab-panel">
                    {/* Pricing Overview */}
                    <div className="pricing-overview">
                      <div className="hourly-rate-card">
                        <div className="rate-header">
                          <h3>Hourly Rate</h3>
                          <div className="rate-display">
                            ${profileData.services.hourlyRate}<span>/hour</span>
                          </div>
                        </div>
                        <div className="rate-features">
                          <div className="feature-item">
                            <FaCheck /> Minimum budget: ${profileData.services.minBudget}
                          </div>
                          <div className="feature-item">
                            <FaCheck /> Maximum budget: ${profileData.services.maxBudget}
                          </div>
                          <div className="feature-item">
                            <FaCheck /> Preferred pricing: {profileData.services.pricingModel}
                          </div>
                          <div className="feature-item">
                            <FaCheck /> Availability: {profileData.services.availability.type}
                          </div>
                        </div>
                        <button className="btn-hire-cta" onClick={handleContact}>
                          Hire {profileData.user.name.split(' ')[0]}
                        </button>
                      </div>
                    </div>

                    {/* Service Packages */}
                    <div className="packages-section">
                      <h4>Service Packages</h4>
                      <div className="packages-grid">
                        {[1, 2, 3].map((num) => (
                          <div key={num} className="package-card">
                            <div className="package-header">
                              <h5>Package {num}</h5>
                              <span className="package-tier">
                                {num === 1 ? 'Basic' : num === 2 ? 'Standard' : 'Premium'}
                              </span>
                            </div>
                            <div className="package-price">
                              ${profileData.services.hourlyRate * 20 * num}
                            </div>
                            <ul className="package-features">
                              <li><FaCheck /> {num * 2} revisions</li>
                              <li><FaCheck /> {num * 5} day delivery</li>
                              <li><FaCheck /> Source files included</li>
                              <li><FaCheck /> {num === 3 ? '24/7' : 'Business hours'} support</li>
                            </ul>
                            <button className="btn-select-package" onClick={handleContact}>
                              Select Package
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Availability Details */}
                    <div className="availability-details">
                      <h4>Availability Details</h4>
                      <div className="availability-cards">
                        <div className="availability-card">
                          <FaClockIcon />
                          <h5>Working Hours</h5>
                          <p>{profileData.services.availability.hoursPerWeek} hours/week</p>
                        </div>
                        <div className="availability-card">
                          <FaProjectDiagram />
                          <h5>Project Size</h5>
                          <p>{profileData.services.availability.preferredProjectSize}</p>
                        </div>
                        <div className="availability-card">
                          <FiMessageSquare />
                          <h5>Communication</h5>
                          <p>{profileData.services.availability.communicationChannels.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EDUCATION TAB */}
                {activeTab === 'education' && (
                  <div className="tab-panel">
                    <div className="panel-header">
                      <h3>Education & Certifications</h3>
                    </div>

                    {/* Highest Education */}
                    {profileData.education.highestEducation.degree ? (
                      <div className="education-card">
                        <div className="education-header">
                          <FaUniversity className="edu-icon" />
                          <div>
                            <h4>Highest Education</h4>
                            <div className="education-details">
                              <strong>{profileData.education.highestEducation.degree}</strong>
                              <p>{profileData.education.highestEducation.institution}</p>
                              {profileData.education.highestEducation.year && (
                                <span className="education-year">Graduated: {profileData.education.highestEducation.year}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="no-data">No education information provided.</p>
                    )}

                    {/* Certifications */}
                    {profileData.education.certifications.length > 0 && (
                      <div className="certifications-section">
                        <h4>Certifications</h4>
                        <div className="certifications-list-full">
                          {profileData.education.certifications.map((cert, index) => (
                            <div key={index} className="certification-card">
                              <FaCertificate />
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Courses */}
                    {profileData.education.courses.length > 0 && (
                      <div className="courses-section">
                        <h4>Relevant Courses</h4>
                        <div className="courses-list">
                          {profileData.education.courses.map((course, index) => (
                            <div key={index} className="course-item">
                              <FaBook />
                              <span>{course}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div className="tab-panel">
                    {/* Reviews Summary */}
                    <div className="reviews-summary">
                      <div className="summary-left">
                        <div className="average-rating">
                          <span className="rating-number">{profileData.reviews.average.toFixed(1)}</span>
                          <div className="stars-large">
                            {renderStars(profileData.reviews.average)}
                          </div>
                          <p className="total-reviews">{profileData.reviews.total} reviews</p>
                        </div>
                      </div>
                      <div className="summary-right">
                        <div className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = profileData.reviews.total > 0
                              ? (count / profileData.reviews.total) * 100
                              : 0;
                            return (
                              <div key={rating} className="rating-bar">
                                <span className="bar-label">{rating} star</span>
                                <div className="bar-container">
                                  <div
                                    className="bar-fill"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="bar-count">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Add Review Button */}
                    <div className="add-review-section">
                      <button
                        className="btn-add-review"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <FaEdit /> Write a Review
                      </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="review-form-container">
                        <h4>Write a Review</h4>
                        <form onSubmit={handleReviewSubmit}>
                          <div className="form-group">
                            <label>Rating *</label>
                            <div className="star-rating-input">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  className={`star-btn ${reviewData.rating >= rating ? 'active' : ''}`}
                                  onClick={() => setReviewData(prev => ({ ...prev, rating }))}
                                >
                                  <FaStar />
                                </button>
                              ))}
                              <span className="rating-text">
                                {reviewData.rating === 5 ? 'Excellent' :
                                  reviewData.rating === 4 ? 'Good' :
                                    reviewData.rating === 3 ? 'Average' :
                                      reviewData.rating === 2 ? 'Poor' : 'Very Poor'}
                              </span>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="reviewTitle">Review Title *</label>
                            <input
                              type="text"
                              id="reviewTitle"
                              name="title"
                              value={reviewData.title}
                              onChange={handleReviewChange}
                              placeholder="Summarize your experience"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="projectType">Project Type</label>
                            <input
                              type="text"
                              id="projectType"
                              name="projectType"
                              value={reviewData.projectType}
                              onChange={handleReviewChange}
                              placeholder="e.g., Web Development, Design, etc."
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="reviewComment">Your Review *</label>
                            <textarea
                              id="reviewComment"
                              name="comment"
                              value={reviewData.comment}
                              onChange={handleReviewChange}
                              rows="4"
                              placeholder="Share details of your experience..."
                              required
                            />
                          </div>

                          <div className="form-group checkbox-group">
                            <label>
                              <input
                                type="checkbox"
                                name="wouldRecommend"
                                checked={reviewData.wouldRecommend}
                                onChange={handleReviewChange}
                              />
                              <span>I would recommend this freelancer to others</span>
                            </label>
                          </div>

                          <div className="form-actions">
                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={() => setShowReviewForm(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-submit-review"
                              disabled={isSubmittingReview}
                            >
                              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="reviews-list">
                      <h4>Client Reviews</h4>
                      {reviews.length > 0 ? (
                        <div className="reviews-container">
                          {reviews.map((review) => (
                            <div key={review.id} className="review-card">
                              <div className="review-header">
                                <div className="reviewer-info">
                                  <FaUserCircle className="reviewer-avatar" />
                                  <div>
                                    <h5>{review.clientName}</h5>
                                    <p className="reviewer-role">{review.clientRole}</p>
                                  </div>
                                </div>
                                <div className="review-meta">
                                  <div className="review-rating">
                                    {renderStars(review.rating)}
                                  </div>
                                  <span className="review-date">{review.date}</span>
                                  {review.verified && (
                                    <span className="review-verified">
                                      <FiCheckCircle /> Verified Review
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h5 className="review-title">{review.title}</h5>
                              <p className="review-comment">{review.comment}</p>

                              {review.projectType && (
                                <div className="review-project-info">
                                  <span className="project-type">Project: {review.projectType}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FaComment size={48} />
                          <h4>No reviews yet</h4>
                          <p>Be the first to review this freelancer!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER CTA ===== */}
      <div className="profile-footer-cta">
        <div className="cta-content">
          <div className="cta-text">
            <h3>Ready to work with {profileData.user.name.split(' ')[0]}?</h3>
            <p>Send a message to discuss your project requirements and get started today.</p>
          </div>
          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={handleContact}>
              <FiMessageSquare /> Send Message
            </button>
            <button className="btn-cta-secondary" onClick={handleDownloadCV}>
              <FaDownload /> Download CV
            </button>
            <button className="btn-cta-outline" onClick={() => setActiveTab('reviews')}>
              <FaStar /> View Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;