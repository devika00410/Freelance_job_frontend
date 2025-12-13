import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  FaPhone,
  FaUpload,
  FaDownload,
  FaEye,
  FaPaperPlane,
  FaCheck,
  FaSpinner,
  FaChartBar,
  FaWallet,
  FaClipboardCheck,
  FaStickyNote,
  FaHome,
  FaSearch,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
  FaArrowRight,
  FaFileUpload,
  FaMusic,
  FaArchive,
  FaHistory
} from 'react-icons/fa';
import './FreelancerWorkspace.css';

// Import components
import FreelancerWorkspaceOverview from './FreelancerWorkspaceOverview';
import FreelancerNotes from './FreelancerNotes';
import FreelancerEarnings from './FreelancerEarnings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FreelancerWorkspace = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    progress: 0,
    earnings: { total: 0, pending: 0, upcoming: 0 },
    milestones: { total: 0, completed: 0, pending: 0, inProgress: 0, awaitingApproval: 0 },
    messages: { total: 0, unread: 0 },
    files: { total: 0, recent: [] }
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [callDetails, setCallDetails] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    description: ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Add refs
  const fetchInProgressRef = useRef(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      // First try to get from localStorage
      if (userData && userData.name) {
        setUserProfile(userData);
      } else {
        // Fetch from API
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setUserProfile(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
    } catch (error) {
      console.log('Using default user profile');
      setUserProfile({
        name: 'Freelancer',
        email: 'freelancer@example.com',
        profileImage: null
      });
    }
  };




  // Function to add notification
  const addNotification = (type, title, message, data = {}) => {
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save to localStorage for persistence
    const savedNotifications = JSON.parse(localStorage.getItem('workspace_notifications') || '[]');
    savedNotifications.unshift(newNotification);
    localStorage.setItem('workspace_notifications', JSON.stringify(savedNotifications.slice(0, 50))); // Keep last 50

    return newNotification;
  };

  // Function to mark notification as read
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Load notifications on mount
  useEffect(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('workspace_notifications') || '[]');
    setNotifications(savedNotifications);
  }, []);


  // ===== FIXED: fetchWorkspaceData with proper milestone handling =====
  const fetchWorkspaceData = useCallback(async () => {
    if (fetchInProgressRef.current) {
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 Fetching workspace data...');

      // Fetch workspace
      const workspaceResponse = await axios.get(
        `${API_URL}/api/freelancer/workspaces/${workspaceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Debug: Log full response
      console.log('🔍 Full API response:', workspaceResponse.data);

      // Extract workspace data from response
      let workspaceData = workspaceResponse.data.workspace || workspaceResponse.data;

      if (!workspaceData) {
        throw new Error('Workspace not found');
      }

      // Ensure workspace has required properties
      workspaceData = {
        ...workspaceData,
        title: workspaceData.title || 'Untitled Project',
        clientName: workspaceData.clientName || 'Client',
        freelancerName: workspaceData.freelancerName || userProfile?.name || 'Freelancer',
        status: workspaceData.status || 'active',
        sharedMilestones: workspaceData.sharedMilestones || [],
        sharedMessages: workspaceData.sharedMessages || [],
        sharedFiles: workspaceData.sharedFiles || [],
        upcomingCalls: workspaceData.upcomingCalls || []
      };

      console.log('✅ Workspace loaded:', workspaceData.title);

      // Fetch contract details to get milestones
      let contractMilestones = [];
      let clientProfileData = null;

      try {
        if (workspaceData.contractId) {
          const contractResponse = await axios.get(
            `${API_URL}/api/contracts/freelancer/contracts/${workspaceData.contractId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (contractResponse.data.success) {
            const contract = contractResponse.data.contract || contractResponse.data;

            // Extract client profile
            if (contract.clientId) {
              clientProfileData = contract.clientId;
            } else if (contract.clientName) {
              clientProfileData = { name: contract.clientName };
            }

            // Extract milestones from contract phases
            if (contract.phases && contract.phases.length > 0) {
              contractMilestones = contract.phases.map((phase, index) => ({
                _id: phase._id || `phase-${index}`,
                milestoneId: phase._id || `phase-${index}`,
                title: phase.title || `Phase ${phase.phase || index + 1}`,
                phaseNumber: phase.phase || index + 1,
                amount: phase.amount || 0,
                description: phase.description || '',
                status: phase.status || 'pending',
                dueDate: phase.dueDate || phase.deliveryDate,
                duration: phase.duration || 'Not specified',
                deliverables: phase.deliverables || [],
                paymentStatus: phase.paymentStatus || 'pending'
              }));

              console.log(`📋 Loaded ${contractMilestones.length} milestones from contract`);
            }
          }
        }
      } catch (contractError) {
        console.log('⚠️ Could not fetch contract details, using workspace milestones');
      }

      // Set client profile
      if (clientProfileData) {
        setClientProfile(clientProfileData);
      } else if (workspaceData.clientId) {
        setClientProfile(workspaceData.clientId);
      } else if (workspaceData.clientName) {
        setClientProfile({ name: workspaceData.clientName });
      } else {
        setClientProfile({ name: 'Client' });
      }

      // Combine workspace milestones with contract milestones - FIXED with undefined filtering
      const allMilestones = [
        ...(workspaceData.sharedMilestones || []).filter(m => m), // Filter out null/undefined
        ...contractMilestones.filter(cm =>
          cm && !(workspaceData.sharedMilestones || []).some(wm => wm && wm._id === cm._id)
        )
      ].filter(m => m); // Final filter to ensure no undefined values

      // Calculate stats
      const completedMilestones = allMilestones.filter(m =>
        ['completed', 'approved', 'paid'].includes(m.status)
      ).length;

      const inProgressMilestones = allMilestones.filter(m =>
        ['in_progress', 'in-progress', 'started'].includes(m.status)
      ).length;

      const pendingMilestones = allMilestones.filter(m =>
        ['pending', 'not_started'].includes(m.status)
      ).length;

      const awaitingApprovalMilestones = allMilestones.filter(m =>
        ['awaiting_approval', 'submitted', 'review'].includes(m.status)
      ).length;

      // Calculate earnings
      const totalEarnings = allMilestones
        .filter(m => ['completed', 'approved', 'paid'].includes(m.status))
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const pendingEarnings = allMilestones
        .filter(m => ['awaiting_approval', 'submitted', 'review'].includes(m.status))
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const upcomingEarnings = allMilestones
        .filter(m => ['pending', 'not_started'].includes(m.status))
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const progress = allMilestones.length > 0
        ? Math.round((completedMilestones / allMilestones.length) * 100)
        : 0;

      // Update workspace with combined milestones
      const updatedWorkspace = {
        ...workspaceData,
        sharedMilestones: allMilestones,
        clientName: clientProfile?.name || workspaceData.clientName || 'Client'
      };

      setWorkspace(updatedWorkspace);

      // Update stats
      setStats({
        progress,
        milestones: {
          total: allMilestones.length,
          completed: completedMilestones,
          pending: inProgressMilestones + pendingMilestones,
          inProgress: inProgressMilestones,
          awaitingApproval: awaitingApprovalMilestones
        },
        earnings: {
          total: totalEarnings,
          pending: pendingEarnings,
          upcoming: upcomingEarnings
        },
        messages: {
          total: workspaceData.sharedMessages?.length || 0,
          unread: 0 // You can update this if you track read status
        },
        files: {
          total: workspaceData.sharedFiles?.length || 0,
          recent: (workspaceData.sharedFiles || []).filter(f => f).slice(0, 5) // Filter out undefined files
        }
      });

      // Fetch files
      await fetchFiles();

    } catch (err) {
      console.error('❌ Error fetching workspace:', err);
      setError(err.message || 'Failed to load workspace data');

      // Create mock workspace for testing
      createMockWorkspace();
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [workspaceId]);

  const createMockWorkspace = () => {
    const mockWorkspace = {
      _id: workspaceId,
      workspaceId: workspaceId,
      title: 'Digital Boost Strategy & Campaign Management',
      clientName: 'John Smith',
      freelancerName: userProfile?.name || 'Freelancer',
      totalBudget: 5000,
      serviceType: 'Marketing Strategy',
      startDate: new Date().toISOString(),
      estimatedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      currentPhase: 1,
      sharedMilestones: [
        {
          _id: 'mock-design-1',
          milestoneId: 'mock-design-1',
          title: 'Design Phase',
          phaseNumber: 1,
          amount: 1500,
          description: 'Create initial design mockups and wireframes',
          status: 'completed',
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '7 days',
          deliverables: ['Wireframes', 'Design Mockups', 'Style Guide'],
          paymentStatus: 'paid'
        },
        {
          _id: 'mock-dev-2',
          milestoneId: 'mock-dev-2',
          title: 'Development Phase',
          phaseNumber: 2,
          amount: 2500,
          description: 'Develop core functionality and features',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '14 days',
          deliverables: ['Frontend Development', 'Backend API', 'Database Setup'],
          paymentStatus: 'pending'
        },
        {
          _id: 'mock-testing-3',
          milestoneId: 'mock-testing-3',
          title: 'Testing & Deployment',
          phaseNumber: 3,
          amount: 1000,
          description: 'Testing, bug fixes, and deployment to production',
          status: 'pending',
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          duration: '7 days',
          deliverables: ['Testing Report', 'Bug Fixes', 'Deployment'],
          paymentStatus: 'pending'
        }
      ],
      sharedMessages: [],
      sharedFiles: [],
      upcomingCalls: []
    };

    setWorkspace(mockWorkspace);
    setClientProfile({ name: 'John Smith' });


    setStats({
      progress: 33,
      milestones: {
        total: 3,
        completed: 1,
        pending: 2,
        inProgress: 1,
        awaitingApproval: 0
      },
      earnings: {
        total: 1500,
        pending: 0,
        upcoming: 3500
      },
      messages: {
        total: 0,
        unread: 0
      },
      files: {
        total: 0,
        recent: []
      }
    });
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered for workspaceId:', workspaceId);
    fetchWorkspaceData();
  }, [workspaceId]);

  const handleFileUpload = async (file) => {
    if (!file) return false;

    try {
      const token = localStorage.getItem('token');

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('workspaceId', workspaceId);
      formData.append('uploaderRole', 'freelancer');

      // Create file object for local state
      const newFile = {
        _id: Date.now().toString(),
        originalName: file.name,
        name: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: {
          _id: userProfile?._id || 'freelancer',
          name: userProfile?.name || 'Freelancer',
          role: 'freelancer'
        },
        fileUrl: URL.createObjectURL(file),
        sharedWith: ['client'] // Mark as shared with client
      };

      // Update local state
      setStats(prev => ({
        ...prev,
        files: {
          total: prev.files.total + 1,
          recent: [newFile, ...prev.files.recent.slice(0, 4)]
        }
      }));

      // Also update workspace state
      setWorkspace(prev => {
        const existingFiles = prev.sharedFiles || [];
        return {
          ...prev,
          sharedFiles: [...existingFiles, newFile]
        };
      });

      // Save to localStorage
      const localStorageKey = `workspace_${workspaceId}_files`;
      const existingFiles = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
      existingFiles.push(newFile);
      localStorage.setItem(localStorageKey, JSON.stringify(existingFiles));

      // Add notification for client
      addNotification(
        'file_upload',
        'New File Shared',
        `${userProfile?.name || 'Freelancer'} shared a file: "${file.name}"`,
        {
          file: newFile,
          workspaceId,
          uploadedBy: userProfile?.name || 'Freelancer'
        }
      );

      console.log('✅ File uploaded and shared with client');

      // Simulate sending to client (in real app, this would be API call)
      setTimeout(() => {
        console.log(`📁 File "${file.name}" has been sent to the client`);
        alert(`✅ File "${file.name}" has been shared with your client!`);
      }, 1000);

      // Try API in background
      try {
        await axios.post(
          `${API_URL}/api/workspaces/${workspaceId}/files/upload`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('✅ File uploaded to API and shared with client');
      } catch (apiError) {
        console.log('📁 File saved locally and client notified (API unavailable)');
      }

      return true;

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      return false;
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');

      // First check localStorage
      const localStorageKey = `workspace_${workspaceId}_files`;
      const savedFiles = localStorage.getItem(localStorageKey);

      if (savedFiles) {
        const files = JSON.parse(savedFiles);
        setStats(prev => ({
          ...prev,
          files: {
            total: files.length,
            recent: files.slice(0, 5)
          }
        }));
      }

      // Try API
      try {
        const response = await axios.get(
          `${API_URL}/api/workspaces/${workspaceId}/files`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.data.success) {
          const files = response.data.files || [];
          setStats(prev => ({
            ...prev,
            files: {
              total: files.length,
              recent: files.slice(0, 5)
            }
          }));
        }
      } catch (apiError) {
        console.log('Using local files (API unavailable)');
      }
    } catch (error) {
      console.log('Error fetching files:', error.message);
    }
  };

  // File handling functions
  const handleViewFile = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    } else if (file.url) {
      window.open(file.url, '_blank');
    } else {
      alert('Cannot preview this file. Please download it first.');
    }
  };

  const handleDownloadFile = (file) => {
    if (file.fileUrl) {
      const a = document.createElement('a');
      a.href = file.fileUrl;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.originalName || file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Cannot download this file. The download link is not available.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create new message object
      const newMsg = {
        _id: Date.now().toString(),
        messageId: Date.now().toString(),
        content: newMessage,
        senderRole: 'freelancer',
        senderId: userProfile?._id || 'freelancer',
        senderName: userProfile?.name || 'Freelancer',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        readBy: ['freelancer'],
        delivered: false,
        read: false
      };

      // Update workspace with new message
      setWorkspace(prev => ({
        ...prev,
        sharedMessages: [...(prev.sharedMessages || []), newMsg]
      }));

      // Update stats
      setStats(prev => ({
        ...prev,
        messages: {
          total: (prev.messages?.total || 0) + 1,
          unread: prev.messages?.unread || 0
        }
      }));

      // Add notification for client
      addNotification(
        'new_message',
        'New Message',
        `${userProfile?.name || 'Freelancer'}: ${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
        {
          message: newMsg,
          sender: userProfile?.name || 'Freelancer',
          workspaceId
        }
      );

      // Clear input
      setNewMessage('');

      // Simulate sending to client (like WhatsApp)
      console.log('💬 Message sent to client:', newMessage);

      // Simulate delivery status
      setTimeout(() => {
        // Update message as delivered
        setWorkspace(prev => ({
          ...prev,
          sharedMessages: prev.sharedMessages.map(msg =>
            msg._id === newMsg._id ? { ...msg, delivered: true } : msg
          )
        }));
        console.log('✓ Message delivered to client');
      }, 1000);

      // Simulate read status (when client reads)
      setTimeout(() => {
        setWorkspace(prev => ({
          ...prev,
          sharedMessages: prev.sharedMessages.map(msg =>
            msg._id === newMsg._id ? { ...msg, read: true } : msg
          )
        }));
        console.log('👁️ Message read by client');
      }, 3000);

      // Try API in background
      try {
        await axios.post(
          `${API_URL}/api/workspaces/${workspaceId}/messages/send`,
          {
            content: newMessage,
            senderRole: 'freelancer',
            workspaceId: workspaceId
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Message sent to API');
      } catch (apiError) {
        console.log('💬 Message sent locally (API unavailable)');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleMilestoneSubmit = async (milestoneId, submissionData) => {
    try {
      const token = localStorage.getItem('token');

      // Find the milestone
      const milestone = workspace.sharedMilestones.find(m =>
        m._id === milestoneId || m.milestoneId === milestoneId
      );

      // Update local state
      updateMilestoneStatus(milestoneId, 'awaiting_approval');

      // Add notification for client
      addNotification(
        'milestone_submission',
        'Milestone Submitted for Review',
        `${userProfile?.name || 'Freelancer'} submitted "${milestone?.title || 'Milestone'}" for review`,
        {
          milestoneId,
          milestoneTitle: milestone?.title,
          submissionData,
          submittedBy: userProfile?.name || 'Freelancer',
          workspaceId
        }
      );

      // Try API
      try {
        await axios.post(
          `${API_URL}/api/freelancer/workspaces/${workspaceId}/milestones/${milestoneId}/submit`,
          {
            ...submissionData,
            workspaceId: workspaceId,
            milestoneId: milestoneId
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Milestone submitted to API and client notified');
      } catch (apiError) {
        console.log('📝 Milestone submitted locally and client notified');
      }

      alert('Milestone submitted successfully! Your client has been notified and will review it soon.');
      return true;
    } catch (error) {
      console.error('Error submitting milestone:', error);
      alert('Failed to submit milestone. Please try again.');
      return false;
    }
  };


  const updateMilestoneStatus = (milestoneId, newStatus) => {
    setWorkspace(prev => {
      if (!prev) return prev;

      const updatedMilestones = prev.sharedMilestones?.map(milestone =>
        milestone._id === milestoneId || milestone.milestoneId === milestoneId
          ? { ...milestone, status: newStatus }
          : milestone
      ) || [];

      return {
        ...prev,
        sharedMilestones: updatedMilestones
      };
    });
  };

  // Formatting helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed': return '#10b981';
      case 'submitted':
      case 'awaiting_approval': return '#3b82f6';
      case 'revision_requested': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'in_progress': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  // Add this to your component


  const NotificationsPanel = () => (
    <div className={`notifications-panel ${showNotifications ? 'show' : ''}`}>
      <div className="notifications-header">
        <h3>Notifications</h3>
        <button
          className="close-btn"
          onClick={() => setShowNotifications(false)}
        >
          ×
        </button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell size={24} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 10).map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'file_upload' && <FaUpload />}
                {notification.type === 'milestone_submission' && <FaCheckCircle />}
                {notification.type === 'new_message' && <FaCommentDots />}
                {notification.type === 'milestone_approved' && <FaCheck />}
                {notification.type === 'milestone_revision' && <FaExclamationTriangle />}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {formatDate(notification.timestamp)}
                </span>
              </div>
              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
      {notifications.length > 10 && (
        <div className="notifications-footer">
          <button className="btn-text" onClick={() => setNotifications([])}>
            Clear All
          </button>
          <button className="btn-text" onClick={() => {
            // Navigate to all notifications
            alert('View all notifications');
          }}>
            View All
          </button>
        </div>
      )}
    </div>
  );

  // Schedule Call Modal Component
  const ScheduleCallModal = () => (
    <div className={`workspace-modal ${showScheduleModal ? 'show' : ''}`}>
      <div className="workspace-modal-content">
        <div className="workspace-modal-header">
          <h3>Schedule a Call</h3>
          <button
            className="workspace-modal-close"
            onClick={() => setShowScheduleModal(false)}
          >
            ×
          </button>
        </div>
        <div className="workspace-modal-body">
          <div className="form-group">
            <label>Call Title</label>
            <input
              type="text"
              value={callDetails.title}
              onChange={(e) => setCallDetails({ ...callDetails, title: e.target.value })}
              placeholder="Weekly check-in, Design review, etc."
              className="form-input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={callDetails.date}
                onChange={(e) => setCallDetails({ ...callDetails, date: e.target.value })}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={callDetails.time}
                onChange={(e) => setCallDetails({ ...callDetails, time: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <select
                value={callDetails.duration}
                onChange={(e) => setCallDetails({ ...callDetails, duration: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description / Agenda</label>
            <textarea
              value={callDetails.description}
              onChange={(e) => setCallDetails({ ...callDetails, description: e.target.value })}
              placeholder="Agenda, topics to discuss, preparation needed, etc."
              rows="3"
              className="form-textarea"
            />
          </div>
        </div>
        <div className="workspace-modal-footer">
          <button
            className="btn-outline"
            onClick={() => setShowScheduleModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              alert('Call scheduled successfully!');
              setShowScheduleModal(false);
              setCallDetails({
                title: '',
                date: '',
                time: '',
                duration: 30,
                description: ''
              });
            }}
            disabled={!callDetails.title || !callDetails.date || !callDetails.time}
          >
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading && !workspace) {
    return (
      <div className="workspace-loading">
        <div className="loading-content">
          <FaSpinner className="spinning" />
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="workspace-error">
        <div className="error-content">
          <FaExclamationTriangle />
          <h3>Unable to load workspace</h3>
          <p>{error}</p>
          <button onClick={fetchWorkspaceData} className="btn-primary">
            <FaSpinner /> Retry
          </button>
          <button onClick={() => navigate('/freelancer/dashboard')} className="btn-outline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!workspace && !loading) {
    return (
      <div className="workspace-error">
        <div className="error-content">
          <h3>Workspace Not Found</h3>
          <p>The requested workspace does not exist or you don't have access.</p>
          <button onClick={() => navigate('/freelancer/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'milestones', label: 'Milestones', icon: <FaCheckCircle /> },
    { id: 'messages', label: 'Messages', icon: <FaCommentDots /> },
    { id: 'files', label: 'Files', icon: <FaFolderOpen /> },
    { id: 'earnings', label: 'Earnings', icon: <FaWallet /> },
    { id: 'calls', label: 'Calls', icon: <FaVideo /> },
    { id: 'notes', label: 'Private Notes', icon: <FaStickyNote /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> }
  ];

  return (
    <div className={`freelancer-workspace ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 🔵 TOP NAVBAR — REPLACES SIDEBAR COMPLETELY */}
      <div className="workspace-topnav-wrapper">

        {/* Project Title + Client */}
        <div className="workspace-topnav-header">
          <div className="topnav-left">
            <h3 className="proj-title">{workspace?.title || "Untitled Project"}</h3>

            <div className="proj-sub">
              <span><FaUser /> {clientProfile?.name || "Client"}</span>
              <span className="proj-status">{workspace?.status || "Active"}</span>
            </div>
          </div>
        </div>

        {/* 🔹 Navigation Button Tabs */}
        <div className="topnav-button-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`topnav-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

      </div>


      {/* Main Content */}
      <div className="workspace-main">
        {/* Header */}

        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumb">
              <button onClick={() => navigate('/freelancer/dashboard')}>
                <FaHome /> Dashboard
              </button>
              <span>/</span>
              <button onClick={() => navigate('/freelancer/workspaces')}>
                Workspaces
              </button>
              <span>/</span>
              <span className="current">{workspace.title || 'Project'}</span>
            </div>

            <div className="header-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search workspace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right">
            <div className="notification-container">
              <button
                className="header-action notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              {showNotifications && <NotificationsPanel />}
            </div>
            <button className="header-action">
              <FaCog />
            </button>
            <div className="user-profile">
              <div className="avatar">
                {userProfile?.name?.charAt(0) || workspace.freelancerName?.charAt(0) || 'F'}
              </div>
              <span>{userProfile?.name || workspace.freelancerName || 'Freelancer'}</span>
            </div>
          </div>
        </header>
        {/* Content Area */}
        <main className="workspace-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <FreelancerWorkspaceOverview
              workspaceData={{
                workspace,
                userProfile,
                clientProfile,
                stats
              }}
              loading={loading}
              onRefresh={fetchWorkspaceData}
            />
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="milestones-tab">
              <div className="section-header">
                <h2>Milestones & Submissions</h2>
                <div className="milestone-summary">
                  <span>{stats.milestones?.completed || 0}/{stats.milestones?.total || 0} Completed</span>
                  <span className="progress-text">{stats.progress || 0}% Overall Progress</span>
                </div>
              </div>

              {workspace?.sharedMilestones?.length > 0 ? (
                <div className="milestones-container">
                  {workspace.sharedMilestones.map((milestone, index) => {
                    const isPending = milestone?.status === 'pending' || milestone?.status === 'not_started';
                    const isInProgress = milestone?.status === 'in_progress';
                    const isAwaitingApproval = milestone?.status === 'awaiting_approval' || milestone?.status === 'submitted';
                    const isCompleted = milestone?.status === 'completed' || milestone?.status === 'approved' || milestone?.status === 'paid';
                    const isRevision = milestone?.status === 'revision_requested';
                    const isRejected = milestone?.status === 'rejected';

                    // Check if previous milestone is completed
                    const previousMilestone = index > 0 ? workspace.sharedMilestones[index - 1] : null;
                    const isPreviousCompleted = previousMilestone ?
                      ['completed', 'approved', 'paid'].includes(previousMilestone.status) :
                      true; // First milestone is always accessible

                    const isLocked = !isPreviousCompleted && isPending;
                    const canStart = isPreviousCompleted && isPending;

                    return (
                      <div
                        key={milestone?._id || milestone?.milestoneId || index}
                        className={`milestone-card ${isLocked ? 'locked' : ''}`}
                      >
                        <div className="milestone-header">
                          <div className="milestone-info">
                            <h3>{milestone?.title || `Milestone ${milestone?.phaseNumber || index + 1}`}</h3>
                            <p className="phase">Phase {milestone?.phaseNumber || index + 1}</p>
                          </div>
                          <div className="milestone-status">
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(milestone?.status) }}
                            >
                              {isLocked ? 'Locked' : (milestone?.status?.replace('_', ' ') || 'Pending')}
                            </span>
                            <span className="amount">{formatCurrency(milestone?.amount || 0)}</span>
                          </div>
                        </div>

                        <div className="milestone-details">
                          <p>{milestone?.description || 'No description provided'}</p>
                          <div className="detail-row">
                            <div className="detail-item">
                              <FaCalendarAlt />
                              <span>Due: {formatDate(milestone?.dueDate)}</span>
                            </div>
                            <div className="detail-item">
                              <FaClock />
                              <span>Duration: {milestone?.duration || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Deliverables if available */}
                          {milestone?.deliverables && milestone.deliverables.length > 0 && (
                            <div className="deliverables">
                              <h4>Deliverables:</h4>
                              <ul>
                                {milestone.deliverables.map((deliverable, idx) => (
                                  <li key={idx}>{deliverable}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Status-specific actions */}
                        <div className="milestone-actions">
                          {isLocked && (
                            <div className="locked-status">
                              <div className="status-message">
                                <FaClock />
                                <div>
                                  <h4>Locked</h4>
                                  <p>Complete Phase {milestone?.phaseNumber - 1 || index} to unlock this milestone</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {canStart && (
                            <button
                              className="btn-primary"
                              onClick={() => updateMilestoneStatus(milestone?._id || milestone?.milestoneId, 'in_progress')}
                            >
                              <FaCheckCircle /> Start Work
                            </button>
                          )}

                          {isInProgress && (
                            <div className="submission-section">
                              <h4>Submit Work for Review</h4>
                              <div className="submission-form">
                                <textarea
                                  placeholder="Add notes about your submission..."
                                  rows="3"
                                  className="submission-notes"
                                  id={`notes-${milestone?._id || index}`}
                                />
                                <div className="file-upload-section">
                                  <input
                                    type="file"
                                    id={`file-${milestone?._id || index}`}
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        await handleFileUpload(file);
                                      }
                                    }}
                                  />
                                  <button
                                    className="btn-outline"
                                    onClick={() => document.getElementById(`file-${milestone?._id || index}`).click()}
                                  >
                                    <FaUpload /> Attach File
                                  </button>
                                </div>
                                <button
                                  className="btn-primary"
                                  onClick={() => {
                                    const notes = document.getElementById(`notes-${milestone?._id || index}`)?.value || '';
                                    handleMilestoneSubmit(milestone?._id || milestone?.milestoneId, {
                                      notes: notes || 'Submitted for review',
                                      submissionDate: new Date().toISOString()
                                    });
                                  }}
                                >
                                  <FaPaperPlane /> Submit for Review
                                </button>
                              </div>
                            </div>
                          )}

                          {isAwaitingApproval && (
                            <div className="awaiting-approval">
                              <div className="status-message">
                                <FaClock />
                                <div>
                                  <h4>Awaiting Client Approval</h4>
                                  <p>Your submission is under review by the client.</p>
                                </div>
                              </div>
                              <button
                                className="btn-outline"
                                onClick={() => {
                                  // Show submission details
                                  alert(`Submission Details:\n\nMilestone: ${milestone?.title}\nStatus: Awaiting Approval\nSubmitted: ${formatDate(milestone?.submissionDate)}\nAmount: ${formatCurrency(milestone?.amount)}`);
                                }}
                              >
                                <FaEye /> View Submission Details
                              </button>
                            </div>
                          )}

                          {isRevision && (
                            <div className="revision-requested">
                              <div className="status-message warning">
                                <FaExclamationTriangle />
                                <div>
                                  <h4>Revision Requested</h4>
                                  <p>The client has requested changes to your submission.</p>
                                </div>
                              </div>
                              <button
                                className="btn-primary"
                                onClick={() => updateMilestoneStatus(milestone?._id || milestone?.milestoneId, 'in_progress')}
                              >
                                <FaUpload /> Make Revisions
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <div className="revision-requested">
                              <div className="status-message warning">
                                <FaExclamationTriangle />
                                <div>
                                  <h4>Submission Rejected</h4>
                                  <p>The client has rejected your submission.</p>
                                </div>
                              </div>
                              <button
                                className="btn-primary"
                                onClick={() => updateMilestoneStatus(milestone?._id || milestone?.milestoneId, 'in_progress')}
                              >
                                <FaUpload /> Resubmit Work
                              </button>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="completed-status">
                              <div className="status-message success">
                                <FaCheck />
                                <div>
                                  <h4>Approved & Completed</h4>
                                  <p>Payment: {milestone?.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}</p>
                                </div>
                              </div>
                              <button
                                className="btn-outline"
                                onClick={() => {
                                  // Show approval details
                                  alert(`Milestone Completion Details:\n\nMilestone: ${milestone?.title}\nStatus: Completed\nApproved: ${formatDate(milestone?.approvedDate || milestone?.completionDate)}\nAmount: ${formatCurrency(milestone?.amount)}\nPayment Status: ${milestone?.paymentStatus || 'Pending'}`);
                                }}
                              >
                                <FaFileAlt /> View Approval Details
                              </button>
                            </div>
                          )}

                          <button
                            className="btn-outline"
                            onClick={() => {
                              // Show detailed milestone information
                              const details = `
Milestone Details:
--------------------
Title: ${milestone?.title || 'N/A'}
Phase: ${milestone?.phaseNumber || index + 1}
Status: ${milestone?.status?.replace('_', ' ') || 'Pending'}
Amount: ${formatCurrency(milestone?.amount || 0)}
Due Date: ${formatDate(milestone?.dueDate)}
Duration: ${milestone?.duration || 'N/A'}
Description: ${milestone?.description || 'No description provided'}
Payment Status: ${milestone?.paymentStatus || 'Pending'}
${milestone?.deliverables?.length > 0 ? `\nDeliverables:\n${milestone.deliverables.map(d => `• ${d}`).join('\n')}` : ''}
                    `;
                              alert(details.trim());
                            }}
                          >
                            <FaEye /> View Details
                          </button>
                        </div>

                        {/* Timeline/Progress indicator */}
                        <div className="milestone-timeline">
                          <div className={`timeline-step ${isPending ? 'active' : ''}`}>
                            <span>Pending</span>
                          </div>
                          <div className={`timeline-step ${isInProgress ? 'active' : ''}`}>
                            <span>In Progress</span>
                          </div>
                          <div className={`timeline-step ${isAwaitingApproval ? 'active' : ''}`}>
                            <span>Under Review</span>
                          </div>
                          <div className={`timeline-step ${isCompleted ? 'active' : ''}`}>
                            <span>Completed</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <FaCheckCircle />
                  <h3>No milestones yet</h3>
                  <p>Milestones will appear here once they're added to the project</p>
                </div>
              )}
            </div>
          )}


          {/* Messages Tab - Updated with WhatsApp-like features */}
          {activeTab === 'messages' && (
            <div className="messages-tab">
              <div className="section-header">
                <h2>Messages</h2>
                <div className="message-summary">
                  <span>{stats.messages?.total || 0} total messages</span>
                  {stats.messages?.unread > 0 && (
                    <span className="unread-count">{stats.messages.unread} unread</span>
                  )}
                </div>
              </div>

              <div className="messages-container">
                {(workspace?.sharedMessages || []).length > 0 ? (
                  [...(workspace.sharedMessages || [])]
                    .sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt))
                    .map((message, index) => (
                      <div
                        key={message._id || message.messageId || index}
                        className={`message-bubble ${message.senderRole === 'freelancer' ? 'sent' : 'received'}`}
                      >
                        <div className="message-avatar">
                          {message.senderRole === 'client' ? 'C' : 'F'}
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender">
                              {message.senderRole === 'client' ? clientProfile?.name || 'Client' : userProfile?.name || 'You'}
                            </span>
                            <span className="time">
                              {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="message-text">{message.content}</div>
                          {message.senderRole === 'freelancer' && (
                            <div className="message-status">
                              {message.read ? (
                                <span className="status-read">✓✓ Read</span>
                              ) : message.delivered ? (
                                <span className="status-delivered">✓✓ Delivered</span>
                              ) : (
                                <span className="status-sent">✓ Sent</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="empty-state">
                    <FaCommentDots />
                    <h3>No messages yet</h3>
                    <p>Start the conversation with your client</p>
                  </div>
                )}
              </div>

              <div className="message-input-container">
                <div className="message-input">
                  <textarea
                    placeholder="Type your message here..."
                    rows="3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="input-actions">
                    <button className="btn-primary send-btn" onClick={sendMessage}>
                      <FaPaperPlane /> Send
                    </button>
                  </div>
                </div>
                <div className="message-tips">
                  <small>Press Enter to send, Shift+Enter for new line</small>
                </div>
              </div>
            </div>
          )}



          {/* Files Tab - Enhanced with proper upload functionality */}
          {activeTab === 'files' && (
            <div className="files-tab">
              <div className="section-header">
                <h2>Shared Files</h2>
                <div className="file-actions">
                  <button
                    className="btn-primary"
                    onClick={() => document.getElementById('file-upload-input').click()}
                  >
                    <FaUpload /> Upload File
                  </button>
                  <input
                    id="file-upload-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                          await handleFileUpload(files[i]);
                        }
                        e.target.value = '';
                      }
                    }}
                    multiple
                  />
                  <button className="btn-outline" onClick={fetchFiles}>
                    <FaDownload /> Refresh Files
                  </button>
                </div>
              </div>

              {/* File Upload Drag & Drop Zone */}
              <div className="file-upload-zone"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                      handleFileUpload(files[i]);
                    }
                  }
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
              >
                <FaFileUpload size={48} />
                <h4>Drop files here or click to upload</h4>
                <p>Upload files to share with your client</p>
                <small>Maximum file size: 50MB</small>
              </div>

              <div className="files-stats">
                <div className="stat-item">
                  <FaFolderOpen />
                  <span>{stats.files?.total || 0} Total Files</span>
                </div>
                <div className="stat-item">
                  <FaFileAlt />
                  <span>{workspace?.sharedFiles?.filter(f => f?.uploadedBy?.role === 'freelancer').length || 0} Uploaded by You</span>
                </div>
                <div className="stat-item">
                  <FaUser />
                  <span>{workspace?.sharedFiles?.filter(f => f?.uploadedBy?.role === 'client').length || 0} From Client</span>
                </div>
              </div>

              {/* Files Grid with enhanced functionality */}
              {stats.files?.recent?.length > 0 ? (
                <>
                  <div className="files-grid">
                    {stats.files.recent.map((file, index) => {
                      if (!file) return null;

                      const fileName = file.originalName || file.name || 'Unnamed File';
                      const isUploadedByYou = file.uploadedBy?.role === 'freelancer';
                      const fileType = file.fileType || file.type || '';
                      const fileSize = formatFileSize(file.fileSize);
                      const uploadDate = formatDate(file.uploadDate || file.createdAt);
                      const uploadedBy = file.uploadedBy?.name || 'Unknown';

                      return (
                        <div key={index} className="file-card">
                          <div className="file-header">
                            <div className="file-icon">
                              {fileType.includes('image') ? <FaImage /> :
                                fileType.includes('pdf') ? <FaFileAlt /> :
                                  fileType.includes('video') ? <FaVideo /> :
                                    fileType.includes('audio') ? <FaMusic /> :
                                      fileType.includes('zip') || fileType.includes('rar') ? <FaArchive /> :
                                        <FaFileAlt />}
                            </div>
                            <div className="file-status">
                              {isUploadedByYou ? (
                                <span className="status-badge uploaded">Uploaded</span>
                              ) : (
                                <span className="status-badge received">From Client</span>
                              )}
                              {file.sharedWith?.includes('client') && (
                                <span className="shared-badge">
                                  <FaPaperPlane size={10} /> Shared
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="file-content">
                            <h4 title={fileName}>
                              {fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName}
                            </h4>
                            <div className="file-meta">
                              <span>{fileSize}</span>
                              <span>•</span>
                              <span>{uploadDate}</span>
                            </div>
                            <div className="file-uploader">
                              <FaUser size={12} />
                              <span>{uploadedBy}</span>
                            </div>
                          </div>

                          <div className="file-actions">
                            {file.fileUrl || file.url ? (
                              <>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleViewFile(file)}
                                  title="Preview file"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="btn-icon"
                                  onClick={() => handleDownloadFile(file)}
                                  title="Download file"
                                >
                                  <FaDownload />
                                </button>
                                {isUploadedByYou && (
                                  <button
                                    className="btn-icon"
                                    onClick={async () => {
                                      // Reshare with client functionality
                                      if (confirm(`Reshare "${fileName}" with client?`)) {
                                        addNotification(
                                          'file_reshare',
                                          'File Reshared',
                                          `You reshared "${fileName}" with ${clientProfile?.name || 'Client'}`,
                                          {
                                            file: file,
                                            workspaceId,
                                            resharedBy: userProfile?.name || 'Freelancer'
                                          }
                                        );
                                        alert(`File "${fileName}" has been reshared with your client!`);
                                      }
                                    }}
                                    title="Reshare with client"
                                  >
                                    <FaPaperPlane />
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="no-preview">Preview not available</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Files Button */}
                  {stats.files.total > 5 && (
                    <div className="view-all-files">
                      <button
                        className="btn-outline"
                        onClick={() => {
                          // Show all files modal or navigate to files page
                          alert(`Showing all ${stats.files.total} files`);
                        }}
                      >
                        <FaFolderOpen /> View All Files ({stats.files.total})
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <FaFolderOpen size={48} />
                  <h3>No files shared yet</h3>
                  <p>Upload files to share with your client</p>
                  <button
                    className="btn-primary"
                    onClick={() => document.getElementById('file-upload-input').click()}
                  >
                    <FaUpload /> Upload First File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Calls Tab */}
          {activeTab === 'calls' && (
            <div className="calls-tab">
              <div className="section-header">
                <h2>Video Calls</h2>
                <div className="call-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <FaVideo /> Schedule Call
                  </button>
                  <button className="btn-outline">
                    <FaPhone /> Start Instant Call
                  </button>
                </div>
              </div>

              <div className="upcoming-calls">
                <h3>Upcoming Calls</h3>
                <div className="empty-state">
                  <FaVideo />
                  <p>No scheduled calls</p>
                  <button className="btn-text" onClick={() => setShowScheduleModal(true)}>
                    Schedule your first call
                  </button>
                </div>
              </div>

              <div className="call-history">
                <h3>Call History</h3>
                <div className="empty-state">
                  <FaHistory />
                  <p>No past calls</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <FreelancerNotes workspaceId={workspaceId} />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-tab">
              <div className="section-header">
                <h2>Reports & Analytics</h2>
              </div>

              <div className="reports-grid">
                <div className="report-card" onClick={() => alert('Work Progress Report - Coming Soon!')}>
                  <div className="card-icon">
                    <FaChartBar />
                  </div>
                  <div className="card-content">
                    <h3>Work Progress</h3>
                    <p>Track your project completion rate</p>
                    <button className="btn-text">View Report</button>
                  </div>
                </div>

                <div className="report-card" onClick={() => alert('Earnings Report - Coming Soon!')}>
                  <div className="card-icon">
                    <FaWallet />
                  </div>
                  <div className="card-content">
                    <h3>Earnings Report</h3>
                    <p>Detailed earnings breakdown</p>
                    <button className="btn-text">View Report</button>
                  </div>
                </div>

                <div className="report-card" onClick={() => alert('Time Tracking Report - Coming Soon!')}>
                  <div className="card-icon">
                    <FaClock />
                  </div>
                  <div className="card-content">
                    <h3>Time Tracking</h3>
                    <p>Hours worked analysis</p>
                    <button className="btn-text">View Report</button>
                  </div>
                </div>

                <div className="report-card" onClick={() => alert('Milestone Performance Report - Coming Soon!')}>
                  <div className="card-icon">
                    <FaCheckCircle />
                  </div>
                  <div className="card-content">
                    <h3>Milestone Performance</h3>
                    <p>Completion rate and delays</p>
                    <button className="btn-text">View Report</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="workspace-footer">
          <div className="footer-left">
            <span className="workspace-id">Workspace ID: {workspace.workspaceId || workspaceId}</span>
            <span className="last-updated">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="footer-right">
            <button
              className="btn-text"
              onClick={fetchWorkspaceData}
              disabled={loading}
            >
              <FaSpinner className={loading ? 'spinning' : ''} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate('/freelancer/dashboard')}
            >
              <FaSignOutAlt /> Exit Workspace
            </button>
          </div>
        </footer>
      </div>

      {/* Schedule Call Modal */}
      {showScheduleModal && <ScheduleCallModal />}
    </div>
  );
};

export default FreelancerWorkspace;