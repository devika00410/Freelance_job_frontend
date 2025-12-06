import React, { useState } from 'react';
import ImageUpload from '../UI/ImageUpload';
import './PortfolioSection.css';

const PortfolioSection = ({ data, updateData }) => {
  const { portfolio } = data;
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
    achievements: ''
  });

  const [currentTech, setCurrentTech] = useState('');

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      const updatedProjects = [...portfolio.projects, { ...newProject, id: Date.now() }];
      updateData('portfolio', { projects: updatedProjects });
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
        achievements: ''
      });
    }
  };

  const removeProject = (projectId) => {
    const updatedProjects = portfolio.projects.filter(p => p.id !== projectId);
    updateData('portfolio', { projects: updatedProjects });
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

  // FIXED: Properly handle multiple image uploads
  const handleProjectImagesUpload = (uploadedImages) => {
    console.log('Uploaded project images:', uploadedImages);
    setNewProject(prev => ({ 
      ...prev, 
      images: [...prev.images, ...uploadedImages] 
    }));
  };

  // FIXED: Handle single image upload (if needed)
  const handleSingleImageUpload = (imageUrl) => {
    console.log('Single image uploaded:', imageUrl);
    setNewProject(prev => ({ 
      ...prev, 
      images: [...prev.images, imageUrl] 
    }));
  };

  // FIXED: Remove specific image from project
  const removeProjectImage = (imageIndex) => {
    setNewProject(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex)
    }));
  };

  const canAddProject = newProject.title.trim() && newProject.description.trim();

  return (
    <div className="portfolio-section">
      <h2 className="portfolio-section__title">Portfolio Projects</h2>
      <p className="portfolio-section__description">
        Showcase your best work to attract potential clients. Highlight your skills, technologies used, and project outcomes to demonstrate your expertise.
      </p>

      {/* Add New Project Form */}
      <div className="portfolio-section__form">
        <h3 className="portfolio-section__form-title">Add New Project</h3>
        
        <div className="portfolio-section__form-grid">
          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label portfolio-section__required">
              Project Title
            </label>
            <input
              type="text"
              className="portfolio-section__input"
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., E-commerce Website Redesign"
            />
          </div>

          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label">Project Category</label>
            <select
              className="portfolio-section__select"
              value={newProject.category}
              onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select category</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-app">Mobile App</option>
              <option value="ui-ux">UI/UX Design</option>
              <option value="ecommerce">E-commerce</option>
              <option value="seo">SEO</option>
              <option value="content">Content Writing</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          <div className="portfolio-section__form-group portfolio-section__form-group--full">
            <label className="portfolio-section__label portfolio-section__required">
              Project Description
            </label>
            <textarea
              className="portfolio-section__textarea"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project scope, your specific role, technologies used, challenges faced, and the final outcomes or results achieved..."
              rows="4"
            />
          </div>

          {/* Technologies */}
          <div className="portfolio-section__form-group portfolio-section__form-group--full">
            <label className="portfolio-section__label">Technologies Used</label>
            <div className="portfolio-section__tech-group">
              <input
                type="text"
                className="portfolio-section__tech-input"
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                placeholder="Add technology (e.g., React, Node.js, Figma)"
                onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
              />
              <button 
                type="button" 
                onClick={addTechnology}
                className="portfolio-section__tech-add-button"
              >
                Add Tech
              </button>
            </div>
            <div className="portfolio-section__tech-tags">
              {newProject.technologies.map((tech, index) => (
                <span key={index} className="portfolio-section__tech-tag">
                  {tech}
                  <button 
                    type="button" 
                    onClick={() => removeTechnology(tech)}
                    className="portfolio-section__tech-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <small className="portfolio-section__help-text">
              Add the main technologies, frameworks, and tools used in this project
            </small>
          </div>

          {/* Project Images - FIXED */}
          <div className="portfolio-section__form-group portfolio-section__form-group--full">
            <label className="portfolio-section__label">Project Images</label>
            
            {/* Show uploaded images preview */}
            {newProject.images.length > 0 && (
              <div className="portfolio-section__uploaded-images">
                <p className="portfolio-section__uploaded-count">
                  {newProject.images.length} image{newProject.images.length !== 1 ? 's' : ''} uploaded
                </p>
                <div className="portfolio-section__images-preview">
                  {newProject.images.map((image, index) => (
                    <div key={index} className="portfolio-section__image-preview">
                      <img src={image} alt={`Project preview ${index + 1}`} />
                      <button 
                        type="button"
                        onClick={() => removeProjectImage(index)}
                        className="portfolio-section__image-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <ImageUpload
              multiple={true}
              uploadUrl="http://localhost:3000/api/upload"
              fieldName="image"
              onImageUpload={handleProjectImagesUpload}
              currentImage={null} // Don't show current image since we're handling multiple
            />
            <small className="portfolio-section__help-text">
              Upload screenshots, mockups, or photos that showcase your project (PNG, JPG, WebP)
            </small>
          </div>

          {/* Project Links */}
          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label">Live Demo URL</label>
            <input
              type="url"
              className="portfolio-section__input"
              value={newProject.liveUrl}
              onChange={(e) => setNewProject(prev => ({ ...prev, liveUrl: e.target.value }))}
              placeholder="https://yourproject.com"
            />
          </div>

          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label">GitHub Repository</label>
            <input
              type="url"
              className="portfolio-section__input"
              value={newProject.githubUrl}
              onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label">Client (Optional)</label>
            <input
              type="text"
              className="portfolio-section__input"
              value={newProject.client}
              onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))}
              placeholder="Client name or company"
            />
          </div>

          <div className="portfolio-section__form-group">
            <label className="portfolio-section__label">Project Duration</label>
            <input
              type="text"
              className="portfolio-section__input"
              value={newProject.duration}
              onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 3 months, 6 weeks"
            />
          </div>

          <div className="portfolio-section__form-group portfolio-section__form-group--full">
            <label className="portfolio-section__label">Key Achievements</label>
            <textarea
              className="portfolio-section__textarea"
              value={newProject.achievements}
              onChange={(e) => setNewProject(prev => ({ ...prev, achievements: e.target.value }))}
              placeholder="What were the key results, metrics improved, or business impact of this project? (e.g., Increased conversion by 25%, Reduced load time by 50%)"
              rows="3"
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={addProject} 
          className="portfolio-section__add-button"
          disabled={!canAddProject}
        >
          Add Project to Portfolio
        </button>
      </div>

      {/* Existing Projects - FIXED: Show project images */}
      <div className="portfolio-section__projects">
        <div className="portfolio-section__projects-title">
          Your Portfolio Projects
          <span className="portfolio-section__projects-count">
            {portfolio.projects.length} project{portfolio.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="portfolio-section__projects-list">
          {portfolio.projects.length === 0 ? (
            <div className="portfolio-section__empty-state">
              <div className="portfolio-section__empty-icon">📁</div>
              <p className="portfolio-section__empty-text">No projects added yet</p>
              <p className="portfolio-section__empty-subtext">
                Add your first project to showcase your work to potential clients
              </p>
            </div>
          ) : (
            portfolio.projects.map(project => (
              <div key={project.id} className="portfolio-section__project-card">
                <div className="portfolio-section__project-header">
                  <h4 className="portfolio-section__project-title">{project.title}</h4>
                  <button
                    type="button"
                    onClick={() => removeProject(project.id)}
                    className="portfolio-section__project-remove"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Show project images if available */}
                {project.images && project.images.length > 0 && (
                  <div className="portfolio-section__project-images">
                    {project.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`${project.title} preview ${index + 1}`}
                        className="portfolio-section__project-image" 
                      />
                    ))}
                  </div>
                )}
                
                <p className="portfolio-section__project-description">{project.description}</p>
                
                <div className="portfolio-section__project-details">
                  {project.category && (
                    <div className="portfolio-section__project-detail">
                      Category: {project.category}
                    </div>
                  )}
                  {project.client && (
                    <div className="portfolio-section__project-detail">
                      Client: {project.client}
                    </div>
                  )}
                  {project.duration && (
                    <div className="portfolio-section__project-detail">
                      Duration: {project.duration}
                    </div>
                  )}
                </div>
                
                {project.technologies.length > 0 && (
                  <div className="portfolio-section__project-technologies">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="portfolio-section__project-tech">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSection;