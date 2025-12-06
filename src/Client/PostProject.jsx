import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaDollarSign,
  FaCalendarAlt,
  FaCode,
  FaTag,
  FaFileAlt,
  FaUpload
} from 'react-icons/fa';
import './PostProject.css';

const PostProject = () => {
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: '',
    requiredSkills: [],
    serviceCategory: '',
    projectType: 'one_time',
    experienceLevel: 'intermediate',
    attachments: []
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  const serviceCategories = [
    'Web Development',
    'Mobile App Development',
    'Graphic Design',
    'Digital Marketing',
    'Content Writing',
    'Data Science',
    'AI & Machine Learning',
    'Video Editing',
    'SEO Services',
    'UI/UX Design'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.requiredSkills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters long';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Valid budget is required';
    }

    if (!formData.timeline) {
      newErrors.timeline = 'Timeline is required';
    }

    if (!formData.serviceCategory) {
      newErrors.serviceCategory = 'Service category is required';
    }

    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const token = localStorage.getItem('token');
    const submitData = new FormData();

    // Log the data for debugging
    console.log('Submitting project data:', {
      title: formData.title,
      budget: formData.budget,
      timeline: formData.timeline,
      serviceCategory: formData.serviceCategory,
      skills: formData.requiredSkills
    });

    // Append form data
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('budget', formData.budget);
    submitData.append('timeline', formData.timeline);
    submitData.append('serviceCategory', formData.serviceCategory);
    submitData.append('projectType', formData.projectType);
    submitData.append('experienceLevel', formData.experienceLevel);

    // Append skills as array
    formData.requiredSkills.forEach(skill => {
      submitData.append('requiredSkills', skill);
    });

    // Append files
    formData.attachments.forEach(file => {
      submitData.append('attachments', file);
    });

    // Use the correct client endpoint
    const response = await axios.post(
      'http://localhost:3000/api/client/projects', 
      submitData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Project posted successfully:', response.data);

    if (response.data.success) {
      alert('Project posted successfully!');
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Error posting project:', error);
    
    if (error.code === 'ERR_NETWORK') {
      alert('Cannot connect to server. Please make sure the backend is running on localhost:3000');
    } else if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status);
      console.error('Error data:', error.response.data);
      alert(`Error: ${error.response.data.message || 'Failed to post project'}`);
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
      alert('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      alert('Failed to post project. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="post-project-page">
      <div className="post-project-container">
        <div className="post-project-header">
          <button 
            className="navigation-back"
            onClick={() => navigate('/dashboard')}>
            <FaArrowLeft />
            Back to Dashboard
          </button>
          <h1 className="header-title">Post a New Project</h1>
          <p className="header-subtitle">
            Fill in the details below to post your project and find the perfect freelancers for your needs
          </p>
        </div>

        <div className="project-form-container">
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    <FaFileAlt className="form-label-icon" />
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-control ${errors.title ? 'error' : ''}`}
                    placeholder="e.g., Build a Modern E-commerce Website"/>
                  {errors.title && <span className="error-display">{errors.title}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <FaFileAlt className="form-label-icon" />
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`form-control form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="Describe your project in detail. Include goals, requirements, specific features needed, and any other relevant information..."
                    rows="6"
                  />
                  {errors.description && <span className="error-display">{errors.description}</span>}
                  <div className="character-counter">
                    {formData.description.length}/3000 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Section */}
            <div className="form-section">
              <h2 className="section-title">Project Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaDollarSign className="form-label-icon" />
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className={`form-control ${errors.budget ? 'error' : ''}`}
                    placeholder="e.g., 1500"
                    min="1"
                  />
                  {errors.budget && <span className="error-display">{errors.budget}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaCalendarAlt className="form-label-icon" />
                    Timeline (Days) *
                  </label>
                  <input
                    type="number"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className={`form-control ${errors.timeline ? 'error' : ''}`}
                    placeholder="e.g., 30"
                    min="1"
                  />
                  {errors.timeline && <span className="error-display">{errors.timeline}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Project Type</label>
                  <div className="radio-options">
                    <label className={`radio-option ${formData.projectType === 'fixed' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="projectType"
                        value="one_time"
                        checked={formData.projectType === 'fixed'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">Fixed Price</span>
                    </label>
                    <label className={`radio-option ${formData.projectType === 'hourly' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="projectType"
                        value="hourly"
                        checked={formData.projectType === 'hourly'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">Hourly</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Skills & Category Section */}
            <div className="form-section">
              <h2 className="section-title">Skills & Category</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FaTag className="form-label-icon" />
                    Service Category *
                  </label>
                  <select
                    name="serviceCategory"
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    className={`form-control ${errors.serviceCategory ? 'error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {serviceCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.serviceCategory && <span className="error-display">{errors.serviceCategory}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <FaCode className="form-label-icon" />
                    Required Skills *
                  </label>
                  <div className="skills-input-wrapper">
                    <input
                      type="text"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      className="form-control skills-input"
                      placeholder="Add required skills (e.g., React, Node.js, Python, UI/UX Design)"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="add-skill-button"
                    >
                      Add Skill
                    </button>
                  </div>
                  {errors.requiredSkills && <span className="error-display">{errors.requiredSkills}</span>}
                  
                  <div className="skills-tags-container">
                    {formData.requiredSkills.map((skill, index) => (
                      <div key={index} className="skill-tag-item">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="form-section">
              <h2 className="section-title">Project Attachments</h2>
              <div className="form-group full-width">
                <div 
                  className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  />
                  <div className="upload-content">
                    <FaUpload className="upload-icon" />
                    <div className="upload-text">Drag & drop files here or click to browse</div>
                    <div className="upload-subtext">Supports PDF, DOC, JPG, PNG, ZIP files (Max 10MB each)</div>
                  </div>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="attachments-display">
                    <div className="attachments-title">Attached Files:</div>
                    <div className="attachment-list">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="attachment-item">
                          <FaFileAlt className="attachment-icon" />
                          <div className="attachment-name">{file.name}</div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="remove-attachment-button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="cancel-action">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-action">
                {isSubmitting ? 'Publishing Project...' : 'Publish Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProject;