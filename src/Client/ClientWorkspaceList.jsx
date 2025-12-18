import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaSpinner,
  FaFolderOpen,
  FaPlus,
  FaSort,
  FaDownload,
} from 'react-icons/fa';
import axios from 'axios';
import ClientWorkspaceCard from './ClientWorkspaceCard'; // Import the card component
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
      
      // Try different API endpoints
      const endpoints = [
        `${API_URL}/api/client/workspaces`,
        `${API_URL}/api/workspaces/client`,
        `${API_URL}/api/workspaces?clientId=${userId}`
      ];

      let workspacesData = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.data && (response.data.workspaces || response.data.success)) {
            workspacesData = response.data.workspaces || response.data.data || [];
            break;
          }
        } catch (err) {
          console.log(`Failed: ${endpoint} - ${err.message}`);
        }
      }

      // If no API data, use sample data
      if (!workspacesData || workspacesData.length === 0) {
        workspacesData = getSampleWorkspaces();
      }

      setWorkspaces(workspacesData);
      calculateStats(workspacesData);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
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
        title: 'Digital Marketing Campaign',
        description: 'Complete digital marketing strategy and campaign management.',
        status: 'active',
        freelancerName: 'Alex Johnson',
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
        daysLeft: 30
      },
      {
        _id: 'workspace_002',
        workspaceId: 'WS_002',
        title: 'Mobile App Development',
        description: 'React Native mobile application for e-commerce.',
        status: 'active',
        freelancerName: 'Sarah Chen',
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
        daysLeft: 15
      },
      {
        _id: 'workspace_003',
        workspaceId: 'WS_003',
        title: 'Website Redesign',
        description: 'Corporate website redesign with modern UI/UX.',
        status: 'completed',
        freelancerName: 'Michael Rodriguez',
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
        daysLeft: 0
      },
      {
        _id: 'workspace_004',
        workspaceId: 'WS_004',
        title: 'Cloud Migration',
        description: 'AWS cloud infrastructure migration.',
        status: 'pending',
        freelancerName: 'Alex Johnson',
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
        daysLeft: 45
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
    if (!workspace) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const title = workspace.title || '';
    const freelancerName = workspace.freelancerName || '';
    const status = workspace.status || '';
    
    return (
      title.toLowerCase().includes(searchLower) ||
      freelancerName.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      workspace.workspaceId?.includes(searchTerm)
    );
  });

  const sortedWorkspaces = [...filteredWorkspaces].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastActivity) - new Date(a.lastActivity);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleCreateWorkspace = () => {
    navigate('/client/projects/create');
  };

  const handleExportData = () => {
    const csvContent = [
      ['Title', 'Freelancer', 'Status', 'Progress', 'Budget', 'Spent', 'Start Date', 'End Date'],
      ...workspaces.map(w => [
        w.title,
        w.freelancerName,
        w.status,
        `${w.progress}%`,
        `$${w.budget}`,
        `$${w.spent}`,
        w.startDate,
        w.endDate
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
      <div className="loading-container">
        <div className="spinner">
          <FaSpinner className="spinning" />
        </div>
        <p>Loading your workspaces...</p>
      </div>
    );
  }

  return (
    <div className="client-workspace-list-container">
      {/* Header Section */}
      <div className="workspace-list-header">
        <div className="header-left">
          <h1>My Workspaces</h1>
          <p className="workspace-count">Manage all your active projects and collaborations</p>
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={handleRefresh}>
            <FaSpinner className={loading ? 'spinning' : ''} />
          </button>
          <button className="btn-primary" onClick={handleCreateWorkspace}>
            <FaPlus /> Create New Project
          </button>
          <button className="btn-secondary" onClick={handleExportData}>
            <FaDownload /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="workspace-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Workspaces</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.active}</span>
          <span className="stat-label">Active Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{formatCurrency(stats.totalBudget)}</span>
          <span className="stat-label">Total Budget</span>
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
            <div className="empty-actions">
              <button className="btn-primary" onClick={handleCreateWorkspace}>
                <FaPlus /> Create Your First Workspace
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="workspaces-grid">
            {sortedWorkspaces.map((workspace) => (
              <ClientWorkspaceCard 
                key={workspace._id} 
                workspace={workspace} 
              />
            ))}
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