import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BasicInfoSection from './ProfileCreation/BasicInfoSection';
import ProfessionalSection from './ProfileCreation/ProfessionalSection';
import SkillsSection from './ProfileCreation/SkillsSection';
import PortfolioSection from './ProfileCreation/PortfolioSection';
import ExperienceSection from './ProfileCreation/ExperienceSection';
import ServicesSection from './ProfileCreation/ServiceSection';
import ReviewSection from './ProfileCreation/ReviewSection';
import ProgressBar from './UI/ProgressBar';
import FormNavigation from './UI/FormNavigation';
import './MainProfile.css';

const MainProfile = () => {
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
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Basic Info', component: BasicInfoSection },
    { id: 2, title: 'Professional', component: ProfessionalSection },
    { id: 3, title: 'Skills', component: SkillsSection },
    { id: 4, title: 'Portfolio', component: PortfolioSection },
    { id: 5, title: 'Experience', component: ExperienceSection },
    { id: 6, title: 'Services', component: ServicesSection },
    { id: 7, title: 'Review', component: ReviewSection }
  ];

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

  // Enhanced image to data URL conversion
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('/images/default-avatar.jpg');
        return;
      }
      
      if (typeof file === 'string') {
        // Already a data URL or URL
        resolve(file);
        return;
      }
      
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      } else {
        resolve('/images/default-avatar.jpg');
      }
    });
  };

  // Transform form data to match backend structure with proper portfolio format
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
      // Updated portfolio structure for PublicProfile
      workPortfolio: formData.portfolio.projects.map((project, index) => ({
        projectId: `project-${Date.now()}-${index}`,
        projectTitle: project.title || `Project ${index + 1}`,
        projectDescription: project.description || 'No description available',
        projectImage: project.image || '/images/placeholder-project.jpg',
        techStack: project.technologies || [],
        demoLink: project.demoLink || project.url || '#',
        codeRepository: project.codeRepository || '#'
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

  const submitProfile = async () => {
    try {
      setIsSubmitting(true);
      
      console.log('Original form data:', formData);
      
      // Convert all images to data URLs before saving
      const profileDataToSubmit = transformFormDataForBackend(formData);
      
      // Convert profile photo
      try {
        profileDataToSubmit.profile.avatar = await fileToDataURL(formData.basicInfo.profilePhoto);
        console.log('Profile photo converted');
      } catch (error) {
        console.error('Error converting profile photo:', error);
        profileDataToSubmit.profile.avatar = '/images/default-avatar.jpg';
      }
      
      // Convert cover photo
      try {
        profileDataToSubmit.profile.coverImage = await fileToDataURL(formData.basicInfo.coverPhoto);
        console.log('Cover photo converted');
      } catch (error) {
        console.error('Error converting cover photo:', error);
        profileDataToSubmit.profile.coverImage = '/images/default-cover.jpg';
      }
      
      // Convert portfolio images
      console.log('Converting portfolio images...');
      for (let i = 0; i < profileDataToSubmit.workPortfolio.length; i++) {
        const project = profileDataToSubmit.workPortfolio[i];
        try {
          if (project.projectImage) {
            project.projectImage = await fileToDataURL(project.projectImage);
            console.log(`Portfolio image ${i} converted`);
          }
        } catch (error) {
          console.error(`Error converting portfolio image ${i}:`, error);
          project.projectImage = '/images/placeholder-project.jpg';
        }
      }
      
      console.log('Final profile data to save:', profileDataToSubmit);
      
      // Save to localStorage
      localStorage.setItem('freelancerProfile', JSON.stringify(profileDataToSubmit));
      localStorage.setItem('profileSubmitted', 'true');
      
      // Also save user info for dashboard
      localStorage.setItem('userName', formData.basicInfo.fullName);
      localStorage.setItem('userEmail', formData.basicInfo.email);
      localStorage.setItem('userRole', 'Freelancer');
      
      console.log('Profile saved successfully to localStorage');
      
      alert('Profile created successfully! Redirecting to dashboard...');
      
      // Navigate to dashboard
      navigate('/freelancer/dashboard');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to submit profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug function to check current form data
  const debugFormData = () => {
    console.log('=== CURRENT FORM DATA ===');
    console.log('Full Form Data:', formData);
    console.log('Transformed for backend:', transformFormDataForBackend(formData));
    console.log('Portfolio projects:', formData.portfolio.projects);
    console.log('=========================');
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="profile-creation-wizard">
      {/* Debug Button - Remove in production */}
      <button 
        onClick={debugFormData}
        style={{
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          zIndex: 1000, 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '5px 10px', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Debug Data
      </button>

      <div className="wizard-header">
        <h1>Create Your Professional Profile</h1>
        <p>Showcase your skills and attract clients</p>
      </div>

      <ProgressBar steps={steps} currentStep={currentStep} />

      <div className="wizard-content">
        <CurrentStepComponent
          data={formData}
          updateData={updateFormData}
          onSubmit={submitProfile}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Only show navigation if not on review step */}
      {currentStep !== steps.length && (
        <FormNavigation
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={submitProfile}
          isLastStep={currentStep === steps.length}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default MainProfile;