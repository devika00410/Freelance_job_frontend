import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaFolderOpen,
  FaStar,
  FaChartLine,
  FaEye,
  FaPlus,
  FaSort,
  FaDownload,
  FaEllipsisV,
  FaRegClock,
  FaRegCalendarCheck
} from 'react-icons/fa';
import axios from 'axios';
import './ClientWorkspaceList.css';

const ClientWorkspaceList = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
    totalBudget: 0,
    totalSpent: 0,
    overdue: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('🔍 Fetching client workspaces for user:', userId);
      
      // Try different API endpoints
      const endpoints = [
        `${API_URL}/api/client/workspaces`,
        `${API_URL}/api/workspaces/client`,
        `${API_URL}/api/workspaces?clientId=${userId}`
      ];

      let workspacesData = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data && (response.data.workspaces || response.data.success)) {
            workspacesData = response.data.workspaces || response.data.data || [];
            console.log(`✅ Success from ${endpoint}:`, workspacesData.length, 'workspaces');
            break;
          }
        } catch (err) {
          console.log(`❌ Failed: ${endpoint} - ${err.message}`);
        }
      }

      // If no API data, use sample data
      if (!workspacesData || workspacesData.length === 0) {
        console.log('🎭 Using sample workspace data');
        workspacesData = getSampleWorkspaces();
      }

      setWorkspaces(workspacesData);
      calculateStats(workspacesData);
    } catch (error) {
      console.error('❌ Error fetching workspaces:', error);
      // Use sample data on error
      const sampleData = getSampleWorkspaces();
      setWorkspaces(sampleData);
      calculateStats(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const getSampleWorkspaces = () => {
    return [
      {
        _id: 'workspace_001',
        workspaceId: 'WS_001',
        title: 'Digital Boost Strategy & Campaign Management',
        description: 'Complete digital marketing strategy and campaign management including SEO, social media marketing, and content creation.',
        status: 'active',
        freelancerName: 'Alex Johnson',
        freelancerId: 'freelancer_001',
        freelancerRating: 4.9,
        progress: 45,
        budget: 12500,
        spent: 2500,
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        lastActivity: new Date().toISOString(),
        milestones: 4,
        completedMilestones: 1,
        overdueTasks: 0,
        nextDeadline: '2024-02-15',
        serviceType: 'Digital Marketing',
        tags: ['marketing', 'seo', 'social-media'],
        createdAt: '2024-01-10',
        contractSigned: true,
        paymentStatus: 'up_to_date'
      },
      {
        _id: 'workspace_002',
        workspaceId: 'WS_002',
        title: 'E-commerce Mobile App Development',
        description: 'Development of a React Native mobile application for e-commerce platform with payment integration.',
        status: 'active',
        freelancerName: 'Sarah Chen',
        freelancerId: 'freelancer_002',
        freelancerRating: 4.8,
        progress: 75,
        budget: 8000,
        spent: 6000,
        startDate: '2024-02-01',
        endDate: '2024-04-01',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: 6,
        completedMilestones: 4,
        overdueTasks: 1,
        nextDeadline: '2024-02-28',
        serviceType: 'Mobile Development',
        tags: ['react-native', 'ecommerce', 'mobile'],
        createdAt: '2024-01-25',
        contractSigned: true,
        paymentStatus: 'pending'
      },
      {
        _id: 'workspace_003',
        workspaceId: 'WS_003',
        title: 'Corporate Website Redesign',
        description: 'Complete redesign and development of corporate website with modern UI/UX and content management system.',
        status: 'completed',
        freelancerName: 'Michael Rodriguez',
        freelancerId: 'freelancer_003',
        freelancerRating: 4.7,
        progress: 100,
        budget: 5000,
        spent: 5000,
        startDate: '2024-01-01',
        endDate: '2024-02-15',
        lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: 3,
        completedMilestones: 3,
        overdueTasks: 0,
        nextDeadline: null,
        serviceType: 'Web Development',
        tags: ['web-design', 'cms', 'responsive'],
        createdAt: '2023-12-15',
        contractSigned: true,
        paymentStatus: 'paid'
      },
      {
        _id: 'workspace_004',
        workspaceId: 'WS_004',
        title: 'Cloud Infrastructure Migration',
        description: 'Migration of existing infrastructure to AWS cloud with optimization and security implementation.',
        status: 'pending',
        freelancerName: 'Alex Johnson',
        freelancerId: 'freelancer_001',
        freelancerRating: 4.9,
        progress: 0,
        budget: 10000,
        spent: 0,
        startDate: '2024-03-01',
        endDate: '2024-05-01',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: 5,
        completedMilestones: 0,
        overdueTasks: 0,
        nextDeadline: '2024-03-15',
        serviceType: 'Cloud Computing',
        tags: ['aws', 'migration', 'devops'],
        createdAt: '2024-02-20',
        contractSigned: false,
        paymentStatus: 'not_started'
      },
      {
        _id: 'workspace_005',
        workspaceId: 'WS_005',
        title: 'Brand Identity & Logo Design',
        description: 'Creation of complete brand identity including logo, color palette, typography, and brand guidelines.',
        status: 'active',
        freelancerName: 'Emma Wilson',
        freelancerId: 'freelancer_004',
        freelancerRating: 4.6,
        progress: 30,
        budget: 3000,
        spent: 900,
        startDate: '2024-02-10',
        endDate: '2024-03-10',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: 3,
        completedMilestones: 1,
        overdueTasks: 0,
        nextDeadline: '2024-02-25',
        serviceType: 'Graphic Design',
        tags: ['branding', 'logo', 'design'],
        createdAt: '2024-01-30',
        contractSigned: true,
        paymentStatus: 'up_to_date'
      },
      {
        _id: 'workspace_006',
        workspaceId: 'WS_006',
        title: 'Data Analytics Dashboard',
        description: 'Development of interactive data analytics dashboard with real-time reporting and visualization.',
        status: 'active',
        freelancerName: 'David Kim',
        freelancerId: 'freelancer_005',
        freelancerRating: 4.8,
        progress: 60,
        budget: 7000,
        spent: 4200,
        startDate: '2024-01-20',
        endDate: '2024-03-20',
        lastActivity: new Date().toISOString(),
        milestones: 4,
        completedMilestones: 2,
        overdueTasks: 0,
        nextDeadline: '2024-02-20',
        serviceType: 'Data Science',
        tags: ['analytics', 'dashboard', 'data-visualization'],
        createdAt: '2024-01-05',
        contractSigned: true,
        paymentStatus: 'pending'
      }
    ];
  };

  const calculateStats = (workspacesData) => {
    const total = workspacesData.length;
    const active = workspacesData.filter(w => w.status === 'active').length;
    const completed = workspacesData.filter(w => w.status === 'completed').length;
    const pending = workspacesData.filter(w => w.status === 'pending').length;
    const totalBudget = workspacesData.reduce((sum, w) => sum + (w.budget || 0), 0);
    const totalSpent = workspacesData.reduce((sum, w) => sum + (w.spent || 0), 0);
    const overdue = workspacesData.filter(w => w.overdueTasks > 0).length;

    setStats({
      total,
      active,
      completed,
      pending,
      totalBudget,
      totalSpent,
      overdue
    });
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && workspace.status === 'active';
    if (filter === 'completed') return matchesSearch && workspace.status === 'completed';
    if (filter === 'pending') return matchesSearch && workspace.status === 'pending';
    if (filter === 'overdue') return matchesSearch && workspace.overdueTasks > 0;
    if (filter === 'unsigned') return matchesSearch && !workspace.contractSigned;
    
    return matchesSearch;
  });

  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt);
      case 'progress':
        return b.progress - a.progress;
      case 'deadline':
        return new Date(a.nextDeadline || a.endDate) - new Date(b.nextDeadline || b.endDate);
      case 'budget':
        return b.budget - a.budget;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'completed': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleWorkspaceClick = (workspaceId, workspaceTitle) => {
    console.log('📍 Client Workspace Card Clicked!');
    console.log('Workspace ID:', workspaceId);
    console.log('Workspace Title:', workspaceTitle);
    navigate(`/client/workspace/${workspaceId}`);
  };

  const handleCreateWorkspace = () => {
    navigate('/client/projects/create');
  };

  const handleExportData = () => {
    // Export workspaces data as CSV
    const csvContent = [
      ['Title', 'Freelancer', 'Status', 'Progress', 'Budget', 'Spent', 'Start Date', 'End Date'],
      ...workspaces.map(w => [
        w.title,
        w.freelancerName,
        w.status,
        `${w.progress}%`,
        `$${w.budget}`,
        `$${w.spent}`,
        formatDate(w.startDate),
        formatDate(w.endDate)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspaces_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    fetchWorkspaces();
  };

  if (loading) {
    return (
      <div className="client-workspace-list-loading">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
        </div>
        <p>Loading your workspaces...</p>
      </div>
    );
  }

  return (
    <div className="client-workspace-list">
      {/* Header Section */}
      <header className="workspace-list-header">
        <div className="header-content">
          <h1>My Workspaces</h1>
          <p>Manage all your active projects and collaborations</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreateWorkspace}>
            <FaPlus /> Create New Project
          </button>
          <button className="btn-outline" onClick={handleExportData}>
            <FaDownload /> Export Data
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaFolderOpen />
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Workspaces</p>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>{stats.active}</h3>
              <p>Active Projects</p>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>{stats.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card budget">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <h3>{formatCurrency(stats.totalBudget)}</h3>
              <p>Total Budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search workspaces by title, freelancer, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Filter by:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active ({stats.active})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({stats.pending})
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({stats.completed})
              </button>
              <button
                className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                onClick={() => setFilter('overdue')}
              >
                Overdue ({stats.overdue})
              </button>
            </div>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="progress">Progress</option>
              <option value="deadline">Deadline</option>
              <option value="budget">Budget</option>
              <option value="name">Name</option>
            </select>
            <button className="refresh-btn" onClick={handleRefresh}>
              <FaSpinner className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Workspaces Grid */}
      {sortedWorkspaces.length === 0 ? (
        <div className="empty-state">
          <FaFolderOpen className="empty-icon" />
          <h3>No workspaces found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any workspaces yet'}
          </p>
          {!searchTerm && (
            <button className="btn-primary" onClick={handleCreateWorkspace}>
              <FaPlus /> Create Your First Workspace
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="workspaces-grid">
            {sortedWorkspaces.map((workspace) => {
              const statusColors = getStatusColor(workspace.status);
              
              return (
                <div
                  key={workspace._id}
                  className="workspace-card"
                  onClick={() => handleWorkspaceClick(workspace._id, workspace.title)}
                >
                  {/* Workspace Header */}
                  <div className="workspace-header">
                    <div className="workspace-title-section">
                      <h3>{workspace.title}</h3>
                      <div className="workspace-meta">
                        <span className="workspace-id">ID: {workspace.workspaceId}</span>
                        <span className={`status-badge ${statusColors.bg} ${statusColors.text}`}>
                          {workspace.status.charAt(0).toUpperCase() + workspace.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="workspace-actions">
                      <button className="action-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleWorkspaceClick(workspace._id, workspace.title);
                      }}>
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  {/* Workspace Description */}
                  <p className="workspace-description">{workspace.description}</p>

                  {/* Freelancer Info */}
                  <div className="freelancer-info">
                    <div className="freelancer-avatar">
                      {workspace.freelancerName.charAt(0)}
                    </div>
                    <div className="freelancer-details">
                      <h4>{workspace.freelancerName}</h4>
                      <div className="freelancer-rating">
                        <FaStar />
                        <span>{workspace.freelancerRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Project Progress</span>
                      <span>{workspace.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${getProgressColor(workspace.progress)}`}
                        style={{ width: `${workspace.progress}%` }}
                      ></div>
                    </div>
                    <div className="milestone-info">
                      <FaCheckCircle />
                      <span>{workspace.completedMilestones}/{workspace.milestones} milestones</span>
                    </div>
                  </div>

                  {/* Budget Info */}
                  <div className="budget-info">
                    <div className="budget-item">
                      <span>Budget:</span>
                      <strong>{formatCurrency(workspace.budget)}</strong>
                    </div>
                    <div className="budget-item">
                      <span>Spent:</span>
                      <strong>{formatCurrency(workspace.spent)}</strong>
                    </div>
                    <div className="budget-item">
                      <span>Remaining:</span>
                      <strong>{formatCurrency(workspace.budget - workspace.spent)}</strong>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div className="timeline-info">
                    <div className="timeline-item">
                      <FaRegCalendarCheck />
                      <span>Start: {formatDate(workspace.startDate)}</span>
                    </div>
                    <div className="timeline-item">
                      <FaRegClock />
                      <span>End: {formatDate(workspace.endDate)}</span>
                    </div>
                    {workspace.nextDeadline && (
                      <div className="timeline-item deadline">
                        <FaClock />
                        <span>Next: {formatDate(workspace.nextDeadline)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="tags-container">
                    {workspace.tags?.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="workspace-footer">
                    <span className="last-activity">
                      Last activity: {formatDate(workspace.lastActivity)}
                    </span>
                    {workspace.overdueTasks > 0 && (
                      <span className="overdue-badge">
                        <FaExclamationTriangle /> {workspace.overdueTasks} overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Info */}
          <div className="pagination-info">
            <p>Showing {sortedWorkspaces.length} of {workspaces.length} workspaces</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientWorkspaceList;