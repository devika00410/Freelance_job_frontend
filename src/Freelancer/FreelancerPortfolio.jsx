import React, { useState, useEffect } from 'react';
import {
  FaUser, FaBriefcase, FaCode, FaFileAlt, FaImages,
  FaEdit, FaPlus, FaTrash, FaStar, FaCalendar,
  FaMoneyBillWave, FaDownload, FaUpload,
  FaCheck, FaTimes, FaLink, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import './FreelancerPortfolio.css';

const FreelancerPortfolio = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolio, setPortfolio] = useState({
    services: [],
    skills: [],
    bio: '',
    projects: [],
    documents: [],
    gallery: [],
    rating: 0,
    completedProjects: 0,
    successRate: 0,
    freelancerInfo: {},
    profileImage: '',
    coverImage: ''
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    serviceType: '',
    budget: '',
    technologies: '',
    projectUrl: '',
    startDate: '',
    endDate: '',
    clientName: ''
  });
  const [skillForm, setSkillForm] = useState({
    name: '',
    proficiency: 'intermediate',
    category: 'technical',
    yearsOfExperience: 1
  });
  const [bioForm, setBioForm] = useState({ bio: '' });
  const [documentForm, setDocumentForm] = useState({
    name: '',
    description: ''
  });
  const [galleryForm, setGalleryForm] = useState({
    name: '',
    description: ''
  });

  // File states
  const [projectFiles, setProjectFiles] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    fetchPortfolio();
    fetchPortfolioStats();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setPortfolio(response.data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/portfolio/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    }
  };

  const handleFileUpload = async (endpoint, formData, onSuccess) => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/freelancer/portfolio/${endpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        onSuccess(response.data);
        setShowModal(false);
        resetForms();
        fetchPortfolio();
        fetchPortfolioStats();
      }
    } catch (error) {
      console.error(`Error uploading ${endpoint}:`, error);
      alert(error.response?.data?.message || `Error uploading ${endpoint}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddProject = async () => {
    const formData = new FormData();
    
    // Add form fields
    Object.keys(projectForm).forEach(key => {
      formData.append(key, projectForm[key]);
    });
    
    // Add files
    projectFiles.forEach(file => {
      formData.append('images', file);
    });

    await handleFileUpload('projects', formData, (data) => {
      console.log('Project added:', data);
    });
  };

  const handleUpdateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add form fields
      Object.keys(projectForm).forEach(key => {
        formData.append(key, projectForm[key]);
      });
      
      // Add new files
      projectFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.put(
        `http://localhost:3000/api/freelancer/portfolio/projects/${editingItem._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setShowModal(false);
        resetForms();
        fetchPortfolio();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3000/api/freelancer/portfolio/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          fetchPortfolio();
          fetchPortfolioStats();
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleAddSkill = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/freelancer/portfolio/skills', 
        skillForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShowModal(false);
        resetForms();
        fetchPortfolio();
        fetchPortfolioStats();
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleDeleteSkill = async (skillName) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3000/api/freelancer/portfolio/skills/${skillName}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          fetchPortfolio();
          fetchPortfolioStats();
        }
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  const handleUpdateBio = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/freelancer/portfolio/bio', 
        { bio: bioForm.bio },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShowModal(false);
        resetForms();
        fetchPortfolio();
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleAddDocument = async () => {
    const formData = new FormData();
    formData.append('name', documentForm.name);
    formData.append('description', documentForm.description);
    formData.append('document', documentFile);

    await handleFileUpload('documents', formData, (data) => {
      console.log('Document uploaded:', data);
    });
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3000/api/freelancer/portfolio/documents/${documentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          fetchPortfolio();
          fetchPortfolioStats();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleAddGalleryItem = async () => {
    const formData = new FormData();
    formData.append('name', galleryForm.name);
    formData.append('description', galleryForm.description);
    formData.append('galleryImage', galleryFile);

    await handleFileUpload('gallery', formData, (data) => {
      console.log('Gallery item added:', data);
    });
  };

  const handleDeleteGalleryItem = async (galleryItemId) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3000/api/freelancer/portfolio/gallery/${galleryItemId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          fetchPortfolio();
          fetchPortfolioStats();
        }
      } catch (error) {
        console.error('Error deleting gallery item:', error);
      }
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileFile) {
      alert('Please select a profile image');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', profileFile);

    await handleFileUpload('upload/profile', formData, (data) => {
      console.log('Profile image uploaded:', data);
    });
  };

  const handleCoverImageUpload = async () => {
    if (!coverFile) {
      alert('Please select a cover image');
      return;
    }

    const formData = new FormData();
    formData.append('coverImage', coverFile);

    await handleFileUpload('upload/cover', formData, (data) => {
      console.log('Cover image uploaded:', data);
    });
  };

  const resetForms = () => {
    setProjectForm({
      title: '', description: '', serviceType: '', budget: '', 
      technologies: '', projectUrl: '', startDate: '', endDate: '', clientName: ''
    });
    setSkillForm({ name: '', proficiency: 'intermediate', category: 'technical', yearsOfExperience: 1 });
    setBioForm({ bio: '' });
    setDocumentForm({ name: '', description: '' });
    setGalleryForm({ name: '', description: '' });
    setProjectFiles([]);
    setDocumentFile(null);
    setGalleryFile(null);
    setProfileFile(null);
    setCoverFile(null);
    setEditingItem(null);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      if (type === 'project') {
        setProjectForm({ 
          ...item,
          technologies: item.technologies?.join(', ') || ''
        });
      } else if (type === 'skill') {
        setSkillForm({ ...item });
      } else if (type === 'bio') {
        setBioForm({ bio: portfolio.bio });
      }
    } else {
      resetForms();
    }
    
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Present';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000${imagePath}`;
  };

  // Overview Tab
  const PortfolioOverview = () => (
    <div className="portfolio-overview-section">
      <div className="portfolio-header-section">
        <div className="portfolio-cover-container">
          <div 
            className="portfolio-cover-image"
            style={{ 
              backgroundImage: portfolio.coverImage ? `url(${getImageUrl(portfolio.coverImage)})` : 'linear-gradient(135deg, var(--navy-blue), var(--navy-dark))'
            }}
          >
            <button 
              className="portfolio-edit-cover-btn"
              onClick={() => openModal('coverImage')}
            >
              <FaEdit /> Edit Cover
            </button>
          </div>
          <div className="portfolio-profile-container">
            <div className="portfolio-profile-image">
              {portfolio.profileImage ? (
                <img src={getImageUrl(portfolio.profileImage)} alt="Profile" />
              ) : (
                <div className="portfolio-profile-placeholder">
                  <FaUser />
                </div>
              )}
              <button 
                className="portfolio-edit-profile-btn"
                onClick={() => openModal('profileImage')}
              >
                <FaEdit />
              </button>
            </div>
            <div className="portfolio-profile-info">
              <h2>{portfolio.freelancerInfo?.name || 'Your Name'}</h2>
              <p className="portfolio-profile-bio">
                {portfolio.bio || 'Add a bio to introduce yourself to potential clients...'}
              </p>
              <div className="portfolio-profile-stats">
                <div className="portfolio-stat-item">
                  <FaStar className="portfolio-stat-icon" />
                  <span>{portfolio.rating}/5 Rating</span>
                </div>
                <div className="portfolio-stat-item">
                  <FaBriefcase className="portfolio-stat-icon" />
                  <span>{stats.totalProjects || 0} Projects</span>
                </div>
                <div className="portfolio-stat-item">
                  <FaCheck className="portfolio-stat-icon" />
                  <span>{portfolio.successRate || 0}% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="portfolio-overview-grid">
        <div className="portfolio-stats-container">
          <div className="portfolio-stat-card">
            <FaBriefcase className="portfolio-stat-card-icon" />
            <div className="portfolio-stat-card-content">
              <h3>{stats.totalProjects || 0}</h3>
              <p>Total Projects</p>
            </div>
          </div>
          <div className="portfolio-stat-card">
            <FaCode className="portfolio-stat-card-icon" />
            <div className="portfolio-stat-card-content">
              <h3>{stats.totalSkills || 0}</h3>
              <p>Skills</p>
            </div>
          </div>
          <div className="portfolio-stat-card">
            <FaFileAlt className="portfolio-stat-card-icon" />
            <div className="portfolio-stat-card-content">
              <h3>{stats.totalDocuments || 0}</h3>
              <p>Documents</p>
            </div>
          </div>
          <div className="portfolio-stat-card">
            <FaImages className="portfolio-stat-card-icon" />
            <div className="portfolio-stat-card-content">
              <h3>{stats.totalGalleryItems || 0}</h3>
              <p>Gallery Items</p>
            </div>
          </div>
        </div>

        <div className="portfolio-quick-actions">
          <h3 className="portfolio-quick-actions-title">Quick Actions</h3>
          <div className="portfolio-action-buttons">
            <button onClick={() => openModal('project')} className="portfolio-action-btn">
              <FaPlus /> Add Project
            </button>
            <button onClick={() => openModal('skill')} className="portfolio-action-btn">
              <FaCode /> Add Skill
            </button>
            <button onClick={() => openModal('bio')} className="portfolio-action-btn">
              <FaEdit /> Edit Bio
            </button>
            <button onClick={() => openModal('document')} className="portfolio-action-btn">
              <FaUpload /> Upload Document
            </button>
            <button onClick={() => openModal('gallery')} className="portfolio-action-btn">
              <FaImages /> Add to Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Projects Tab
  const PortfolioProjects = () => (
    <div className="portfolio-projects-section">
      <div className="portfolio-section-header">
        <h3 className="portfolio-section-title">Portfolio Projects</h3>
        <button 
          className="portfolio-primary-btn"
          onClick={() => openModal('project')}
        >
          <FaPlus /> Add Project
        </button>
      </div>

      <div className="portfolio-projects-grid">
        {portfolio.projects.length === 0 ? (
          <div className="portfolio-empty-state">
            <FaBriefcase className="portfolio-empty-icon" />
            <p className="portfolio-empty-text">No projects added yet</p>
            <button 
              className="portfolio-primary-btn"
              onClick={() => openModal('project')}
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          portfolio.projects.map(project => (
            <div key={project._id} className="portfolio-project-card">
              <div className="portfolio-project-image">
                {project.images && project.images.length > 0 ? (
                  <img src={getImageUrl(project.images[0])} alt={project.title} />
                ) : (
                  <div className="portfolio-project-placeholder">
                    <FaBriefcase />
                  </div>
                )}
              </div>
              <div className="portfolio-project-content">
                <h4 className="portfolio-project-title">{project.title}</h4>
                <p className="portfolio-project-description">
                  {project.description?.length > 100 
                    ? `${project.description.substring(0, 100)}...` 
                    : project.description
                  }
                </p>
                <div className="portfolio-project-meta">
                  <span className="portfolio-project-service">{project.serviceType}</span>
                  {project.budget && (
                    <span className="portfolio-project-budget">{formatCurrency(project.budget)}</span>
                  )}
                </div>
                <div className="portfolio-project-technologies">
                  {project.technologies?.slice(0, 3).map((tech, index) => (
                    <span key={index} className="portfolio-tech-tag">{tech}</span>
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="portfolio-tech-more">+{project.technologies.length - 3} more</span>
                  )}
                </div>
                <div className="portfolio-project-dates">
                  {project.startDate && (
                    <span>Started: {formatDate(project.startDate)}</span>
                  )}
                  {project.endDate && (
                    <span>Completed: {formatDate(project.endDate)}</span>
                  )}
                </div>
              </div>
              <div className="portfolio-project-actions">
                <button 
                  className="portfolio-edit-btn"
                  onClick={() => openModal('project', project)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="portfolio-delete-btn"
                  onClick={() => handleDeleteProject(project._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Skills Tab
  const PortfolioSkills = () => (
    <div className="portfolio-skills-section">
      <div className="portfolio-section-header">
        <h3 className="portfolio-section-title">Skills & Expertise</h3>
        <button 
          className="portfolio-primary-btn"
          onClick={() => openModal('skill')}
        >
          <FaPlus /> Add Skill
        </button>
      </div>

      <div className="portfolio-skills-grid">
        {portfolio.skills.length === 0 ? (
          <div className="portfolio-empty-state">
            <FaCode className="portfolio-empty-icon" />
            <p className="portfolio-empty-text">No skills added yet</p>
            <button 
              className="portfolio-primary-btn"
              onClick={() => openModal('skill')}
            >
              Add Your First Skill
            </button>
          </div>
        ) : (
          portfolio.skills.map((skill, index) => (
            <div key={index} className="portfolio-skill-card">
              <div className="portfolio-skill-header">
                <h4 className="portfolio-skill-name">{skill.name}</h4>
                <div className="portfolio-skill-actions">
                  <button 
                    className="portfolio-edit-btn"
                    onClick={() => openModal('skill', skill)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="portfolio-delete-btn"
                    onClick={() => handleDeleteSkill(skill.name)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="portfolio-skill-details">
                <span className={`portfolio-skill-proficiency ${skill.proficiency}`}>
                  {skill.proficiency}
                </span>
                <span className="portfolio-skill-experience">
                  {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="portfolio-skill-category">
                {skill.category}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Documents Tab
  const PortfolioDocuments = () => (
    <div className="portfolio-documents-section">
      <div className="portfolio-section-header">
        <h3 className="portfolio-section-title">Documents & Certificates</h3>
        <button 
          className="portfolio-primary-btn"
          onClick={() => openModal('document')}
        >
          <FaUpload /> Upload Document
        </button>
      </div>

      <div className="portfolio-documents-list">
        {portfolio.documents.length === 0 ? (
          <div className="portfolio-empty-state">
            <FaFileAlt className="portfolio-empty-icon" />
            <p className="portfolio-empty-text">No documents uploaded yet</p>
            <button 
              className="portfolio-primary-btn"
              onClick={() => openModal('document')}
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          portfolio.documents.map(doc => (
            <div key={doc._id} className="portfolio-document-card">
              <div className="portfolio-document-icon">
                <FaFileAlt />
              </div>
              <div className="portfolio-document-info">
                <h4 className="portfolio-document-name">{doc.name}</h4>
                <p className="portfolio-document-description">{doc.description}</p>
                <div className="portfolio-document-meta">
                  <span className="portfolio-document-type">{doc.fileType}</span>
                  <span className="portfolio-document-size">{doc.fileSize}</span>
                  <span className="portfolio-document-date">
                    {formatDate(doc.uploadedAt)}
                  </span>
                </div>
              </div>
              <div className="portfolio-document-actions">
                <a 
                  href={getImageUrl(doc.fileUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="portfolio-download-btn"
                >
                  <FaDownload />
                </a>
                <button 
                  className="portfolio-delete-btn"
                  onClick={() => handleDeleteDocument(doc._id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Gallery Tab
  const PortfolioGallery = () => (
    <div className="portfolio-gallery-section">
      <div className="portfolio-section-header">
        <h3 className="portfolio-section-title">Project Gallery</h3>
        <button 
          className="portfolio-primary-btn"
          onClick={() => openModal('gallery')}
        >
          <FaUpload /> Add to Gallery
        </button>
      </div>

      <div className="portfolio-gallery-grid">
        {portfolio.gallery.length === 0 ? (
          <div className="portfolio-empty-state">
            <FaImages className="portfolio-empty-icon" />
            <p className="portfolio-empty-text">No gallery items yet</p>
            <button 
              className="portfolio-primary-btn"
              onClick={() => openModal('gallery')}
            >
              Add Your First Image
            </button>
          </div>
        ) : (
          portfolio.gallery.map(item => (
            <div key={item._id} className="portfolio-gallery-item">
              <div className="portfolio-gallery-image">
                <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                <div className="portfolio-gallery-overlay">
                  <button 
                    className="portfolio-delete-btn"
                    onClick={() => handleDeleteGalleryItem(item._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="portfolio-gallery-info">
                <h4 className="portfolio-gallery-title">{item.name}</h4>
                <p className="portfolio-gallery-description">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Modal Component
  const PortfolioModal = () => {
    const renderModalContent = () => {
      switch (modalType) {
        case 'profileImage':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">Upload Profile Image</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Profile Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileFile(e.target.files[0])}
                  className="portfolio-form-input"
                />
                {profileFile && (
                  <div className="portfolio-file-preview">
                    <img src={URL.createObjectURL(profileFile)} alt="Preview" className="portfolio-image-preview" />
                    <span>{profileFile.name}</span>
                  </div>
                )}
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleProfileImageUpload}
                  disabled={!profileFile || uploading}
                >
                  {uploading ? <FaSpinner className="portfolio-spinner" /> : 'Upload Image'}
                </button>
              </div>
            </div>
          );

        case 'coverImage':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">Upload Cover Image</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Cover Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                  className="portfolio-form-input"
                />
                {coverFile && (
                  <div className="portfolio-file-preview">
                    <img src={URL.createObjectURL(coverFile)} alt="Preview" className="portfolio-image-preview" />
                    <span>{coverFile.name}</span>
                  </div>
                )}
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleCoverImageUpload}
                  disabled={!coverFile || uploading}
                >
                  {uploading ? <FaSpinner className="portfolio-spinner" /> : 'Upload Image'}
                </button>
              </div>
            </div>
          );

        case 'project':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">{editingItem ? 'Edit Project' : 'Add New Project'}</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Project Title *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  placeholder="Enter project title"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Description *</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Describe the project and your role..."
                  rows="4"
                  className="portfolio-form-textarea"
                />
              </div>
              <div className="portfolio-form-row">
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">Service Type *</label>
                  <input
                    type="text"
                    value={projectForm.serviceType}
                    onChange={(e) => setProjectForm({...projectForm, serviceType: e.target.value})}
                    placeholder="e.g., Web Development"
                    className="portfolio-form-input"
                  />
                </div>
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">Budget</label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                    placeholder="Project budget"
                    className="portfolio-form-input"
                  />
                </div>
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Technologies Used</label>
                <input
                  type="text"
                  value={projectForm.technologies}
                  onChange={(e) => setProjectForm({...projectForm, technologies: e.target.value})}
                  placeholder="React, Node.js, MongoDB (comma separated)"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Project Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProjectFiles(Array.from(e.target.files))}
                  className="portfolio-form-input"
                />
                {projectFiles.length > 0 && (
                  <div className="portfolio-files-list">
                    {projectFiles.map((file, index) => (
                      <div key={index} className="portfolio-file-item">
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="portfolio-form-row">
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                    className="portfolio-form-input"
                  />
                </div>
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">End Date</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                    className="portfolio-form-input"
                  />
                </div>
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Client Name</label>
                <input
                  type="text"
                  value={projectForm.clientName}
                  onChange={(e) => setProjectForm({...projectForm, clientName: e.target.value})}
                  placeholder="Client or company name"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Project URL</label>
                <input
                  type="url"
                  value={projectForm.projectUrl}
                  onChange={(e) => setProjectForm({...projectForm, projectUrl: e.target.value})}
                  placeholder="Live project URL"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={editingItem ? handleUpdateProject : handleAddProject}
                  disabled={!projectForm.title || !projectForm.description || uploading}
                >
                  {uploading ? <FaSpinner className="portfolio-spinner" /> : (editingItem ? 'Update Project' : 'Add Project')}
                </button>
              </div>
            </div>
          );

        case 'skill':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">{editingItem ? 'Edit Skill' : 'Add New Skill'}</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Skill Name *</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  placeholder="e.g., React.js"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-row">
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">Proficiency Level</label>
                  <select
                    value={skillForm.proficiency}
                    onChange={(e) => setSkillForm({...skillForm, proficiency: e.target.value})}
                    className="portfolio-form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div className="portfolio-form-group">
                  <label className="portfolio-form-label">Years of Experience</label>
                  <input
                    type="number"
                    value={skillForm.yearsOfExperience}
                    onChange={(e) => setSkillForm({...skillForm, yearsOfExperience: parseInt(e.target.value)})}
                    min="0"
                    max="50"
                    className="portfolio-form-input"
                  />
                </div>
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                  className="portfolio-form-select"
                >
                  <option value="technical">Technical</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="soft-skills">Soft Skills</option>
                </select>
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleAddSkill}
                  disabled={!skillForm.name}
                >
                  {editingItem ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </div>
          );

        case 'bio':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">Edit Bio</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Professional Bio *</label>
                <textarea
                  value={bioForm.bio}
                  onChange={(e) => setBioForm({bio: e.target.value})}
                  placeholder="Write a compelling bio that showcases your expertise and experience..."
                  rows="6"
                  className="portfolio-form-textarea"
                />
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleUpdateBio}
                  disabled={!bioForm.bio}
                >
                  Update Bio
                </button>
              </div>
            </div>
          );

        case 'document':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">Upload Document</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Document Name *</label>
                <input
                  type="text"
                  value={documentForm.name}
                  onChange={(e) => setDocumentForm({...documentForm, name: e.target.value})}
                  placeholder="e.g., Resume, Certificate, Portfolio PDF"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Description</label>
                <textarea
                  value={documentForm.description}
                  onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                  placeholder="Brief description of the document..."
                  rows="3"
                  className="portfolio-form-textarea"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Document File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  className="portfolio-form-input"
                />
                {documentFile && (
                  <div className="portfolio-file-preview">
                    <span>{documentFile.name}</span>
                  </div>
                )}
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleAddDocument}
                  disabled={!documentForm.name || !documentFile || uploading}
                >
                  {uploading ? <FaSpinner className="portfolio-spinner" /> : 'Upload Document'}
                </button>
              </div>
            </div>
          );

        case 'gallery':
          return (
            <div className="portfolio-modal-form">
              <h3 className="portfolio-modal-title">Add to Gallery</h3>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Image Name *</label>
                <input
                  type="text"
                  value={galleryForm.name}
                  onChange={(e) => setGalleryForm({...galleryForm, name: e.target.value})}
                  placeholder="e.g., Project Screenshot, Design Mockup"
                  className="portfolio-form-input"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Description</label>
                <textarea
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})}
                  placeholder="Describe this image..."
                  rows="3"
                  className="portfolio-form-textarea"
                />
              </div>
              <div className="portfolio-form-group">
                <label className="portfolio-form-label">Gallery Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGalleryFile(e.target.files[0])}
                  className="portfolio-form-input"
                />
                {galleryFile && (
                  <div className="portfolio-file-preview">
                    <img src={URL.createObjectURL(galleryFile)} alt="Preview" className="portfolio-image-preview" />
                    <span>{galleryFile.name}</span>
                  </div>
                )}
              </div>
              <div className="portfolio-modal-actions">
                <button 
                  className="portfolio-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="portfolio-primary-btn"
                  onClick={handleAddGalleryItem}
                  disabled={!galleryForm.name || !galleryFile || uploading}
                >
                  {uploading ? <FaSpinner className="portfolio-spinner" /> : 'Add to Gallery'}
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className={`portfolio-modal ${showModal ? 'portfolio-modal-show' : ''}`}>
        <div className="portfolio-modal-content">
          <div className="portfolio-modal-header">
            <button 
              className="portfolio-modal-close"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="portfolio-modal-body">
            {renderModalContent()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="portfolio-loading-spinner"></div>
        <p className="portfolio-loading-text">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="freelancer-portfolio-container">
      <div className="portfolio-page-header">
        <h1 className="portfolio-page-title">My Portfolio</h1>
        <p className="portfolio-page-subtitle">Showcase your work, skills, and experience to attract clients</p>
      </div>

      <div className="portfolio-tabs-container">
        <nav className="portfolio-tab-navigation">
          <button 
            className={`portfolio-tab-btn ${activeTab === 'overview' ? 'portfolio-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaUser /> Overview
          </button>
          <button 
            className={`portfolio-tab-btn ${activeTab === 'projects' ? 'portfolio-tab-active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FaBriefcase /> Projects
          </button>
          <button 
            className={`portfolio-tab-btn ${activeTab === 'skills' ? 'portfolio-tab-active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <FaCode /> Skills
          </button>
          <button 
            className={`portfolio-tab-btn ${activeTab === 'documents' ? 'portfolio-tab-active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FaFileAlt /> Documents
          </button>
          <button 
            className={`portfolio-tab-btn ${activeTab === 'gallery' ? 'portfolio-tab-active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <FaImages /> Gallery
          </button>
        </nav>

        <div className="portfolio-tab-content">
          {activeTab === 'overview' && <PortfolioOverview />}
          {activeTab === 'projects' && <PortfolioProjects />}
          {activeTab === 'skills' && <PortfolioSkills />}
          {activeTab === 'documents' && <PortfolioDocuments />}
          {activeTab === 'gallery' && <PortfolioGallery />}
        </div>
      </div>

      <PortfolioModal />
    </div>
  );
};

export default FreelancerPortfolio;