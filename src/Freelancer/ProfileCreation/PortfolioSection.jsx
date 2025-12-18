import React, { useState } from 'react';
import ImageUpload from '../UI/ImageUpload';
import './PortfolioSection.css';

const PortfolioSection = ({
  data,
  updateData,
  allowedServices = []
}) => {

  const experiencePortfolio = React.useMemo(() => {
    // Try multiple possible data structures
    let experiences = [];
    let portfolioItems = [];

    // Structure 1: data.experiencePortfolio
    if (data?.experiencePortfolio) {
      experiences = Array.isArray(data.experiencePortfolio.experiences) ? data.experiencePortfolio.experiences : [];
      portfolioItems = Array.isArray(data.experiencePortfolio.portfolioItems) ? data.experiencePortfolio.portfolioItems : [];
    }
    // Structure 2: data.experience and data.portfolio (root level)
    else {
      experiences = Array.isArray(data?.experience) ? data.experience : [];
      portfolioItems = Array.isArray(data?.portfolio) ? data.portfolio : [];
    }

    // Clean the data - filter out any invalid items
    const cleanExperiences = experiences.filter(item =>
      item && typeof item === 'object' && (item.jobTitle || item.title)
    );

    const cleanPortfolioItems = portfolioItems.filter(item =>
      item && typeof item === 'object' && (item.title || item.projectTitle)
    );

    return {
      experiences: cleanExperiences,
      portfolioItems: cleanPortfolioItems
    };
  }, [data]);

  // Use safe versions throughout the component
  const safeExperiences = experiencePortfolio.experiences;
  const safePortfolioItems = experiencePortfolio.portfolioItems;

  const [newExperience, setNewExperience] = useState({
    jobTitle: '',
    company: '',
    employmentType: 'full-time',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: '',
    clientType: 'company'
  });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    technologies: [],
    liveUrl: '',
    githubUrl: '',
    images: [],
    client: '',
    duration: '',
    achievements: '',
    serviceCategory: '' // must match selected service
  });

  const [currentTech, setCurrentTech] = useState('');

  // Experience Functions
  const addExperience = () => {
    if (newExperience.jobTitle && newExperience.company && newExperience.startDate) {
      const updated = [...safeExperiences, { ...newExperience, id: Date.now() }];
      updateData('experiencePortfolio', { experiences: updated });
      setNewExperience({
        jobTitle: '', company: '', employmentType: 'full-time',
        startDate: '', endDate: '', current: false, description: '',
        achievements: '', clientType: 'company'
      });
    }
  };

  const removeExperience = (expId) => {
    const updated = safeExperiences.filter(e => e.id !== expId);
    updateData('experiencePortfolio', { experiences: updated });
  };

  // Project Functions
  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim() && newProject.serviceCategory) {
      const updatedProjects = [...safePortfolioItems, { ...newProject, id: Date.now() }];
      updateData('experiencePortfolio', { portfolioItems: updatedProjects });
      setNewProject({
        title: '',
        description: '',
        category: '',
        technologies: [],
        liveUrl: '',
        githubUrl: '',
        images: [],
        client: '',
        duration: '',
        achievements: '',
        serviceCategory: ''
      });
      setCurrentTech('');
    }
  };

  const removeProject = (projectId) => {
    const updatedProjects = safePortfolioItems.filter(p => p.id !== projectId);
    updateData('experiencePortfolio', { portfolioItems: updatedProjects });
  };

  const addTechnology = () => {
    if (currentTech.trim() && !newProject.technologies.includes(currentTech.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, currentTech.trim()]
      }));
      setCurrentTech('');
    }
  };

  const removeTechnology = (tech) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  // const handleProjectImagesUpload = (uploadedImages) => {
  //   if (Array.isArray(uploadedImages)) {
  //     setNewProject(prev => ({
  //       ...prev,
  //       images: [...prev.images, ...uploadedImages]
  //     }));
  //   } else if (uploadedImages) {
  //     // Single image
  //     setNewProject(prev => ({
  //       ...prev,
  //       images: [...prev.images, uploadedImages]
  //     }));
  //   }
  // };



  const handleImageUpload = (uploadedImages) => {
    if (!uploadedImages) return;

    setNewProject(prev => {
      // If it's an array of server responses
      if (Array.isArray(uploadedImages)) {
        // Extract fullUrl from each server response
        const newImageUrls = uploadedImages.map(img => img.fullUrl || img.filePath || img.base64);
        return {
          ...prev,
          images: [...(prev.images || []), ...newImageUrls]
        };
      }

      // If it's a single server response
      const imageUrl = uploadedImages.fullUrl || uploadedImages.filePath || uploadedImages;
      return {
        ...prev,
        images: [...(prev.images || []), imageUrl]
      };
    });
  };



  const removeProjectImage = (imageIndex) => {
    setNewProject(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex)
    }));
  };

  const canAddExperience = newExperience.jobTitle && newExperience.company && newExperience.startDate;
  const canAddProject = newProject.title.trim() && newProject.description.trim() && newProject.serviceCategory;
  const isMinimumExperienceMet = safeExperiences.length >= 1;
  const isMinimumProjectsMet = safePortfolioItems.length >= 2;

  return (
    <div className="experience-portfolio-section">
      <div className="section-header">
        <h2>Experience & Portfolio</h2>
        <p className="section-description">
          Showcase your professional journey and proof of work. Experience and portfolio are mandatory for publishing.
        </p>
        <div className="points-info">
          <span className="points-badge">20 Points</span>
          <span className="points-description">(8 experience, 12 portfolio - all mandatory)</span>
        </div>
      </div>

      <div className="form-content">
        {/* WORK EXPERIENCE SECTION */}
        <div className="subsection">
          <div className="subsection-header">
            <h3>Work Experience</h3>
            <div className="subsection-requirement">
              <span className={`requirement-status ${isMinimumExperienceMet ? 'met' : 'not-met'}`}>
                {isMinimumExperienceMet ? '✓' : '!'}
              </span>
              <span className="requirement-text">
                {isMinimumExperienceMet ? 'Minimum met' : `Minimum 1 experience required`}
              </span>
            </div>
          </div>
          <p className="subsection-description">
            Add your professional work experience to build credibility.
          </p>

          {/* Add Experience Form */}
          <div className="experience-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label mandatory-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newExperience.jobTitle}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label mandatory-label">Company</label>
                <input
                  type="text"
                  className="form-input"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  className="form-input"
                  value={newExperience.employmentType}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, employmentType: e.target.value }))}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Client Type</label>
                <select
                  className="form-input"
                  value={newExperience.clientType}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, clientType: e.target.value }))}
                >
                  <option value="company">Company</option>
                  <option value="startup">Startup</option>
                  <option value="individual">Individual Client</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label mandatory-label">Start Date</label>
                <input
                  type="month"
                  className="form-input"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="month"
                  className="form-input"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={newExperience.current}
                />
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={newExperience.current}
                    onChange={(e) => setNewExperience(prev => ({
                      ...prev,
                      current: e.target.checked,
                      endDate: e.target.checked ? '' : prev.endDate
                    }))}
                  />
                  <label className="checkbox-label">I currently work here</label>
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newExperience.description}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your responsibilities, technologies used, and key contributions..."
                  rows="4"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Key Achievements</label>
                <textarea
                  className="form-textarea"
                  value={newExperience.achievements}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="List your key achievements, projects delivered, or impact made (one per line)..."
                  rows="3"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addExperience}
              className="add-button"
              disabled={!canAddExperience}
            >
              Add Experience
            </button>
          </div>

          {/* Experience List */}
          <div className="items-list">
            <div className="items-header">
              <span className="items-title">Your Work Experience</span>
              <span className="items-count">
                {safeExperiences.length} position{safeExperiences.length !== 1 ? 's' : ''}
              </span>
            </div>

            {safeExperiences.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <p className="empty-text">No work experience added yet</p>
                <p className="empty-subtext">Add at least 1 experience entry to continue</p>
              </div>
            ) : (
              safeExperiences.map(exp => (
                <div key={exp.id} className="item-card">
                  <div className="item-header">
                    <div className="item-title-group">
                      <h4 className="item-title">{exp.jobTitle}</h4>
                      <span className="item-subtitle">{exp.company}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-details">
                    <div className="item-detail">
                      {exp.employmentType} • {exp.clientType} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="item-description">{exp.description}</p>
                  )}
                  {exp.achievements && (
                    <div className="item-achievements">
                      <strong>Achievements:</strong>
                      <p>{exp.achievements}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* PORTFOLIO SECTION */}
        <div className="subsection">
          <div className="subsection-header">
            <h3>Portfolio Projects</h3>
            <div className="subsection-requirement">
              <span className={`requirement-status ${isMinimumProjectsMet ? 'met' : 'not-met'}`}>
                {isMinimumProjectsMet ? '✓' : '!'}
              </span>
              <span className="requirement-text">
                {isMinimumProjectsMet ? 'Minimum met' : `Minimum 2 projects required`}
              </span>
            </div>
          </div>
          <p className="subsection-description mandatory">
            ⚠️ You must add at least 2 portfolio projects to publish your profile
          </p>

          {/* Add Project Form */}
          <div className="project-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label mandatory-label">Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., E-commerce Website Redesign"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label mandatory-label">Service Category</label>
                <select
                  className="form-input"
                  value={newProject.serviceCategory}
                  onChange={(e) =>
                    setNewProject(prev => ({ ...prev, serviceCategory: e.target.value }))
                  }
                  required
                >
                  <option value="">Select service category</option>
                  {(allowedServices || []).map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                <p className="field-help mandatory">Must match your selected service</p>
              </div>


              <div className="form-group full-width">
                <label className="form-label mandatory-label">Project Description</label>
                <textarea
                  className="form-textarea"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the project scope, your specific role, technologies used, challenges faced, and the final outcomes or results achieved..."
                  rows="4"
                  required
                />
              </div>

              {/* Technologies */}
              <div className="form-group full-width">
                <label className="form-label">Technologies Used</label>
                <div className="tech-input-group">
                  <input
                    type="text"
                    className="tech-input"
                    value={currentTech}
                    onChange={(e) => setCurrentTech(e.target.value)}
                    placeholder="Add technology (e.g., React, Node.js, Figma)"
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="tech-add-button"
                  >
                    Add Tech
                  </button>
                </div>
                <div className="tech-tags">
                  {newProject.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="tech-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Images */}
              <div className="form-group full-width">
                <label className="form-label">Project Images</label>
                {newProject.images.length > 0 && (
                  <div className="uploaded-images">
                    <p className="uploaded-count">
                      {newProject.images.length} image{newProject.images.length !== 1 ? 's' : ''} uploaded
                    </p>
                    <div className="images-preview">
                      {newProject.images.map((image, index) => (
                        <div key={index} className="image-preview">
                          <img src={image} alt={`Project preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeProjectImage(index)}
                            className="image-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Use the new ImageUpload component */}
     
                <ImageUpload
                  multiple={true}
                  maxSizeMB={5}
                  maxImages={10}
                  onImageUpload={handleImageUpload}
                />
                <p className="field-help">
                  Upload screenshots, mockups, or photos that showcase your project.
                  Supported formats: PNG, JPG, GIF. Max 5MB per image.
                </p>
              </div>
              {/* Project Links */}
              <div className="form-group">
                <label className="form-label">Live Demo URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
                  placeholder="https://yourproject.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository</label>
                <input
                  type="url"
                  className="form-input"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProject.client}
                  onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Client name or company"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Duration</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProject.duration}
                  onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 3 months, 6 weeks"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Key Achievements / Results</label>
                <textarea
                  className="form-textarea"
                  value={newProject.achievements}
                  onChange={(e) => setNewProject(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="What were the key results, metrics improved, or business impact? (e.g., Increased conversion by 25%, Reduced load time by 50%)"
                  rows="3"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addProject}
              className="add-button"
              disabled={!canAddProject}
            >
              Add Project to Portfolio
            </button>
          </div>

          {/* Portfolio List */}
          <div className="items-list">
            <div className="items-header">
              <span className="items-title">Your Portfolio Projects</span>
              <span className="items-count">
                {safePortfolioItems.length} project{safePortfolioItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {safePortfolioItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p className="empty-text">No projects added yet</p>
                <p className="empty-subtext mandatory">You must add at least 2 projects to publish your profile</p>
              </div>
            ) : (
              safePortfolioItems.map(project => (
                <div key={project.id} className="item-card portfolio-card">
                  <div className="item-header">
                    <div className="item-title-group">
                      <h4 className="item-title">{project.title}</h4>
                      <span className="item-subtitle">{project.serviceCategory}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(project.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>

                  {project.images && Array.isArray(project.images) && project.images.length > 0 && (
                    <div className="project-images">
                      {project.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${project.title} preview ${index + 1}`}
                          className="project-image"
                        />
                      ))}
                    </div>
                  )}

                  <p className="item-description">{project.description}</p>

                  <div className="item-details">
                    {project.client && (
                      <div className="item-detail">
                        <strong>Client:</strong> {project.client}
                      </div>
                    )}
                    {project.duration && (
                      <div className="item-detail">
                        <strong>Duration:</strong> {project.duration}
                      </div>
                    )}
                    {(project.liveUrl || project.githubUrl) && (
                      <div className="item-detail">
                        <strong>Links:</strong>
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">Live Demo</a>}
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">GitHub</a>}
                      </div>
                    )}
                  </div>

                  {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                    <div className="project-technologies">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="project-tech">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.achievements && (
                    <div className="project-achievements">
                      <strong>Results:</strong> {project.achievements}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completion Status */}
        <div className="completion-status">
          <div className="status-row">
            <span className="status-label">Work Experience:</span>
            <span className={`status-count ${isMinimumExperienceMet ? 'status-success' : 'status-error'}`}>
              {isMinimumExperienceMet ? '✓ 1/1 (Complete)' : `0/1 (Minimum required)`}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Portfolio Projects:</span>
            <span className={`status-count ${isMinimumProjectsMet ? 'status-success' : 'status-error'}`}>
              {safePortfolioItems.length}/2 {isMinimumProjectsMet ? '(Complete)' : '(Incomplete)'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Overall Status:</span>
            <span className={`status-count ${isMinimumExperienceMet && isMinimumProjectsMet ? 'status-success' : 'status-error'}`}>
              {isMinimumExperienceMet && isMinimumProjectsMet ? '✓ Ready to publish' : '⚠️ Needs more items'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection;