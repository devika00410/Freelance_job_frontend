import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BasicInfoSection from './BasicInfoSection';
import ProfessionalSection from './ProfessionalSection';
import SkillsSection from './SkillsSection';
import PortfolioSection from './PortfolioSection';
import ExperienceSection from './ExperienceSection';
import ServicesSection from './ServiceSection';
import ReviewSection from './ReviewSection';
import ProgressBar from '../UI/ProgressBar';
import FormNavigation from '../UI/FormNavigation';
import './EditProfile.css';

const EditProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    basicInfo: {
      fullName: '',
      professionalHeadline: '',
      profilePhoto: null,
      coverPhoto: null,
      location: '',
      timezone: '',
      email: '',
      phone: '',
      website: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        behance: ''
      }
    },
    
    // Professional
    professional: {
      bio: '',
      professionalTitle: '',
      yearsOfExperience: '',
      availability: 'available',
      hourlyRate: '',
      responseTime: '24h'
    },
    
    // Skills
    skills: {
      categories: [],
      technicalSkills: [],
      serviceCategories: []
    },
    
    // Portfolio
    portfolio: {
      projects: []
    },
    
    // Experience & Education
    experience: {
      workExperience: [],
      education: [],
      certifications: []
    },
    
    // Services
    services: {
      servicePackages: [],
      pricingModel: 'hourly'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 1, title: 'Basic Info', component: BasicInfoSection },
    { id: 2, title: 'Professional', component: ProfessionalSection },
    { id: 3, title: 'Skills', component: SkillsSection },
    { id: 4, title: 'Portfolio', component: PortfolioSection },
    { id: 5, title: 'Experience', component: ExperienceSection },
    { id: 6, title: 'Services', component: ServicesSection },
    { id: 7, title: 'Review', component: ReviewSection }
  ];

  // Load existing profile data
  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = () => {
    try {
      setIsLoading(true);
      
      // Get profile data from localStorage or navigation state
      let existingProfile;
      
      if (location.state?.existingProfile) {
        existingProfile = location.state.existingProfile;
      } else {
        const storedProfile = localStorage.getItem('freelancerProfile');
        if (storedProfile) {
          existingProfile = JSON.parse(storedProfile);
        }
      }

      if (existingProfile) {
        // Transform backend data to form structure
        const transformedData = transformBackendToFormData(existingProfile);
        setFormData(transformedData);
        console.log('Loaded existing profile:', transformedData);
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform backend data to form structure
  const transformBackendToFormData = (backendData) => {
    return {
      basicInfo: {
        fullName: backendData.profile?.name || '',
        professionalHeadline: backendData.profile?.title || '',
        profilePhoto: backendData.profile?.avatar || null,
        coverPhoto: backendData.profile?.coverImage || null,
        location: backendData.profile?.location || '',
        timezone: '',
        email: localStorage.getItem('userEmail') || '',
        phone: backendData.profile?.phone || '',
        website: backendData.profile?.website || '',
        socialLinks: {
          linkedin: backendData.profile?.linkedin || '',
          github: backendData.profile?.github || '',
          twitter: backendData.profile?.twitter || '',
          behance: backendData.profile?.behance || ''
        }
      },
      professional: {
        bio: backendData.profile?.bio || '',
        professionalTitle: backendData.profile?.title || '',
        yearsOfExperience: backendData.profile?.yearsOfExperience || '',
        availability: backendData.profile?.availability || 'available',
        hourlyRate: backendData.profile?.hourlyRate?.toString() || '',
        responseTime: backendData.profile?.responseTime || '24h'
      },
      skills: {
        categories: [],
        technicalSkills: backendData.skills || [],
        serviceCategories: []
      },
      portfolio: {
        projects: backendData.portfolio?.map(project => ({
          title: project.title,
          description: project.description,
          image: project.image,
          technologies: project.technologies,
          demoLink: project.url,
          codeRepository: '#'
        })) || []
      },
      experience: {
        workExperience: backendData.experience?.map(exp => ({
          company: exp.company,
          position: exp.position,
          duration: exp.duration,
          description: exp.description
        })) || [],
        education: backendData.education?.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          duration: edu.duration
        })) || [],
        certifications: []
      },
      services: {
        servicePackages: backendData.services?.map(service => ({
          title: service.title,
          description: service.description,
          price: service.price,
          deliveryTime: service.deliveryTime
        })) || [],
        pricingModel: 'hourly'
      }
    };
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Transform form data to match backend structure
  const transformFormDataForBackend = (formData) => {
    return {
      profile: {
        name: formData.basicInfo.fullName,
        title: formData.professional.professionalTitle,
        bio: formData.professional.bio,
        location: formData.basicInfo.location,
        education: formData.experience.education?.[0]?.degree || formData.experience.education?.[0]?.institution || '',
        availability: formData.professional.availability,
        hourlyRate: parseFloat(formData.professional.hourlyRate) || 0,
        phone: formData.basicInfo.phone,
        website: formData.basicInfo.website,
        github: formData.basicInfo.socialLinks.github,
        linkedin: formData.basicInfo.socialLinks.linkedin,
        twitter: formData.basicInfo.socialLinks.twitter,
        behance: formData.basicInfo.socialLinks.behance,
        avatar: formData.basicInfo.profilePhoto,
        coverImage: formData.basicInfo.coverPhoto,
        yearsOfExperience: formData.professional.yearsOfExperience,
        responseTime: formData.professional.responseTime
      },
      skills: formData.skills.technicalSkills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || skill
      ),
      portfolio: formData.portfolio.projects.map((project, index) => ({
        title: project.title || `Project ${index + 1}`,
        description: project.description || 'No description available',
        image: project.image || project.projectImage || '/default-portfolio.jpg',
        technologies: project.technologies || project.techStack || [],
        url: project.demoLink || project.url || '#'
      })),
      experience: formData.experience.workExperience.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description
      })),
      education: formData.experience.education.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        duration: edu.duration
      })),
      services: formData.services.servicePackages.map(service => ({
        title: service.title,
        description: service.description,
        price: service.price,
        deliveryTime: service.deliveryTime
      }))
    };
  };

  // Convert image file to data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('/default-avatar.jpg');
        return;
      }
      
      if (typeof file === 'string') {
        // Already a data URL or URL
        resolve(file);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const updateProfile = async () => {
    try {
      setIsSubmitting(true);
      
      // Convert images to data URLs before saving
      const profileDataToSubmit = transformFormDataForBackend(formData);
      
      // Convert profile photo if it's a new file
      try {
        if (formData.basicInfo.profilePhoto && typeof formData.basicInfo.profilePhoto !== 'string') {
          profileDataToSubmit.profile.avatar = await fileToDataURL(formData.basicInfo.profilePhoto);
        }
      } catch (error) {
        console.error('Error converting profile photo:', error);
      }
      
      // Convert cover photo if it's a new file
      try {
        if (formData.basicInfo.coverPhoto && typeof formData.basicInfo.coverPhoto !== 'string') {
          profileDataToSubmit.profile.coverImage = await fileToDataURL(formData.basicInfo.coverPhoto);
        }
      } catch (error) {
        console.error('Error converting cover photo:', error);
      }
      
      // Convert portfolio images
      for (let project of profileDataToSubmit.portfolio) {
        if (project.image && typeof project.image !== 'string') {
          try {
            project.image = await fileToDataURL(project.image);
          } catch (error) {
            console.error('Error converting portfolio image:', error);
          }
        }
      }
      
      console.log('Updating profile data:', profileDataToSubmit);
      
      // Update localStorage
      localStorage.setItem('freelancerProfile', JSON.stringify(profileDataToSubmit));
      
      // Also update user info
      localStorage.setItem('userName', formData.basicInfo.fullName);
      
      console.log('Profile updated successfully:', profileDataToSubmit);
      alert('Profile updated successfully!');
      
      // Navigate back to dashboard
      navigate('/freelancer/dashboard');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  if (isLoading) {
    return (
      <div className="profile-creation-wizard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-creation-wizard">
      <div className="wizard-header">
        <h1>Edit Your Professional Profile</h1>
        <p>Update your information and showcase your latest work</p>
      </div>

      <ProgressBar steps={steps} currentStep={currentStep} />

      <div className="wizard-content">
        <CurrentStepComponent
          data={formData}
          updateData={updateFormData}
          onSubmit={updateProfile}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      </div>

      {/* Only show navigation if not on review step */}
      {currentStep !== steps.length && (
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={updateProfile}
          isLastStep={currentStep === steps.length}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default EditProfile;