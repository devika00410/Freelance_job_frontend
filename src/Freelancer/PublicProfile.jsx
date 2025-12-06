import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiRefreshCw, FiAlertCircle, FiUser, FiAward, FiBriefcase, FiStar, FiMail, FiMapPin, FiCalendar, FiClock, FiGlobe } from 'react-icons/fi';
import ProfileHeader from './PublicProfilePage/ProfileHeader';
import ProfileAbout from './PublicProfilePage/ProfileAbout';
import ProfileSkills from './PublicProfilePage/ProfileSkills';
import ProfilePortfolio from './PublicProfilePage/ProfilePortfolio';
import ProfileReviews from './PublicProfilePage/ProfileReviews';
import ProfileContact from './PublicProfilePage/ProfileContact';
import './PublicProfile.css';


const PublicProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentSection, setCurrentSection] = useState('about');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Check if we have a freelancer ID from URL or state
        const freelancerId = id || location.state?.freelancerId;

        if (freelancerId) {
          // FETCH OTHER FREELANCER'S PROFILE
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:3000/api/freelancer/${freelancerId}/profile`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            const transformedProfile = transformBackendData(response.data.profile);
            setProfileData(transformedProfile);
          } else {
            throw new Error('Profile not found');
          }
        } else {
          // SHOW LOGGED-IN USER'S PROFILE (current behavior)
          const localProfile = localStorage.getItem('freelancerProfile');
          if (localProfile) {
            const parsedData = JSON.parse(localProfile);
            const transformedProfile = transformBackendData(parsedData);
            setProfileData(transformedProfile);
          } else {
            setErrorMessage('No profile found. Please create a profile first.');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMessage('Profile not found or not accessible.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id, location.state?.freelancerId]);

  // Enhanced data transformation with proper image handling
  const transformBackendData = (backendData) => {
    console.log('Transforming backend data:', backendData);

    // Handle profile picture
    const getProfilePicture = () => {
      if (backendData.profile?.avatar) {
        return backendData.profile.avatar;
      }
      // Check if it's a data URL or needs conversion
      if (backendData.profile?.profilePhoto && typeof backendData.profile.profilePhoto === 'string') {
        return backendData.profile.profilePhoto;
      }
      return '/images/default-avatar.jpg';
    };

    // Handle cover photo
    const getCoverPhoto = () => {
      if (backendData.profile?.coverImage) {
        return backendData.profile.coverImage;
      }
      if (backendData.profile?.coverPhoto && typeof backendData.profile.coverPhoto === 'string') {
        return backendData.profile.coverPhoto;
      }
      return '/images/default-cover.jpg';
    };

    // Handle portfolio images
    const transformPortfolio = (portfolio) => {
      if (!portfolio || !Array.isArray(portfolio)) return [];

      return portfolio.map((item, index) => {
        // Handle different portfolio data structures
        const projectImage = item.projectImage || item.image || '/images/placeholder-project.jpg';
        const projectTitle = item.projectTitle || item.title || `Project ${index + 1}`;
        const projectDescription = item.projectDescription || item.description || 'No description available';
        const techStack = item.techStack || item.technologies || [];
        const demoLink = item.demoLink || item.url || '#';
        const codeRepository = item.codeRepository || item.repository || '#';

        console.log(`Portfolio item ${index}:`, {
          projectImage,
          projectTitle,
          hasImage: !!projectImage
        });

        return {
          projectId: item.projectId || item._id || `project-${index}`,
          projectTitle,
          projectImage,
          projectDescription,
          techStack,
          demoLink,
          codeRepository
        };
      });
    };

    const profilePicture = getProfilePicture();
    const coverPhoto = getCoverPhoto();
    const workPortfolio = transformPortfolio(backendData.workPortfolio || backendData.portfolio);

    console.log('Transformed images:', {
      profilePicture,
      coverPhoto,
      portfolioCount: workPortfolio.length,
      portfolioImages: workPortfolio.map(p => p.projectImage)
    });

    return {
      userInfo: {
        _id: backendData._id || backendData.userId || 'local-user',
        fullName: backendData.profile?.name || backendData.fullName || 'No Name Provided',
        professionalTitle: backendData.profile?.title || backendData.professionalTitle || 'Freelancer',
        profilePicture: profilePicture,
        coverPhoto: coverPhoto,
        biography: backendData.profile?.bio || backendData.biography || 'No bio available.',
        currentLocation: backendData.profile?.location || backendData.location || 'Location not specified',
        memberSince: backendData.createdAt || new Date().toISOString(),
        averageRating: backendData.freelancerStats?.avgRating || backendData.rating || 4.5,
        totalProjects: backendData.freelancerStats?.completedProjects || backendData.completedProjects || workPortfolio.length,
        successPercentage: backendData.freelancerStats?.successRate || backendData.successRate || 95,
        responseTime: backendData.profile?.responseTime || 'Within 24 hours',
        spokenLanguages: backendData.languages || ['English'],
        educationBackground: backendData.profile?.education || backendData.education?.[0]?.degree || 'Education not specified',
        workAvailability: mapAvailabilityStatus(backendData.profile?.availability || backendData.availability),
        ratePerHour: backendData.profile?.hourlyRate || backendData.hourlyRate || 0,
        contactPhone: backendData.profile?.phone || backendData.phone || '',
        yearsOfExperience: backendData.profile?.yearsOfExperience || backendData.experience || '',
        email: backendData.profile?.email || backendData.email || ''
      },
      technicalSkills: (backendData.skills || []).map(skill => ({
        skillName: typeof skill === 'string' ? skill : skill.name,
        proficiencyLevel: skill.proficiencyLevel || 'intermediate',
        skillCategory: skill.category || 'technical'
      })),
      workPortfolio: workPortfolio,
      workExperience: (backendData.experience || []).map((exp, index) => ({
        id: exp._id || index,
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description
      })),
      education: (backendData.education || []).map((edu, index) => ({
        id: edu._id || index,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        duration: edu.duration
      })),
      services: (backendData.services || []).map((service, index) => ({
        id: service._id || index,
        title: service.title,
        description: service.description,
        price: service.price,
        deliveryTime: service.deliveryTime
      })),
      clientFeedback: backendData.reviews || backendData.clientFeedback || [
        {
          clientName: 'Sarah Wilson',
          rating: 5,
          comment: 'Excellent work! Delivered ahead of schedule with great communication.',
          project: 'Website Redesign',
          date: '2024-01-15'
        }
      ],
      contactDetails: {
        emailAddress: backendData.email || backendData.contactEmail || backendData.profile?.email || '',
        personalWebsite: backendData.profile?.website || backendData.website || '',
        socialProfiles: {
          github: backendData.profile?.github || backendData.github || '',
          linkedin: backendData.profile?.linkedin || backendData.linkedin || '',
          twitter: backendData.profile?.twitter || backendData.twitter || '',
          behance: backendData.profile?.behance || backendData.behance || ''
        }
      },
      verificationStatus: {
        isEmailVerified: backendData.verification?.emailVerified || backendData.emailVerified || true,
        isPhoneVerified: backendData.verification?.phoneVerified || backendData.phoneVerified || false,
        isIdentityVerified: backendData.verification?.status === 'verified' || backendData.identityVerified || false
      }
    };
  };

  const mapAvailabilityStatus = (availability) => {
    const availabilityMapping = {
      'available': 'Available for new projects',
      'full-time': 'Available for full-time projects',
      'part-time': 'Available for part-time projects',
      'not-available': 'Not available for new projects',
      'busy': 'Currently busy with projects'
    };
    return availabilityMapping[availability] || 'Available for projects';
  };

  // Navigation sections with icons
  const profileSections = [
    { id: 'about', label: 'About', component: ProfileAbout, icon: FiUser },
    { id: 'skills', label: 'Skills', component: ProfileSkills, icon: FiAward },
    { id: 'portfolio', label: 'Portfolio', component: ProfilePortfolio, icon: FiBriefcase },
    { id: 'experience', label: 'Experience', component: ProfileAbout, icon: FiBriefcase },
    { id: 'services', label: 'Services', component: ProfileAbout, icon: FiAward },
    { id: 'reviews', label: 'Reviews', component: ProfileReviews, icon: FiStar },
    { id: 'contact', label: 'Contact', component: ProfileContact, icon: FiMail }
  ];

  // Function to refresh profile data
  const refreshProfile = () => {
    const localProfile = localStorage.getItem('freelancerProfile');
    if (localProfile) {
      const parsedData = JSON.parse(localProfile);
      const transformedProfile = transformBackendData(parsedData);
      setProfileData(transformedProfile);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loader-wrapper">
        <div className="profile-loader-spinner"></div>
        <p className="profile-loader-text">Loading Professional Profile...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="profile-error-wrapper">
        <div className="profile-error-icon">
          <FiAlertCircle />
        </div>
        <h3 className="profile-error-heading">Profile Loading Failed</h3>
        <p className="profile-error-desc">{errorMessage}</p>
        <button
          className="profile-retry-btn"
          onClick={() => navigate('/freelancer/profile/create')}
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-not-found-wrapper">
        <div className="profile-error-icon">
          <FiUser />
        </div>
        <h3 className="profile-not-found-heading">Profile Not Found</h3>
        <p className="profile-not-found-desc">
          The profile you're looking for doesn't exist or may have been removed.
        </p>
        <button
          className="profile-retry-btn"
          onClick={() => navigate('/')}
        >
          Go Home
        </button>
      </div>
    );
  }

  const ActiveSectionComponent = profileSections.find(section => section.id === currentSection)?.component;

  return (
    <div className="public-profile-container">
      {/* Refresh Button */}
      <div className="profile-refresh-container">
        <button
          className="profile-refresh-btn"
          onClick={refreshProfile}
          title="Refresh profile data"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Profile Header */}
      <ProfileHeader profile={profileData} />

      {/* Navigation Tabs */}
      <nav className="profile-nav-container">
        {profileSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              className={`profile-nav-btn ${currentSection === section.id ? 'profile-nav-btn-active' : ''}`}
              onClick={() => setCurrentSection(section.id)}
            >
              <IconComponent size={18} />
              {section.label}
            </button>
          );
        })}
      </nav>

      {/* Active Section Content */}
      <div className="profile-content-area">
        {ActiveSectionComponent && (
          <ActiveSectionComponent
            profile={profileData}
            currentSection={currentSection}
          />
        )}
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <strong>Debug Info:</strong><br />
          Portfolio Items: {profileData.workPortfolio?.length || 0}<br />
          Has Images: {profileData.workPortfolio?.filter(p => p.projectImage).length || 0}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;