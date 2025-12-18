// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import BasicInfoSection from './ProfileCreation/BasicInfoSection';
// import ProfessionalServiceSection from './ProfileCreation/ServiceSection';
// import SkillsToolsSection from './ProfileCreation/SkillsSection';
// import ProfessionalOverviewSection from './ProfileCreation/ProfessionalSection';
// import ExperiencePortfolioSection from './ProfileCreation/PortfolioSection';
// import PricingAvailabilitySection from './ProfileCreation/PricingAvailabilitySection';
// import EducationCertificationsSection from './ProfileCreation/EducationCertificationsSection';
// import ReviewPublishSection from './ProfileCreation/ReviewSection';
// import ProgressBar from './UI/ProgressBar';
// import FormNavigation from './UI/FormNavigation';
// import './MainProfile.css';

// const MainProfile = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [completionScore, setCompletionScore] = useState(0);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [editSection, setEditSection] = useState(null);
//   const navigate = useNavigate();

//   // Initialize formData with empty structure
//   const [formData, setFormData] = useState({
//     // STEP 1: Basic Information (20 Points)
//     basicInfo: {
//       profilePhoto: null,
//       fullName: '',
//       displayName: '',
//       country: '',
//       timezone: '',
//       email: '',
//       phone: '',
//       languages: [],
//       availability: 'available',
//       headline: '',
//     },

//     // STEP 2: Professional Title & Service Selection (15 Points)
//     professionalService: {
//       professionalTitle: '',
//       primaryService: '',
//       secondaryServices: [],
//       industryFocus: [],
//     },

//     // STEP 3: Skills, Tools & Expertise (15 Points)
//     skillsTools: {
//       skills: [],
//       yearsOfExperience: '',
//       toolsTechnologies: [],
//       specializations: [],
//       certifications: [],
//     },

//     // STEP 4: About / Professional Overview (15 Points)
//     professionalOverview: {
//       summary: '',
//       videoIntroduction: '',
//       communicationStyle: '',
//     },

//     // STEP 5: Experience & Portfolio (MANDATORY) (20 Points)
//     experiencePortfolio: {
//       experiences: [],
//       portfolioItems: [],
//     },

//     // STEP 6: Pricing & Availability (10 Points)
//     pricingAvailability: {
//       pricingType: 'hourly',
//       rate: '',
//       availabilityType: 'full-time',
//       weeklyHours: '',
//       preferredProjectSize: '',
//       communicationChannels: [],
//     },

//     // STEP 7: Education & Certifications (5 Points)
//     educationCertifications: {
//       highestEducation: {
//         degree: '',
//         institution: '',
//         year: '',
//       },
//       certifications: [],
//       courses: [],
//     },
//   });

//   const steps = [
//     { id: 1, title: 'Basic Info', points: 20, section: 'basicInfo' },
//     { id: 2, title: 'Service & Title', points: 15, section: 'professionalService' },
//     { id: 3, title: 'Skills & Tools', points: 15, section: 'skillsTools' },
//     { id: 4, title: 'Professional Overview', points: 15, section: 'professionalOverview' },
//     { id: 5, title: 'Experience & Portfolio', points: 20, section: 'experiencePortfolio' },
//     { id: 6, title: 'Pricing & Availability', points: 10, section: 'pricingAvailability' },
//     { id: 7, title: 'Education', points: 5, section: 'educationCertifications' },
//     { id: 8, title: 'Review & Publish', points: 0, section: 'review' },
//   ];

//   // Allowed services (strict list from master prompt)
//   const allowedServices = [
//     'Web Development',
//     'Mobile App Development',
//     'UI / UX Design',
//     'SEO',
//     'Digital Marketing',
//     'Content Writing',
//     'Graphic Designing',
//     'Video Editing'
//   ];

//   // Load existing profile data on component mount
//   useEffect(() => {
//   const loadExistingProfile = () => {
//     try {
//       const savedProfile = localStorage.getItem('freelancerProfile');
//       if (savedProfile) {
//         const profileData = JSON.parse(savedProfile);
//         console.log('Loading existing profile data:', profileData);
        
//         const profileId = localStorage.getItem('profileId');
//         const profileSubmitted = localStorage.getItem('profileSubmitted');
        
//         if (profileId && profileSubmitted === 'true') {
//           setIsEditing(true);
//           setEditMode(true);
          
//           // Update formData with existing profile data
//           setFormData(prev => {
//             const updated = { ...prev };
            
//             // Update each section if it exists in saved data
//             if (profileData.basicInfo) {
//               updated.basicInfo = { ...prev.basicInfo, ...profileData.basicInfo };
//             }
            
//             if (profileData.professionalService) {
//               updated.professionalService = { 
//                 ...prev.professionalService, 
//                 ...profileData.professionalService 
//               };
//             }
            
//             if (profileData.skillsTools) {
//               updated.skillsTools = { 
//                 ...prev.skillsTools, 
//                 ...profileData.skillsTools 
//               };
//             }
            
//             if (profileData.professionalOverview) {
//               updated.professionalOverview = { 
//                 ...prev.professionalOverview, 
//                 ...profileData.professionalOverview 
//               };
//             } else {
//               // Ensure professionalOverview exists with default values
//               updated.professionalOverview = {
//                 summary: '',
//                 videoIntroduction: '',
//                 communicationStyle: ''
//               };
//             }
            
//             if (profileData.experiencePortfolio) {
//               updated.experiencePortfolio = { 
//                 ...prev.experiencePortfolio, 
//                 ...profileData.experiencePortfolio 
//               };
//             }
            
//             if (profileData.pricingAvailability) {
//               updated.pricingAvailability = { 
//                 ...prev.pricingAvailability, 
//                 ...profileData.pricingAvailability 
//               };
//             }
            
//             if (profileData.educationCertifications) {
//               updated.educationCertifications = { 
//                 ...prev.educationCertifications, 
//                 ...profileData.educationCertifications 
//               };
              
//               // Ensure highestEducation exists
//               if (!updated.educationCertifications.highestEducation) {
//                 updated.educationCertifications.highestEducation = {
//                   degree: '',
//                   institution: '',
//                   year: ''
//                 };
//               }
//             }
            
//             return updated;
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error loading existing profile:', error);
//     }
//   };

//   loadExistingProfile();
// }, []);

//   // Calculate completion percentage
//   const calculateCompletion = () => {
//     let totalScore = 0;
//     let maxScore = 100;

//     // STEP 1: Basic Information (20 Points)
//     let step1Score = 0;
//     const basicInfo = formData.basicInfo;

//     // Mandatory fields (15 pts)
//     const mandatoryBasicFields = [
//       basicInfo.profilePhoto,
//       basicInfo.fullName,
//       basicInfo.country,
//       basicInfo.timezone,
//       basicInfo.email,
//       basicInfo.phone
//     ];

//     const completedMandatory = mandatoryBasicFields.filter(field => {
//       if (Array.isArray(field)) return field.length > 0;
//       return field && field.toString().trim().length > 0;
//     }).length;

//     step1Score += (completedMandatory / 6) * 15;

//     // Recommended fields (5 pts)
//     const recommendedBasicFields = [
//       basicInfo.languages.length > 0,
//       basicInfo.availability,
//       basicInfo.headline
//     ];

//     const completedRecommended = recommendedBasicFields.filter(Boolean).length;
//     step1Score += (completedRecommended / 3) * 5;

//     totalScore += step1Score;

//     // STEP 2: Professional Title & Service Selection (15 Points)
//     let step2Score = 0;
//     const professionalService = formData.professionalService;

//     // Mandatory fields (12 pts)
//     if (professionalService.professionalTitle?.trim()) step2Score += 6;
//     if (professionalService.primaryService) step2Score += 6;

//     // Recommended fields (3 pts)
//     if (professionalService.secondaryServices.length > 0) step2Score += 1.5;
//     if (professionalService.industryFocus.length > 0) step2Score += 1.5;

//     totalScore += step2Score;

//     // STEP 3: Skills, Tools & Expertise (15 Points)
//     let step3Score = 0;
//     const skillsTools = formData.skillsTools;

//     // Mandatory fields (10 pts)
//     if (skillsTools.skills.length >= 5) step3Score += 5;
//     if (skillsTools.yearsOfExperience) step3Score += 5;

//     // Recommended fields (5 pts)
//     const recommendedSkillsFields = [
//       skillsTools.toolsTechnologies.length > 0,
//       skillsTools.specializations.length > 0,
//       skillsTools.certifications.length > 0
//     ];

//     const completedSkillsRecommended = recommendedSkillsFields.filter(Boolean).length;
//     step3Score += (completedSkillsRecommended / 3) * 5;

//     totalScore += step3Score;

//     // STEP 4: Professional Overview (15 Points)
//     let step4Score = 0;
//     const professionalOverview = formData.professionalOverview;

//     // Mandatory fields (12 pts) - min 250 words
//     const wordCount = professionalOverview.summary.trim().split(/\s+/).length;
//     if (wordCount >= 250) step4Score += 12;

//     // Recommended fields (3 pts)
//     if (professionalOverview.videoIntroduction) step4Score += 1.5;
//     if (professionalOverview.communicationStyle) step4Score += 1.5;

//     totalScore += step4Score;

//     // STEP 5: Experience & Portfolio (20 Points)
//     let step5Score = 0;
//     const experiencePortfolio = formData.experiencePortfolio;

//     // Experience (8 pts)
//     if (experiencePortfolio.experiences.length >= 1) step5Score += 8;

//     // Portfolio (12 pts)
//     if (experiencePortfolio.portfolioItems.length >= 2) step5Score += 12;

//     totalScore += step5Score;

//     // STEP 6: Pricing & Availability (10 Points)
//     let step6Score = 0;
//     const pricingAvailability = formData.pricingAvailability;

//     // Mandatory fields (8 pts)
//     if (pricingAvailability.pricingType) step6Score += 2.5;
//     if (pricingAvailability.rate) step6Score += 2.5;
//     if (pricingAvailability.availabilityType) step6Score += 3;

//     // Recommended fields (2 pts)
//     if (pricingAvailability.weeklyHours) step6Score += 0.5;
//     if (pricingAvailability.preferredProjectSize) step6Score += 0.5;
//     if (pricingAvailability.communicationChannels.length > 0) step6Score += 1;

//     totalScore += step6Score;

//     // STEP 7: Education & Certifications (5 Points)
//     let step7Score = 0;
//     const educationCertifications = formData.educationCertifications;

//     // Mandatory fields (3 pts)
//     if (educationCertifications.highestEducation.degree) step7Score += 3;

//     // Recommended fields (2 pts)
//     if (educationCertifications.certifications.length > 0) step7Score += 1;
//     if (educationCertifications.courses.length > 0) step7Score += 1;

//     totalScore += step7Score;

//     const percentage = Math.round((totalScore / maxScore) * 100);
//     return percentage;
//   };

//   useEffect(() => {
//     const newScore = calculateCompletion();
//     setCompletionScore(newScore);
//   }, [formData]);

//   const updateFormData = (section, data) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: { ...prev[section], ...data }
//     }));
    
//     // If in edit mode and a specific section is being edited
//     if (editMode && editSection === section) {
//       // Show save button for this section
//       setEditSection(section);
//     }
//   };

//   // Handle editing a specific section
//   const handleEditSection = (section) => {
//     setEditSection(section);
//     setEditMode(true);
//   };

//   // Save specific section changes
//   const handleSaveSection = (section) => {
//     // Update the profile in localStorage
//     const savedProfile = localStorage.getItem('freelancerProfile');
//     if (savedProfile) {
//       const profileData = JSON.parse(savedProfile);
      
//       // Update only the changed section
//       const updatedProfile = {
//         ...profileData,
//         [section]: formData[section],
//         lastUpdated: new Date().toISOString(),
//         completionScore: calculateCompletion()
//       };
      
//       localStorage.setItem('freelancerProfile', JSON.stringify(updatedProfile));
      
//       // Show success message
//       setSaveSuccess(true);
//       setEditSection(null);
      
//       // Hide success message after 3 seconds
//       setTimeout(() => {
//         setSaveSuccess(false);
//       }, 3000);
//     }
//   };

//   const nextStep = () => {
//     if (currentStep < steps.length) {
//       setCurrentStep(currentStep + 1);
//       window.scrollTo(0, 0);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//       window.scrollTo(0, 0);
//     }
//   };

//   // Check if profile can be published
//   const canPublishProfile = () => {
//     const percentage = calculateCompletion();

//     // Strict publish rules from master prompt
//     const mandatoryChecks = [
//       // Basic info verified
//       formData.basicInfo.profilePhoto,
//       formData.basicInfo.fullName?.trim(),
//       formData.basicInfo.country,
//       formData.basicInfo.timezone,
//       formData.basicInfo.email?.trim(),
//       formData.basicInfo.phone?.trim(),

//       // Professional title & service selected
//       formData.professionalService.professionalTitle?.trim(),
//       formData.professionalService.primaryService,

//       // About section ≥ 250 words
//       formData.professionalOverview.summary.trim().split(/\s+/).length >= 250,

//       // Portfolio added (mandatory)
//       formData.experiencePortfolio.portfolioItems.length >= 2,

//       // Pricing filled
//       formData.pricingAvailability.pricingType,
//       formData.pricingAvailability.rate,
//     ];

//     const allMandatoryMet = mandatoryChecks.every(check => Boolean(check));
//     const meetsMinCompleteness = percentage >= 60;

//     return allMandatoryMet && meetsMinCompleteness;
//   };

//   const compressImage = (base64String) => {
//     if (!base64String) {
//       return '/default-avatar.png';
//     }
    
//     // If it's already a URL or path, return as is
//     if (typeof base64String === 'string' && 
//         (base64String.startsWith('/') || 
//          base64String.startsWith('http') || 
//          base64String.startsWith('data:image'))) {
//       return base64String;
//     }
    
//     // If it's an object with URL property (from file upload)
//     if (typeof base64String === 'object' && base64String.url) {
//       return base64String.url;
//     }
    
//     return '/default-avatar.png';
//   };

//   // Save or Update Profile
//   const saveOrUpdateProfile = async () => {
//     try {
//       setIsSubmitting(true);

//       if (!canPublishProfile() && !isEditing) {
//         alert('Cannot publish profile. Please complete all mandatory fields.');
//         setIsSubmitting(false);
//         return;
//       }

//       // Check if editing existing profile or creating new
//       let profileId;
//       if (isEditing) {
//         profileId = localStorage.getItem('profileId');
//       } else {
//         profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       }
      
//       const profileData = {
//         ...formData,
//         _id: profileId,
//         userId: localStorage.getItem('userId'),
//         completionScore: calculateCompletion(),
//         publishedAt: isEditing ? localStorage.getItem('profilePublishedAt') : new Date().toISOString(),
//         isVerified: isEditing ? JSON.parse(localStorage.getItem('freelancerProfile')).isVerified : false,
//         isNewFreelancer: isEditing ? false : true,
//         lastUpdated: new Date().toISOString(),
//       };

//       const compressedProfileData = {
//         ...profileData,
//         basicInfo: {
//           ...profileData.basicInfo,
//           profilePhoto: compressImage(formData.basicInfo.profilePhoto)
//         }
//       };

//       // Save to localStorage
//       localStorage.setItem('freelancerProfile', JSON.stringify(compressedProfileData));
//       localStorage.setItem('profileId', profileId);
      
//       if (!isEditing) {
//         localStorage.setItem('profileSubmitted', 'true');
//         localStorage.setItem('profilePublishedAt', new Date().toISOString());
//       }
      
//       localStorage.setItem('userName', formData.basicInfo.fullName);
//       localStorage.setItem('userEmail', formData.basicInfo.email);
//       localStorage.setItem('userRole', 'Freelancer');

//       // Determine visibility level
//       let visibilityLevel = 'hidden';
//       const score = calculateCompletion();

//       if (score < 50) visibilityLevel = 'hidden';
//       else if (score >= 50 && score < 70) visibilityLevel = 'basic';
//       else if (score >= 70 && score < 85) visibilityLevel = 'good';
//       else if (score >= 85 && score < 100) visibilityLevel = 'strong';
//       else if (score === 100) visibilityLevel = 'excellent';

//       localStorage.setItem('profileVisibility', visibilityLevel);

//       // Create/update public URL for the profile
//       const publicUrl = `/profile/${profileId}`;
//       localStorage.setItem('profilePublicUrl', publicUrl);

//       // Show success message
//       if (isEditing) {
//         alert(`Profile updated successfully!\nCompletion: ${score}%\nVisibility: ${visibilityLevel}`);
//         setSaveSuccess(true);
//         setIsEditing(true);
//       } else {
//         alert(`Profile published successfully!\nYour profile is now live at: ${publicUrl}\nCompletion: ${score}%\nVisibility: ${visibilityLevel}`);
        
//         // Offer to view the profile
//         const viewProfile = window.confirm('Do you want to view your public profile now?');
//         if (viewProfile) {
//           navigate(publicUrl);
//         } else {
//           navigate('/freelancer/dashboard');
//         }
//       }

//     } catch (error) {
//       console.error('Error saving profile:', error);
//       alert('Failed to save profile. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Get current step component with edit/save controls
//   const getCurrentStepComponent = () => {
//     const currentStepData = steps[currentStep - 1];
//     const currentSection = currentStepData?.section;
    
//     const baseComponent = (() => {
//       switch (currentStep) {
//         case 1:
//           return <BasicInfoSection data={formData} updateData={updateFormData} />;
//         case 2:
//           return <ProfessionalServiceSection data={formData} updateData={updateFormData} allowedServices={allowedServices} />;
//         case 3:
//           return <SkillsToolsSection data={formData} updateData={updateFormData} />;
//         case 4:
//           return <ProfessionalOverviewSection data={formData} updateData={updateFormData} />;
//         case 5:
//           return <ExperiencePortfolioSection data={formData} updateData={updateFormData} allowedServices={allowedServices} />;
//         case 6:
//           return <PricingAvailabilitySection data={formData} updateData={updateFormData} />;
//         case 7:
//           return <EducationCertificationsSection data={formData} updateData={updateFormData} />;
//         case 8:
//           return <ReviewPublishSection
//             data={formData}
//             completionScore={completionScore}
//             onSubmit={saveOrUpdateProfile}
//             canPublish={canPublishProfile()}
//             isSubmitting={isSubmitting}
//             isEditing={isEditing}
//           />;
//         default:
//           return <BasicInfoSection data={formData} updateData={updateFormData} />;
//       }
//     })();

//     // Add edit/save controls for existing profiles
//     if (isEditing && currentStep < 8 && currentSection) {
//       return (
//         <div className="section-with-edit-controls">
//           <div className="section-header-controls">
//             <h2 className="section-title">{currentStepData.title}</h2>
//             <div className="section-action-buttons">
//               {editSection === currentSection ? (
//                 <>
//                   <button 
//                     className="btn-save-section"
//                     onClick={() => handleSaveSection(currentSection)}
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? 'Saving...' : 'Save Changes'}
//                   </button>
//                   <button 
//                     className="btn-cancel-edit"
//                     onClick={() => setEditSection(null)}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button 
//                   className="btn-edit-section"
//                   onClick={() => handleEditSection(currentSection)}
//                 >
//                   Edit
//                 </button>
//               )}
//             </div>
//           </div>
//           {baseComponent}
//           {saveSuccess && editSection === currentSection && (
//             <div className="save-success-message">
//               ✓ Changes saved successfully!
//             </div>
//           )}
//         </div>
//       );
//     }

//     return baseComponent;
//   };

//   return (
//     <div className="profile-creation-wizard">
//       {/* Header with Completion Score */}
//       <div className="wizard-header">
//         <div className="header-top">
//           <h1>
//             {isEditing ? 'Edit Your Profile' : 'Create Your Professional Profile'}
//           </h1>
//           <div className="completion-badge">
//             <span className="completion-label">Profile Completion</span>
//             <span className="completion-percentage">{completionScore}%</span>
//           </div>
//         </div>
//         <p className="header-subtitle">
//           {isEditing 
//             ? 'Update your profile information to keep it current and attractive to clients'
//             : 'Complete your profile to increase visibility and attract more clients'}
//         </p>

//         {/* Visibility Indicator */}
//         <div className="visibility-indicator">
//           <div className="visibility-label">Current Visibility:</div>
//           <div className={`visibility-level visibility-${completionScore < 50 ? 'hidden' :
//             completionScore < 70 ? 'basic' :
//               completionScore < 85 ? 'good' :
//                 completionScore < 100 ? 'strong' : 'excellent'}`}>
//             {completionScore < 50 ? 'Hidden' :
//               completionScore < 70 ? 'Basic' :
//                 completionScore < 85 ? 'Good' :
//                   completionScore < 100 ? 'Strong' : 'Excellent'}
//           </div>
//           <div className="visibility-help">
//             {completionScore < 60 ?
//               'Complete mandatory fields to become searchable' :
//               'Complete recommended fields to boost visibility'}
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <ProgressBar
//         steps={steps}
//         currentStep={currentStep}
//         completionScore={completionScore}
//       />

