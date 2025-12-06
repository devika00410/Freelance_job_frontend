import React, { useState } from 'react';
import { FaExternalLinkAlt, FaGithub, FaEye, FaTimes, FaFolderOpen } from 'react-icons/fa';
import './ProfilePortfolio.css'

const ProfilePortfolio = ({ profile }) => {
  const { workPortfolio } = profile;
  const [selectedProject, setSelectedProject] = useState(null);

  if (!workPortfolio || workPortfolio.length === 0) {
    return (
      <div className="portfolio-main-container">
        <div className="portfolio-empty-container">
          <div className="portfolio-empty-content">
            <FaFolderOpen className="portfolio-empty-icon" />
            <h3 className="portfolio-empty-title">No Portfolio Projects</h3>
            <p className="portfolio-empty-text">This freelancer hasn't added any projects yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-main-container">
      <div className="portfolio-header-section">
        <h3 className="portfolio-main-title">Portfolio</h3>
        <p className="portfolio-subtitle">Featured work and projects</p>
      </div>

      <div className="portfolio-grid-layout">
        {workPortfolio.map((project) => (
          <div 
            key={project.projectId} 
            className="portfolio-project-card"
            onClick={() => setSelectedProject(project)}>

            <div className="portfolio-image-container">
              <img 
                src={project.projectImage} 
                alt={project.projectTitle}
                className="portfolio-project-image"
              />
              <div className="portfolio-image-overlay">
                <FaEye className="portfolio-overlay-icon" />
                <span>View Project</span>
              </div>
            </div>
            
            <div className="portfolio-card-content">
              <h4 className="portfolio-project-title">{project.projectTitle}</h4>
              <p className="portfolio-project-desc">{project.projectDescription}</p>
              
              <div className="portfolio-tech-container">
                {project.techStack.slice(0, 3).map((tech, index) => (
                  <span key={index} className="portfolio-tech-tag">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="portfolio-tech-more">
                    +{project.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="portfolio-modal-overlay">
          <div className="portfolio-modal-content">
            <button 
              className="portfolio-modal-close"
              onClick={() => setSelectedProject(null)}>
              <FaTimes />
            </button>
            
            <div className="portfolio-modal-image">
              <img src={selectedProject.projectImage} alt={selectedProject.projectTitle} />
            </div>
            
            <div className="portfolio-modal-details">
              <h3 className="portfolio-modal-title">{selectedProject.projectTitle}</h3>
              <p className="portfolio-modal-description">{selectedProject.projectDescription}</p>
              
              <div className="portfolio-modal-tech-section">
                <h4 className="portfolio-modal-tech-title">Technologies</h4>
                <div className="portfolio-modal-tech-tags">
                  {selectedProject.techStack.map((tech, index) => (
                    <span key={index} className="portfolio-tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="portfolio-modal-actions">
                {selectedProject.demoLink && selectedProject.demoLink !== '#' && (
                  <a 
                    href={selectedProject.demoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="portfolio-modal-btn portfolio-primary-btn">
                    <FaExternalLinkAlt />
                    Live Demo
                  </a>
                )}
                {selectedProject.codeRepository && selectedProject.codeRepository !== '#' && (
                  <a 
                    href={selectedProject.codeRepository} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="portfolio-modal-btn portfolio-secondary-btn">
                    <FaGithub />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePortfolio;