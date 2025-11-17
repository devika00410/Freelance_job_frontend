import React, { useState, useEffect } from 'react';
import { 
  FaCode, 
  FaPalette, 
  FaVideo, 
  FaSearch, 
  FaPenAlt,
  FaChartLine,
  FaMobile,
  FaHashtag,
  FaUserTie,
  FaLaptopCode,
  FaArrowRight,
  FaArrowLeft,
  FaRobot,
  FaStar,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import './ProjectMatchmaker.css';

const ProjectMatchmaker = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [matchedFreelancers, setMatchedFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Your 10 services mapped to icons
  const services = [
    { value: "web-dev", label: "Full Stack Web Development", icon: <FaLaptopCode /> },
    { value: "graphic-design", label: "Graphic Design", icon: <FaPalette /> },
    { value: "video-editing", label: "Video Editing", icon: <FaVideo /> },
    { value: "seo", label: "SEO", icon: <FaSearch /> },
    { value: "content-writing", label: "Content Writing", icon: <FaPenAlt /> },
    { value: "digital-marketing", label: "Digital Marketing", icon: <FaChartLine /> },
    { value: "ui-ux", label: "UI/UX Design", icon: <FaMobile /> },
    { value: "mobile-dev", label: "Mobile App Development", icon: <FaCode /> },
    { value: "social-media", label: "Social Media Management", icon: <FaHashtag /> },
    { value: "virtual-assistant", label: "Virtual Assistance", icon: <FaUserTie /> }
  ];

  const steps = [
    {
      id: 1,
      question: "What service do you need?",
      options: services
    },
    {
      id: 2,
      question: "What's your project timeline?",
      options: [
        { value: "urgent", label: "Urgent (1-3 days)", icon: <FaClock className="urgent" /> },
        { value: "standard", label: "Standard (1-2 weeks)", icon: <FaCheckCircle className="standard" /> },
        { value: "flexible", label: "Flexible (1+ month)", icon: <FaClock className="flexible" /> }
      ]
    },
    {
      id: 3,
      question: "What's your budget range?",
      options: [
        { value: "budget", label: "$500 - $2,000", icon: <FaStar className="budget" /> },
        { value: "medium", label: "$2,000 - $5,000", icon: <FaStar className="medium" /> },
        { value: "enterprise", label: "$5,000+", icon: <FaStar className="enterprise" /> }
      ]
    },
    {
      id: 4,
      question: "Preferred freelancer experience level?",
      options: [
        { value: "entry", label: "Entry Level (1-2 years)", icon: <FaUserTie className="entry" /> },
        { value: "mid", label: "Mid Level (3-5 years)", icon: <FaUserTie className="mid" /> },
        { value: "expert", label: "Expert (5+ years)", icon: <FaUserTie className="expert" /> }
      ]
    }
  ];

  const handleOptionSelect = (stepId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [`step${stepId}`]: value
    }));
  };

  const nextStep = async () => {
    if (!userAnswers[`step${currentStep}`]) {
      alert('Please select an option to continue');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      await findMatches();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Simulate API call to your backend
  const findMatches = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // This is where you would connect to your actual backend
    // const response = await fetch('/api/match-freelancers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userAnswers)
    // });
    // const data = await response.json();
    
    // For now, using mock data based on user selections
    const mockMatches = generateMockMatches(userAnswers);
    setMatchedFreelancers(mockMatches);
    setShowResults(true);
    setLoading(false);
  };

  const generateMockMatches = (answers) => {
    const service = answers.step1;
    const experience = answers.step4;
    
    // Mock data structure matching your user model
    const baseProfiles = [
      {
        id: 1,
        name: "Sarah Chen",
        title: "Senior Full Stack Developer",
        avatar: "👩‍💻",
        rating: 4.9,
        completedProjects: 127,
        successRate: 98,
        hourlyRate: 85,
        skills: ["React", "Node.js", "TypeScript", "MongoDB"],
        experience: "expert",
        service: "web-dev",
        matchScore: 95,
        responseTime: "1 hour",
        location: "San Francisco, CA",
        description: "Specialized in building scalable web applications with modern tech stacks.",
        verified: true
      },
      {
        id: 2,
        name: "Mike Rodriguez",
        title: "UI/UX Design Expert",
        avatar: "👨‍🎨",
        rating: 4.8,
        completedProjects: 89,
        successRate: 96,
        hourlyRate: 75,
        skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        experience: "expert",
        service: "ui-ux",
        matchScore: 88,
        responseTime: "2 hours",
        location: "New York, NY",
        description: "Creating intuitive user experiences that drive engagement and conversion.",
        verified: true
      },
      {
        id: 3,
        name: "Alex Thompson",
        title: "Digital Marketing Specialist",
        avatar: "👨‍💼",
        rating: 4.7,
        completedProjects: 156,
        successRate: 94,
        hourlyRate: 65,
        skills: ["SEO", "PPC", "Social Media", "Content Strategy"],
        experience: "mid",
        service: "digital-marketing",
        matchScore: 82,
        responseTime: "3 hours",
        location: "Austin, TX",
        description: "Driving growth through data-driven marketing strategies.",
        verified: true
      }
    ];

    // Filter and sort based on user preferences
    return baseProfiles
      .filter(profile => 
        profile.service === service && 
        profile.experience === experience
      )
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  };

  const calculateSuccessProbability = () => {
    let baseScore = 85;
    
    // Adjust based on user selections
    if (userAnswers.step2 === 'standard') baseScore += 5;
    if (userAnswers.step3 === 'medium') baseScore += 3;
    if (userAnswers.step4 === 'expert') baseScore += 7;
    
    return Math.min(baseScore, 98);
  };

  const progress = (currentStep / steps.length) * 100;

  const getServiceIcon = (serviceValue) => {
    return services.find(s => s.value === serviceValue)?.icon;
  };

  if (loading) {
    return (
      <section className="matchmaker-section">
        <div className="container">
          <div className="loading-state">
            <FaRobot className="loading-icon" />
            <h3>Finding your perfect matches...</h3>
            <p>Analyzing your requirements with our AI engine</p>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="matchmaker-section">
      <div className="container">
        <div className="section-header">
          <h2>Find Your Perfect Freelancer</h2>
          <p>Tell us about your project and we'll match you with the ideal talent from our network</p>
        </div>

        <div className="matchmaker-container">
          {/* Quiz Section */}
          <div className="quiz-container">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">Step {currentStep} of {steps.length}</span>
            </div>

            {steps.map(step => (
              <div 
                key={step.id}
                className={`quiz-step ${currentStep === step.id ? 'active' : ''}`}
              >
                <h3>{step.question}</h3>
                <div className="option-grid">
                  {step.options.map(option => (
                    <div
                      key={option.value}
                      className={`option-card ${
                        userAnswers[`step${step.id}`] === option.value ? 'selected' : ''
                      }`}
                      onClick={() => handleOptionSelect(step.id, option.value)}
                    >
                      <div className="option-icon">
                        {option.icon}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="quiz-nav">
              <button 
                className="btn-secondary" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <FaArrowLeft /> Previous
              </button>
              <button className="btn-primary" onClick={nextStep}>
                {currentStep === steps.length ? 'Find Matches' : 'Next'} <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="results-panel">
            {!showResults ? (
              <div className="results-placeholder">
                <div className="ai-thinking">
                  <FaRobot className="ai-icon" />
                  <h4>Complete the quiz to see your matches</h4>
                  <p>Our AI will analyze your requirements and connect you with pre-vetted professionals</p>
                  <div className="features-list">
                    <div className="feature">
                      <FaCheckCircle /> Pre-vetted professionals
                    </div>
                    <div className="feature">
                      <FaCheckCircle /> AI-powered matching
                    </div>
                    <div className="feature">
                      <FaCheckCircle /> 95% success rate
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="results-content">
                <div className="results-header">
                  <h3>Your Perfect Matches</h3>
                  <div className="success-predictor-mini">
                    <div className="prediction-badge">
                      <span>{calculateSuccessProbability()}%</span>
                      Success Probability
                    </div>
                  </div>
                </div>
                
                <div className="match-cards">
                  {matchedFreelancers.map((freelancer) => (
                    <div key={freelancer.id} className="match-card">
                      <div className="match-card-header">
                        <div className="freelancer-avatar">
                          {freelancer.avatar}
                          {freelancer.verified && <span className="verified-badge">✓</span>}
                        </div>
                        <div className="match-score">
                          {freelancer.matchScore}% Match
                        </div>
                      </div>
                      
                      <div className="freelancer-info">
                        <h4>{freelancer.name}</h4>
                        <p className="title">{freelancer.title}</p>
                        <div className="rating">
                          <FaStar className="star" />
                          <span>{freelancer.rating}</span>
                          <span className="projects">({freelancer.completedProjects} projects)</span>
                        </div>
                      </div>

                      <div className="skills">
                        {freelancer.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>

                      <div className="statss">
                        <div className="stat">
                          <span className="value">{freelancer.successRate}%</span>
                          <span className="label">Success Rate</span>
                        </div>
                        <div className="stat">
                          <span className="value">${freelancer.hourlyRate}/hr</span>
                          <span className="label">Rate</span>
                        </div>
                        <div className="stat">
                          <span className="value">{freelancer.responseTime}</span>
                          <span className="label">Response</span>
                        </div>
                      </div>

                      <p className="description">{freelancer.description}</p>

                      <div className="match-card-actions">
                        <button className="btn-primary btn-sm">View Profile</button>
                        <button className="btn-outline btn-sm">Message</button>
                      </div>
                    </div>
                  ))}
                </div>

                {matchedFreelancers.length === 0 && (
                  <div className="no-matches">
                    <h4>No perfect matches found</h4>
                    <p>Try adjusting your requirements or browse all freelancers</p>
                    <button className="btn-primary">Browse All Freelancers</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectMatchmaker;