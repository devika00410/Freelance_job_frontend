import React, { useState } from 'react';
import { 
  FaExternalLinkAlt, FaGithub, FaEye, FaTimes, 
  FaFolderOpen, FaLink, FaCode, FaStar
} from 'react-icons/fa';
import './ProfilePortfolio.css';

const ProfilePortfolio = ({ profile }) => {
  const { workPortfolio } = profile;
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  if (!workPortfolio || workPortfolio.length === 0) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-header">
          <h2 className="portfolio-title">Portfolio</h2>
          <div className="portfolio-subtitle">
            <span className="portfolio-count">0 projects</span>
            <span className="portfolio-subtext">No projects to display</span>
          </div>
        </div>
        <div className="empty-portfolio">
          <div className="empty-icon">
            <FaFolderOpen />
          </div>
          <h3 className="empty-title">No Portfolio Projects</h3>
          <p className="empty-description">
            This freelancer hasn't added any portfolio projects yet.
          </p>
        </div>
      </div>
    );
  }

  // Filter and sort projects
  const filteredProjects = workPortfolio.filter(project => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'featured') return project.featured === true;
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    return 0;
  });

  const categories = ['all', 'featured', ...new Set(workPortfolio.map(p => p.category).filter(Boolean))];

  return (
    <div className="portfolio-container">
      {/* Header with Stats */}
      <div className="portfolio-header">
        <div className="header-left">
          <h2 className="portfolio-title">Portfolio</h2>
          <div className="portfolio-stats">
            <span className="stat-item">
              <FaStar className="stat-icon" />
              <span className="stat-value">{workPortfolio.length}</span>
              <span className="stat-label">Projects</span>
            </span>
            <span className="stat-divider">•</span>
            <span className="stat-item">
              <span className="stat-value">{workPortfolio.reduce((acc, p) => acc + (p.techStack?.length || 0), 0)}+</span>
              <span className="stat-label">Technologies</span>
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="filter-group">
            <label className="filter-label">Sort by:</label>
            <select 
              className="filter-select" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="featured">Featured</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.slice(0, 6).map(category => (
          <button
            key={category}
            className={`category-filter ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
            {category === 'featured' && <FaStar className="filter-star" />}
          </button>
        ))}
        {categories.length > 6 && (
          <button className="category-filter more-filter">
            +{categories.length - 6} More
          </button>
        )}
      </div>

      {/* Portfolio Grid */}
      <div className="portfolio-grid">
        {sortedProjects.map((project, index) => (
          <div 
            key={project.projectId || index} 
            className="project-card"
            onClick={() => setSelectedProject(project)}
          >
            {/* Project Image with Overlay */}
            <div className="project-image-container">
              <img 
                src={project.projectImage || '/images/placeholder-project.jpg'} 
                alt={project.projectTitle}
                className="project-image"
                onError={(e) => {
                  e.target.src = '/images/placeholder-project.jpg';
                  e.target.onerror = null;
                }}
              />
              <div className="project-overlay">
                <div className="overlay-content">
                  <div className="view-project-btn">
                    <FaEye className="view-icon" />
                    View Details
                  </div>
                </div>
              </div>
              
              {/* Featured Badge */}
              {project.featured && (
                <div className="featured-badge">
                  <FaStar />
                  Featured
                </div>
              )}
              
              {/* Tech Stack Preview */}
              <div className="tech-preview">
                {project.techStack?.slice(0, 2).map((tech, i) => (
                  <span key={i} className="tech-preview-tag">
                    {tech}
                  </span>
                ))}
                {project.techStack?.length > 2 && (
                  <span className="tech-more">+{project.techStack.length - 2}</span>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="project-info">
              <div className="project-header">
                <h3 className="project-title">{project.projectTitle}</h3>
                {project.category && (
                  <span className="project-category">{project.category}</span>
                )}
              </div>
              
              <p className="project-description">
                {project.projectDescription?.substring(0, 120)}
                {project.projectDescription?.length > 120 ? '...' : ''}
              </p>
              
              {/* Project Meta */}
              <div className="project-meta">
                {project.duration && (
                  <span className="meta-item">
                    <FaCode className="meta-icon" />
                    {project.duration}
                  </span>
                )}
                {project.client && (
                  <span className="meta-item">
                    <FaStar className="meta-icon" />
                    {project.client}
                  </span>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="project-actions">
                {(project.demoLink && project.demoLink !== '#') && (
                  <a 
                    href={project.demoLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn demo-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt />
                    Demo
                  </a>
                )}
                {(project.codeRepository && project.codeRepository !== '#') && (
                  <a 
                    href={project.codeRepository} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn code-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGithub />
                    Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="project-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 className="modal-title">{selectedProject.projectTitle}</h3>
                {selectedProject.category && (
                  <span className="modal-category">{selectedProject.category}</span>
                )}
                {selectedProject.featured && (
                  <span className="modal-featured">
                    <FaStar />
                    Featured Project
                  </span>
                )}
              </div>
              <button 
                className="modal-close"
                onClick={() => setSelectedProject(null)}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Project Image */}
              <div className="modal-image-section">
                <img 
                  src={selectedProject.projectImage || '/images/placeholder-project.jpg'} 
                  alt={selectedProject.projectTitle}
                  className="modal-image"
                />
              </div>

              {/* Project Details */}
              <div className="modal-details">
                {/* Description */}
                <div className="detail-section">
                  <h4 className="detail-title">Project Overview</h4>
                  <p className="detail-description">{selectedProject.projectDescription}</p>
                </div>

                {/* Tech Stack */}
                {selectedProject.techStack?.length > 0 && (
                  <div className="detail-section">
                    <h4 className="detail-title">Technologies Used</h4>
                    <div className="tech-stack-grid">
                      {selectedProject.techStack.map((tech, index) => (
                        <div key={index} className="tech-stack-item">
                          <span className="tech-icon">▸</span>
                          <span className="tech-name">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Info */}
                <div className="detail-grid">
                  {selectedProject.duration && (
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{selectedProject.duration}</span>
                    </div>
                  )}
                  {selectedProject.client && (
                    <div className="detail-item">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">{selectedProject.client}</span>
                    </div>
                  )}
                  {selectedProject.achievements && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Results:</span>
                      <span className="detail-value">{selectedProject.achievements}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                  {(selectedProject.demoLink && selectedProject.demoLink !== '#') && (
                    <a 
                      href={selectedProject.demoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-btn primary-btn"
                    >
                      <FaExternalLinkAlt />
                      View Live Demo
                    </a>
                  )}
                  {(selectedProject.codeRepository && selectedProject.codeRepository !== '#') && (
                    <a 
                      href={selectedProject.codeRepository} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="modal-btn secondary-btn"
                    >
                      <FaGithub />
                      View Source Code
                    </a>
                  )}
                  <button 
                    className="modal-btn outline-btn"
                    onClick={() => setSelectedProject(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePortfolio;