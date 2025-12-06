import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaFolderOpen,
  FaCommentDots,
  FaCheckCircle,
  FaVideo,
  FaCalendarAlt,
  FaDollarSign,
  FaExclamationTriangle,
  FaUser,
  FaClock,
  FaFileAlt,
  FaImage,
  FaPalette,
  FaPlayCircle,
  FaPhone,
  FaUpload,
  FaEdit,
  FaDownload,
  FaEye,
  FaCreditCard,
  FaPaperPlane,
  FaCheck,
  FaSpinner,
  FaChartLine,
  FaMoneyBillWave,
  FaTasks
} from 'react-icons/fa';
import io from 'socket.io-client';
import './FreelancerWorkspace.css';

// Import API services
import {
  workspaceService,
  milestoneService,
  messageService,
  fileService,
  videoCallService,
  paymentService
} from '../Service/api';

const FreelancerWorkspace = () => {
  const { id: workspaceId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('project-overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectMilestones, setProjectMilestones] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');

  const chatEndRef = useRef(null);

  // Workspace information - initialized with null
  const [workspaceInfo, setWorkspaceInfo] = useState(null);

  // Fetch current user ID
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUserId(parsedUser._id || parsedUser.id);
    }
  }, []);
const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
  // Fetch all workspace data from backend
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!workspaceId) {
        setApiError('No workspace ID provided');
        setLoading(false);
        navigate('/freelancer/dashboard');
        return;
      }

      setLoading(true);
      setApiError(null);

      try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch workspace details
        const workspaceRes = await workspaceService.getWorkspaceById(workspaceId);
        if (!workspaceRes.success) {
          throw new Error(workspaceRes.message || 'Failed to fetch workspace');
        }

        const workspaceData = workspaceRes.data;
        setWorkspaceInfo({
          _id: workspaceData._id,
          projectTitle: workspaceData.projectTitle,
          clientName: workspaceData.client?.name || 'Client',
          freelancerName: workspaceData.freelancer?.name || 'Freelancer',
          clientId: workspaceData.client?._id,
          freelancerId: workspaceData.freelancer?._id,
          status: workspaceData.status,
          currentPhase: workspaceData.currentPhase || 1,
          overallProgress: workspaceData.progressPercentage || 0,
          startDate: workspaceData.startDate,
          estimatedEndDate: workspaceData.endDate,
          budget: workspaceData.budget,
          timeline: workspaceData.timeline,
          description: workspaceData.description
        });

        // Fetch milestones
        const milestonesRes = await milestoneService.getByWorkspace(workspaceId);
        if (milestonesRes.success) {
          setProjectMilestones(milestonesRes.data);
        }

        // Fetch messages
        const messagesRes = await messageService.getByWorkspace(workspaceId);
        if (messagesRes.success) {
          setChatMessages(messagesRes.data);
        }

        // Fetch files
        const filesRes = await fileService.getByWorkspace(workspaceId);
        if (filesRes.success) {
          setProjectFiles(filesRes.data);
        }

        // Fetch scheduled calls
        const callsRes = await videoCallService.getByWorkspace(workspaceId);
        if (callsRes.success) {
          setScheduledMeetings(callsRes.data);
        }

      } catch (error) {
        console.error('Error fetching workspace data:', error);
        setApiError(error.message || 'Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [workspaceId, navigate]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!workspaceInfo?._id) return;

    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Join workspace room
    newSocket.emit('join_workspace', workspaceInfo._id);

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      if (message.workspaceId === workspaceInfo._id) {
        setChatMessages(prev => [...prev, message]);
      }
    });

    // Online status listeners
    newSocket.on('user_online', (userId) => {
      if (workspaceInfo.clientId === userId) {
        setIsOnline(true);
      }
    });

    newSocket.on('user_offline', (userId) => {
      if (workspaceInfo.clientId === userId) {
        setIsOnline(false);
      }
    });

    return () => {
      newSocket.emit('leave_workspace', workspaceInfo._id);
      newSocket.disconnect();
    };
  }, [workspaceInfo]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Helper functions
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeDisplay = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFileTypeIcon = (fileType) => {
    const type = fileType?.toLowerCase() || 'document';
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt': return <FaFileAlt />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return <FaImage />;
      case 'fig':
      case 'ai':
      case 'psd':
      case 'sketch': return <FaPalette />;
      case 'mp4':
      case 'mov':
      case 'avi': return <FaPlayCircle />;
      default: return <FaFileAlt />;
    }
  };

  // Message handling
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (newChatMessage.trim() === '' || !workspaceInfo?._id) return;

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const messageData = {
        workspaceId: workspaceInfo._id,
        content: newChatMessage.trim(),
        sender: 'freelancer',
        senderId: userData._id || currentUserId,
        senderName: userData.name
      };

      const response = await messageService.sendMessage(messageData);

      if (response.success) {
        // Send via socket for real-time
        if (socket) {
          socket.emit('send_message', response.data);
        }

        // Update local state
        setChatMessages(prev => [...prev, response.data]);
        setNewChatMessage('');
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // File upload
  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !workspaceInfo?._id) {
      alert('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('workspaceId', workspaceInfo._id);
      formData.append('uploadedBy', userData._id || currentUserId);
      formData.append('uploaderName', userData.name || 'Freelancer');
      formData.append('relatedPhase', workspaceInfo.currentPhase.toString());
      formData.append('description', `Uploaded ${selectedFile.name}`);
      formData.append('purpose', 'project_deliverable');

      const response = await fileService.uploadFile(formData);

      if (response.success) {
        // Add the new file to the list
        setProjectFiles(prev => [...prev, response.data]);

        // Clear form
        setSelectedFile(null);
        e.target.reset();

        alert('File uploaded successfully!');
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Milestone submission
  const handleMilestoneSubmit = async (milestoneId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await milestoneService.submitForApproval(milestoneId);

      if (response.success) {
        // Update milestone status locally
        setProjectMilestones(prev =>
          prev.map(milestone =>
            milestone._id === milestoneId
              ? { ...milestone, status: 'submitted', submissionDate: new Date().toISOString() }
              : milestone
          )
        );

        alert('Milestone submitted for approval!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed: ' + error.message);
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.scheduledTime || !workspaceInfo?._id) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const callData = {
        workspaceId: workspaceInfo._id,
        scheduledTime: newMeeting.scheduledTime,
        title: newMeeting.title,
        description: newMeeting.description,
        duration: newMeeting.duration,
        scheduledBy: userData._id || currentUserId,
        participants: [workspaceInfo.clientId, workspaceInfo.freelancerId].filter(id => id)
      };

      const response = await videoCallService.scheduleCall(callData);

      if (response.success) {
        // Add to scheduled meetings
        setScheduledMeetings(prev => [...prev, response.data]);

        // Reset form
        setNewMeeting({
          title: '',
          description: '',
          scheduledTime: '',
          duration: 60
        });

        const modal = document.getElementById('meeting-schedule-modal');
        if (modal) {
          modal.style.display = 'none';
        }

        alert('Call scheduled successfully!');
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Failed to schedule call:', error);
      alert('Failed to schedule call: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // File download
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await fileService.downloadFile(fileId);

      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        const downloadUrl = `${process.env.REACT_APP_API_URL}/files/download/${fileId}`;
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error.message);
    }
  };

  // Create instant call
  const handleCreateInstantCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const callData = {
        workspaceId: workspaceInfo._id,
        title: 'Instant Call',
        description: 'Instant video call started by ' + userData.name,
        duration: 60,
        startedBy: userData._id || currentUserId,
        participants: [workspaceInfo.clientId, workspaceInfo.freelancerId].filter(id => id),
        isInstant: true
      };

      const response = await videoCallService.createInstantCall(callData);

      if (response.success) {
        setSelectedCall(response.data);
        setIsInVideoCall(true);
        alert('Joining video call...');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to create instant call:', error);
      alert('Failed to start instant call: ' + error.message);
    }
  };

  // Request milestone extension
  const handleRequestExtension = async (milestoneId) => {
    try {
      const reason = prompt('Please provide a reason for the extension request:');
      if (!reason) return;

      const response = await milestoneService.requestExtension(milestoneId, { reason });

      if (response.success) {
        alert('Extension request submitted!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Extension request failed:', error);
      alert('Extension request failed: ' + error.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="workspace-loading-overlay">
        <div className="loading-spinner-content">
          <FaSpinner className="spinning-icon" />
          <p>Loading workspace data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && !workspaceInfo) {
    return (
      <div className="error-state">
        <h2>Error Loading Workspace</h2>
        <p>{apiError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={() => navigate('/freelancer/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  // No workspace data
  if (!workspaceInfo) {
    return (
      <div className="error-state">
        <h2>Workspace Not Found</h2>
        <p>The requested workspace could not be loaded.</p>
        <button onClick={() => navigate('/freelancer/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="freelancer-workspace-container">
      {/* API Error Banner */}
      {apiError && (
        <div className="demo-mode-banner">
          <FaExclamationTriangle />
          <span>{apiError}</span>
        </div>
      )}

      {/* Workspace Header */}
      <header className="workspace-header-section">
        <div className="header-content-wrapper">
          <div className="project-info-container">
            <h1 className="project-title">{workspaceInfo.projectTitle}</h1>
            <div className="project-meta-info">
              <span className="client-info"><FaUser /> Client: {workspaceInfo.clientName}</span>
              <span className={`project-status-indicator ${workspaceInfo.status}`}>
                {workspaceInfo.status}
              </span>
            </div>
          </div>
          <div className="project-stats-container">
            <div className="stat-item-box">
              <span className="stat-number">{workspaceInfo.overallProgress}%</span>
              <span className="stat-description">Progress</span>
            </div>
            <div className="stat-item-box">
              <span className="stat-number">Phase {workspaceInfo.currentPhase}</span>
              <span className="stat-description">Current Phase</span>
            </div>
            <div className="stat-item-box">
              <span className="stat-number">{workspaceInfo.budget}</span>
              <span className="stat-description">Budget</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="workspace-navigation-bar">
        <div className="nav-container">
          {[
            { key: 'project-overview', label: 'Overview', icon: FaTasks },
            { key: 'project-milestones', label: 'Milestones', icon: FaCheckCircle },
            { key: 'project-chat', label: 'Chat', icon: FaCommentDots },
            { key: 'project-files', label: 'Files', icon: FaFolderOpen },
            { key: 'project-meetings', label: 'Calls', icon: FaVideo },
            { key: 'project-earnings', label: 'Earnings', icon: FaChartLine }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`nav-button ${activeSection === tab.key ? 'nav-button-active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
            >
              <tab.icon className="nav-button-icon" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="workspace-main-content">
        {/* Overview Section */}
        {activeSection === 'project-overview' && (
          <div className="content-panel-wrapper">
            <div className="overview-layout-grid">
              {/* Progress Section */}
              <div className="progress-section-main">
                <div className="progress-header-section">
                  <div>
                    <h2>Project Progress</h2>
                    <p>Track your project milestones and completion status</p>
                  </div>
                  <div className="progress-indicator-section">
                    <span>{workspaceInfo.overallProgress}% Complete</span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-fill"
                        style={{ width: `${workspaceInfo.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Milestones Tracker */}
                <div className="milestones-tracker-container">
                  <div className="tracker-header-section">
                    <h3>Project Milestones</h3>
                    <span className="current-phase-label">Current Phase: {workspaceInfo.currentPhase}</span>
                  </div>

                  <div className="timeline-container">
                    {projectMilestones.map((milestone, index) => (
                      <div key={milestone._id || milestone.id} className="timeline-phase-item">
                        <div className="phase-connector-wrapper">
                          {index > 0 && (
                            <div className={`connector-line ${milestone.status === 'completed' ? 'completed' : ''}`} />
                          )}
                          <div className={`phase-indicator ${milestone.status}`}>
                            {milestone.status === 'completed' && <FaCheck />}
                            {milestone.status === 'submitted' && <FaCheckCircle />}
                            {milestone.status === 'in-progress' && <FaSpinner className="spinning-icon" />}
                            {milestone.status === 'pending' && <span>{milestone.phase || index + 1}</span>}
                          </div>
                        </div>

                        <div className="phase-content-wrapper">
                          <div className="phase-header-section">
                            <h4>{milestone.title}</h4>
                            <span className={`phase-status ${milestone.status}`}>
                              {milestone.status?.replace('-', ' ') || 'Pending'}
                            </span>
                          </div>
                          <p>{milestone.description}</p>
                          <div className="phase-details-grid">
                            <div className="phase-detail-item">
                              <FaCalendarAlt />
                              <span>Due: {formatDateDisplay(milestone.dueDate || milestone.date)}</span>
                            </div>
                            <div className="phase-detail-item">
                              <FaDollarSign />
                              <span>${milestone.amount || milestone.payoutAmount}</span>
                            </div>
                          </div>
                          {milestone.status === 'in-progress' && (
                            <button
                              className="primary-action-button"
                              onClick={() => handleMilestoneSubmit(milestone._id || milestone.id)}
                            >
                              Submit for Approval
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Sections */}
              <div className="sidebar-sections-container">
                {/* Project Details */}
                <div className="sidebar-panel-card">
                  <h3 className="panel-title">Project Details</h3>
                  <div className="project-details-grid">
                    <div className="detail-item">
                      <span>Start Date:</span>
                      <span>{formatDateDisplay(workspaceInfo.startDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span>End Date:</span>
                      <span>{formatDateDisplay(workspaceInfo.estimatedEndDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Timeline:</span>
                      <span>{workspaceInfo.timeline}</span>
                    </div>
                    <div className="detail-item">
                      <span>Budget:</span>
                      <span>{workspaceInfo.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="sidebar-panel-card">
                  <h3 className="panel-title">Recent Activity</h3>
                  <div className="activity-list">
                    {chatMessages.slice(-3).reverse().map((message) => (
                      <div key={message._id || message.id} className="activity-item">
                        <div className="activity-icon">
                          <FaCommentDots />
                        </div>
                        <div className="activity-content">
                          <p>New message from {message.sender === 'client' ? 'client' : 'you'}</p>
                          <span>{formatTimeDisplay(message.timestamp || message.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    {projectFiles.slice(-1).map((file) => (
                      <div key={file._id || file.id} className="activity-item">
                        <div className="activity-icon">
                          <FaFolderOpen />
                        </div>
                        <div className="activity-content">
                          <p>File uploaded: {file.originalName || file.name}</p>
                          <span>{formatDateDisplay(file.uploadedAt || file.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="sidebar-panel-card">
                  <h3 className="panel-title">Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <button
                      className="action-button"
                      onClick={() => setActiveSection('project-files')}
                    >
                      <FaUpload /> Upload Work
                    </button>
                    <button
                      className="action-button"
                      onClick={() => setActiveSection('project-meetings')}
                    >
                      <FaVideo /> Schedule Call
                    </button>
                    <button
                      className="action-button"
                      onClick={() => setActiveSection('project-milestones')}
                    >
                      <FaCheckCircle /> Update Progress
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Section */}
        {activeSection === 'project-milestones' && (
          <div className="content-panel-wrapper">
            <div className="section-header">
              <h2>Project Milestones</h2>
              <p>Manage your project phases and submit work for approval</p>
            </div>
            <div className="milestones-grid-layout">
              {projectMilestones.map((milestone) => (
                <div key={milestone._id || milestone.id} className="milestone-card">
                  <div className="milestone-header">
                    <h3>Phase {milestone.phase || milestone.phaseNumber}</h3>
                    <span className={`status-badge ${milestone.status}`}>
                      {milestone.status?.replace('-', ' ') || 'Pending'}
                    </span>
                  </div>
                  <h4>{milestone.title}</h4>
                  <p>{milestone.description}</p>
                  <div className="milestone-details">
                    <div className="detail-item">
                      <span>Due Date:</span>
                      <span>{formatDateDisplay(milestone.dueDate || milestone.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Payment:</span>
                      <span>${milestone.amount || milestone.payoutAmount}</span>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span className={`payment-status ${milestone.paymentStatus || 'pending'}`}>
                        {milestone.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                  {milestone.status === 'in-progress' && (
                    <div className="milestone-actions">
                      <button
                        className="primary-action-button"
                        onClick={() => handleMilestoneSubmit(milestone._id || milestone.id)}
                      >
                        Submit for Approval
                      </button>
                      <button
                        className="secondary-action-button"
                        onClick={() => handleRequestExtension(milestone._id || milestone.id)}
                      >
                        <FaEdit /> Request Extension
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Section */}
        {activeSection === 'project-chat' && (
          <div className="content-panel-wrapper">
            <div className="chat-interface-container">
              <div className="chat-header">
                <h2>Chat with {workspaceInfo.clientName}</h2>
                <div className="online-status">
                  <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="messages-container">
                {chatMessages.map((message) => (
                  <div
                    key={message._id || message.id}
                    className={`message-bubble ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {formatTimeDisplay(message.timestamp || message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="chat-input-form" onSubmit={handleSendChatMessage}>
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button type="submit" className="send-button" disabled={loading}>
                  {loading ? <FaSpinner className="spinning-icon" /> : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Files Section */}
        {activeSection === 'project-files' && (
          <div className="content-panel-wrapper">
            <div className="section-header">
              <h2>Project Files</h2>
              <p>Share and manage project files with your client</p>
              <form className="file-upload-form" onSubmit={handleFileUploadSubmit}>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.ai,.sketch"
                  disabled={loading}
                />
                <button type="submit" className="primary-action-button" disabled={loading}>
                  {loading ? <FaSpinner className="spinning-icon" /> : <><FaUpload /> Upload File</>}
                </button>
              </form>
            </div>
            <div className="files-grid">
              {projectFiles.map((file) => (
                <div key={file._id || file.id} className="file-card">
                  <div className={`file-icon ${file.fileType || 'document'}`}>
                    {getFileTypeIcon(file.fileType || file.type)}
                  </div>
                  <div className="file-info">
                    <h4>{file.originalName || file.name}</h4>
                    <p>Uploaded by: {file.uploaderName || file.uploadedBy}</p>
                    <div className="file-meta">
                      <span><FaCalendarAlt /> {formatDateDisplay(file.uploadedAt || file.date)}</span>
                      <span>{file.fileSize ? `${(file.fileSize / (1024 * 1024)).toFixed(1)} MB` : file.size}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      className="download-button"
                      onClick={() => handleDownloadFile(file._id, file.originalName || file.name)}
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calls Section */}
        {activeSection === 'project-meetings' && (
          <div className="content-panel-wrapper">
            {isInVideoCall ? (
              <div className="video-call-interface">
                <button
                  onClick={() => setIsInVideoCall(false)}
                  className="back-button"
                >
                  ← Back to Calls
                </button>
                <div className="video-call-demo">
                  <h3>Video Call in Progress</h3>
                  <p>Video call interface would be implemented here</p>
                  <button
                    className="primary-action-button"
                    onClick={() => setIsInVideoCall(false)}
                  >
                    End Call
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="section-header">
                  <h2>Video Calls</h2>
                  <div className="call-actions">
                    <button
                      className="primary-action-button"
                      onClick={() => {
                        const modal = document.getElementById('meeting-schedule-modal');
                        if (modal) modal.style.display = 'block';
                      }}
                    >
                      <FaVideo /> Schedule Call
                    </button>
                    <button
                      className="secondary-action-button"
                      onClick={handleCreateInstantCall}
                    >
                      <FaPhone /> Start Instant Call
                    </button>
                  </div>
                </div>
                <div className="calls-list-container">
                  <h3>Scheduled Calls</h3>
                  {scheduledMeetings.length === 0 ? (
                    <div className="empty-calls-state">
                      <FaVideo size={48} />
                      <p>No scheduled calls</p>
                    </div>
                  ) : (
                    <div className="calls-grid">
                      {scheduledMeetings.map((meeting) => (
                        <div key={meeting._id || meeting.id} className="call-item">
                          <div className="call-info">
                            <h4>{meeting.title}</h4>
                            <p>{meeting.description || 'No description'}</p>
                            <div className="call-meta">
                              <span><FaCalendarAlt /> {formatDateDisplay(meeting.scheduledTime)}</span>
                              <span>Duration: {meeting.duration}min</span>
                              <span className={`call-status ${meeting.status}`}>
                                {meeting.status}
                              </span>
                            </div>
                          </div>
                          <button
                            className="primary-action-button"
                            onClick={() => {
                              setSelectedCall(meeting);
                              setIsInVideoCall(true);
                            }}
                          >
                            Join Call
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Earnings Section */}
        {activeSection === 'project-earnings' && (
          <div className="content-panel-wrapper">
            <div className="section-header">
              <h2>Earnings & Payments</h2>
              <p>Track your project earnings and payment status</p>
            </div>
            <div className="earnings-overview">
              {/* Earnings would come from payment service API */}
              <div className="earnings-stats-cards">
                <div className="earnings-card">
                  <div className="card-icon total-earnings">
                    <FaMoneyBillWave />
                  </div>
                  <div className="card-content">
                    <h3>Total Earned</h3>
                    <span className="amount">$0</span>
                  </div>
                </div>
                <div className="earnings-card">
                  <div className="card-icon pending-payments">
                    <FaClock />
                  </div>
                  <div className="card-content">
                    <h3>Pending Payments</h3>
                    <span className="amount pending">$0</span>
                  </div>
                </div>
              </div>

              <div className="payment-history-section">
                <h3>Payment History</h3>
                <div className="payment-history">
                  {/* This would come from payment service API */}
                  {projectMilestones
                    .filter(m => m.paymentStatus === 'paid')
                    .map((milestone) => (
                      <div key={milestone._id} className="payment-item">
                        <div className="payment-info">
                          <span>{milestone.title}</span>
                          <span className="payment-amount">${milestone.amount || milestone.payoutAmount}</span>
                        </div>
                        <div className="payment-status">
                          <span className="status-paid">Paid</span>
                          <span>{formatDateDisplay(milestone.paidDate || milestone.completedDate)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Call Modal */}
      <div id="meeting-schedule-modal" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-content-panel">
          <div className="modal-header-section">
            <h3 className="modal-title-text">Schedule Video Call</h3>
            <span
              className="modal-close-button"
              onClick={() => document.getElementById('meeting-schedule-modal').style.display = 'none'}
            >
              &times;
            </span>
          </div>
          <div className="modal-body-section">
            <form onSubmit={handleScheduleMeeting}>
              <div className="form-field-group">
                <label className="form-field-label">Call Title</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g., Design Review Meeting"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Description</label>
                <textarea
                  className="form-textarea-field"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="Brief description of the call agenda..."
                  rows="3"
                  disabled={loading}
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input-field"
                  value={newMeeting.scheduledTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, scheduledTime: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-input-field"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                  disabled={loading}
                />
              </div>
              <div className="modal-action-buttons">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={() => document.getElementById('meeting-schedule-modal').style.display = 'none'}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-action-button" disabled={loading}>
                  {loading ? <FaSpinner className="spinning-icon" /> : 'Schedule Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerWorkspace;

