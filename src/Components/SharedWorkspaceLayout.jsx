import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { workspaceAPI } from '../Service/api';
import {
  MessageSquare,
  FileText,
  CheckCircle,
  Calendar,
  Clock,
  DollarSign,
  Settings,
  Upload,
  Video,
  Users,
  Bell,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  BarChart,
  PieChart
} from 'lucide-react';

const SharedWorkspaceLayout = ({
  children,
  roleSpecificComponents = {},
  additionalTabs = [],
  workspaceTitle,
  workspaceDescription,
  customHeaderActions,

}) => {
  const { workspaceId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    messages: 0,
    files: 0,
    milestones: 0,
    progress: 0
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Shared tabs for both roles
  const sharedTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: unreadCount },
    { id: 'milestones', label: 'Milestones', icon: <CheckCircle size={18} />, badge: stats.milestones },
    { id: 'files', label: 'Files', icon: <FileText size={18} />, badge: stats.files },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'reports', label: 'Reports', icon: <PieChart size={18} /> },
    { id: 'overview', label: 'Overview', icon: <BarChart size={18} /> },
  ];

  // Role-specific tabs
  const roleTabs = role === 'client'
    ? [
      { id: 'client-notes', label: 'Private Notes', icon: <EyeOff size={18} /> },
      { id: 'budget', label: 'Budget & Payments', icon: <DollarSign size={18} /> },
      { id: 'approvals', label: 'Approvals', icon: <Check size={18} /> }
    ]
    : [
      { id: 'freelancer-notes', label: 'Private Notes', icon: <EyeOff size={18} /> },
      { id: 'earnings', label: 'Earnings', icon: <TrendingUp size={18} /> },
      { id: 'submissions', label: 'Submissions', icon: <Upload size={18} /> },
      { id: 'time-tracking', label: 'Time Tracking', icon: <Clock size={18} /> }
    ];

  const allTabs = [...sharedTabs, ...roleTabs, ...additionalTabs];

  useEffect(() => {
    fetchWorkspaceData();
    setupWebSocket();
  }, [workspaceId]);

  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'messages') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [workspace?.sharedMessages, activeTab]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = role === 'client'
        ? `/workspace/client/${workspaceId}`
        : `/workspace/freelancer/${workspaceId}`;

      const response = await workspaceAPI.get(endpoint);

      if (response.data.success) {
        setWorkspace(response.data.workspace);
        calculateStats(response.data.workspace);

        // Calculate unread messages
        const unread = response.data.workspace.sharedMessages?.filter(
          msg => !msg.readBy?.includes(user._id)
        ).length || 0;
        setUnreadCount(unread);
      } else {
        throw new Error(response.data.message || 'Failed to fetch workspace');
      }
    } catch (err) {
      console.error('Error fetching workspace:', err);
      setError(err.message || 'Failed to load workspace');

      // Auto-retry after 5 seconds
      setTimeout(() => {
        if (workspaceId) {
          fetchWorkspaceData();
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // TODO: Setup WebSocket connection for real-time updates
    // This would connect to your socket.io server
    console.log('Setting up WebSocket for workspace:', workspaceId);
  };

  const calculateStats = (workspaceData) => {
    const messages = workspaceData.sharedMessages?.length || 0;
    const files = workspaceData.sharedFiles?.length || 0;
    const milestones = workspaceData.sharedMilestones?.length || 0;
    const progress = workspaceData.overallProgress || 0;

    setStats({ messages, files, milestones, progress });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await workspaceAPI.post(`/workspace/${workspaceId}/shared/messages`, {
        content: newMessage,
        messageType: 'text'
      });

      if (response.data.success) {
        setNewMessage('');
        fetchWorkspaceData(); // Refresh messages
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingFile(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('originalName', file.name);
      formData.append('fileSize', file.size);
      formData.append('fileType', file.type);
      formData.append('description', `Uploaded by ${user.name}`);

      const response = await workspaceAPI.post(
        `/workspace/${workspaceId}/shared/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setShowFileUpload(false);
        setSelectedFile(null);
        fetchWorkspaceData();
        alert('File uploaded successfully!');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--success)';
      case 'completed': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'in_progress': return 'var(--primary)';
      case 'awaiting_approval': return 'var(--info)';
      case 'cancelled': return 'var(--danger)';
      default: return 'var(--gray-500)';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'var(--danger)';
    if (progress < 70) return 'var(--warning)';
    return 'var(--success)';
  };

  const renderLoading = () => (
    <div className="workspace-loading">
      <div className="loading-spinner"></div>
      <p>Loading workspace...</p>
    </div>
  );

  const renderError = () => (
    <div className="workspace-error">
      <AlertCircle size={48} />
      <h3>Failed to load workspace</h3>
      <p>{error}</p>
      <button
        className="btn-primary"
        onClick={fetchWorkspaceData}
      >
        Retry
      </button>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!workspace) return renderError();

  return (
    <div className={`workspace-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="workspace-sidebar">
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <ChevronRight size={20} />
          </button>
          {!isSidebarCollapsed && (
            <div className="workspace-info">
              <h3>{workspace.title}</h3>
              <span className={`status-badge status-${workspace.status}`}>
                {workspace.status}
              </span>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <>
            {/* Progress Section */}
            <div className="progress-section">
              <div className="progress-header">
                <span>Overall Progress</span>
                <span className="progress-percent">{workspace.overallProgress}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${workspace.overallProgress}%`,
                    backgroundColor: getProgressColor(workspace.overallProgress)
                  }}
                ></div>
              </div>
              <div className="progress-stats">
                <div className="stat-item">
                  <Clock size={14} />
                  <span>Current Phase: {workspace.currentPhase}</span>
                </div>
                {role === 'client' && workspace.privateData?.budgetTracking && (
                  <div className="stat-item">
                    <DollarSign size={14} />
                    <span>Budget: ${workspace.privateData.budgetTracking.totalBudget}</span>
                  </div>
                )}
                {role === 'freelancer' && workspace.privateData?.earningsTracking && (
                  <div className="stat-item">
                    <TrendingUp size={14} />
                    <span>Earned: ${workspace.privateData.earningsTracking.totalEarned}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h4>Quick Actions</h4>
              <button
                className="action-btn"
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare size={16} />
                <span>New Message</span>
              </button>
              <button
                className="action-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload File</span>
              </button>
              <button
                className="action-btn"
                onClick={() => setActiveTab('calendar')}
              >
                <Video size={16} />
                <span>Schedule Call</span>
              </button>
              {role === 'client' && (
                <button
                  className="action-btn"
                  onClick={() => setActiveTab('budget')}
                >
                  <DollarSign size={16} />
                  <span>Make Payment</span>
                </button>
              )}
            </div>

            {/* Participants */}
            <div className="participants-section">
              <h4>Participants</h4>
              <div className="participant-list">
                <div className="participant-item client">
                  <div className="participant-avatar">
                    {workspace.clientName?.charAt(0) || 'C'}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">
                      {workspace.clientName || 'Client'}
                    </span>
                    <span className="participant-role">Client</span>
                  </div>
                </div>
                <div className="participant-item freelancer">
                  <div className="participant-avatar">
                    {workspace.freelancerName?.charAt(0) || 'F'}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">
                      {workspace.freelancerName || 'Freelancer'}
                    </span>
                    <span className="participant-role">Freelancer</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="workspace-main">
        {/* Header */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumb">
              <Link to={role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'}>
                Dashboard
              </Link>
              <ChevronRight size={16} />
              <Link to={role === 'client' ? '/client/workspaces' : '/freelancer/workspaces'}>
                Workspaces
              </Link>
              <ChevronRight size={16} />
              <span className="current">{workspace.title}</span>
            </div>
            <h1>{workspaceTitle || workspace.title}</h1>
            {workspaceDescription && (
              <p className="workspace-description">{workspaceDescription}</p>
            )}
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button className="header-btn" title="Search">
                <Search size={20} />
              </button>
              <button className="header-btn" title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <button className="header-btn" title="Settings">
                <Settings size={20} />
              </button>
            </div>
            {customHeaderActions}
          </div>
        </header>

        {/* Tabs */}
        <nav className="workspace-tabs">
          {allTabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="workspace-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && isFreelancer && workspaceId && (
            <WorkspaceOverview workspaceId={workspaceId} />
          )}
          {/* <div className="overview-tab">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <MessageSquare size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.messages}</h3>
                  <p>Messages</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.files}</h3>
                  <p>Files Shared</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.milestones}</h3>
                  <p>Milestones</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.progress}%</h3>
                  <p>Progress</p>
                </div>
              </div>
            </div>

            <div className="overview-sections">
              <div className="section recent-messages">
                <h2>Recent Messages</h2>
                <div className="messages-preview">
                  {workspace.sharedMessages?.slice(0, 3).map(message => (
                    <div key={message.messageId} className="message-preview">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.senderRole === 'client' ? 'Client' : 'Freelancer'}
                        </span>
                        <span className="message-time">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="message-content-preview">
                        {message.content.length > 100
                          ? `${message.content.substring(0, 100)}...`
                          : message.content}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  className="btn-text"
                  onClick={() => setActiveTab('messages')}
                >
                  View All Messages
                </button>
              </div>

              <div className="section upcoming-milestones">
                <h2>Upcoming Milestones</h2>
                <div className="milestones-preview">
                  {workspace.sharedMilestones
                    ?.filter(m => m.status === 'pending' || m.status === 'in_progress')
                    .slice(0, 3)
                    .map(milestone => (
                      <div key={milestone.milestoneId} className="milestone-preview">
                        <div className="milestone-header">
                          <h4>{milestone.title}</h4>
                          <span
                            className="status-tag"
                            style={{ backgroundColor: getStatusColor(milestone.status) }}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="milestone-due">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                        <p className="milestone-amount">${milestone.amount}</p>
                      </div>
                    ))}
                </div>
                <button
                  className="btn-text"
                  onClick={() => setActiveTab('milestones')}
                >
                  View All Milestones
                </button>
              </div>
            </div>
          </div>
           */}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="messages-tab">
              <div className="messages-header">
                <h2>Messages</h2>
                <div className="messages-actions">
                  <button className="btn-icon" title="Mark all as read">
                    <Check size={18} />
                  </button>
                  <button className="btn-icon" title="Clear chat">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="messages-container">
                {workspace.sharedMessages?.length > 0 ? (
                  workspace.sharedMessages.map(message => (
                    <div
                      key={message.messageId}
                      className={`message-bubble ${message.senderRole === role ? 'sent' : 'received'} ${!message.readBy?.includes(user._id) ? 'unread' : ''
                        }`}
                    >
                      <div className="message-avatar">
                        {message.senderRole.charAt(0).toUpperCase()}
                      </div>
                      <div className="message-content">
                        <div className="message-meta">
                          <span className="message-sender">
                            {message.senderRole === 'client' ? 'Client' : 'Freelancer'}
                          </span>
                          <span className="message-time">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <div className="message-text">{message.content}</div>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="message-attachments">
                            {message.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment}
                                className="attachment-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText size={14} />
                                Attachment {index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <MessageSquare size={48} />
                    <h3>No messages yet</h3>
                    <p>Start the conversation by sending a message</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <div className="input-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} />
                  </button>
                  <button type="button" className="btn-icon">
                    <Video size={20} />
                  </button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows="3"
                  className="message-textarea"
                />
                <button
                  type="submit"
                  className="btn-primary send-btn"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="milestones-tab">
              <div className="milestones-header">
                <h2>Milestones</h2>
                <div className="milestone-summary">
                  <div className="summary-item">
                    <span className="summary-label">Completed</span>
                    <span className="summary-value">
                      {workspace.sharedMilestones?.filter(m => m.status === 'completed').length || 0}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">In Progress</span>
                    <span className="summary-value">
                      {workspace.sharedMilestones?.filter(m => m.status === 'in_progress').length || 0}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Pending</span>
                    <span className="summary-value">
                      {workspace.sharedMilestones?.filter(m => m.status === 'pending').length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="milestones-list">
                {workspace.sharedMilestones?.length > 0 ? (
                  workspace.sharedMilestones.map(milestone => (
                    <div key={milestone.milestoneId} className="milestone-card">
                      <div className="milestone-header">
                        <div className="milestone-info">
                          <h3>{milestone.title}</h3>
                          <p className="milestone-description">{milestone.description}</p>
                        </div>
                        <div className="milestone-status">
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(milestone.status) }}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                          <span className="milestone-amount">${milestone.amount}</span>
                        </div>
                      </div>

                      <div className="milestone-details">
                        <div className="detail-item">
                          <span className="detail-label">Phase:</span>
                          <span className="detail-value">{milestone.phaseNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Due:</span>
                          <span className="detail-value">
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Deliverables:</span>
                          <span className="detail-value">
                            {milestone.deliverables?.join(', ') || 'None specified'}
                          </span>
                        </div>
                      </div>

                      <div className="milestone-actions">
                        {role === 'freelancer' && milestone.status === 'pending' && (
                          <button
                            className="btn-primary"
                            onClick={() => navigate(
                              `/freelancer/workspace/${workspaceId}/submit/${milestone.milestoneId}`
                            )}
                          >
                            Submit Work
                          </button>
                        )}
                        {role === 'client' && milestone.status === 'awaiting_approval' && (
                          <button
                            className="btn-success"
                            onClick={() => navigate(
                              `/client/workspace/${workspaceId}/approve/${milestone.milestoneId}`
                            )}
                          >
                            Review & Approve
                          </button>
                        )}
                        <button className="btn-outline">
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <CheckCircle size={48} />
                    <h3>No milestones yet</h3>
                    <p>Milestones will appear here once added to the contract</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="files-tab">
              <div className="files-header">
                <h2>Shared Files</h2>
                <div className="files-actions">
                  <button
                    className="btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={18} />
                    Upload File
                  </button>
                  <button className="btn-outline">
                    <Download size={18} />
                    Download All
                  </button>
                </div>
              </div>

              <div className="files-list">
                {workspace.sharedFiles?.length > 0 ? (
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Uploaded By</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspace.sharedFiles.map(file => (
                        <tr key={file.fileId}>
                          <td>
                            <div className="file-info">
                              <FileText size={16} />
                              <span className="file-name">{file.filename}</span>
                            </div>
                          </td>
                          <td>{file.fileType}</td>
                          <td>{(file.fileSize / 1024).toFixed(2)} KB</td>
                          <td>{file.uploadedBy?.name || 'Unknown'}</td>
                          <td>{formatDate(file.uploadDate)}</td>
                          <td>
                            <div className="file-actions">
                              <button className="btn-icon">
                                <Eye size={16} />
                              </button>
                              <button className="btn-icon">
                                <Download size={16} />
                              </button>
                              <button className="btn-icon">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <h3>No files shared yet</h3>
                    <p>Upload files to share with the other participant</p>
                    <button
                      className="btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload First File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role-specific tabs */}
          {activeTab === 'client-notes' && roleSpecificComponents.clientNotes}
          {activeTab === 'freelancer-notes' && roleSpecificComponents.freelancerNotes}
          {activeTab === 'budget' && roleSpecificComponents.budget}
          {activeTab === 'earnings' && roleSpecificComponents.earnings}
          {activeTab === 'submissions' && roleSpecificComponents.submissions}
          {activeTab === 'approvals' && roleSpecificComponents.approvals}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="calendar-tab">
              <h2>Calendar & Video Calls</h2>
              {/* Calendar implementation would go here */}
              <p>Calendar view coming soon...</p>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-tab">
              <h2>Reports & Analytics</h2>
              {/* Reports implementation would go here */}
              <p>Reports view coming soon...</p>
            </div>
          )}

          {/* Additional custom tabs */}
          {additionalTabs.map(tab =>
            activeTab === tab.id && tab.component
          )}

          {/* Children content */}
          {children}
        </main>

        {/* Status Bar */}
        <footer className="workspace-footer">
          <div className="footer-left">
            <span className="last-sync">
              Last synced: {formatDate(new Date())}
            </span>
          </div>
          <div className="footer-right">
            <span className="connection-status connected">
              ● Connected
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SharedWorkspaceLayout;