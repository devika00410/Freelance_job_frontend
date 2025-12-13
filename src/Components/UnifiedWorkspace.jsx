// UnifiedWorkspace.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaFolderOpen, FaCommentDots, FaCheckCircle, FaVideo, FaCalendarAlt,
  FaDollarSign, FaExclamationTriangle, FaUser, FaClock, FaFileAlt,
  FaImage, FaPalette, FaPlayCircle, FaPhone, FaUpload, FaEdit,
  FaDownload, FaEye, FaSpinner, FaCheck, FaTimes, FaPaperPlane,
  FaChartLine, FaMoneyBillWave, FaTasks, FaArrowLeft
} from 'react-icons/fa';
import './UnifiedWorkspace.css';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UnifiedWorkspace = ({ userRole }) => {
  const { workspaceId } = useParams();
  console.log('🔍 workspaceId from useParams:', workspaceId);
  console.log('🔍 Type:', typeof workspaceId);
  console.log('🔍 Value:', workspaceId);

  // If it's already an object, you need to extract the string ID
  const actualId = workspaceId?.id || workspaceId?._id || workspaceId;
  console.log('🔍 Actual ID to use:', actualId);
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/workspaces/${String(workspaceId?.id || workspaceId?._id || workspaceId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setWorkspace(response.data.workspace);
        setMilestones(response.data.workspace.milestones || []);
        setMessages(response.data.workspace.recentMessages || []);
        await fetchFiles();
        await fetchMilestones();
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
      setApiError('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/workspaces/${workspaceId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setFiles(response.data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/workspaces/${workspaceId}/milestones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setMilestones(response.data.milestones || []);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/workspaces/${workspaceId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Message handling
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/workspaces/${workspaceId}/messages`, {
        content: newMessage,
        messageType: 'text'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // File upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', `Uploaded ${selectedFile.name}`);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/workspaces/${workspaceId}/files`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedFile(null);
        fetchFiles(); // Refresh files
        alert('File uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  // Milestone submission (Freelancer only)
  const handleSubmitMilestone = async (milestoneId, submissionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/workspaces/${workspaceId}/milestones/${milestoneId}/submit`,
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchMilestones();
        alert('Work submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting milestone:', error);
      alert('Error submitting work');
    }
  };

  // Milestone approval (Client only)
  const handleApproveMilestone = async (milestoneId, feedback = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/workspaces/${workspaceId}/milestones/${milestoneId}/approve`,
        { feedback },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchMilestones();
        alert('Milestone approved!');
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Error approving milestone');
    }
  };

  // Request changes (Client only)
  const handleRequestChanges = async (milestoneId, feedback) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/workspaces/${workspaceId}/milestones/${milestoneId}/request-changes`,
        { feedback },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchMilestones();
        alert('Changes requested!');
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      alert('Error requesting changes');
    }
  };

  // Helper functions
  const getOtherParty = () => {
    if (!workspace) return null;
    if (userRole === 'client') {
      return workspace.freelancer || workspace.freelancerId;
    } else {
      return workspace.client || workspace.clientId;
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
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('image')) return <FaImage />;
    if (fileType?.includes('pdf')) return <FaFileAlt />;
    if (fileType?.includes('video')) return <FaPlayCircle />;
    return <FaFileAlt />;
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

  return (
    <div className="unified-workspace">
      {/* Header */}
      <header className="workspace-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className="project-info">
            <h1>{workspace.projectTitle || workspace.title || 'Workspace'}</h1>
            <div className="project-meta">
              <span className="other-party">
                <FaUser />
                {userRole === 'client' ? 'Freelancer: ' : 'Client: '}
                {otherParty?.name || otherParty?.username || 'Unknown'}
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
              <span className="stat-value">
                Phase {(workspace.currentPhase || 1)}
              </span>
              <span className="stat-label">Current Phase</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">${workspace.totalBudget || 0}</span>
              <span className="stat-label">Budget</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="workspace-nav">
        {[
          { key: 'overview', label: 'Overview', icon: FaTasks },
          { key: 'milestones', label: 'Milestones', icon: FaCheckCircle },
          { key: 'chat', label: 'Chat', icon: FaCommentDots },
          { key: 'files', label: 'Files', icon: FaFolderOpen },
          { key: 'calls', label: 'Calls', icon: FaVideo }
        ].map((item) => (
          <button
            key={item.key}
            className={`nav-btn ${activeSection === item.key ? 'active' : ''}`}
            onClick={() => setActiveSection(item.key)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="workspace-main">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <OverviewSection
            workspace={workspace}
            milestones={milestones}
            userRole={userRole}
            onApproveMilestone={handleApproveMilestone}
            onRequestChanges={handleRequestChanges}
            onSubmitMilestone={handleSubmitMilestone}
            formatDate={formatDate}
          />
        )}

        {/* Milestones Section */}
        {activeSection === 'milestones' && (
          <MilestonesSection
            milestones={milestones}
            userRole={userRole}
            onApproveMilestone={handleApproveMilestone}
            onRequestChanges={handleRequestChanges}
            onSubmitMilestone={handleSubmitMilestone}
            formatDate={formatDate}
          />
        )}

        {/* Chat Section */}
        {activeSection === 'chat' && (
          <ChatSection
            messages={messages}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            otherParty={otherParty}
            chatEndRef={chatEndRef}
            formatTime={formatTime}
            userRole={userRole}
          />
        )}

        {/* Files Section */}
        {activeSection === 'files' && (
          <FilesSection
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileUpload={handleFileUpload}
            getFileTypeIcon={getFileTypeIcon}
            formatDate={formatDate}
            userRole={userRole}
          />
        )}

        {/* Calls Section */}
        {activeSection === 'calls' && (
          <CallsSection
            workspaceId={workspaceId}
            userRole={userRole}
            otherParty={otherParty}
          />
        )}
      </main>

      {apiError && (
        <div className="error-banner">
          <FaExclamationTriangle />
          {apiError}
        </div>
      )}
    </div>
  );
};

// Sub-components

const OverviewSection = ({ workspace, milestones, userRole, onApproveMilestone, onRequestChanges, onSubmitMilestone, formatDate }) => {
  const currentMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'in-progress') ||
    milestones.find(m => m.status === 'awaiting_approval' || m.status === 'awaiting-approval');

  return (
    <div className="overview-section">
      <div className="progress-section">
        <h2>Project Progress</h2>
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${workspace.overallProgress || 0}%` }}
            />
          </div>
          <span className="progress-text">{workspace.overallProgress || 0}% Complete</span>
        </div>
      </div>

      {currentMilestone && (
        <div className="current-phase">
          <h3>Current Phase</h3>
          <div className="phase-card">
            <div className="phase-header">
              <h4>Phase {currentMilestone.phaseNumber || currentMilestone.phase}: {currentMilestone.title}</h4>
              <span className={`status-tag ${currentMilestone.status}`}>
                {currentMilestone.status?.replace('_', ' ')}
              </span>
            </div>
            <p>{currentMilestone.description}</p>
            <div className="phase-details">
              <span><FaDollarSign /> ${currentMilestone.amount || 0}</span>
              {currentMilestone.dueDate && (
                <span><FaCalendarAlt /> Due: {formatDate(currentMilestone.dueDate)}</span>
              )}
            </div>

            {/* Action buttons based on role and status */}
            <div className="phase-actions">
              {userRole === 'freelancer' && (currentMilestone.status === 'in_progress' || currentMilestone.status === 'in-progress') && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    const files = []; // You can implement file selection here
                    const notes = prompt('Add submission notes:') || 'Work completed';
                    onSubmitMilestone(currentMilestone._id, { files, notes });
                  }}
                >
                  Submit Work
                </button>
              )}

              {userRole === 'client' && (currentMilestone.status === 'awaiting_approval' || currentMilestone.status === 'awaiting-approval') && (
                <>
                  <button
                    className="btn-success"
                    onClick={() => onApproveMilestone(currentMilestone._id, 'Great work! Approved.')}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="btn-warning"
                    onClick={() => {
                      const feedback = prompt('Enter feedback for changes:');
                      if (feedback) onRequestChanges(currentMilestone._id, feedback);
                    }}
                  >
                    <FaEdit /> Request Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="quick-stats">
        <div className="stat-item">
          <FaCheckCircle />
          <span>Completed: {milestones.filter(m => m.status === 'completed').length}</span>
        </div>
        <div className="stat-item">
          <FaClock />
          <span>In Progress: {milestones.filter(m => m.status === 'in_progress' || m.status === 'in-progress').length}</span>
        </div>
        <div className="stat-item">
          <FaFolderOpen />
          <span>Total Files: {workspace.filesCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

const MilestonesSection = ({ milestones, userRole, onApproveMilestone, onRequestChanges, onSubmitMilestone, formatDate }) => {
  return (
    <div className="milestones-section">
      <div className="section-header">
        <h2>Project Milestones</h2>
        <p>Track and manage all project phases</p>
      </div>

      <div className="milestones-grid">
        {milestones.map(milestone => (
          <div key={milestone._id} className={`milestone-card ${milestone.status}`}>
            <div className="milestone-header">
              <h3>Phase {milestone.phaseNumber || milestone.phase}</h3>
              <span className={`status-badge ${milestone.status}`}>
                {milestone.status?.replace('_', ' ')}
              </span>
            </div>

            <h4>{milestone.title}</h4>
            <p>{milestone.description}</p>

            <div className="milestone-details">
              <div className="detail-item">
                <FaDollarSign />
                <span>${milestone.amount || 0}</span>
              </div>
              {milestone.dueDate && (
                <div className="detail-item">
                  <FaCalendarAlt />
                  <span>{formatDate(milestone.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Submission info */}
            {milestone.submission && milestone.submission.submittedAt && (
              <div className="submission-info">
                <small>Submitted: {formatDate(milestone.submission.submittedAt)}</small>
                {milestone.submission.notes && (
                  <p className="submission-notes">{milestone.submission.notes}</p>
                )}
              </div>
            )}

            {/* Feedback */}
            {milestone.approval && milestone.approval.feedback && (
              <div className="feedback-section">
                <strong>Feedback:</strong>
                <p>{milestone.approval.feedback}</p>
              </div>
            )}

            {/* Actions */}
            <div className="milestone-actions">
              {userRole === 'freelancer' && (milestone.status === 'in_progress' || milestone.status === 'in-progress') && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    const files = [];
                    const notes = prompt('Add submission notes:') || 'Work completed';
                    onSubmitMilestone(milestone._id, { files, notes });
                  }}
                >
                  Submit Work
                </button>
              )}

              {userRole === 'client' && (milestone.status === 'awaiting_approval' || milestone.status === 'awaiting-approval') && (
                <>
                  <button
                    className="btn-success"
                    onClick={() => onApproveMilestone(milestone._id, 'Approved!')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-warning"
                    onClick={() => {
                      const feedback = prompt('Enter feedback for changes:');
                      if (feedback) onRequestChanges(milestone._id, feedback);
                    }}
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
  );
};

const ChatSection = ({ messages, newMessage, onNewMessageChange, onSendMessage, otherParty, chatEndRef, formatTime, userRole }) => {
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h2>Chat with {otherParty?.name || otherParty?.username || 'Partner'}</h2>
        <div className="online-status">
          <span className="status-dot"></span>
          {userRole === 'client' ? 'Freelancer' : 'Client'}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id || message.id}
              className={`message ${message.senderRole === 'system' ? 'system' :
                message.senderId === currentUserId ? 'sent' : 'received'
                }`}
            >
              <div className="message-content">
                {message.senderRole === 'system' && <FaExclamationTriangle />}
                <p>{message.content}</p>
                <span className="message-time">
                  {formatTime(message.timestamp || message.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={onSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="send-btn">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

const FilesSection = ({ files, selectedFile, onFileSelect, onFileUpload, getFileTypeIcon, formatDate, userRole }) => {
  const handleDownload = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    } else {
      alert('Download URL not available');
    }
  };

  return (
    <div className="files-section">
      <div className="section-header">
        <h2>Project Files</h2>
        <p>Shared files and documents</p>

        <form className="upload-form" onSubmit={onFileUpload}>
          <input
            type="file"
            onChange={(e) => onFileSelect(e.target.files[0])}
          />
          <button type="submit" className="btn-primary" disabled={!selectedFile}>
            <FaUpload /> Upload File
          </button>
        </form>
      </div>

      <div className="files-grid">
        {files.length === 0 ? (
          <div className="empty-state">
            <FaFolderOpen />
            <p>No files uploaded yet</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file._id || file.id} className="file-card">
              <div className="file-icon">
                {getFileTypeIcon(file.fileType || file.type)}
              </div>
              <div className="file-info">
                <h4>{file.originalName || file.name}</h4>
                <p>Uploaded by {file.uploadedBy?.name || file.uploadedBy || userRole}</p>
                <div className="file-meta">
                  <span>{formatDate(file.uploadDate || file.createdAt)}</span>
                  <span>{file.fileSize || 'Unknown size'}</span>
                </div>
              </div>
              <div className="file-actions">
                <button className="btn-download" onClick={() => handleDownload(file)}>
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CallsSection = ({ workspaceId, userRole, otherParty }) => {
  const [scheduledCalls, setScheduledCalls] = useState([]);

  const handleScheduleCall = async () => {
    alert('Call scheduling feature will be implemented soon!');
  };

  const handleStartInstantCall = () => {
    alert('Instant call feature will be implemented soon!');
  };

  return (
    <div className="calls-section">
      <div className="section-header">
        <h2>Video Calls</h2>
        <p>Connect with {otherParty?.name || otherParty?.username || 'your partner'}</p>

        <div className="call-actions">
          <button className="btn-primary" onClick={handleScheduleCall}>
            <FaVideo /> Schedule Call
          </button>
          <button className="btn-secondary" onClick={handleStartInstantCall}>
            <FaPhone /> Instant Call
          </button>
        </div>
      </div>

      <div className="calls-list">
        <div className="empty-state">
          <FaVideo />
          <p>No scheduled calls</p>
          <button className="btn-primary" onClick={handleScheduleCall}>
            Schedule Your First Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedWorkspace;