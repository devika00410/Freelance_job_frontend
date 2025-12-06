import React, { useState, useEffect } from 'react';
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
  FaChevronDown,
  FaSpinner,
  FaFileContract,
  FaHourglassHalf,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import './ClientProject.css';

const ClientProject = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Real data structure
  const [projectsData, setProjectsData] = useState({
    overview: {
      total: 0,
      active: 0,
      completed: 0,
      pendingReview: 0,
      totalSpent: 0,
      budget: 0,
      draft: 0,
      sent: 0,
      pending: 0
    },
    projects: [],
    pendingActions: []
  });

  const statusConfig = {
    draft: { 
      label: 'Draft', 
      color: '#6B7280', 
      bgColor: '#F9FAFB',
      icon: FaFileContract 
    },
    sent: { 
      label: 'Sent to Freelancer', 
      color: '#3B82F6', 
      bgColor: '#EFF6FF',
      icon: FaClock 
    },
    pending: { 
      label: 'Pending Signature', 
      color: '#F59E0B', 
      bgColor: '#FFFBEB',
      icon: FaHourglassHalf 
    },
    pending_client: { 
      label: 'Awaiting Your Signature', 
      color: '#F59E0B', 
      bgColor: '#FFFBEB',
      icon: FaCheck 
    },
    pending_freelancer: { 
      label: 'Awaiting Freelancer', 
      color: '#F59E0B', 
      bgColor: '#FFFBEB',
      icon: FaHourglassHalf 
    },
    active: { 
      label: 'Active', 
      color: '#10B981', 
      bgColor: '#F0FDF4',
      icon: FaCheckCircle 
    },
    in_progress: { 
      label: 'In Progress', 
      color: '#3B82F6', 
      bgColor: '#EFF6FF',
      icon: FaClock 
    },
    under_review: { 
      label: 'Under Review', 
      color: '#F59E0B', 
      bgColor: '#FFFBEB',
      icon: FaExclamationTriangle 
    },
    completed: { 
      label: 'Completed', 
      color: '#059669', 
      bgColor: '#ECFDF5',
      icon: FaCheckCircle 
    },
    cancelled: { 
      label: 'Cancelled', 
      color: '#6B7280', 
      bgColor: '#F9FAFB',
      icon: FaTimes 
    },
    disputed: { 
      label: 'Disputed', 
      color: '#EF4444', 
      bgColor: '#FEF2F2',
      icon: FaExclamationTriangle 
    }
  };

  // Load real data from backend
  useEffect(() => {
    loadRealProjectData();
  }, []);

  const loadRealProjectData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch contracts data (which represent projects)
      const contractsResponse = await axios.get('http://localhost:3000/api/client/contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch project stats
      const statsResponse = await axios.get('http://localhost:3000/api/client/contracts/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contracts = contractsResponse.data.contracts || contractsResponse.data || [];
      
      // Transform contracts to projects format
      const projects = contracts.map(contract => {
        const contractObj = typeof contract === 'object' ? contract : { _id: contract };
        
        return {
          id: contractObj._id || contractObj.contractId,
          contractId: contractObj.contractId,
          title: contractObj.title || 'Untitled Project',
          description: contractObj.description || '',
          freelancer: contractObj.freelancerName || (contractObj.freelancerId?.name || 'Freelancer not assigned'),
          status: contractObj.status || 'draft',
          progress: calculateProgress(contractObj),
          budget: contractObj.totalBudget || 0,
          spent: calculateTotalPaid(contractObj.phases || []),
          timeline: {
            start: contractObj.startDate || contractObj.createdAt,
            deadline: contractObj.endDate || null,
            nextMilestone: getNextMilestone(contractObj.phases || [])
          },
          needsAttention: ['sent', 'pending', 'pending_client', 'under_review', 'disputed'].includes(contractObj.status),
          lastActivity: formatLastActivity(contractObj.updatedAt || contractObj.createdAt),
          startDate: contractObj.startDate || contractObj.createdAt,
          currentPhase: getCurrentPhase(contractObj.phases || []),
          contractSigned: contractObj.clientSigned && contractObj.freelancerSigned,
          clientSigned: contractObj.clientSigned || false,
          freelancerSigned: contractObj.freelancerSigned || false,
          workspaceId: contractObj.workspaceId,
          phases: contractObj.phases || [],
          projectId: contractObj.projectId,
          proposalId: contractObj.proposalId
        };
      });

      // Calculate overview stats
      const overview = {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'active').length,
        completed: contracts.filter(c => c.status === 'completed').length,
        pendingReview: contracts.filter(c => c.status === 'under_review').length,
        totalSpent: contracts.reduce((sum, c) => sum + calculateTotalPaid(c.phases || []), 0),
        budget: contracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0),
        draft: contracts.filter(c => c.status === 'draft').length,
        sent: contracts.filter(c => c.status === 'sent').length,
        pending: contracts.filter(c => ['pending', 'pending_client', 'pending_freelancer'].includes(c.status)).length
      };

      // Get pending actions
      const pendingActions = getPendingActions(contracts);

      setProjectsData({
        overview,
        projects,
        pendingActions
      });

      setApiError(null);
    } catch (error) {
      console.error('Failed to load project data:', error);
      setApiError('Failed to load project data. Please try again later.');
      
      // Set empty state
      setProjectsData({
        overview: {
          total: 0,
          active: 0,
          completed: 0,
          pendingReview: 0,
          totalSpent: 0,
          budget: 0,
          draft: 0,
          sent: 0,
          pending: 0
        },
        projects: [],
        pendingActions: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateProgress = (contract) => {
    if (!contract.phases || contract.phases.length === 0) return 0;
    const completed = contract.phases.filter(p => p.status === 'paid').length;
    return Math.round((completed / contract.phases.length) * 100);
  };

  const calculateTotalPaid = (phases) => {
    if (!phases || !Array.isArray(phases)) return 0;
    return phases
      .filter(phase => phase.status === 'paid')
      .reduce((total, phase) => total + (phase.amount || 0), 0);
  };

  const getNextMilestone = (phases) => {
    if (!phases || !Array.isArray(phases)) return null;
    const next = phases.find(phase => 
      ['pending', 'in-progress'].includes(phase.status)
    );
    return next ? next.title : 'All phases completed';
  };

  const getCurrentPhase = (phases) => {
    if (!phases || !Array.isArray(phases)) return 0;
    const inProgress = phases.findIndex(phase => 
      ['pending', 'in-progress'].includes(phase.status)
    );
    return inProgress !== -1 ? inProgress + 1 : phases.length;
  };

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPendingActions = (contracts) => {
    const actions = [];
    
    contracts.forEach(contract => {
      // Contract signing actions
      if (contract.status === 'sent' && !contract.clientSigned) {
        actions.push({
          type: 'contract_signature',
          project: contract.title,
          freelancer: contract.freelancerName || 'Freelancer',
          deadline: contract.endDate,
          description: 'Sign contract to start project',
          contractId: contract.contractId,
          priority: 'high'
        });
      }

      if (contract.status === 'pending_client') {
        actions.push({
          type: 'contract_signature',
          project: contract.title,
          freelancer: contract.freelancerName || 'Freelancer',
          deadline: contract.endDate,
          description: 'Freelancer has signed, awaiting your signature',
          contractId: contract.contractId,
          priority: 'high'
        });
      }

      // Phase approval actions
      if (contract.phases && Array.isArray(contract.phases)) {
        contract.phases.forEach(phase => {
          if (phase.status === 'completed') {
            actions.push({
              type: 'phase_approval',
              project: contract.title,
              freelancer: contract.freelancerName || 'Freelancer',
              deadline: phase.dueDate,
              description: `Approve phase: ${phase.title}`,
              amount: phase.amount,
              phaseId: phase._id,
              contractId: contract.contractId,
              priority: 'medium'
            });
          }
        });
      }

      // Under review actions
      if (contract.status === 'under_review') {
        actions.push({
          type: 'deliverable_review',
          project: contract.title,
          freelancer: contract.freelancerName || 'Freelancer',
          deadline: contract.endDate,
          description: 'Review submitted deliverables',
          contractId: contract.contractId,
          priority: 'high'
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return actions.slice(0, 5); // Return top 5 actions
  };

  const filteredProjects = projectsData.projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.freelancer && project.freelancer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.contractId && project.contractId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'unsigned' ? !project.contractSigned : project.status === activeFilter);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleSignContract = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/client/contracts/${contractId}/sign`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Contract signed successfully!');
        loadRealProjectData(); // Refresh data
        if (response.data.contract.workspaceId) {
          navigate(`/workspace/${response.data.contract.workspaceId}`);
        }
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Failed to sign contract: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewWorkspace = (workspaceId, contractId) => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    } else {
      navigate(`/contracts/${contractId}`);
    }
  };

  const handleSendContract = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/client/contracts/${contractId}/send`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        alert('Contract sent to freelancer!');
        loadRealProjectData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending contract:', error);
      alert('Failed to send contract: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="client-projects-page">
      {/* Header Section */}
      <div className="projects-header">
        <div className="header-content">
          <h1>My Projects & Contracts</h1>
          <p>Manage all your projects, contracts, and agreements</p>
        </div>
        <Link to="/jobs/create" className="create-project-btn nav-link">
          <FaPlus />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <FaSpinner className="spinning" />
          <p>Loading your projects...</p>
        </div>
      )}

      {/* API Error Banner */}
      {apiError && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <span>{apiError}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.total}</h3>
            <p>Total Contracts</p>
          </div>
          <div className="card-icon total">
            <FaFileContract />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.active}</h3>
            <p>Active Projects</p>
          </div>
          <div className="card-icon active">
            <FaCheckCircle />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.draft + projectsData.overview.sent + projectsData.overview.pending}</h3>
            <p>Pending Contracts</p>
          </div>
          <div className="card-icon pending">
            <FaHourglassHalf />
          </div>
        </div>

        <div className="overview-card">
          <div className="card-content">
            <h3>{projectsData.overview.completed}</h3>
            <p>Completed</p>
          </div>
          <div className="card-icon completed">
            <FaCheck />
          </div>
        </div>

        <div className="overview-card financial">
          <div className="card-content">
            <h3>${projectsData.overview.totalSpent.toLocaleString()}</h3>
            <p>Total Spent / ${projectsData.overview.budget.toLocaleString()}</p>
            <div className="budget-bar">
              <div
                className="budget-progress"
                style={{
                  width: `${projectsData.overview.budget > 0
                    ? (projectsData.overview.totalSpent / projectsData.overview.budget) * 100
                    : 0}%`
                }}></div>
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
                placeholder="Search projects, freelancers, contract IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {['all', 'draft', 'sent', 'pending', 'pending_client', 'active', 'in_progress', 'under_review', 'completed', 'cancelled'].map(filter => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All Projects' : 
                   filter === 'unsigned' ? 'Unsigned Contracts' : 
                   statusConfig[filter]?.label || filter}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="projects-list">
            {filteredProjects.length === 0 ? (
              <div className="empty-state">
                <FaExclamationTriangle size={48} />
                <h3>No projects found</h3>
                <p>{loading ? 'Loading...' : 'No projects match your current filters.'}</p>
                <Link to="/jobs/create" className="create-btn">
                  <FaPlus /> Create Your First Project
                </Link>
              </div>
            ) : (
              filteredProjects.map(project => {
                const StatusIcon = statusConfig[project.status]?.icon || FaFileContract;
                const statusConfigItem = statusConfig[project.status] || statusConfig.draft;
                
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <div className="project-title-section">
                        <h3>{project.title}</h3>
                        <span className="contract-id">Contract: {project.contractId}</span>
                        
                        {/* Signature Status */}
                        <div className="signature-status">
                          <span className={`signature-badge ${project.clientSigned ? 'signed' : 'unsigned'}`}>
                            Client: {project.clientSigned ? '✓ Signed' : '✗ Pending'}
                          </span>
                          <span className={`signature-badge ${project.freelancerSigned ? 'signed' : 'unsigned'}`}>
                            Freelancer: {project.freelancerSigned ? '✓ Signed' : '✗ Pending'}
                          </span>
                        </div>
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: statusConfigItem.bgColor,
                          color: statusConfigItem.color
                        }}
                      >
                        <StatusIcon style={{ marginRight: '5px' }} />
                        {statusConfigItem.label}
                      </span>
                    </div>

                    <div className="project-details">
                      <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <span>{project.freelancer}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>Start: {formatDate(project.startDate)}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>Deadline: {formatDate(project.timeline.deadline)}</span>
                      </div>
                      <div className="detail-item">
                        <FaDollarSign className="detail-icon" />
                        <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                      </div>
                      {project.currentPhase && project.phases && project.phases.length > 0 && (
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>Phase {project.currentPhase} of {project.phases.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="project-progress">
                      <div className="progress-header">
                        <span>Project Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Next Milestone */}
                    {project.timeline.nextMilestone && (
                      <div className="next-milestone">
                        <strong>Next Milestone:</strong> {project.timeline.nextMilestone}
                      </div>
                    )}

                    {/* Project Actions */}
                    <div className="project-actions">
                      {project.status === 'draft' && (
                        <button 
                          className="action-btn send"
                          onClick={() => handleSendContract(project.contractId)}
                        >
                          <FaClock />
                          Send to Freelancer
                        </button>
                      )}

                      {project.status === 'sent' && !project.clientSigned && (
                        <button 
                          className="action-btn sign"
                          onClick={() => handleSignContract(project.contractId)}
                        >
                          <FaCheck />
                          Sign Contract
                        </button>
                      )}

                      {project.status === 'pending_client' && !project.clientSigned && (
                        <button 
                          className="action-btn sign urgent"
                          onClick={() => handleSignContract(project.contractId)}
                        >
                          <FaCheck />
                          Sign Now (Freelancer Signed)
                        </button>
                      )}

                      {(project.status === 'active' || project.contractSigned) && (
                        <button 
                          className="action-btn view"
                          onClick={() => handleViewWorkspace(project.workspaceId, project.contractId)}
                        >
                          <FaEye />
                          {project.workspaceId ? 'Enter Workspace' : 'View Contract'}
                        </button>
                      )}

                      {project.status === 'under_review' && (
                        <button className="action-btn review">
                          <FaCheckCircle />
                          Review Deliverables
                        </button>
                      )}

                      <button className="action-btn message">
                        <FaComment />
                        Message
                      </button>
                    </div>

                    <div className="project-footer">
                      <span className="last-activity">
                        Last updated: {project.lastActivity}
                      </span>
                      {project.phases && project.phases.length > 0 && (
                        <span className="phase-info">
                          {project.phases.filter(p => p.status === 'paid').length}/{project.phases.length} phases paid
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Actions & Quick Stats */}
        <div className="projects-sidebar">
          {/* Pending Actions */}
          <div className="sidebar-section">
            <h3>Actions Required ({projectsData.pendingActions.length})</h3>
            <div className="actions-list">
              {projectsData.pendingActions.length === 0 ? (
                <div className="empty-actions">
                  <p>No pending actions</p>
                </div>
              ) : (
                projectsData.pendingActions.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-header">
                      <span className="action-type">{action.type?.replace('_', ' ') || 'Action'}</span>
                      <span className="action-deadline">Due: {formatDate(action.deadline)}</span>
                    </div>
                    <p className="action-project">{action.project}</p>
                    <p className="action-description">{action.description}</p>
                    <div className="action-footer">
                      <span className="freelancer-name">{action.freelancer}</span>
                      <button 
                        className="action-btn small"
                        onClick={() => {
                          if (action.type === 'contract_signature') {
                            navigate(`/contracts/${action.contractId}`);
                          } else if (action.type === 'phase_approval') {
                            navigate(`/workspace/${action.contractId}?phase=${action.phaseId}`);
                          } else {
                            navigate(`/contracts/${action.contractId}`);
                          }
                        }}
                      >
                        Take Action
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="sidebar-section">
            <h3>Contract Status Summary</h3>
            <div className="performance-stats">
              <div className="stat-item">
                <span className="stat-label">Draft Contracts</span>
                <span className="stat-value">{projectsData.overview.draft}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sent for Review</span>
                <span className="stat-value">{projectsData.overview.sent}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Signature</span>
                <span className="stat-value">{projectsData.overview.pending}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Projects</span>
                <span className="stat-value">{projectsData.overview.active}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sidebar-section">
            <h3>Quick Links</h3>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/contracts')}
              >
                <FaFileContract />
                <span>All Contracts</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/contracts/create')}
              >
                <FaPlus />
                <span>Create New Contract</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/payments')}
              >
                <FaDollarSign />
                <span>Make Payment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProject;