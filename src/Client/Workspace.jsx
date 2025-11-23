// Workspace.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  FaMobileAlt, 
  FaCreditCard, 
  FaIdCard, 
  FaMoneyBillAlt,
  FaPaperPlane,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';

import './Workspace.css';

// Import API services
import workspaceService from '../services/workspaceService';
import milestoneService from '../services/milestoneService';
import { CallListComponent } from '../Videocall/callListComponent';
import { VideoCallComponent} from '../Videocall/videocallComponent'
import videoCallService from '../Service/videocallService';

const Workspace = () => {
  const [activeSection, setActiveSection] = useState('project-overview');
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
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
  const [issueReport, setIssueReport] = useState({
    reason: '',
    details: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    screenshot: null,
    method: 'upi',
    upiId: '',
    upiApp: '',
    upiReference: '',
    razorpayId: '',
    razorpayOrderId: '',
    razorpaySignature: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    debitCardNumber: '',
    debitCardExpiry: '',
    debitCardCvv: '',
    debitCardName: '',
    bankName: ''
  });

  // API integration states
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const chatEndRef = useRef(null);

  const [workspaceInfo, setWorkspaceInfo] = useState({
    projectTitle: 'E-commerce Platform Development',
    clientName: 'Alex Rivera',
    freelancerName: 'Jordan Lee',
    status: 'active',
    currentPhase: 2,
    overallProgress: 35,
    startDate: '2025-09-15',
    estimatedEndDate: '2026-01-15',
    budget: '$8,500',
    timeline: '4 months'
  });

  // Mock data initialization with updated dates - KEEP YOUR EXISTING DUMMY DATA
  useEffect(() => {
    // Mock messages with recent dates
    setChatMessages([
      { id: 1, sender: 'client', content: 'Hi Jordan, any updates on the wireframes?', timestamp: '2025-11-20T14:30:00' },
      { id: 2, sender: 'freelancer', content: 'Hi Alex, Wireframes are ready for review. Check the files tab.', timestamp: '2025-11-20T14:32:00' },
      { id: 3, sender: 'client', content: 'Looks promising! Let\'s discuss changes in the next call.', timestamp: '2025-11-20T15:00:00' },
      { id: 4, sender: 'freelancer', content: 'Scheduled a call for tomorrow. See you then!', timestamp: '2025-11-20T15:15:00' },
      { id: 5, sender: 'client', content: 'Perfect, confirmed.', timestamp: '2025-11-21T09:45:00' }
    ]);

    // Mock milestones with updated dates
    setProjectMilestones([
      { 
        id: 1, 
        title: 'Requirement Gathering', 
        description: 'Analyze business needs and user stories', 
        status: 'completed', 
        phase: 1,
        date: '2025-10-05',
        amount: '$850'
      },
      { 
        id: 2, 
        title: 'UI/UX Design', 
        description: 'Develop wireframes and high-fidelity mockups', 
        status: 'in-progress', 
        phase: 2,
        date: '2025-11-25',
        amount: '$2,550'
      },
      { 
        id: 3, 
        title: 'Frontend Implementation', 
        description: 'Build responsive frontend using React', 
        status: 'pending', 
        phase: 3,
        date: '2025-12-20',
        amount: '$2,550'
      },
      { 
        id: 4, 
        title: 'Backend Development', 
        description: 'Set up API and database integration', 
        status: 'pending', 
        phase: 4,
        date: '2026-01-10',
        amount: '$1,700'
      },
      { 
        id: 5, 
        title: 'Testing & Launch', 
        description: 'Conduct QA testing and deploy to production', 
        status: 'pending', 
        phase: 5,
        date: '2026-01-25',
        amount: '$850'
      }
    ]);

    // Mock files with recent uploads
    setProjectFiles([
      { id: 1, name: 'requirements_doc_v2.pdf', type: 'document', uploadedBy: 'client', date: '2025-10-01', size: '1.8 MB' },
      { id: 2, name: 'wireframes_sketch.fig', type: 'design', uploadedBy: 'freelancer', date: '2025-11-20', size: '4.2 MB' },
      { id: 3, name: 'logo_designs.ai', type: 'design', uploadedBy: 'freelancer', date: '2025-11-18', size: '2.1 MB' },
      { id: 4, name: 'user_flow_diagram.png', type: 'image', uploadedBy: 'client', date: '2025-10-10', size: '0.9 MB' }
    ]);

    // Mock video calls with upcoming dates
    setScheduledMeetings([
      { id: 1, title: 'Kickoff Meeting', scheduledTime: '2025-09-20T10:00:00', duration: 60, status: 'completed' },
      { id: 2, title: 'Design Review', scheduledTime: '2025-11-23T11:00:00', duration: 45, status: 'scheduled' },
      { id: 3, title: 'Sprint Planning', scheduledTime: '2025-12-05T14:30:00', duration: 60, status: 'scheduled' }
    ]);

    // Try to load real data from API
    fetchRealWorkspaceData();
  }, []);

  // API Integration Functions
  const fetchRealWorkspaceData = async () => {
    setLoading(true);
    try {
      // Try to get real data from API
      const workspaceData = await workspaceService.getWorkspaceById('current-workspace-id');
      const milestonesData = await milestoneService.getMilestonesByWorkspace('current-workspace-id');
      
      // Update with real data if API succeeds
      setWorkspaceInfo(workspaceData);
      setProjectMilestones(milestonesData);
      setIsDemoMode(false);
      setApiError(null);
    } catch (error) {
      // If API fails, keep using your existing dummy data
      console.log('API not available, using demo data');
      setApiError('Real data unavailable - showing demo workspace');
      // Your existing dummy data remains intact
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Helper functions
  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeDisplay = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMilestoneStatusClass = (status) => status.replace('-', ' ');

  const getFileTypeIcon = (type) => {
    switch(type) {
      case 'document': return <FaFileAlt />;
      case 'image': return <FaImage />;
      case 'design': return <FaPalette />;
      case 'video': return <FaPlayCircle />;
      default: return <FaFileAlt />;
    }
  };

  // Handle functions - UPDATED WITH API INTEGRATION
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (newChatMessage.trim() === '') return;

    const newMsg = {
      id: chatMessages.length + 1,
      sender: 'client',
      content: newChatMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages([...chatMessages, newMsg]);
    setNewChatMessage('');
  };

  const handleFileUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const newFile = {
      id: projectFiles.length + 1,
      name: selectedFile.name,
      type: selectedFile.name.split('.').pop().toLowerCase(),
      uploadedBy: 'client',
      date: new Date().toISOString().split('T')[0],
      size: '1.2 MB'
    };

    setProjectFiles([...projectFiles, newFile]);
    setSelectedFile(null);
    e.target.reset();
  };

  const handleScheduleMeeting = async (e) => {
  e.preventDefault();
  if (!newMeeting.title || !newMeeting.scheduledTime) return;

  try {
    setLoading(true);
    
    // Use real API instead of mock data
    const callData = {
      workspaceId: workspaceInfo._id || 'demo-workspace-id',
      scheduledTime: newMeeting.scheduledTime,
      title: newMeeting.title,
      description: newMeeting.description,
      duration: newMeeting.duration
    };

    const response = await videoCallService.scheduleCall(callData);
    
    // Refresh calls list
    fetchRealWorkspaceData();
    
    setNewMeeting({
      title: '',
      description: '',
      scheduledTime: '',
      duration: 60
    });
    
    document.getElementById('meeting-schedule-modal').style.display = 'none';
    
    alert('Call scheduled successfully!');
    
  } catch (error) {
    console.error('Failed to schedule call:', error);
    alert('Failed to schedule call');
  } finally {
    setLoading(false);
  }
};
  const handleMilestoneApprove = async (milestoneId) => {
    try {
      // API call for real data
      if (!isDemoMode) {
        await milestoneService.approveMilestone(milestoneId);
      }
      
      // Keep your existing local state update
      const updatedMilestones = projectMilestones.map(milestone =>
        milestone.id === milestoneId 
          ? { ...milestone, status: 'completed' }
          : milestone
      );
      setProjectMilestones(updatedMilestones);
      
      // Show appropriate message
      alert(isDemoMode ? 'Demo: Milestone approved!' : 'Milestone approved successfully!');
      
    } catch (error) {
      console.log('Approval failed:', error);
      alert(isDemoMode ? 'Demo: Milestone approved!' : 'Approval failed');
    }
  };

  const handleMilestoneFeedbackRequest = async (milestoneId) => {
    try {
      // API call for real data
      if (!isDemoMode) {
        await milestoneService.requestFeedback(milestoneId);
      }
      
      alert(isDemoMode ? 'Demo: Feedback requested!' : 'Feedback requested successfully!');
      
    } catch (error) {
      console.log('Feedback request failed:', error);
      alert(isDemoMode ? 'Demo: Feedback requested!' : 'Feedback request failed');
    }
  };

  const handlePaymentSubmission = (e) => {
    e.preventDefault();
    if (!paymentData.amount || !paymentData.screenshot) {
      alert('Please fill all payment details');
      return;
    }
    
    alert(isDemoMode ? 'Demo: Payment submitted!' : 'Payment submitted successfully!');
    setPaymentData({ 
      amount: '', 
      screenshot: null,
      method: 'upi',
      upiId: '',
      upiApp: '',
      upiReference: '',
      razorpayId: '',
      razorpayOrderId: '',
      razorpaySignature: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardName: '',
      debitCardNumber: '',
      debitCardExpiry: '',
      debitCardCvv: '',
      debitCardName: '',
      bankName: ''
    });
    e.target.reset();
  };

  const handleIssueReportSubmit = (e) => {
    e.preventDefault();
    if (!issueReport.reason) {
      alert('Please provide a reason for reporting');
      return;
    }
    
    alert(isDemoMode ? 'Demo: Report submitted!' : 'Report submitted to admin.');
    setIssueReport({ reason: '', details: '' });
    e.target.reset();
  };

  const handleCreateInstantCall = async () => {
  try {
    setLoading(true);
    const response = await videoCallService.createInstantCall(workspaceInfo._id || 'demo-workspace-id');
    
    // Join the instant call immediately
    setSelectedCall(response.call);
    setIsInVideoCall(true);
    
  } catch (error) {
    console.error('Failed to create instant call:', error);
    alert('Failed to start instant call');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="project-workspace">
      {/* Loading and Demo Mode Indicators */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <FaSpinner className="spinning" />
            <p>Loading workspace data...</p>
          </div>
        </div>
      )}
      
      {apiError && (
        <div className="demo-mode-banner">
          <FaExclamationTriangle />
          <span>{apiError}</span>
        </div>
      )}

      {/* Clean Header */}
      <header className="workspace-header">
        <div className="header-main">
          <div className="project-info-section">
            <h1>{workspaceInfo.projectTitle}</h1>
            <div className="project-meta-info">
              <span><FaUser /> {workspaceInfo.clientName}</span>
              <span><FaUser /> {workspaceInfo.freelancerName}</span>
              <span className="project-status-badge">{workspaceInfo.status}</span>
            </div>
          </div>
          <div className="project-statistics">
            <div className="stat-item">
              <span className="stat-number">{workspaceInfo.overallProgress}%</span>
              <span className="stat-description">Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Phase {workspaceInfo.currentPhase}/5</span>
              <span className="stat-description">Phase</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{workspaceInfo.budget}</span>
              <span className="stat-description">Budget</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="workspace-navigation">
        <div className="nav-wrapper">
          {[
            { key: 'project-overview', label: 'Overview' },
            { key: 'project-milestones', label: 'Milestones' },
            { key: 'project-chat', label: 'Chat' },
            { key: 'project-files', label: 'Files' },
            { key: 'project-meetings', label: 'Calls' },
            { key: 'project-payment', label: 'Payment' },
            { key: 'project-report', label: 'Report' }
          ].map((tab) => (
            <button 
              key={tab.key}
              className={activeSection === tab.key ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="workspace-content-area">
        {activeSection === 'project-overview' && (
          <div className="content-panel">
            <div className="overview-layout">
              {/* Progress Section */}
              <div className="progress-display-section">
                <div className="progress-header-area">
                  <div>
                    <h2>Project Progress</h2>
                    <p>Track your project's milestones and overall completion</p>
                  </div>
                  <div className="progress-indicator-area">
                    <span>{workspaceInfo.overallProgress}% Complete</span>
                    <div className="progress-bar-wrapper">
                      <div 
                        className="progress-fill-bar" 
                        style={{ width: `${workspaceInfo.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Tracker - Amazon/Flipkart Style */}
                <div className="progress-tracker-container">
                  <div className="tracker-header">
                    <h3>Project Milestone Tracker</h3>
                    <span className="tracker-status">Current Phase: {workspaceInfo.currentPhase}</span>
                  </div>
                  
                  <div className="tracker-timeline">
                    {projectMilestones.map((milestone, index) => (
                      <div key={milestone.id} className="tracker-phase">
                        <div className="phase-connector">
                          {index > 0 && (
                            <div 
                              className={`connector-line ${milestone.status === 'completed' ? 'completed' : ''} ${milestone.status === 'in-progress' ? 'active' : ''}`}
                            />
                          )}
                          <div 
                            className={`phase-indicator ${milestone.status}`}
                          >
                            {milestone.status === 'completed' && <FaCheck className="indicator-icon" />}
                            {milestone.status === 'in-progress' && <FaSpinner className="indicator-icon spinning" />}
                            {milestone.status === 'pending' && <span className="phase-number">{milestone.phase}</span>}
                          </div>
                        </div>
                        
                        <div className="phase-content">
                          <div className="phase-header">
                            <h4 className="phase-title">{milestone.title}</h4>
                            <span className={`phase-status ${milestone.status}`}>
                              {milestone.status === 'completed' && 'Completed'}
                              {milestone.status === 'in-progress' && 'In Progress'}
                              {milestone.status === 'pending' && 'Upcoming'}
                            </span>
                          </div>
                          
                          <p className="phase-description">{milestone.description}</p>
                          
                          <div className="phase-details">
                            <div className="phase-date">
                              <FaCalendarAlt className="detail-icon" />
                              <span>Due: {formatDateDisplay(milestone.date)}</span>
                            </div>
                            <div className="phase-amount">
                              <FaDollarSign className="detail-icon" />
                              <span>{milestone.amount}</span>
                            </div>
                          </div>

                          {milestone.status === 'in-progress' && (
                            <div className="phase-actions">
                              <button 
                                className="button-primary small"
                                onClick={() => handleMilestoneApprove(milestone.id)}
                              >
                                Approve Phase
                              </button>
                              <button 
                                className="button-secondary small"
                                onClick={() => handleMilestoneFeedbackRequest(milestone.id)}
                              >
                                Request Changes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Sections */}
              <div className="sidebar-layout">
                {/* Project Overview */}
                <div className="sidebar-panel">
                  <h3 className="panel-title">Project Overview</h3>
                  <div className="details-grid">
                    <div className="detail-line">
                      <span className="detail-name">Start Date</span>
                      <span className="detail-value">{formatDateDisplay(workspaceInfo.startDate)}</span>
                    </div>
                    <div className="detail-line">
                      <span className="detail-name">End Date</span>
                      <span className="detail-value">{formatDateDisplay(workspaceInfo.estimatedEndDate)}</span>
                    </div>
                    <div className="detail-line">
                      <span className="detail-name">Timeline</span>
                      <span className="detail-value">{workspaceInfo.timeline}</span>
                    </div>
                    <div className="detail-line">
                      <span className="detail-name">Total Budget</span>
                      <span className="detail-value">{workspaceInfo.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="sidebar-panel">
                  <h3 className="panel-title">Recent Activity</h3>
                  <div className="activity-stream">
                    <div className="activity-entry">
                      <div className="activity-symbol">
                        <FaFolderOpen />
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">Wireframes uploaded</p>
                        <span className="activity-timestamp">2 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-entry">
                      <div className="activity-symbol">
                        <FaCommentDots />
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">New message from Jordan</p>
                        <span className="activity-timestamp">5 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-entry">
                      <div className="activity-symbol">
                        <FaCheckCircle />
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">Phase 1 completed</p>
                        <span className="activity-timestamp">1 day ago</span>
                      </div>
                    </div>
                    <div className="activity-entry">
                      <div className="activity-symbol">
                        <FaVideo />
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">Design review scheduled</p>
                        <span className="activity-timestamp">2 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="sidebar-panel">
                  <h3 className="panel-title">Quick Actions</h3>
                  <div className="quick-actions-list">
                    <button className="action-button" onClick={() => setActiveSection('project-meetings')}>
                      <FaCalendarAlt /> Schedule Call
                    </button>
                    <button className="action-button" onClick={() => setActiveSection('project-files')}>
                      <FaUpload /> Upload File
                    </button>
                    <button className="action-button" onClick={() => setActiveSection('project-payment')}>
                      <FaDollarSign /> Make Payment
                    </button>
                    <button className="action-button" onClick={() => setActiveSection('project-report')}>
                      <FaExclamationTriangle /> Report Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of your tabs remain exactly the same */}
        {/* Milestones Tab */}
        {activeSection === 'project-milestones' && (
          <div className="content-panel">
            <div className="section-title-area">
              <h2>Milestones</h2>
              <p>Manage and track all project phases with clear deliverables</p>
            </div>
            <div className="milestones-grid-layout">
              {projectMilestones.map((milestone) => (
                <div key={milestone.id} className="milestone-card-item">
                  <div className="milestone-card-header">
                    <h3 className="milestone-phase-label">Phase {milestone.phase}</h3>
                    <span className={`milestone-status-badge ${milestone.status}`}>
                      {getMilestoneStatusClass(milestone.status)}
                    </span>
                  </div>
                  <h4 className="milestone-card-title">{milestone.title}</h4>
                  <p className="milestone-card-description">{milestone.description}</p>
                  <div className="milestone-details-grid">
                    <div className="milestone-detail-item">
                      <span className="milestone-detail-label">Due Date</span>
                      <span className="milestone-detail-value">{formatDateDisplay(milestone.date)}</span>
                    </div>
                    <div className="milestone-detail-item">
                      <span className="milestone-detail-label">Payout</span>
                      <span className="milestone-detail-value">{milestone.amount}</span>
                    </div>
                  </div>
                  {milestone.status === 'in-progress' && (
                    <div className="milestone-action-buttons">
                      <button className="button-primary" onClick={() => handleMilestoneApprove(milestone.id)}>
                        Approve & Release
                      </button>
                      <button className="button-secondary" onClick={() => handleMilestoneFeedbackRequest(milestone.id)}>
                        <FaEdit /> Request Changes
                      </button>
                    </div>
                  )}
                  {milestone.status === 'pending' && (
                    <div className="milestone-note-message">
                      <FaClock /> Awaiting prior phase completion
                    </div>
                  )}
                  {milestone.status === 'completed' && (
                    <div className="milestone-completed-message">
                      <FaCheckCircle /> Completed on {formatDateDisplay(milestone.date)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeSection === 'project-chat' && (
          <div className="content-panel">
            <div className="chat-interface">
              <div className="chat-header-area">
                <h2 className="chat-title-text">Chat with {workspaceInfo.freelancerName}</h2>
                <div className="online-status-indicator">
                  <span className="online-dot-icon"></span>
                  Online
                </div>
              </div>
              <div className="chat-messages-area">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message-bubble ${message.sender === 'client' ? 'sent-message' : 'received-message'}`}
                  >
                    <div className="message-content-wrapper">
                      <p>{message.content}</p>
                      <span className="message-time-stamp">{formatTimeDisplay(message.timestamp)}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="chat-input-area" onSubmit={handleSendChatMessage}>
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit" className="send-message-button">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeSection === 'project-files' && (
          <div className="content-panel">
            <div className="section-title-area files-header-section">
              <h2>Files & Documents</h2>
              <p>Manage shared files and uploads for your project</p>
              <form className="file-upload-form" onSubmit={handleFileUploadSubmit}>
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.ai,.sketch"
                />
                <button type="submit" className="button-primary">
                  <FaUpload /> Upload Files
                </button>
              </form>
            </div>
            {projectFiles.length === 0 ? (
              <div className="empty-state-message">
                <FaFolderOpen size={48} className="empty-state-icon" />
                <h3>No files yet</h3>
                <p>Upload your first file to get started.</p>
              </div>
            ) : (
              <div className="files-grid-layout">
                {projectFiles.map((file) => (
                  <div key={file.id} className="file-card-item">
                    <div className={`file-icon-wrapper ${file.type}`}>
                      {getFileTypeIcon(file.type)}
                    </div>
                    <div className="file-info-content">
                      <h4 className="file-name-text" title={file.name}>{file.name}</h4>
                      <p className="file-uploader-info">Uploaded by: <span className="uploader-name-text">{file.uploadedBy}</span></p>
                      <div className="file-metadata">
                        <span><FaCalendarAlt /> {formatDateDisplay(file.date)}</span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                    <div className="file-action-buttons">
                      <button className="download-file-button">
                        <FaDownload size={14} /> Download
                      </button>
                      <button className="preview-file-button" onClick={() => alert('Preview: ' + file.name)}>
                        <FaEye size={14} /> Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calls Tab */}
{activeSection === 'project-meetings' && (
  <div className="content-panel">
    {isInVideoCall ? (
      // Video Call Interface
      <div className="video-call-interface">
        <button 
          onClick={() => {
            setIsInVideoCall(false);
            setSelectedCall(null);
          }} 
          className="back-btn">
          ← Back to Calls
        </button>
        <VideoCallComponent
          callId={selectedCall._id}
          userName={localStorage.getItem('userName') || 'User'}
          userId={localStorage.getItem('userId')}
          isOwner={selectedCall.scheduledBy === localStorage.getItem('userId')}
          onCallEnd={() => {
            setIsInVideoCall(false);
            setSelectedCall(null);
            // Refresh calls list
            fetchRealWorkspaceData();
          }}/>
      </div>
    ) : (
      // Calls List Interface
      <div>
        <div className="section-title-area">
          <h2>Video Calls</h2>
          <div className="call-action-buttons">
            <button 
              className="button-primary"
              onClick={() => document.getElementById('meeting-schedule-modal').style.display = 'block'}>
              <FaVideo /> Schedule New
            </button>
            <button 
              className="button-secondary"
              onClick={handleCreateInstantCall}>
              <FaPhone /> Start Instant Call
            </button>
          </div>
        </div>
        
        <CallListComponent 
          workspaceId={workspaceInfo._id || 'demo-workspace-id'}
          onJoinCall={(call) => {
            setSelectedCall(call);
            setIsInVideoCall(true);
          }}
        />
      </div>
    )}
  </div>
)}
        {/* Payment Tab */}
        {activeSection === 'project-payment' && (
          <div className="content-panel">
            <div className="section-title-area">
              <h2>Payment</h2>
              <p>Submit payments for completed milestones</p>
            </div>
            
            <div className="payment-layout">
              <div className="payment-info-card">
                <h3 className="payment-card-title">Current Phase Payment</h3>
                <div className="payment-details-list">
                  <div className="payment-detail-line">
                    <span>Phase:</span>
                    <span>{workspaceInfo.currentPhase}</span>
                  </div>
                  <div className="payment-detail-line">
                    <span>Amount Due:</span>
                    <span className="payment-amount">$2,550</span>
                  </div>
                  <div className="payment-detail-line">
                    <span>Due Date:</span>
                    <span>{formatDateDisplay(projectMilestones.find(m => m.phase === workspaceInfo.currentPhase)?.date)}</span>
                  </div>
                </div>
                
                <form className="payment-submission-form" onSubmit={handlePaymentSubmission}>
                  <h3 className="payment-card-title">Submit Payment</h3>
                  
                  {/* Payment Method Selection */}
                  <div className="form-field-group">
                    <label className="form-field-label">Payment Method</label>
                    <div className="payment-method-selector">
                      <button 
                        type="button"
                        className={`payment-method-option ${paymentData.method === 'upi' ? 'active' : ''}`}
                        onClick={() => setPaymentData({...paymentData, method: 'upi'})}
                      >
                        <FaMobileAlt /> UPI Payment
                      </button>
                      <button 
                        type="button"
                        className={`payment-method-option ${paymentData.method === 'razorpay' ? 'active' : ''}`}
                        onClick={() => setPaymentData({...paymentData, method: 'razorpay'})}
                      >
                        <FaCreditCard /> Razorpay
                      </button>
                      <button 
                        type="button"
                        className={`payment-method-option ${paymentData.method === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentData({...paymentData, method: 'card'})}
                      >
                        <FaIdCard /> Credit Card
                      </button>
                      <button 
                        type="button"
                        className={`payment-method-option ${paymentData.method === 'debit' ? 'active' : ''}`}
                        onClick={() => setPaymentData({...paymentData, method: 'debit'})}
                      >
                        <FaMoneyBillAlt /> Debit Card
                      </button>
                    </div>
                  </div>

                  {/* Common Payment Fields */}
                  <div className="form-field-group">
                    <label className="form-field-label">Amount</label>
                    <input
                      type="number"
                      className="form-input-field"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  {/* UPI Payment Fields */}
                  {paymentData.method === 'upi' && (
                    <div className="payment-method-fields">
                      <div className="form-field-group">
                        <label className="form-field-label">UPI ID</label>
                        <input
                          type="text"
                          className="form-input-field"
                          value={paymentData.upiId || ''}
                          onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                          placeholder="yourname@upi"
                          required
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">UPI App</label>
                        <select
                          className="form-select-field"
                          value={paymentData.upiApp || ''}
                          onChange={(e) => setPaymentData({...paymentData, upiApp: e.target.value})}
                          required
                        >
                          <option value="">Select UPI App</option>
                          <option value="gpay">Google Pay</option>
                          <option value="phonepe">PhonePe</option>
                          <option value="paytm">Paytm</option>
                          <option value="bhim">BHIM UPI</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-field-group">
                        <label className="form-field-label">Transaction Reference</label>
                        <input
                          type="text"
                          className="form-input-field"
                          value={paymentData.upiReference || ''}
                          onChange={(e) => setPaymentData({...paymentData, upiReference: e.target.value})}
                          placeholder="UPI transaction reference number"
                          required
                        />
                      </div>
                    </div>
                  )}

          {/* Razorpay Fields */}
          {paymentData.method === 'razorpay' && (
            <div className="payment-method-fields">
              <div className="form-field-group">
                <label className="form-field-label">Razorpay Payment ID</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.razorpayId || ''}
                  onChange={(e) => setPaymentData({...paymentData, razorpayId: e.target.value})}
                  placeholder="razorpay_payment_id"
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Order ID</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.razorpayOrderId || ''}
                  onChange={(e) => setPaymentData({...paymentData, razorpayOrderId: e.target.value})}
                  placeholder="razorpay_order_id"
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Signature</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.razorpaySignature || ''}
                  onChange={(e) => setPaymentData({...paymentData, razorpaySignature: e.target.value})}
                  placeholder="razorpay_signature"
                  required
                />
              </div>
            </div>
          )}

          {/* Credit Card Fields */}
          {paymentData.method === 'card' && (
            <div className="payment-method-fields">
              <div className="form-field-group">
                <label className="form-field-label">Card Number</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.cardNumber || ''}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              <div className="card-details-row">
                <div className="form-field-group">
                  <label className="form-field-label">Expiry Date</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={paymentData.cardExpiry || ''}
                    onChange={(e) => setPaymentData({...paymentData, cardExpiry: e.target.value})}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-field-label">CVV</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={paymentData.cardCvv || ''}
                    onChange={(e) => setPaymentData({...paymentData, cardCvv: e.target.value})}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.cardName || ''}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          {/* Debit Card Fields */}
          {paymentData.method === 'debit' && (
            <div className="payment-method-fields">
              <div className="form-field-group">
                <label className="form-field-label">Card Number</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.debitCardNumber || ''}
                  onChange={(e) => setPaymentData({...paymentData, debitCardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              <div className="card-details-row">
                <div className="form-field-group">
                  <label className="form-field-label">Expiry Date</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={paymentData.debitCardExpiry || ''}
                    onChange={(e) => setPaymentData({...paymentData, debitCardExpiry: e.target.value})}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-field-label">CVV</label>
                  <input
                    type="text"
                    className="form-input-field"
                    value={paymentData.debitCardCvv || ''}
                    onChange={(e) => setPaymentData({...paymentData, debitCardCvv: e.target.value})}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.debitCardName || ''}
                  onChange={(e) => setPaymentData({...paymentData, debitCardName: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input-field"
                  value={paymentData.bankName || ''}
                  onChange={(e) => setPaymentData({...paymentData, bankName: e.target.value})}
                  placeholder="Your Bank Name"
                  required
                />
              </div>
            </div>
          )}

          {/* Common Screenshot Upload */}
          <div className="form-field-group">
            <label className="form-field-label">Upload Payment Screenshot/Proof</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="form-input-field"
              onChange={(e) => setPaymentData({...paymentData, screenshot: e.target.files[0]})}
              required
            />
            <small className="file-helper-text">Upload screenshot of payment confirmation or receipt</small>
          </div>

          <button type="submit" className="button-primary">
            <FaPaperPlane /> Submit Payment
          </button>
        </form>
      </div>
      
      <div className="payment-history-card">
        <h3 className="payment-card-title">Payment History</h3>
        <div className="payment-history-list">
          <div className="payment-history-item">
            <div className="payment-meta-info">
              <span>Phase 1 - Requirement Gathering</span>
              <span className="payment-amount">$850</span>
            </div>
            <div className="payment-status-info">
              <span className="payment-status-completed">Completed</span>
              <span>{formatDateDisplay('2025-10-10')}</span>
            </div>
            <div className="payment-method-info">
              <FaCreditCard /> Credit Card
            </div>
          </div>
          <div className="payment-history-item">
            <div className="payment-meta-info">
              <span>Phase 2 - UI/UX Design (Partial)</span>
              <span className="payment-amount">$850</span>
            </div>
            <div className="payment-status-info">
              <span className="payment-status-completed">Completed</span>
              <span>{formatDateDisplay('2025-11-15')}</span>
            </div>
            <div className="payment-method-info">
              <FaMobileAlt /> UPI Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        {/* Report Tab */}
        {activeSection === 'project-report' && (
          <div className="content-panel">
            <div className="section-title-area">
              <h2>Report Issue</h2>
              <p>Report any concerns about the project or collaboration</p>
            </div>
            
            <div className="report-form-container">
              <div className="report-info-message">
                <p>
                  If you're experiencing any issues with the freelancer or project progress, 
                  please report it here. Our admin team will review your report and take 
                  appropriate action to resolve the situation.
                </p>
              </div>
              
              <form className="report-submission-form" onSubmit={handleIssueReportSubmit}>
                <div className="form-field-group">
                  <label className="form-field-label">Reason for Reporting</label>
                  <select
                    className="form-select-field"
                    value={issueReport.reason}
                    onChange={(e) => setIssueReport({...issueReport, reason: e.target.value})}
                    required>
                    <option value="">Select a reason</option>
                    <option value="quality">Poor Quality Work</option>
                    <option value="communication">Communication Issues</option>
                    <option value="deadline">Missed Deadlines</option>
                    <option value="payment">Payment Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-field-group">
                  <label className="form-field-label">Detailed Description</label>
                  <textarea
                    className="form-textarea-field"
                    value={issueReport.details}
                    onChange={(e) => setIssueReport({...issueReport, details: e.target.value})}
                    placeholder="Please provide detailed information about the issue..."
                    rows="6"/>
                </div>
                <button type="submit" className="button-report">Submit Report to Admin</button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Call Modal */}
      <div id="meeting-schedule-modal" className="modal-overlay">
        <div className="modal-content-panel">
          <div className="modal-header-section">
            <h3 className="modal-title-text">Schedule Video Call</h3>
            <span 
              className="modal-close-button"
              onClick={() => document.getElementById('meeting-schedule-modal').style.display = 'none'}>
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
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  placeholder="e.g., Design Review Meeting"
                  required/>
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Description</label>
                <textarea
                  className="form-textarea-field"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  placeholder="Brief description of the call agenda..."
                  rows="3"/>
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input-field"
                  value={newMeeting.scheduledTime}
                  onChange={(e) => setNewMeeting({...newMeeting, scheduledTime: e.target.value})}
                  required/>
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-input-field"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value)})}
                  min="15"
                  step="15"
                />
              </div>
              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => document.getElementById('meeting-schedule-modal').style.display = 'none'}>
                  Cancel
                </button>
                <button type="submit" className="button-primary">Schedule Call</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;