//       {/* Main Content */}
//       <div className="wizard-content">
//         {getCurrentStepComponent()}
//       </div>

//       {/* Navigation - Show Previous/Next for all steps */}
//       {currentStep <= steps.length && (
//         <div className="wizard-navigation">
//           <div className="nav-buttons">
//             {currentStep > 1 && (
//               <button 
//                 className="btn-prev-step"
//                 onClick={prevStep}
//               >
//                 ← Previous
//               </button>
//             )}
            
//             <div className="nav-right">
//               {currentStep < steps.length ? (
//                 <button 
//                   className="btn-next-step"
//                   onClick={nextStep}
//                 >
//                   Next →
//                 </button>
//               ) : (
//                 <button 
//                   className={`btn-submit-profile ${!canPublishProfile() ? 'disabled' : ''}`}
//                   onClick={saveOrUpdateProfile}
//                   disabled={!canPublishProfile() || isSubmitting}
//                 >
//                   {isSubmitting 
//                     ? (isEditing ? 'Updating...' : 'Publishing...') 
//                     : (isEditing ? 'Update Profile' : 'Publish Profile')}
//                 </button>
//               )}
//             </div>
//           </div>
          
//           {saveSuccess && !editSection && (
//             <div className="global-success-message">
//               ✓ Profile updated successfully!
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainProfile;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicInfoSection from './ProfileCreation/BasicInfoSection';
import ProfessionalServiceSection from './ProfileCreation/ServiceSection';
import SkillsToolsSection from './ProfileCreation/SkillsSection';
import ProfessionalOverviewSection from './ProfileCreation/ProfessionalSection';
import ExperiencePortfolioSection from './ProfileCreation/PortfolioSection';
import PricingAvailabilitySection from './ProfileCreation/PricingAvailabilitySection';
import EducationCertificationsSection from './ProfileCreation/EducationCertificationsSection';
import ReviewPublishSection from './ProfileCreation/ReviewSection';
import ProgressBar from './UI/ProgressBar';
import FormNavigation from './UI/FormNavigation';
import './MainProfile.css';

const MainProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completionScore, setCompletionScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true); // NEW: Loading state
  const navigate = useNavigate();

  // Define initial empty structure
  const initialFormData = {
    basicInfo: {
      profilePhoto: null,
      fullName: '',
      displayName: '',
      country: '',
      timezone: '',
      email: '',
      phone: '',
      languages: [],
      availability: 'available',
      headline: '',
    },
    professionalService: {
      professionalTitle: '',
      primaryService: '',
      secondaryServices: [],
      industryFocus: [],
    },
    skillsTools: {
      skills: [],
      yearsOfExperience: '',
      toolsTechnologies: [],
      specializations: [],
      certifications: [],
    },
    professionalOverview: {
      summary: '',
      videoIntroduction: '',
      communicationStyle: '',
    },
    experiencePortfolio: {
      experiences: [],
      portfolioItems: [],
    },
    pricingAvailability: {
      pricingType: 'hourly',
      rate: '',
      availabilityType: 'full-time',
      weeklyHours: '',
      preferredProjectSize: '',
      communicationChannels: [],
    },
    educationCertifications: {
      highestEducation: {
        degree: '',
        institution: '',
        year: '',
      },
      certifications: [],
      courses: [],
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  const steps = [
    { id: 1, title: 'Basic Info', points: 20, section: 'basicInfo' },
    { id: 2, title: 'Service & Title', points: 15, section: 'professionalService' },
    { id: 3, title: 'Skills & Tools', points: 15, section: 'skillsTools' },
    { id: 4, title: 'Professional Overview', points: 15, section: 'professionalOverview' },
    { id: 5, title: 'Experience & Portfolio', points: 20, section: 'experiencePortfolio' },
    { id: 6, title: 'Pricing & Availability', points: 10, section: 'pricingAvailability' },
    { id: 7, title: 'Education', points: 5, section: 'educationCertifications' },
    { id: 8, title: 'Review & Publish', points: 0, section: 'review' },
  ];

  const allowedServices = [
    'Web Development',
    'Mobile App Development',
    'UI / UX Design',
    'SEO',
    'Digital Marketing',
    'Content Writing',
    'Graphic Designing',
    'Video Editing'
  ];

  // FIXED: Better data loading function
  const loadProfileData = () => {
    try {
      const savedProfile = localStorage.getItem('freelancerProfile');
      const profileId = localStorage.getItem('profileId');
      const profileSubmitted = localStorage.getItem('profileSubmitted');
      
      if (savedProfile && profileId && profileSubmitted === 'true') {
        const profileData = JSON.parse(savedProfile);
        console.log('Loading existing profile data:', profileData);
        
        setIsEditing(true);
        setEditMode(true);
        
        // Deep merge the saved data with initial structure
        const mergedData = deepMergeFormData(initialFormData, profileData);
        setFormData(mergedData);
        
        // Calculate initial completion score
        const initialScore = calculateCompletion(mergedData);
        setCompletionScore(initialScore);
      } else {
        console.log('No existing profile found, starting fresh');
        setIsEditing(false);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsEditing(false);
      setEditMode(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Helper function to deep merge form data
  const deepMergeFormData = (initial, saved) => {
    const result = { ...initial };
    
    // Merge each section
    Object.keys(result).forEach(section => {
      if (saved[section]) {
        // For nested objects like highestEducation
        if (section === 'educationCertifications' && saved[section].highestEducation) {
          result[section] = {
            ...result[section],
            ...saved[section],
            highestEducation: {
              ...result[section].highestEducation,
              ...saved[section].highestEducation
            }
          };
        } else {
          // For other sections
          result[section] = {
            ...result[section],
            ...saved[section]
          };
        }
      }
    });
    
    return result;
  };

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Calculate completion percentage
  const calculateCompletion = (data = formData) => {
    let totalScore = 0;
    let maxScore = 100;

    // STEP 1: Basic Information (20 Points)
    let step1Score = 0;
    const basicInfo = data.basicInfo;

    // Mandatory fields (15 pts)
    const mandatoryBasicFields = [
      basicInfo.profilePhoto,
      basicInfo.fullName,
      basicInfo.country,
      basicInfo.timezone,
      basicInfo.email,
      basicInfo.phone
    ];

    const completedMandatory = mandatoryBasicFields.filter(field => {
      if (Array.isArray(field)) return field.length > 0;
      return field && field.toString().trim().length > 0;
    }).length;

    step1Score += (completedMandatory / 6) * 15;

    // Recommended fields (5 pts)
    const recommendedBasicFields = [
      basicInfo.languages.length > 0,
      basicInfo.availability,
      basicInfo.headline
    ];

    const completedRecommended = recommendedBasicFields.filter(Boolean).length;
    step1Score += (completedRecommended / 3) * 5;

    totalScore += step1Score;

    // STEP 2: Professional Title & Service Selection (15 Points)
    let step2Score = 0;
    const professionalService = data.professionalService;

    // Mandatory fields (12 pts)
    if (professionalService.professionalTitle?.trim()) step2Score += 6;
    if (professionalService.primaryService) step2Score += 6;

    // Recommended fields (3 pts)
    if (professionalService.secondaryServices.length > 0) step2Score += 1.5;
    if (professionalService.industryFocus.length > 0) step2Score += 1.5;

    totalScore += step2Score;

    // STEP 3: Skills, Tools & Expertise (15 Points)
    let step3Score = 0;
    const skillsTools = data.skillsTools;

    // Mandatory fields (10 pts)
    if (skillsTools.skills.length >= 5) step3Score += 5;
    if (skillsTools.yearsOfExperience) step3Score += 5;

    // Recommended fields (5 pts)
    const recommendedSkillsFields = [
      skillsTools.toolsTechnologies.length > 0,
      skillsTools.specializations.length > 0,
      skillsTools.certifications.length > 0
    ];

    const completedSkillsRecommended = recommendedSkillsFields.filter(Boolean).length;
    step3Score += (completedSkillsRecommended / 3) * 5;

    totalScore += step3Score;

    // STEP 4: Professional Overview (15 Points)
    let step4Score = 0;
    const professionalOverview = data.professionalOverview;

    // Mandatory fields (12 pts) - min 250 words
    const wordCount = professionalOverview.summary.trim().split(/\s+/).length;
    if (wordCount >= 250) step4Score += 12;

    // Recommended fields (3 pts)
    if (professionalOverview.videoIntroduction) step4Score += 1.5;
    if (professionalOverview.communicationStyle) step4Score += 1.5;

    totalScore += step4Score;

    // STEP 5: Experience & Portfolio (20 Points)
    let step5Score = 0;
    const experiencePortfolio = data.experiencePortfolio;

    // Experience (8 pts)
    if (experiencePortfolio.experiences.length >= 1) step5Score += 8;

    // Portfolio (12 pts)
    if (experiencePortfolio.portfolioItems.length >= 2) step5Score += 12;

    totalScore += step5Score;

    // STEP 6: Pricing & Availability (10 Points)
    let step6Score = 0;
    const pricingAvailability = data.pricingAvailability;

    // Mandatory fields (8 pts)
    if (pricingAvailability.pricingType) step6Score += 2.5;
    if (pricingAvailability.rate) step6Score += 2.5;
    if (pricingAvailability.availabilityType) step6Score += 3;

    // Recommended fields (2 pts)
    if (pricingAvailability.weeklyHours) step6Score += 0.5;
    if (pricingAvailability.preferredProjectSize) step6Score += 0.5;
    if (pricingAvailability.communicationChannels.length > 0) step6Score += 1;

    totalScore += step6Score;

    // STEP 7: Education & Certifications (5 Points)
    let step7Score = 0;
    const educationCertifications = data.educationCertifications;

    // Mandatory fields (3 pts)
    if (educationCertifications.highestEducation.degree) step7Score += 3;

    // Recommended fields (2 pts)
    if (educationCertifications.certifications.length > 0) step7Score += 1;
    if (educationCertifications.courses.length > 0) step7Score += 1;

    totalScore += step7Score;

    const percentage = Math.round((totalScore / maxScore) * 100);
    return percentage;
  };

  // Update completion score when formData changes
  useEffect(() => {
    if (!loadingProfile) {
      const newScore = calculateCompletion();
      setCompletionScore(newScore);
    }
  }, [formData, loadingProfile]);

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    
    if (editMode && editSection === section) {
      setEditSection(section);
    }
  };

  const handleEditSection = (section) => {
    setEditSection(section);
    setEditMode(true);
  };

  const handleSaveSection = (section) => {
    const savedProfile = localStorage.getItem('freelancerProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      
      const updatedProfile = {
        ...profileData,
        [section]: formData[section],
        lastUpdated: new Date().toISOString(),
        completionScore: calculateCompletion()
      };
      
      localStorage.setItem('freelancerProfile', JSON.stringify(updatedProfile));
      
      setSaveSuccess(true);
      setEditSection(null);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const canPublishProfile = () => {
    const percentage = calculateCompletion();

    const mandatoryChecks = [
      formData.basicInfo.profilePhoto,
      formData.basicInfo.fullName?.trim(),
      formData.basicInfo.country,
      formData.basicInfo.timezone,
      formData.basicInfo.email?.trim(),
      formData.basicInfo.phone?.trim(),
      formData.professionalService.professionalTitle?.trim(),
      formData.professionalService.primaryService,
      formData.professionalOverview.summary.trim().split(/\s+/).length >= 250,
      formData.experiencePortfolio.portfolioItems.length >= 2,
      formData.pricingAvailability.pricingType,
      formData.pricingAvailability.rate,
    ];

    const allMandatoryMet = mandatoryChecks.every(check => Boolean(check));
    const meetsMinCompleteness = percentage >= 60;

    return allMandatoryMet && meetsMinCompleteness;
  };

  const compressImage = (base64String) => {
    if (!base64String) {
      return '/default-avatar.png';
    }
    
    if (typeof base64String === 'string' && 
        (base64String.startsWith('/') || 
         base64String.startsWith('http') || 
         base64String.startsWith('data:image'))) {
      return base64String;
    }
    
    if (typeof base64String === 'object' && base64String.url) {
      return base64String.url;
    }
    
    return '/default-avatar.png';
  };

  const saveOrUpdateProfile = async () => {
    try {
      setIsSubmitting(true);

      if (!canPublishProfile() && !isEditing) {
        alert('Cannot publish profile. Please complete all mandatory fields.');
        setIsSubmitting(false);
        return;
      }

      let profileId;
      if (isEditing) {
        profileId = localStorage.getItem('profileId');
      } else {
        profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const profileData = {
        ...formData,
        _id: profileId,
        userId: localStorage.getItem('userId') || 'user_' + Date.now(),
        completionScore: calculateCompletion(),
        publishedAt: isEditing ? localStorage.getItem('profilePublishedAt') : new Date().toISOString(),
        isVerified: isEditing ? (JSON.parse(localStorage.getItem('freelancerProfile'))?.isVerified || false) : false,
        isNewFreelancer: isEditing ? false : true,
        lastUpdated: new Date().toISOString(),
      };

      const compressedProfileData = {
        ...profileData,
        basicInfo: {
          ...profileData.basicInfo,
          profilePhoto: compressImage(formData.basicInfo.profilePhoto)
        }
      };

      // Save to localStorage
      localStorage.setItem('freelancerProfile', JSON.stringify(compressedProfileData));
      localStorage.setItem('profileId', profileId);
      
      if (!isEditing) {
        localStorage.setItem('profileSubmitted', 'true');
        localStorage.setItem('profilePublishedAt', new Date().toISOString());
      }
      
      localStorage.setItem('userName', formData.basicInfo.fullName);
      localStorage.setItem('userEmail', formData.basicInfo.email);
      localStorage.setItem('userRole', 'Freelancer');

      let visibilityLevel = 'hidden';
      const score = calculateCompletion();

      if (score < 50) visibilityLevel = 'hidden';
      else if (score >= 50 && score < 70) visibilityLevel = 'basic';
      else if (score >= 70 && score < 85) visibilityLevel = 'good';
      else if (score >= 85 && score < 100) visibilityLevel = 'strong';
      else if (score === 100) visibilityLevel = 'excellent';

      localStorage.setItem('profileVisibility', visibilityLevel);

      const publicUrl = `/profile/${profileId}`;
      localStorage.setItem('profilePublicUrl', publicUrl);

      if (isEditing) {
        alert(`Profile updated successfully!\nCompletion: ${score}%\nVisibility: ${visibilityLevel}`);
        setSaveSuccess(true);
        setIsEditing(true);
      } else {
        alert(`Profile published successfully!\nYour profile is now live at: ${publicUrl}\nCompletion: ${score}%\nVisibility: ${visibilityLevel}`);
        
        const viewProfile = window.confirm('Do you want to view your public profile now?');
        if (viewProfile) {
          navigate(publicUrl);
        } else {
          navigate('/freelancer/dashboard');
        }
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current step component with edit/save controls
  const getCurrentStepComponent = () => {
    if (loadingProfile) {
      return (
        <div className="loading-profile-data">
          <div className="loading-spinner"></div>
          <p>Loading your profile data...</p>
        </div>
      );
    }

    const currentStepData = steps[currentStep - 1];
    const currentSection = currentStepData?.section;
    
    const baseComponent = (() => {
      switch (currentStep) {
        case 1:
          return <BasicInfoSection data={formData} updateData={updateFormData} />;
        case 2:
          return <ProfessionalServiceSection data={formData} updateData={updateFormData} allowedServices={allowedServices} />;
        case 3:
          return <SkillsToolsSection data={formData} updateData={updateFormData} />;
        case 4:
          return <ProfessionalOverviewSection data={formData} updateData={updateFormData} />;
        case 5:
          return <ExperiencePortfolioSection data={formData} updateData={updateFormData} allowedServices={allowedServices} />;
        case 6:
          return <PricingAvailabilitySection data={formData} updateData={updateFormData} />;
        case 7:
          return <EducationCertificationsSection data={formData} updateData={updateFormData} />;
        case 8:
          return <ReviewPublishSection
            data={formData}
            completionScore={completionScore}
            onSubmit={saveOrUpdateProfile}
            canPublish={canPublishProfile()}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />;
        default:
          return <BasicInfoSection data={formData} updateData={updateFormData} />;
      }
    })();

    if (isEditing && currentStep < 8 && currentSection) {
      return (
        <div className="section-with-edit-controls">
          <div className="section-header-controls">
            <h2 className="section-title">{currentStepData.title}</h2>
            <div className="section-action-buttons">
              {editSection === currentSection ? (
                <>
                  <button 
                    className="btn-save-section"
                    onClick={() => handleSaveSection(currentSection)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    className="btn-cancel-edit"
                    onClick={() => setEditSection(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="btn-edit-section"
                  onClick={() => handleEditSection(currentSection)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          {baseComponent}
          {saveSuccess && editSection === currentSection && (
            <div className="save-success-message">
              ✓ Changes saved successfully!
            </div>
          )}
        </div>
      );
    }

    return baseComponent;
  };

  return (
    <div className="profile-creation-wizard">
      {/* Header with Completion Score */}
      <div className="wizard-header">
        <div className="header-top">
          <h1>
            {loadingProfile ? 'Loading Profile...' : 
             isEditing ? 'Edit Your Profile' : 'Create Your Professional Profile'}
          </h1>
          {!loadingProfile && (
            <div className="completion-badge">
              <span className="completion-label">Profile Completion</span>
              <span className="completion-percentage">{completionScore}%</span>
            </div>
          )}
        </div>
        {!loadingProfile && (
          <>
            <p className="header-subtitle">
              {isEditing 
                ? 'Update your profile information to keep it current and attractive to clients'
                : 'Complete your profile to increase visibility and attract more clients'}
            </p>

            {/* Visibility Indicator */}
            <div className="visibility-indicator">
              <div className="visibility-label">Current Visibility:</div>
              <div className={`visibility-level visibility-${completionScore < 50 ? 'hidden' :
                completionScore < 70 ? 'basic' :
                  completionScore < 85 ? 'good' :
                    completionScore < 100 ? 'strong' : 'excellent'}`}>
                {completionScore < 50 ? 'Hidden' :
                  completionScore < 70 ? 'Basic' :
                    completionScore < 85 ? 'Good' :
                      completionScore < 100 ? 'Strong' : 'Excellent'}
              </div>
              <div className="visibility-help">
                {completionScore < 60 ?
                  'Complete mandatory fields to become searchable' :
                  'Complete recommended fields to boost visibility'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar - Only show when not loading */}
      {!loadingProfile && (
        <ProgressBar
          steps={steps}
          currentStep={currentStep}
          completionScore={completionScore}
        />
      )}

      {/* Main Content */}
      <div className="wizard-content">
        {getCurrentStepComponent()}
      </div>

     {/* Navigation - Show only when not loading */}
{!loadingProfile && currentStep <= steps.length && (
  <div className="wizard-navigation">
    <div className="nav-buttons">
      {/* PREVIOUS BUTTON - Shows only when not on step 1 */}
      {currentStep > 1 && (
        <button 
          className="btn-prev-step"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          ← Previous Step
        </button>
      )}
      
      {/* Quick Navigation Buttons (for editing mode) */}
      {isEditing && currentStep !== steps.length && (
        <div className="quick-nav-buttons">
          <button 
            className="btn-quick-nav"
            onClick={() => setCurrentStep(8)} 
          >
            Jump to Review
          </button>
        </div>
      )}
      
      <div className="nav-right">
        {currentStep < steps.length ? (
          <button 
            className="btn-next-step"
            onClick={nextStep}
            disabled={isSubmitting}
          >
            Continue to {currentStep < steps.length - 1 ? steps[currentStep]?.title : 'Review'} →
          </button>
        ) : (
          <button 
            className={`btn-submit-profile ${!canPublishProfile() ? 'disabled' : ''}`}
            onClick={saveOrUpdateProfile}
            disabled={!canPublishProfile() || isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Publishing...') 
              : (isEditing ? 'Update Profile' : 'Publish Profile')}
          </button>
        )}
      </div>
    </div>
    
    {/* Step Progress */}
    <div className="step-progress">
      <div className="step-progress-bar">
        <div 
          className="step-progress-fill" 
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        ></div>
      </div>
      <div className="step-info">
        <span className="step-position">Step {currentStep} of {steps.length}</span>
        <span className="step-dots">
          {steps.map((step, index) => (
            <span 
              key={step.id}
              className={`step-dot ${index + 1 === currentStep ? 'active' : ''}`}
              onClick={() => {
                if (index + 1 < currentStep) {
                  setCurrentStep(index + 1);
                }
              }}
              title={step.title}
            ></span>
          ))}
        </span>
      </div>
    </div>
    
    {saveSuccess && !editSection && (
      <div className="global-success-message">
        ✓ Profile updated successfully!
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default MainProfile;