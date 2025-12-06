// Workspace.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaFolderOpen, FaCommentDots, FaCheckCircle, FaVideo, FaCalendarAlt,
  FaDollarSign, FaExclamationTriangle, FaUser, FaClock, FaFileAlt,
  FaImage, FaPalette, FaPlayCircle, FaPhone, FaUpload, FaEdit,
  FaDownload, FaEye, FaSpinner, FaCheck, FaTimes, FaPaperPlane,
  FaChartLine, FaMoneyBillWave, FaTasks, FaArrowLeft, FaFlag, FaCheckSquare,
  // FaUploadCloud, FaUserCheck, FaFileContract,
  FaClipboardCheck, FaCalendarPlus, FaCalendarDay
} from 'react-icons/fa';
import './ClientWorkspace.css';
import io from 'socket.io-client';

// API Service
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ClientWorkspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // State for different sections
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  
  // New milestone submission (for freelancer)
  const [milestoneSubmission, setMilestoneSubmission] = useState({
    files: [],
    notes: ''
  });

  // Payment states
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'upi',
    screenshot: null,
    upiId: '',
    transactionId: ''
  });

  // Meeting states
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60
  });

  const chatEndRef = useRef(null);

  // Get user info on mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role || 'client');
      setUserId(parsedUser._id || parsedUser.id);
    }
  }, []);

  // Fetch workspace data
  useEffect(() => {
    if (workspaceId && userId) {
      fetchWorkspaceData();
    }
  }, [workspaceId, userId]);

  // Initialize WebSocket
  useEffect(() => {
    if (!workspace || !userId) return;

    const token = localStorage.getItem('token');
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Join workspace room
    newSocket.emit('join_workspace', workspace._id);

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      if (message.workspaceId === workspace._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Online status
    newSocket.on('user_online', (onlineUserId) => {
      const otherId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
      if (onlineUserId === otherId) {
        setOtherPartyOnline(true);
      }
    });

    newSocket.on('user_offline', (offlineUserId) => {
      const otherId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
      if (offlineUserId === otherId) {
        setOtherPartyOnline(false);
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_workspace', workspace._id);
        newSocket.disconnect();
      }
    };
  }, [workspace, userId, userRole]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // In your fetchWorkspaceData function, wrap the API call with timeout:


// Fix the fetchWorkspaceData function - REPLACE the broken one
const fetchWorkspaceData = async () => {
  setLoading(true);
  setApiError(null);

  try {
    const token = localStorage.getItem('token');
    
    // Try API first
    const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success) {
        setWorkspace(data.workspace || data.data);
        
        // Fetch related data
        await Promise.all([
          fetchMessages(),
          fetchFiles(),
          fetchMilestones()
        ]);
      } else {
        throw new Error(data.message || 'Failed to load workspace');
      }
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error fetching workspace:', error);
    setApiError(error.message);
    
    // Load demo data as fallback
    setWorkspace({
      _id: workspaceId || 'demo-id',
      projectTitle: 'Demo Project',
      clientName: 'Demo Client',
      freelancerName: 'Demo Freelancer',
      status: 'active',
      currentPhase: 1,
      overallProgress: 0,
      startDate: new Date().toISOString(),
      estimatedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: '$5000',
      description: 'Demo workspace data - backend not available'
    });
    
  } finally {
    setLoading(false); 
  }
};

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

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFiles(data.files || data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/milestones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMilestones(data.milestones || data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  // Message handling
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !workspace) return;

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      const messageData = {
        content: newMessage,
        workspaceId: workspace._id,
        senderId: userId,
        senderName: userData.name || userData.username,
        senderRole: userRole
      };

      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Send via socket
          if (socket) {
            socket.emit('send_message', data.message || data.data);
          }
          
          // Update local state
          setMessages(prev => [...prev, data.message || data.data]);
          setNewMessage('');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  // File upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !workspace) {
      alert('Please select a file');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('workspaceId', workspace._id);
      formData.append('description', `Uploaded ${selectedFile.name}`);

      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFiles(prev => [...prev, data.file || data.data]);
          setSelectedFile(null);
          alert('File uploaded successfully!');
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  // Milestone submission (freelancer)
  const handleSubmitMilestone = async (milestoneId) => {
    if (!milestoneSubmission.notes.trim()) {
      alert('Please add submission notes');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const submissionData = {
        notes: milestoneSubmission.notes,
        files: milestoneSubmission.files
      };

      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/milestones/${milestoneId}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update milestone status
          setMilestones(prev => prev.map(m => 
            m._id === milestoneId ? { ...m, status: 'awaiting_approval' } : m
          ));
          
          // Reset submission form
          setMilestoneSubmission({ files: [], notes: '' });
          alert('Work submitted successfully! Awaiting client approval.');
        }
      }
    } catch (error) {
      console.error('Error submitting milestone:', error);
      alert('Failed to submit work');
    }
  };

  // Milestone approval (client)
  const handleApproveMilestone = async (milestoneId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/milestones/${milestoneId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback: 'Approved! Great work.' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update milestone status
          setMilestones(prev => prev.map(m => 
            m._id === milestoneId ? { ...m, status: 'completed' } : m
          ));
          
          // Update workspace progress
          if (workspace) {
            const completedCount = milestones.filter(m => m.status === 'completed').length + 1;
            const totalCount = milestones.length;
            const newProgress = Math.round((completedCount / totalCount) * 100);
            
            setWorkspace(prev => ({
              ...prev,
              overallProgress: newProgress,
              currentPhase: prev.currentPhase + 1
            }));
          }
          
          alert('Milestone approved and payment released!');
        }
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Failed to approve milestone');
    }
  };

  // Request changes (client)
  const handleRequestChanges = async (milestoneId) => {
    const feedback = prompt('Please provide feedback for requested changes:');
    if (!feedback) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/milestones/${milestoneId}/request-changes`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update milestone status
          setMilestones(prev => prev.map(m => 
            m._id === milestoneId ? { ...m, status: 'in_progress' } : m
          ));
          
          alert('Changes requested successfully!');
        }
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      alert('Failed to request changes');
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.scheduledTime) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const meetingData = {
        ...newMeeting,
        workspaceId: workspace._id,
        scheduledBy: userId
      };

      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Meeting scheduled successfully!');
          setNewMeeting({
            title: '',
            description: '',
            scheduledTime: '',
            duration: 60
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    }
  };

  // Helper functions
  const getOtherParty = () => {
    if (!workspace) return null;
    if (userRole === 'client') {
      return {
        id: workspace.freelancerId,
        name: workspace.freelancerName || workspace.freelancer?.name || 'Freelancer'
      };
    } else {
      return {
        id: workspace.clientId,
        name: workspace.clientName || workspace.client?.name || 'Client'
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFileTypeIcon = (fileType) => {
    if (!fileType) return <FaFileAlt />;
    
    const type = fileType.toLowerCase();
    if (type.includes('image')) return <FaImage />;
    if (type.includes('pdf')) return <FaFileAlt />;
    if (type.includes('video')) return <FaPlayCircle />;
    if (type.includes('fig') || type.includes('ai') || type.includes('psd')) return <FaPalette />;
    return <FaFileAlt />;
  };

  const getCurrentMilestone = () => {
    return milestones.find(m => 
      m.status === 'in_progress' || 
      m.status === 'in-progress' || 
      m.status === 'awaiting_approval' || 
      m.status === 'awaiting-approval'
    );
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <FaSpinner className="spinning" />
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="workspace-error">
        <FaExclamationTriangle />
        <h3>Workspace not found</h3>
        <p>You don't have access to this workspace or it doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const otherParty = getOtherParty();
  const currentMilestone = getCurrentMilestone();

  return (
    <div className="workspace-container">
      {/* Header */}
      <header className="workspace-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          
          <div className="project-info">
            <h1>{workspace.projectTitle || 'Workspace'}</h1>
            <div className="project-meta">
              <span className="other-party">
                <FaUser /> 
                {userRole === 'client' ? 'Freelancer: ' : 'Client: '}
                {otherParty?.name || 'Unknown'}
              </span>
              <span className="contract-id">
                <FaFileContract /> Contract: {workspace.contractId || 'N/A'}
              </span>
              <span className={`status-badge ${workspace.status}`}>
                {workspace.status}
              </span>
            </div>
          </div>
          
          <div className="workspace-stats">
            <div className="stat-card">
              <span className="stat-value">{workspace.overallProgress || 0}%</span>
              <span className="stat-label">Progress</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">Phase {workspace.currentPhase || 1}</span>
              <span className="stat-label">Current Phase</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">${workspace.totalBudget || 0}</span>
              <span className="stat-label">Budget</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                <span className={`online-dot ${otherPartyOnline ? 'online' : 'offline'}`}></span>
              </span>
              <span className="stat-label">{otherPartyOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="workspace-nav">
        <div className="nav-container">
          {[
            { key: 'overview', label: 'Overview', icon: FaTasks },
            { key: 'milestones', label: 'Milestones', icon: FaCheckCircle },
            { key: 'chat', label: 'Chat', icon: FaCommentDots },
            { key: 'files', label: 'Files', icon: FaFolderOpen },
            { key: 'calls', label: 'Calls', icon: FaVideo },
            { key: 'contract', label: 'Contract', icon: FaFileContract }
          ].map((item) => (
            <button
              key={item.key}
              className={`nav-btn ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="workspace-main">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="overview-section">
            <div className="section-header">
              <h2>Project Overview</h2>
              <p>Track your project progress and current status</p>
            </div>

            <div className="overview-content">
              {/* Progress Section */}
              <div className="progress-section">
                <h3>Project Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${workspace.overallProgress || 0}%` }}
                    />
                  </div>
                  <div className="progress-info">
                    <span className="progress-text">{workspace.overallProgress || 0}% Complete</span>
                    <span>Phase {workspace.currentPhase || 1} of {milestones.length}</span>
                  </div>
                </div>
              </div>

              {/* Current Milestone */}
              {currentMilestone && (
                <div className="current-milestone-section">
                  <h3>Current Phase</h3>
                  <div className="milestone-card">
                    <div className="milestone-header">
                      <h4>Phase {currentMilestone.phase || currentMilestone.phaseNumber}: {currentMilestone.title}</h4>
                      <span className={`status-tag ${currentMilestone.status}`}>
                        {currentMilestone.status?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="milestone-description">{currentMilestone.description}</p>
                    
                    <div className="milestone-details">
                      <div className="detail-item">
                        <FaDollarSign />
                        <span>${currentMilestone.amount || 0}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt />
                        <span>Due: {formatDate(currentMilestone.dueDate)}</span>
                      </div>
                    </div>

                    {/* Actions based on role and status */}
                    <div className="milestone-actions">
                      {userRole === 'freelancer' && 
                       (currentMilestone.status === 'in_progress' || currentMilestone.status === 'in-progress') && (
                        <div className="submission-form">
                          <h5>Submit Work</h5>
                          <textarea
                            placeholder="Add submission notes..."
                            value={milestoneSubmission.notes}
                            onChange={(e) => setMilestoneSubmission(prev => ({ ...prev, notes: e.target.value }))}
                            rows="3"
                          />
                          <div className="file-upload">
                            <input
                              type="file"
                              multiple
                              onChange={(e) => setMilestoneSubmission(prev => ({
                                ...prev,
                                files: [...prev.files, ...Array.from(e.target.files)]
                              }))}
                            />
                            <FaUploadCloud />
                          </div>
                          <button 
                            className="btn-primary"
                            onClick={() => handleSubmitMilestone(currentMilestone._id)}
                          >
                            Submit for Review
                          </button>
                        </div>
                      )}

                      {userRole === 'client' && 
                       (currentMilestone.status === 'awaiting_approval' || currentMilestone.status === 'awaiting-approval') && (
                        <div className="approval-actions">
                          <button 
                            className="btn-success"
                            onClick={() => handleApproveMilestone(currentMilestone._id)}
                          >
                            <FaCheck /> Approve & Release Payment
                          </button>
                          <button 
                            className="btn-warning"
                            onClick={() => handleRequestChanges(currentMilestone._id)}
                          >
                            <FaEdit /> Request Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-card">
                  <FaCheckCircle />
                  <div>
                    <span className="stat-number">
                      {milestones.filter(m => m.status === 'completed').length}
                    </span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                <div className="stat-card">
                  <FaClock />
                  <div>
                    <span className="stat-number">
                      {milestones.filter(m => 
                        m.status === 'in_progress' || 
                        m.status === 'in-progress' ||
                        m.status === 'awaiting_approval' ||
                        m.status === 'awaiting-approval'
                      ).length}
                    </span>
                    <span className="stat-label">In Progress</span>
                  </div>
                </div>
                <div className="stat-card">
                  <FaFolderOpen />
                  <div>
                    <span className="stat-number">{files.length}</span>
                    <span className="stat-label">Files</span>
                  </div>
                </div>
                <div className="stat-card">
                  <FaCommentDots />
                  <div>
                    <span className="stat-number">{messages.length}</span>
                    <span className="stat-label">Messages</span>
                  </div>
                </div>
              </div>

              {/* Project Timeline */}
              <div className="timeline-section">
                <h3>Project Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">Start Date</div>
                    <div className="timeline-content">
                      <h4>Project Started</h4>
                      <p>{formatDate(workspace.startDate)}</p>
                    </div>
                  </div>
                  
                  {milestones.map((milestone, index) => (
                    <div key={milestone._id} className="timeline-item">
                      <div className="timeline-date">
                        {formatDate(milestone.dueDate)}
                      </div>
                      <div className="timeline-content">
                        <h4>Phase {milestone.phase || milestone.phaseNumber}: {milestone.title}</h4>
                        <p>${milestone.amount} • {milestone.status}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="timeline-item">
                    <div className="timeline-date">End Date</div>
                    <div className="timeline-content">
                      <h4>Project Completion</h4>
                      <p>{formatDate(workspace.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Section */}
        {activeSection === 'milestones' && (
          <div className="milestones-section">
            <div className="section-header">
              <h2>Project Milestones</h2>
              <p>Manage and track all project phases</p>
            </div>

            <div className="milestones-grid">
              {milestones.map(milestone => (
                <div key={milestone._id} className={`milestone-card ${milestone.status}`}>
                  <div className="milestone-header">
                    <div className="milestone-phase">
                      <span className="phase-number">Phase {milestone.phase || milestone.phaseNumber}</span>
                      <span className={`status-badge ${milestone.status}`}>
                        {milestone.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3>{milestone.title}</h3>
                  </div>
                  
                  <p className="milestone-description">{milestone.description}</p>
                  
                  <div className="milestone-details">
                    <div className="detail-item">
                      <FaDollarSign />
                      <span>${milestone.amount || 0}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>{formatDate(milestone.dueDate)}</span>
                    </div>
                  </div>

                  {/* Submission info if exists */}
                  {milestone.submission && (
                    <div className="submission-info">
                      <h5>Submission Details:</h5>
                      <p>{milestone.submission.notes}</p>
                      <small>Submitted: {formatDate(milestone.submission.submittedAt)}</small>
                    </div>
                  )}

                  {/* Feedback if exists */}
                  {milestone.feedback && (
                    <div className="feedback-info">
                      <h5>Client Feedback:</h5>
                      <p>{milestone.feedback}</p>
                    </div>
                  )}

                  {/* Actions based on role and status */}
                  <div className="milestone-actions">
                    {userRole === 'freelancer' && 
                     (milestone.status === 'in_progress' || milestone.status === 'in-progress') && (
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setMilestoneSubmission({ files: [], notes: '' });
                          // You could implement a modal for submission
                          alert('Click "Submit Work" in the Overview tab to submit this milestone');
                        }}
                      >
                        Submit Work
                      </button>
                    )}

                    {userRole === 'client' && 
                     (milestone.status === 'awaiting_approval' || milestone.status === 'awaiting-approval') && (
                      <>
                        <button 
                          className="btn-success"
                          onClick={() => handleApproveMilestone(milestone._id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-warning"
                          onClick={() => handleRequestChanges(milestone._id)}
                        >
                          Request Changes
                        </button>
                      </>
                    )}

                    {milestone.status === 'completed' && (
                      <div className="completed-badge">
                        <FaCheckCircle /> Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Section */}
        {activeSection === 'chat' && (
          <div className="chat-section">
            <div className="chat-header">
              <div className="chat-partner-info">
                <h2>Chat with {otherParty?.name}</h2>
                <div className="online-status">
                  <span className={`status-dot ${otherPartyOnline ? 'online' : 'offline'}`}></span>
                  {otherPartyOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              <button 
                className="btn-primary"
                onClick={() => {
                  const modal = document.getElementById('schedule-meeting-modal');
                  if (modal) modal.style.display = 'block';
                }}
              >
                <FaCalendarPlus /> Schedule Call
              </button>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <FaCommentDots />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${
                      message.senderRole === 'system' ? 'system' : 
                      message.senderId === userId ? 'sent' : 'received'
                    }`}
                  >
                    <div className="message-header">
                      <span className="sender-name">
                        {message.senderRole === 'system' ? 'System' : message.senderName}
                      </span>
                      <span className="message-time">
                        {formatTime(message.timestamp || message.createdAt)}
                      </span>
                    </div>
                    <div className="message-content">
                      {message.senderRole === 'system' && <FaExclamationTriangle />}
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button type="submit" className="send-btn" disabled={loading}>
                {loading ? <FaSpinner className="spinning" /> : <FaPaperPlane />}
              </button>
            </form>
          </div>
        )}

        {/* Files Section */}
        {activeSection === 'files' && (
          <div className="files-section">
            <div className="section-header">
              <div>
                <h2>Project Files</h2>
                <p>Shared files and documents</p>
              </div>
              <form className="upload-form" onSubmit={handleFileUpload}>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={!selectedFile || loading}>
                  {loading ? <FaSpinner className="spinning" /> : <><FaUpload /> Upload File</>}
                </button>
              </form>
            </div>

            {files.length === 0 ? (
              <div className="empty-state">
                <FaFolderOpen />
                <p>No files uploaded yet</p>
                <small>Upload your first file to get started</small>
              </div>
            ) : (
              <div className="files-grid">
                {files.map((file) => (
                  <div key={file._id} className="file-card">
                    <div className="file-icon">
                      {getFileTypeIcon(file.fileType || file.type)}
                    </div>
                    <div className="file-info">
                      <h4 title={file.originalName || file.name}>
                        {file.originalName || file.name}
                      </h4>
                      <p className="uploader">
                        Uploaded by {file.uploadedBy?.name || file.uploaderName || 'Unknown'}
                      </p>
                      <div className="file-meta">
                        <span>{formatDate(file.uploadDate || file.createdAt)}</span>
                        <span>{file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                        {file.relatedPhase && <span>Phase {file.relatedPhase}</span>}
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="btn-download"
                        onClick={() => window.open(file.fileUrl || file.url, '_blank')}
                      >
                        <FaDownload />
                      </button>
                      <button 
                        className="btn-preview"
                        onClick={() => window.open(file.fileUrl || file.url, '_blank')}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calls Section */}
        {activeSection === 'calls' && (
          <div className="calls-section">
            <div className="section-header">
              <h2>Video Calls</h2>
              <p>Connect with {otherParty?.name}</p>
              <div className="call-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const modal = document.getElementById('schedule-meeting-modal');
                    if (modal) modal.style.display = 'block';
                  }}
                >
                  <FaCalendarDay /> Schedule Call
                </button>
                <button className="btn-secondary">
                  <FaPhone /> Start Instant Call
                </button>
              </div>
            </div>

            <div className="calls-list">
              <div className="empty-state">
                <FaVideo />
                <p>No scheduled calls</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const modal = document.getElementById('schedule-meeting-modal');
                    if (modal) modal.style.display = 'block';
                  }}
                >
                  Schedule Your First Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contract Section */}
        {activeSection === 'contract' && (
          <div className="contract-section">
            <div className="section-header">
              <h2>Contract Details</h2>
              <p>View and manage your project contract</p>
            </div>

            <div className="contract-details">
              <div className="contract-card">
                <div className="contract-header">
                  <h3>Project Contract</h3>
                  <span className="contract-status">{workspace.contractStatus || 'Active'}</span>
                </div>
                
                <div className="contract-info">
                  <div className="info-row">
                    <span className="info-label">Contract ID:</span>
                    <span className="info-value">{workspace.contractId || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Project Title:</span>
                    <span className="info-value">{workspace.projectTitle}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Contract Value:</span>
                    <span className="info-value">${workspace.totalBudget}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Start Date:</span>
                    <span className="info-value">{formatDate(workspace.startDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">End Date:</span>
                    <span className="info-value">{formatDate(workspace.endDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Payment Terms:</span>
                    <span className="info-value">Milestone-based</span>
                  </div>
                </div>

                <div className="contract-parties">
                  <div className="party-card">
                    <h4>Client</h4>
                    <p>{workspace.clientName || 'Client'}</p>
                    <small>Role: Client</small>
                  </div>
                  <div className="party-card">
                    <h4>Freelancer</h4>
                    <p>{workspace.freelancerName || 'Freelancer'}</p>
                    <small>Role: Freelancer</small>
                  </div>
                </div>

                <div className="contract-actions">
                  <button className="btn-primary">
                    <FaDownload /> Download Contract
                  </button>
                  <button className="btn-secondary">
                    <FaEye /> View Full Contract
                  </button>
                </div>
              </div>

              {/* Milestone Payments */}
              <div className="payments-section">
                <h3>Payment Schedule</h3>
                <div className="payments-list">
                  {milestones.map(milestone => (
                    <div key={milestone._id} className="payment-item">
                      <div className="payment-info">
                        <h4>Phase {milestone.phase || milestone.phaseNumber}: {milestone.title}</h4>
                        <p>${milestone.amount}</p>
                      </div>
                      <div className="payment-status">
                        <span className={`status ${milestone.status}`}>
                          {milestone.status === 'completed' ? 'Paid' : milestone.status}
                        </span>
                        <small>Due: {formatDate(milestone.dueDate)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Meeting Modal */}
      <div id="schedule-meeting-modal" className="modal" style={{ display: 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Schedule Video Call</h3>
            <span className="close" onClick={() => document.getElementById('schedule-meeting-modal').style.display = 'none'}>
              &times;
            </span>
          </div>
          <div className="modal-body">
            <form onSubmit={handleScheduleMeeting}>
              <div className="form-group">
                <label>Call Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g., Design Review Meeting"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="Brief description of the call agenda..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={newMeeting.scheduledTime}
                  onChange={(e) => setNewMeeting({ ...newMeeting, scheduledTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                  min="15"
                  step="15"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => document.getElementById('schedule-meeting-modal').style.display = 'none'}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Schedule Call
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="error-banner">
          <FaExclamationTriangle />
          <span>{apiError}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default ClientWorkspace;