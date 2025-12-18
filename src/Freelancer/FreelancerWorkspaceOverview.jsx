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
  Target,
  Loader2,
  AlertTriangle,
  FileUp,
  Plus,
  Phone,
  Share2,
  Zap,
  FileCheck,
  CalendarCheck
} from 'lucide-react';
import './FreelancerWorkspaceOverview.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FreelancerWorkspaceOverview = ({ workspaceData, loading, onRefresh, workspaceId }) => {
  const { workspace, userProfile, clientProfile, stats } = workspaceData || {};
  
  const [localStats, setLocalStats] = useState({
    progress: 0,
    earnings: { total: 0, paid: 0, pending: 0, upcoming: 0 },
    milestones: { total: 0, completed: 0, inProgress: 0, pending: 0 },
    messages: { total: 0, unread: 0 },
    files: { total: 0, recent: [] },
    recentActivity: [],
    timeTracking: { totalHours: 0, avgHours: 0 }
  });

  const [refreshing, setRefreshing] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [showWorkspaceId, setShowWorkspaceId] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchRealTimeData();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (stats && workspace) {
      updateStatsFromProps();
    }
  }, [stats, workspace]);

  const updateStatsFromProps = () => {
    if (!stats || !workspace) return;

    const allMilestones = workspace.sharedMilestones || [];
    const completedMilestones = allMilestones.filter(m => 
      ['completed', 'approved', 'paid'].includes(m?.status)
    ).length;
    
    const inProgressMilestones = allMilestones.filter(m => 
      ['in_progress', 'in-progress', 'started'].includes(m?.status)
    ).length;
    
    const pendingMilestones = allMilestones.filter(m => 
      ['pending', 'not_started'].includes(m?.status)
    ).length;

    const totalEarnings = allMilestones
      .filter(m => ['completed', 'approved', 'paid'].includes(m?.status))
      .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

    const pendingEarnings = allMilestones
      .filter(m => ['awaiting_approval', 'submitted', 'review'].includes(m?.status))
      .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

    const upcomingEarnings = allMilestones
      .filter(m => ['pending', 'in_progress'].includes(m?.status))
      .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

    const progress = allMilestones.length > 0
      ? Math.round((completedMilestones / allMilestones.length) * 100)
      : 0;

    setLocalStats(prev => ({
      ...prev,
      progress: stats.progress || progress,
      earnings: {
        total: stats.earnings?.total || totalEarnings,
        paid: stats.earnings?.total || totalEarnings,
        pending: stats.earnings?.pending || pendingEarnings,
        upcoming: stats.earnings?.upcoming || upcomingEarnings
      },
      milestones: {
        total: stats.milestones?.total || allMilestones.length,
        completed: stats.milestones?.completed || completedMilestones,
        inProgress: stats.milestones?.inProgress || inProgressMilestones,
        pending: stats.milestones?.pending || pendingMilestones
      },
      messages: {
        total: stats.messages?.total || workspace.sharedMessages?.length || 0,
        unread: stats.messages?.unread || 0
      },
      files: {
        total: stats.files?.total || workspace.sharedFiles?.length || 0,
        recent: stats.files?.recent || (workspace.sharedFiles || []).slice(0, 3)
      }
    }));

    setMilestones(allMilestones);
  };

  const fetchRealTimeData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_URL}/api/freelancer/workspaces/${workspaceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.workspace || response.data) {
        const workspaceData = response.data.workspace || response.data;
        
        const allMilestones = workspaceData.sharedMilestones || [];
        const messages = workspaceData.sharedMessages || [];
        const files = workspaceData.sharedFiles || [];
        
        const completedMilestones = allMilestones.filter(m => 
          ['completed', 'approved', 'paid'].includes(m?.status)
        ).length;
        
        const totalEarnings = allMilestones
          .filter(m => ['completed', 'approved', 'paid'].includes(m?.status))
          .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

        const pendingEarnings = allMilestones
          .filter(m => ['awaiting_approval', 'submitted', 'review'].includes(m?.status))
          .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

        const upcomingEarnings = allMilestones
          .filter(m => ['pending', 'in_progress'].includes(m?.status))
          .reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);

        const progress = allMilestones.length > 0
          ? Math.round((completedMilestones / allMilestones.length) * 100)
          : 0;

        const unreadMessages = messages.filter(msg => 
          msg && msg.senderRole === 'client' && 
          (!msg.readBy || !msg.readBy.includes('freelancer'))
        ).length;

        const recentActivity = generateRecentActivity(workspaceData);

        setLocalStats({
          progress,
          earnings: {
            total: totalEarnings,
            paid: totalEarnings,
            pending: pendingEarnings,
            upcoming: upcomingEarnings
          },
          milestones: {
            total: allMilestones.length,
            completed: completedMilestones,
            inProgress: allMilestones.filter(m => 
              ['in_progress', 'in-progress', 'started'].includes(m?.status)
            ).length,
            pending: allMilestones.filter(m => 
              ['pending', 'not_started'].includes(m?.status)
            ).length
          },
          messages: {
            total: messages.length,
            unread: unreadMessages
          },
          files: {
            total: files.length,
            recent: files.slice(0, 3)
          },
          recentActivity,
          timeTracking: {
            totalHours: calculateTotalHours(workspaceData),
            avgHours: calculateAvgHours(workspaceData)
          }
        });

        setMilestones(allMilestones);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTotalHours = (workspaceData) => {
    const allMilestones = workspaceData.sharedMilestones || [];
    return allMilestones.length * 8;
  };

  const calculateAvgHours = (workspaceData) => {
    const totalHours = calculateTotalHours(workspaceData);
    const startDate = new Date(workspaceData.startDate || new Date());
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    return Math.round(totalHours / daysDiff) || 0;
  };

  const generateRecentActivity = (workspaceData) => {
    const activities = [];
    const now = new Date();

    (workspaceData.sharedMilestones || []).forEach(milestone => {
      if (milestone && milestone.status === 'completed' && milestone.completedDate) {
        const completedDate = new Date(milestone.completedDate);
        if ((now - completedDate) <= (7 * 24 * 60 * 60 * 1000)) {
          activities.push({
            type: 'milestone',
            description: `Milestone "${milestone.title || 'Untitled'}" was completed`,
            timestamp: milestone.completedDate,
            icon: <CheckCircle size={14} />
          });
        }
      }
    });

    (workspaceData.sharedFiles || []).forEach(file => {
      if (file && file.uploadDate) {
        const uploadDate = new Date(file.uploadDate);
        if ((now - uploadDate) <= (7 * 24 * 60 * 60 * 1000)) {
          activities.push({
            type: 'file',
            description: `${file.uploadedBy?.name || 'Someone'} uploaded "${file.originalName || file.name || 'File'}"`,
            timestamp: file.uploadDate,
            icon: <FileText size={14} />
          });
        }
      }
    });

    (workspaceData.sharedMessages || []).forEach(message => {
      if (message && message.timestamp) {
        const messageDate = new Date(message.timestamp);
        if ((now - messageDate) <= (24 * 60 * 60 * 1000)) {
          activities.push({
            type: 'message',
            description: `${message.senderName || 'Someone'} sent a message`,
            timestamp: message.timestamp,
            icon: <MessageSquare size={14} />
          });
        }
      }
    });

    return activities
      .filter(activity => activity && activity.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const getQuickActions = () => {
    const actions = [];
    if (!workspaceId) return actions;

    const pendingMilestone = milestones.find(m => 
      m && (m.status === 'in_progress' || m.status === 'pending')
    );

    actions.push(
      {
        id: 'upload-file',
        label: 'Upload File',
        icon: <Upload size={18} />,
        path: `/freelancer/workspace/${workspaceId}?tab=files`,
        color: 'blue',
        description: 'Share documents with client'
      },
      {
        id: 'message-client',
        label: 'Message Client',
        icon: <MessageSquare size={18} />,
        path: `/freelancer/workspace/${workspaceId}?tab=messages`,
        color: 'green',
        description: 'Send quick message'
      },
      {
        id: 'schedule-call',
        label: 'Schedule Call',
        icon: <Video size={18} />,
        path: `/freelancer/workspace/${workspaceId}?tab=calls`,
        color: 'purple',
        description: 'Plan video meeting'
      }
    );

    if (pendingMilestone) {
      actions.unshift({
        id: 'submit-work',
        label: 'Submit Work',
        icon: <FileCheck size={18} />,
        path: `/freelancer/workspace/${workspaceId}?tab=milestones`,
        color: 'orange',
        description: pendingMilestone.title || 'Submit milestone work'
      });
    }

    actions.push({
      id: 'create-milestone',
      label: 'Add Milestone',
      icon: <Plus size={18} />,
      path: `/freelancer/workspace/${workspaceId}?tab=milestones`,
      color: 'indigo',
      description: 'Add new milestone'
    });

    return actions;
  };

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRealTimeData();
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !workspace) {
    return (
      <div className="overview-loading">
        <Loader2 size={32} className="spinning" />
        <p>Loading workspace overview...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="overview-error">
        <AlertTriangle size={48} />
        <h3>Unable to load workspace data</h3>
        <p>Please try refreshing the page</p>
        <button
          onClick={handleRefresh}
          className="btn-primary"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Retry'}
        </button>
      </div>
    );
  }

  const quickActions = getQuickActions();

  return (
    <div className="overview-wrapper"> {/* ADDED WRAPPER DIV */}
      <div className="workspace-overview">
        {/* Header - Compact */}
        <div className="overview-header">
          <div className="header-content">
            <div className="header-left">
              <div className="user-avatar-compact">
                {userProfile?.name?.charAt(0) || 
                 workspace?.freelancerName?.charAt(0) || 
                 workspaceData?.freelancer?.name?.charAt(0) || 'F'}
              </div>
              <div className="welcome-content">
                <h1>
                  Welcome back, <span>
                    {userProfile?.name || 
                     workspace?.freelancerName || 
                     workspaceData?.freelancer?.name || 'Freelancer'}
                  </span>
                </h1>
                <div className="project-info-mini">
                  <div className="client-tag">
                    <User size={12} />
                    <span>
                      Client: {clientProfile?.name || 
                              workspace?.clientName || 
                              workspaceData?.client?.name || 
                              workspace?.client?.name || 'Client'}
                    </span>
                  </div>
                  <span className={`status-badge ${workspace?.status || workspaceData?.status || 'active'}`}>
                    {(workspace?.status || workspaceData?.status || 'active').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="header-right">
              <button 
                className="id-toggle"
                onClick={() => setShowWorkspaceId(!showWorkspaceId)}
                title="Click to show/hide workspace ID"
              >
                <Share2 size={12} />
                <span>
                  ID: {showWorkspaceId ? 
                      (workspace?.workspaceId || workspaceId || workspaceData?.id || 'N/A') : 
                      '••••••••'}
                </span>
              </button>
              <button 
                className="header-action-btn"
                onClick={() => window.location.href = `/freelancer/workspace/${workspaceId}?tab=messages`}
              >
                <MessageSquare size={14} />
                Message
              </button>
              <button 
                className="header-action-btn primary"
                onClick={() => window.location.href = `/freelancer/workspace/${workspaceId}?tab=calls`}
              >
                <Phone size={14} />
                Schedule Call
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="quick-stats-section">
          <div className="quick-stats-grid">
            <div className="quick-stat-card">
              <div className="stat-icon-circle progress">
                <TrendingUp size={20} />
              </div>
              <div className="stat-content-compact">
                <span className="stat-figure">{localStats.progress}%</span>
                <span className="stat-label">Project Progress</span>
                <span className="stat-subtext">
                  {localStats.milestones.completed} of {localStats.milestones.total} milestones
                </span>
              </div>
            </div>
            
            <div className="quick-stat-card">
              <div className="stat-icon-circle earnings">
                <DollarSign size={20} />
              </div>
              <div className="stat-content-compact">
                <span className="stat-figure">{formatCurrency(localStats.earnings.total)}</span>
                <span className="stat-label">Total Earned</span>
                <span className="stat-subtext">
                  {formatCurrency(localStats.earnings.pending)} pending
                </span>
              </div>
            </div>
            
            <div className="quick-stat-card">
              <div className="stat-icon-circle milestones">
                <CheckCircle size={20} />
              </div>
              <div className="stat-content-compact">
                <span className="stat-figure">{localStats.milestones.completed}</span>
                <span className="stat-label">Completed</span>
                <span className="stat-subtext">
                  {localStats.milestones.inProgress} in progress
                </span>
              </div>
            </div>
            
            <div className="quick-stat-card">
              <div className="stat-icon-circle messages">
                <MessageSquare size={20} />
              </div>
              <div className="stat-content-compact">
                <span className="stat-figure">{localStats.messages.total}</span>
                <span className="stat-label">Messages</span>
                <span className="stat-subtext">
                  {localStats.messages.unread} unread
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="dashboard-layout">
          {/* Left Column */}
          <div className="left-column">
{/* Project Progress – Single Structured Card */}
<div className="card project-progress-card">

  {/* HEADER */}
  <div className="card-header">
    <h3>
      <BarChart3 size={18} />
      Project Progress – {workspace?.title || workspaceData?.title || 'Untitled Project'}
    </h3>

    <div className="card-header-actions">
      <span className="current-phase">
        Phase {workspace?.currentPhase || workspaceData?.currentPhase || 1}
      </span>
      <span className="progress-percent">
        {localStats.progress}% complete
      </span>
    </div>
  </div>

  {/* BODY */}
  <div className="card-body project-progress-body">

    {/* PROGRESS SECTION */}
    <section className="progress-main">
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${localStats.progress}%` }}
          >
            <div className="progress-markers">
              {milestones.map((milestone, index) => {
                const milestoneProgress =
                  (index + 1) * (100 / Math.max(milestones.length, 1));

                return (
                  <div
                    key={milestone?._id || index}
                    className="progress-marker"
                    style={{ left: `${Math.min(milestoneProgress, 100)}%` }}
                    title={`Phase ${milestone?.phaseNumber || index + 1}`}
                  >
                    <div className={`marker-dot ${milestone?.status || 'pending'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="progress-stats">
          <span className="progress-percentage">
            {localStats.progress}%
          </span>
          <span className="progress-text">
            {localStats.milestones.completed} of {localStats.milestones.total} milestones completed
          </span>
        </div>
      </div>
    </section>

    {/* TIMELINE STRIP */}
    <section className="timeline-strip">
      <div className="timeline-item">
        <span className="timeline-label">Start</span>
        <span className="timeline-value">
          {workspace?.startDate
            ? new Date(workspace.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Not set'}
        </span>
      </div>

      <div className="timeline-item">
        <span className="timeline-label">Due</span>
        <span className="timeline-value">
          {workspace?.estimatedEndDate
            ? new Date(workspace.estimatedEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Not set'}
        </span>
      </div>

      <div className="timeline-item">
        <span className="timeline-label">Budget</span>
        <span className="timeline-value">
          {formatCurrency(workspace?.totalBudget || 0)}
        </span>
      </div>

      <div className="timeline-item">
        <span className="timeline-label">Elapsed</span>
        <span className="timeline-value">
          {workspace?.startDate
            ? calculateTimeElapsed(workspace.startDate, workspace?.estimatedEndDate)
            : '—'}
        </span>
      </div>
    </section>

    {/* MILESTONE STATUS */}
    <section className="milestone-status">
      <h4>Milestone Status</h4>

      <div className="status-bars">
        {[
          { label: 'Completed', value: localStats.milestones.completed, type: 'completed' },
          { label: 'In Progress', value: localStats.milestones.inProgress, type: 'in-progress' },
          { label: 'Pending', value: localStats.milestones.pending, type: 'pending' }
        ].map((item) => (
          <div key={item.label} className={`status-bar ${item.type}`}>
            <div className="status-label">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="status-fill">
              <div
                className="status-fill-inner"
                style={{
                  width: `${(item.value / Math.max(localStats.milestones.total, 1)) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>

  </div>
</div>


            {/* Upcoming Milestones Card */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <CheckCircle size={18} />
                  Upcoming Milestones
                </h3>
                <Link
                  to={`/freelancer/workspace/${workspaceId}?tab=milestones`}
                  className="view-all-link"
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="card-body">
                <div className="upcoming-milestones">
                  {milestones
                    .filter(m => m && (m.status === 'pending' || m.status === 'in_progress' || m.status === 'in-progress'))
                    .slice(0, 3)
                    .map((milestone, index) => (
                      <div key={milestone._id || index} className="upcoming-milestone">
                        <div className="milestone-header">
                          <h4>{milestone.title || `Milestone ${milestone.phaseNumber || index + 1}`}</h4>
                          <span className="milestone-amount">{formatCurrency(milestone.amount || 0)}</span>
                        </div>
                        <div className="milestone-details">
                          <span className="due-date">
                            <Calendar size={12} />
                            {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            }) : 'No due date'}
                          </span>
                          <span className={`status-tag ${(milestone.status || 'pending').replace('_', '-')}`}>
                            {(milestone.status || 'pending').replace('_', ' ')}
                          </span>
                        </div>
                        {(milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'in-progress') && (
                          <Link
                            to={`/freelancer/workspace/${workspaceId}?tab=milestones`}
                            className="submit-work-btn"
                          >
                            <FileUp size={14} />
                            Work on this
                          </Link>
                        )}
                      </div>
                    ))}
                  
                  {milestones.filter(m => m && (m.status === 'pending' || m.status === 'in_progress' || m.status === 'in-progress')).length === 0 && (
                    <div className="empty-state">
                      <CheckCircle size={24} className="empty-state-icon" />
                      <p className="empty-state-text">No upcoming milestones</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Earnings Summary Card */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <DollarSign size={18} />
                  Earnings Summary
                </h3>
                <Link
                  to={`/freelancer/workspace/${workspaceId}?tab=earnings`}
                  className="view-all-link"
                >
                  View Details
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="card-body">
                <div className="earnings-summary">
                  <div className="earning-item">
                    <span className="earning-amount">{formatCurrency(localStats.earnings.total)}</span>
                    <span className="earning-label">Total Earned</span>
                  </div>
                  <div className="earning-item">
                    <span className="earning-amount">{formatCurrency(localStats.earnings.pending)}</span>
                    <span className="earning-label">Pending</span>
                  </div>
                  <div className="earning-item">
                    <span className="earning-amount">{formatCurrency(localStats.earnings.upcoming)}</span>
                    <span className="earning-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          {/* Right Column */}
          <div className="right-column">
            {/* Recent Activity Card */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <Activity size={18} />
                  Recent Activity
                </h3>
                <Link
                  to={`/freelancer/workspace/${workspaceId}?tab=activity`}
                  className="view-all-link"
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="card-body">
                <div className="activity-list">
                  {localStats.recentActivity.length === 0 ? (
                    <div className="empty-state">
                      <Activity size={24} className="empty-state-icon" />
                      <p className="empty-state-text">No recent activity</p>
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
            </div>

            {/* Files Card */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <FolderOpen size={18} />
                  Recent Files
                </h3>
                <Link
                  to={`/freelancer/workspace/${workspaceId}?tab=files`}
                  className="view-all-link"
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="card-body">
                <div className="files-list">
                  {localStats.files.recent.length === 0 ? (
                    <div className="empty-state">
                      <FileText size={24} className="empty-state-icon" />
                      <p className="empty-state-text">No files uploaded yet</p>
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
            </div>

           </div>
           </div>
        {/* Communication Card */}
        <div className="card">
          <div className="card-header">
            <h3>
              <MessageSquare size={18} />
              Client Communication
            </h3>
            <span className="client-name">
              {clientProfile?.name || workspace?.clientName || workspaceData?.client?.name || 'Client'}
            </span>
          </div>
          <div className="card-body">
            <div className="communication-grid">
              <div className="comm-item">
                <span className="comm-count">{localStats.messages.total}</span>
                <span className="comm-label">Total Messages</span>
              </div>
              <div className="comm-item">
                <span className="comm-count">{localStats.messages.unread}</span>
                <span className="comm-label">Unread</span>
              </div>
              <div className="comm-item">
                <span className="comm-count">{workspace?.upcomingCalls?.length || workspaceData?.upcomingCalls?.length || 0}</span>
                <span className="comm-label">Calls Scheduled</span>
              </div>
            </div>
            <div className="communication-actions">
              <Link
                to={`/freelancer/workspace/${workspaceId}?tab=messages`}
                className="btn-primary"
              >
                <MessageSquare size={16} />
                Go to Messages
              </Link>
              <Link
                to={`/freelancer/workspace/${workspaceId}?tab=calls`}
                className="btn-outline"
              >
                <Video size={16} />
                Schedule Call
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="workspace-footer">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-btn"
          >
            <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <div className="workspace-info">
            <span className="last-updated">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="workspace-id">
              Workspace ID: {workspace?.workspaceId || workspaceId || workspaceData?.id || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateTimeElapsed = (startDate, endDate) => {
  if (!startDate) return 'Not started';
  
  const start = new Date(startDate);
  const now = new Date();
  const end = endDate ? new Date(endDate) : null;
  
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (end && now > end) {
    const overdueDays = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
    return `${diffDays} days (${overdueDays} days overdue)`;
  }
  
  if (end) {
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return `${diffDays} of ${totalDays} days (${remainingDays} days left)`;
  }
  
  return `${diffDays} days`;
};

export default FreelancerWorkspaceOverview;
