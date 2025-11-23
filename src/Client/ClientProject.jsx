import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDollarSign,
  FaUser,
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaComment,
  FaChevronDown
} from 'react-icons/fa';
import './ClientProject.css';

const ClientProject = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  const projectsData = {
    overview: {
      total: 12,
      active: 4,
      completed: 6,
      pendingReview: 2,
      totalSpent: 45200,
      budget: 60000
    },
    projects: [
      {
        id: 1,
        title: "E-commerce Website Development",
        freelancer: "Sarah Johnson",
        status: "in_progress",
        progress: 75,
        budget: 15000,
        spent: 11250,
        timeline: {
          start: "2024-01-15",
          deadline: "2024-03-30",
          nextMilestone: "Payment Integration"
        },
        needsAttention: true,
        lastActivity: "2 hours ago"
      },
      {
        id: 2,
        title: "Mobile App UI/UX Design",
        freelancer: "Mike Chen",
        status: "under_review",
        progress: 100,
        budget: 8000,
        spent: 8000,
        timeline: {
          start: "2024-02-01",
          deadline: "2024-02-28"
        },
        needsAttention: true,
        lastActivity: "1 day ago"
      },
      {
        id: 3,
        title: "SEO Optimization Package",
        freelancer: "Emily Davis",
        status: "active",
        progress: 25,
        budget: 5000,
        spent: 1250,
        timeline: {
          start: "2024-03-01",
          deadline: "2024-05-01",
          nextMilestone: "Keyword Research Report"
        },
        needsAttention: false,
        lastActivity: "3 days ago"
      }
    ],
    pendingActions: [
      {
        type: "milestone_approval",
        project: "E-commerce Website Development",
        freelancer: "Sarah Johnson",
        deadline: "2024-03-10",
        description: "Approve payment integration milestone"
      },
      {
        type: "deliverable_review",
        project: "Mobile App UI/UX Design",
        freelancer: "Mike Chen",
        deadline: "2024-03-08",
        description: "Review final design files"
      }
    ]
  };

  const statusConfig = {
    active: { label: 'Active', color: '#10B981', bgColor: '#F0FDF4' },
    in_progress: { label: 'In Progress', color: '#3B82F6', bgColor: '#EFF6FF' },
    under_review: { label: 'Under Review', color: '#F59E0B', bgColor: '#FFFBEB' },
    completed: { label: 'Completed', color: '#6B7280', bgColor: '#F9FAFB' },
    cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#FEF2F2' }
  };

  const filteredProjects = projectsData.projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.freelancer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || project.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="client-projects-page">
      {/* Header Section */}
      <div className="projects-header">
        <div className="header-content">
          <h1>My Projects</h1>
          <p>Manage and track all your active projects</p>
        </div>
        {/* <button className="create-project-btn">
          <FaPlus />
          New Project
        </button> */}
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.total}</h3>
            <p>Total Projects</p>
          </div>
          <div className="card-icon total">
            <FaCheckCircle />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.active}</h3>
            <p>Active Projects</p>
          </div>
          <div className="card-icon active">
            <FaClock />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.completed}</h3>
            <p>Completed</p>
          </div>
          <div className="card-icon completed">
            <FaCheckCircle />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.pendingReview}</h3>
            <p>Pending Review</p>
          </div>
          <div className="card-icon review">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="overview-card financial">
          <div className="card-content">
            <h3>${projectsData.overview.totalSpent.toLocaleString()}</h3>
            <p>Total Spent / ${projectsData.overview.budget.toLocaleString()}</p>
            <div className="budget-bar">
              <div
                className="budget-progress"
                style={{ width: `${(projectsData.overview.totalSpent / projectsData.overview.budget) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="card-icon financial">
            <FaDollarSign />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="projects-content">
        {/* Left Column - Projects List */}
        <div className="projects-main">
          {/* Search and Filters */}
          <div className="projects-toolbar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search projects, freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {['all', 'active', 'in_progress', 'under_review', 'completed'].map(filter => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All Projects' : statusConfig[filter]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="projects-list">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-title-section">
                    <h3>{project.title}</h3>
                    {project.needsAttention && (
                      <span className="attention-badge">Attention Needed</span>
                    )}
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: statusConfig[project.status]?.bgColor,
                      color: statusConfig[project.status]?.color
                    }}
                  >
                    {statusConfig[project.status]?.label}
                  </span>
                </div>

                <div className="project-details">
                  <div className="detail-item">
                    <FaUser className="detail-icon" />
                    <span>{project.freelancer}</span>
                  </div>
                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <span>Due: {new Date(project.timeline.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <FaDollarSign className="detail-icon" />
                    <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="project-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {project.timeline.nextMilestone && (
                  <div className="next-milestone">
                    <strong>Next:</strong> {project.timeline.nextMilestone}
                  </div>
                )}

                <div className="project-actions">
                  <button className="action-btn view">
                    <FaEye />
                    View Details
                  </button>
                  <button className="action-btn message">
                    <FaComment />
                    Message
                  </button>
                  {project.status === 'under_review' && (
                    <button className="action-btn review">
                      <FaCheckCircle />
                      Review
                    </button>
                  )}
                </div>

                <div className="project-footer">
                  <span className="last-activity">Updated {project.lastActivity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Actions & Quick Stats */}
        <div className="projects-sidebar">
          {/* Pending Actions */}
          <div className="sidebar-section">
            <h3>Actions Required</h3>
            <div className="actions-list">
              {projectsData.pendingActions.map((action, index) => (
                <div key={index} className="action-item">
                  <div className="action-header">
                    <span className="action-type">{action.type.replace('_', ' ')}</span>
                    <span className="action-deadline">Due: {new Date(action.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="action-project">{action.project}</p>
                  <p className="action-description">{action.description}</p>
                  <div className="action-footer">
                    <span className="freelancer-name">{action.freelancer}</span>
                    <button className="action-btn small">Take Action</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="sidebar-section">
            <h3>Project Performance</h3>
            <div className="performance-stats">
              <div className="stat-item">
                <span className="stat-label">On-time Delivery</span>
                <span className="stat-value">85%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg. Rating Given</span>
                <span className="stat-value">4.7/5</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Freelancers</span>
                <span className="stat-value">3</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <Link to="/download" className="nav-item">
             <FaDownload />
                  <span>Download Reports</span>
                </Link>        
              </button>
              <button className="quick-action-btn">
                <Link to="/hire-previous" className="nav-item">
                  <FaUser />
                  <span>Hire Previous Freelancer</span>
                </Link>
              </button>

              <button className="quick-action-btn">
                <FaPlus />
                Use Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProject;