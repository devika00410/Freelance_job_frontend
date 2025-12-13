import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  CheckCircle,
  Calendar,
  AlertCircle,
  Users,
  BarChart3,
  RefreshCw,
  ArrowRight,
  FolderOpen,
  Video,
  Bell,
  Activity,
  Upload,
  Download,
  Eye,
  User,
  Target
} from 'lucide-react';
import './FreelancerWorkspaceOverview.css';

const FreelancerWorkspaceOverview = ({ workspaceData, loading, onRefresh }) => {
  const { workspace, userProfile, clientProfile, stats } = workspaceData || {};
  
  // ============ STATE MANAGEMENT ============
  const [localStats, setLocalStats] = useState({
    progress: 0,
    earnings: { total: 0, pending: 0, upcoming: 0 },
    milestones: { total: 0, completed: 0, pending: 0 },
    messages: { total: 0, unread: 0 },
    files: { total: 0, recent: [] },
    recentActivity: []
  });

  // ============ DATA PROCESSING ============
  useEffect(() => {
    if (stats) {
      setLocalStats({
        ...localStats,
        ...stats,
        milestones: stats.milestones || { total: 0, completed: 0, pending: 0 },
        earnings: stats.earnings || { total: 0, pending: 0, upcoming: 0 },
        messages: stats.messages || { total: 0, unread: 0 },
        files: stats.files || { total: 0, recent: [] }
      });
    } else if (workspace) {
      calculateStatsFromWorkspace();
    }
  }, [workspace, stats]);

  const calculateStatsFromWorkspace = () => {
    if (!workspace) return;

    const milestones = Array.isArray(workspace.sharedMilestones) ? workspace.sharedMilestones : [];
    const messages = Array.isArray(workspace.sharedMessages) ? workspace.sharedMessages : [];
    const files = Array.isArray(workspace.sharedFiles) ? workspace.sharedFiles : [];
    
    const validMilestones = milestones.filter(m => m && m.status);
    
    const completedMilestones = validMilestones.filter(m =>
      ['completed', 'approved', 'paid'].includes(m.status)
    ).length;

    const pendingMilestones = validMilestones.filter(m =>
      ['in_progress', 'pending', 'awaiting_approval'].includes(m.status)
    ).length;

    const totalEarnings = validMilestones
      .filter(m => ['completed', 'approved', 'paid'].includes(m.status))
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    const pendingEarnings = validMilestones
      .filter(m => ['awaiting_approval', 'submitted'].includes(m.status))
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    const upcomingEarnings = validMilestones
      .filter(m => ['pending', 'in_progress'].includes(m.status))
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    const progress = validMilestones.length > 0
      ? Math.round((completedMilestones / validMilestones.length) * 100)
      : 0;

    const unreadMessages = messages.filter(m => 
      m && m.readBy && !m.readBy.includes('freelancer')
    ).length;

    setLocalStats({
      progress,
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        upcoming: upcomingEarnings
      },
      milestones: {
        total: validMilestones.length,
        completed: completedMilestones,
        pending: pendingMilestones
      },
      messages: {
        total: messages.length,
        unread: unreadMessages
      },
      files: {
        total: files.length,
        recent: files.filter(f => f).slice(0, 3)
      },
      recentActivity: generateRecentActivity(workspace)
    });
  };

  const generateRecentActivity = (workspace) => {
    const activities = [];

    (workspace.sharedMilestones || []).forEach(milestone => {
      if (milestone && milestone.status && (milestone.status === 'completed' || milestone.status === 'approved')) {
        activities.push({
          type: 'milestone',
          description: `Milestone "${milestone.title || 'Untitled'}" was ${milestone.status}`,
          timestamp: milestone.approvedDate || milestone.submissionDate || new Date(),
          icon: <CheckCircle size={14} />
        });
      }
    });

    (workspace.sharedFiles || []).slice(0, 2).forEach(file => {
      if (file && (file.originalName || file.name)) {
        activities.push({
          type: 'file',
          description: `Uploaded "${file.originalName || file.name || 'File'}"`,
          timestamp: file.uploadDate || file.createdAt || new Date(),
          icon: <FileText size={14} />
        });
      }
    });

    return activities
      .filter(activity => activity && activity.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const getQuickActions = () => {
    const actions = [];
    const workspaceId = workspace?._id || workspace?.workspaceId;

    if (!workspaceId) return actions;

    const pendingMilestone = (workspace.sharedMilestones || []).find(m => 
      m && (['in_progress', 'pending'].includes(m.status))
    );

    if (pendingMilestone) {
      actions.push({
        id: 'submit-work',
        label: 'Submit Work',
        icon: <Upload size={16} />,
        path: `/freelancer/workspace/${workspaceId}/submissions`,
        color: 'primary',
        description: pendingMilestone.title || 'Submit your work'
      });
    }

    actions.push(
      {
        id: 'upload-file',
        label: 'Upload File',
        icon: <FileText size={16} />,
        path: `/freelancer/workspace/${workspaceId}#files`,
        color: 'success',
        description: 'Share documents'
      },
      {
        id: 'message-client',
        label: 'Message Client',
        icon: <MessageSquare size={16} />,
        path: `/freelancer/workspace/${workspaceId}#messages`,
        color: 'info',
        description: 'Quick chat'
      },
      {
        id: 'track-progress',
        label: 'Track Progress',
        icon: <BarChart3 size={16} />,
        path: `/freelancer/workspace/${workspaceId}#progress`,
        color: 'warning',
        description: 'Update status'
      },
      {
        id: 'schedule-call',
        label: 'Schedule Call',
        icon: <Video size={16} />,
        path: `/freelancer/workspace/${workspaceId}#calls`,
        color: 'secondary',
        description: 'Video meeting'
      }
    );

    return actions;
  };

  // ============ HELPER FUNCTIONS ============
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const bytesNum = Number(bytes);
    if (isNaN(bytesNum)) return '0 B';
    if (bytesNum < 1024) return bytesNum + ' B';
    if (bytesNum < 1024 * 1024) return (bytesNum / 1024).toFixed(1) + ' KB';
    return (bytesNum / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ============ LOADING AND ERROR STATES ============
  if (loading && !workspace) {
    return (
      <div className="overview-loading">
        <RefreshCw size={24} className="spinning" />
        <p>Loading workspace overview...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="overview-error">
        <AlertCircle size={48} />
        <h3>Unable to load workspace data</h3>
        <p>Please try refreshing the page</p>
        <button
          onClick={onRefresh}
          className="btn-primary"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const workspaceId = workspace._id || workspace.workspaceId;
  const quickActions = getQuickActions();

  // ============ MAIN RENDER ============
  return (
    <div className="workspace-overview">
      {/* Header Section */}
      <div className="overview-header">
        <div className="welcome-section">
          <div className="user-greeting">
            <div className="avatar-large">
              {userProfile?.name?.charAt(0) || workspace.freelancerName?.charAt(0) || 'F'}
            </div>
            <div>
              <h1>Welcome back, {userProfile?.name || workspace.freelancerName || 'Freelancer'}</h1>
              <p className="project-title">
                <Target size={16} />
                {workspace.title || 'Untitled Project'}
              </p>
            </div>
          </div>
          <div className="project-meta">
            <span className="client-info">
              <User size={14} />
              Client: {clientProfile?.name || workspace.clientName || 'Client'}
            </span>
            <span className={`status-badge status-${workspace.status || 'active'}`}>
              {workspace.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{localStats.progress}%</span>
              <span className="stat-label">Overall Progress</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(localStats.earnings.total)}</span>
              <span className="stat-label">Total Earned</span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {localStats.milestones.completed}/{localStats.milestones.total}
              </span>
              <span className="stat-label">Milestones Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Main Content */}
        <div className="dashboard-left">
          {/* Progress Card */}
          <div className="card progress-card">
            <div className="card-header">
              <h3>
                <BarChart3 size={18} />
                Project Progress
              </h3>
              <span className="current-phase">Phase {(workspace.currentPhase || 1)}</span>
            </div>
            <div className="progress-section">
              <div className="progress-bar-large">
                <div
                  className="progress-fill"
                  style={{ width: `${localStats.progress}%` }}
                >
                  <span className="progress-text">{localStats.progress}% Complete</span>
                </div>
              </div>
              <div className="timeline-info">
                <div className="timeline-item">
                  <Calendar size={16} />
                  <div>
                    <span className="label">Start Date</span>
                    <span className="value">
                      {workspace.startDate ? new Date(workspace.startDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>
                <div className="timeline-item">
                  <Calendar size={16} />
                  <div>
                    <span className="label">Estimated Completion</span>
                    <span className="value">
                      {workspace.estimatedEndDate
                        ? new Date(workspace.estimatedEndDate).toLocaleDateString()
                        : 'Not set'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="card earnings-card">
            <div className="card-header">
              <h3>
                <DollarSign size={18} />
                Earnings Summary
              </h3>
              <Link
                to={`/freelancer/workspace/${workspaceId}#earnings`}
                className="view-all"
              >
                View Details
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="earnings-summary">
              <div className="earnings-item total">
                <div className="earnings-icon">
                  <DollarSign size={20} />
                </div>
                <div className="earnings-content">
                  <span className="label">Total Earned</span>
                  <span className="amount">{formatCurrency(localStats.earnings.total)}</span>
                </div>
              </div>
              <div className="earnings-item pending">
                <div className="earnings-icon">
                  <Clock size={20} />
                </div>
                <div className="earnings-content">
                  <span className="label">Pending Approval</span>
                  <span className="amount">{formatCurrency(localStats.earnings.pending)}</span>
                </div>
              </div>
              <div className="earnings-item upcoming">
                <div className="earnings-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="earnings-content">
                  <span className="label">Upcoming</span>
                  <span className="amount">{formatCurrency(localStats.earnings.upcoming)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card actions-card">
            <div className="card-header">
              <h3>
                <Activity size={18} />
                Quick Actions
              </h3>
            </div>
            <div className="actions-grid">
              {quickActions.map(action => (
                <Link
                  key={action.id}
                  to={action.path}
                  className={`action-button ${action.color}`}
                >
                  <div className="action-icon">
                    {action.icon}
                  </div>
                  <div className="action-content">
                    <span className="action-label">{action.label}</span>
                    <span className="action-description">{action.description}</span>
                  </div>
                  <ArrowRight size={16} className="action-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="dashboard-right">
          {/* Recent Activity Card */}
          <div className="card activity-card">
            <div className="card-header">
              <h3>
                <Bell size={18} />
                Recent Activity
              </h3>
              <Link
                to={`/freelancer/workspace/${workspaceId}#activity`}
                className="view-all"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="activity-list">
              {localStats.recentActivity.length === 0 ? (
                <div className="empty-activity">
                  <AlertCircle size={24} />
                  <p>No recent activity</p>
                </div>
              ) : (
                localStats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">{activity.description}</p>
                      <span className="activity-time">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Files Card */}
          <div className="card files-card">
            <div className="card-header">
              <h3>
                <FolderOpen size={18} />
                Recent Files
              </h3>
              <Link
                to={`/freelancer/workspace/${workspaceId}#files`}
                className="view-all"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="files-list">
              {localStats.files.recent.length === 0 ? (
                <div className="empty-files">
                  <FileText size={24} />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                localStats.files.recent.map((file, index) => {
                  if (!file) return null;
                  
                  const fileName = file.originalName || file.name || 'Unnamed File';
                  const displayName = fileName.length > 25
                    ? fileName.substring(0, 25) + '...'
                    : fileName;
                    
                  return (
                    <div key={index} className="file-item">
                      <div className="file-icon">
                        <FileText size={16} />
                      </div>
                      <div className="file-info">
                        <span className="file-name" title={fileName}>
                          {displayName}
                        </span>
                        <span className="file-meta">
                          {formatFileSize(file.fileSize)} • {formatDate(file.uploadDate)}
                        </span>
                      </div>
                      <div className="file-actions">
                        <button
                          className="file-action-btn"
                          onClick={() => {
                            const fileUrl = file.fileUrl || file.url;
                            if (fileUrl) {
                              window.open(fileUrl, '_blank');
                            } else {
                              alert('File URL not available');
                            }
                          }}
                          title="View file"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="file-action-btn"
                          onClick={() => {
                            const fileUrl = file.fileUrl || file.url;
                            if (fileUrl) {
                              const a = document.createElement('a');
                              a.href = fileUrl;
                              a.download = fileName;
                              a.click();
                            } else {
                              alert('File download not available');
                            }
                          }}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Milestone Status Card */}
          <div className="card milestones-card">
            <div className="card-header">
              <h3>
                <CheckCircle size={18} />
                Milestone Status
              </h3>
              <Link
                to={`/freelancer/workspace/${workspaceId}#milestones`}
                className="view-all"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="milestones-summary">
              <div className="milestone-stats">
                <div className="stat completed">
                  <span className="count">{localStats.milestones.completed}</span>
                  <span className="label">Completed</span>
                </div>
                <div className="stat in-progress">
                  <span className="count">{localStats.milestones.pending}</span>
                  <span className="label">In Progress</span>
                </div>
                <div className="stat total">
                  <span className="count">{localStats.milestones.total}</span>
                  <span className="label">Total</span>
                </div>
              </div>

              {(workspace.sharedMilestones || []).slice(0, 2).map((milestone, index) => {
                if (!milestone) return null;
                
                return (
                  <div key={milestone._id || `milestone-${index}`} className="milestone-preview">
                    <div className="milestone-header">
                      <h4>{milestone.title || `Milestone ${milestone.phaseNumber || index + 1}`}</h4>
                      <span className={`status-tag ${milestone.status || 'pending'}`}>
                        {(milestone.status || 'pending').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="milestone-details">
                      <span className="amount">{formatCurrency(milestone.amount || 0)}</span>
                      <span className="due-date">
                        Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                    {(milestone.status === 'in_progress' || milestone.status === 'pending') && (
                      <Link
                        to={`/freelancer/workspace/${workspaceId}/submissions`}
                        className="submit-btn"
                      >
                        <Upload size={14} /> Submit Work
                      </Link>
                    )}
                  </div>
                );
              })}

              {(!workspace.sharedMilestones || workspace.sharedMilestones.length === 0) && (
                <div className="empty-milestones">
                  <CheckCircle size={24} />
                  <p>No milestones yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Card */}
      <div className="communication-card card">
        <div className="card-header">
          <h3>
            <MessageSquare size={18} />
            Client Communication
          </h3>
        </div>
        <div className="communication-stats">
          <div className="comm-stat">
            <div className="stat-icon">
              <MessageSquare size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{localStats.messages.total}</span>
              <span className="stat-label">Total Messages</span>
            </div>
          </div>
          <div className="comm-stat">
            <div className="stat-icon unread">
              <Bell size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{localStats.messages.unread}</span>
              <span className="stat-label">Unread Messages</span>
            </div>
          </div>
          <div className="comm-stat">
            <div className="stat-icon">
              <Video size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {workspace.upcomingCalls?.length || 0}
              </span>
              <span className="stat-label">Upcoming Calls</span>
            </div>
          </div>
        </div>
        <div className="communication-actions">
          <Link
            to={`/freelancer/workspace/${workspaceId}#messages`}
            className="btn-primary"
          >
            <MessageSquare size={16} />
            Go to Messages
          </Link>
          <Link
            to={`/freelancer/workspace/${workspaceId}#calendar`}
            className="btn-outline"
          >
            <Video size={16} />
            Schedule Call
          </Link>
        </div>
      </div>

      {/* Refresh Section */}
      <div className="refresh-section">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="refresh-btn"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
        <span className="last-updated">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default FreelancerWorkspaceOverview;