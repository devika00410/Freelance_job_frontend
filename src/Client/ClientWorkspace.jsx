// ClientWorkspace.jsx - Updated with Navbar Design
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaFolderOpen, FaCommentDots, FaCheckCircle, FaVideo, FaCalendarAlt,
  FaDollarSign, FaExclamationTriangle, FaUser, FaClock, FaFileAlt,
  FaImage, FaUpload, FaDownload, FaEye, FaSpinner, FaCheck,
  FaPaperPlane, FaChartBar, FaWallet, FaStickyNote, FaFileContract,
  FaHome, FaSearch, FaBell, FaCog, FaSignOutAlt,
  FaEdit, FaMusic, FaArchive 
} from 'react-icons/fa';
import io from 'socket.io-client';

import ClientMilestoneApprovals from './ClientMilestoneApprovals';
import ClientPaymentManager from './ClientPaymentManager';
import ClientReportsDashboard from './ClientReportsDashboard';
import ClientNotes from './ClientNotes';
import SharedMeetingScheduler from './SharedMeetingScheduler';
import ClientWorkspaceOverview from './ClientWorkspaceOverview';
import ContractViewer from './ClientContractViewer';

import './ClientWorkspace.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ===== Helper function to parse workspaceId =====
const parseWorkspaceId = (workspaceId) => {
  if (!workspaceId) return null;
  
  if (typeof workspaceId === 'string' && workspaceId.length === 24) {
    return workspaceId;
  }
  
  if (typeof workspaceId === 'string' && workspaceId.includes('object')) {
    const stored = localStorage.getItem('currentWorkspaceId');
    if (stored) return stored;
    
    try {
      const parsed = JSON.parse(workspaceId);
      return parsed.id || parsed._id || parsed.workspaceId;
    } catch (e) {
      return null;
    }
  }
  
  if (typeof workspaceId === 'object' && workspaceId !== null) {
    return workspaceId.id || workspaceId._id || workspaceId.workspaceId;
  }
  
  return workspaceId;
};

const ClientWorkspace = () => {
  const { workspaceId: rawWorkspaceId } = useParams();
  const navigate = useNavigate();
  
  const workspaceId = parseWorkspaceId(rawWorkspaceId);
  console.log('📌 Workspace ID:', workspaceId);
  
  const [userId, setUserId] = useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        let id = parsed._id || parsed.id || parsed.userId;
        if (id && typeof id === 'string') {
          if (id.includes('ObjectId')) {
            const match = id.match(/'([^']+)'/);
            if (match) {
              id = match[1];
            }
          }
          return id;
        }
        return id || '';
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    }
    
    const directId = localStorage.getItem('userId') || 
                     localStorage.getItem('user_id') || 
                     localStorage.getItem('userID') || '';
    
    if (directId.includes('ObjectId')) {
      const match = directId.match(/'([^']+)'/);
      if (match) return match[1];
    }
    
    return directId;
  });
  
  const [userRole, setUserRole] = useState('client');
  const [workspace, setWorkspace] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Stats state
  const [stats, setStats] = useState({
    progress: 0,
    earnings: { total: 0, pending: 0, upcoming: 0 },
    milestones: { total: 0, completed: 0, pending: 0, awaitingApproval: 0 },
    messages: { total: 0, unread: 0 },
    files: { total: 0, recent: [] }
  });

  // Chat and socket state
  const [newMessage, setNewMessage] = useState('');
  const [sharedMessages, setSharedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  const chatEndRef = useRef(null);

  // Workspace data
  const [sharedFiles, setSharedFiles] = useState([]);
  const [sharedMilestones, setSharedMilestones] = useState([]);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [videoCalls, setVideoCalls] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [callDetails, setCallDetails] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    description: ''
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchCountRef = useRef(0);
  const dataLoadedRef = useRef(false);

  // Navigation tabs - Updated for navbar
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'milestones', label: 'Milestones', icon: <FaCheckCircle /> },
    { id: 'budget', label: 'Budget & Payments', icon: <FaWallet /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
    { id: 'notes', label: 'Private Notes', icon: <FaStickyNote /> },
    { id: 'meetings', label: 'Meetings', icon: <FaVideo /> },
    { id: 'chat', label: 'Chat', icon: <FaCommentDots /> },
    { id: 'files', label: 'Files', icon: <FaFolderOpen /> },
    { id: 'contract', label: 'Contract', icon: <FaFileContract /> }
  ];

  // ===== Initialize user info =====
  useEffect(() => {
    const loadUserInfo = () => {
      console.log('🔄 Loading user info...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      let extractedUserId = userId;
      
      if (!extractedUserId) {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            extractedUserId = parsed._id || parsed.id;
            if (extractedUserId && typeof extractedUserId === 'string') {
              if (extractedUserId.includes('ObjectId')) {
                const match = extractedUserId.match(/'([^']+)'/);
                if (match) {
                  extractedUserId = match[1];
                }
              }
              setUserId(extractedUserId);
              console.log('✅ Extracted userId from userData:', extractedUserId);
            }
          } catch (error) {
            console.error('Error parsing userData:', error);
          }
        }
      }
      
      const storedRole = localStorage.getItem('userRole') || 'client';
      setUserRole(storedRole);
    };
    
    loadUserInfo();
  }, [navigate, userId]);

  // ===== Fetch contract details =====
  const fetchContractDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !workspaceId) return;

      console.log('🔍 Fetching contract details...');
      
      // Try multiple endpoints
      const endpoints = [
        `${API_URL}/api/contracts/${workspaceId}`,
        `${API_URL}/api/contracts/workspace/${workspaceId}`,
        `${API_URL}/api/workspaces/${workspaceId}/contract`
      ];

      let contractResponse = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.contract || data.success) {
              contractResponse = data.contract || data;
              console.log(`✅ Success from endpoint: ${endpoint}`);
              break;
            }
          }
        } catch (error) {
          lastError = error;
          console.log(`❌ Failed endpoint ${endpoint}:`, error.message);
        }
      }

      if (contractResponse) {
        setContractDetails(contractResponse);
        console.log('📄 Contract data loaded:', contractResponse);

        // Extract milestones from contract
        if (contractResponse.milestones || contractResponse.phases) {
          const contractMilestones = contractResponse.milestones || contractResponse.phases || [];
          setSharedMilestones(contractMilestones.map((milestone, index) => ({
            _id: milestone._id || `milestone-${index + 1}`,
            title: milestone.title || `Milestone ${index + 1}`,
            phase: milestone.phase || index + 1,
            amount: milestone.amount || milestone.value || 0,
            description: milestone.description || milestone.deliverables || '',
            status: milestone.status || 'pending',
            dueDate: milestone.dueDate || milestone.deliveryDate,
            deliverables: milestone.deliverables || [],
            paymentStatus: milestone.paymentStatus || 'pending',
            ...(milestone.submission && { submission: milestone.submission })
          })));
        }
      } else {
        console.log('❌ Could not fetch contract from any endpoint');
      }
    } catch (error) {
      console.error('🔥 Error in fetchContractDetails:', error);
    }
  };

  // ===== Calculate stats from workspace data =====
  const calculateStats = useCallback((workspaceData, milestones) => {
    if (!workspaceData || !milestones) return;
    
    const completedMilestones = milestones.filter(m => 
      m.status === 'completed' || m.status === 'approved' || m.status === 'paid'
    ).length;
    
    const pendingMilestones = milestones.filter(m => 
      m.status === 'pending' || m.status === 'not_started'
    ).length;
    
    const awaitingApprovalMilestones = milestones.filter(m => 
      m.status === 'awaiting_approval' || m.status === 'submitted' || m.status === 'review'
    ).length;
    
    const totalEarnings = milestones
      .filter(m => m.status === 'completed' || m.status === 'approved' || m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const pendingEarnings = milestones
      .filter(m => m.status === 'awaiting_approval' || m.status === 'submitted' || m.status === 'review')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const upcomingEarnings = milestones
      .filter(m => m.status === 'pending' || m.status === 'not_started')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const progress = milestones.length > 0 
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
    
    setStats(prev => ({
      ...prev,
      progress,
      milestones: {
        total: milestones.length,
        completed: completedMilestones,
        pending: pendingMilestones,
        awaitingApproval: awaitingApprovalMilestones
      },
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        upcoming: upcomingEarnings
      }
    }));
  }, []);

  // ===== Fetch workspace data =====
const fetchData = async () => {
  if (dataLoadedRef.current) return;
  
  setLoading(true);
  setApiError(null);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    console.log('🔍 Fetching workspace...');

    // Use Promise.race for timeout
    const fetchPromise = fetch(`${API_URL}/api/workspaces/client/${workspaceId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    // Timeout after 3 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.workspace) {
          console.log('✅ Real API data loaded:', data.workspace.title);
          setWorkspace(data.workspace);
          
          if (data.workspace.milestones) {
            setSharedMilestones(data.workspace.milestones);
            calculateStats(data.workspace, data.workspace.milestones);
          }
          
          dataLoadedRef.current = true;
          setLoading(false);
          return;
        }
      }
    } catch (fetchError) {
      console.log('⚠️ API call failed:', fetchError.message);
    }
    
    // Fallback to mock data
    console.log('🎭 Falling back to mock data');
    createMockWorkspace();
    
  } catch (error) {
    console.error('❌ Main error:', error);
    createMockWorkspace();
  }
};

 // ===== Initialize WebSocket =====
useEffect(() => {
  if (!workspaceId || !userId) {
    console.log('⚠️ WebSocket: Missing workspaceId or userId');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('⚠️ WebSocket: No authentication token found');
    return;
  }

  console.log('🔌 Initializing WebSocket connection...');
  
  // Create socket with robust error handling
  const newSocket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
    autoConnect: true
  });

  setSocket(newSocket);

  // Connection established
  newSocket.on('connect', () => {
    console.log('✅ WebSocket connected successfully');
    console.log('📡 Socket ID:', newSocket.id);
    
    // Join the workspace room
    newSocket.emit('join_workspace', { workspaceId });
    
    // Notify that user is online
    newSocket.emit('user_online', {
      userId: userId,
      workspaceId: workspaceId,
      role: userRole,
      userName: workspace?.client?.name || 'Client'
    });
  });

  // Connection error
  newSocket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error.message);
    
    // Check if it's a specific error type
    if (error.message.includes('Invalid credentials')) {
      console.log('⚠️ Authentication error, clearing token...');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
    
    // Don't show connection errors to users unless they're critical
  });

  // Socket error
  newSocket.on('error', (error) => {
    console.error('❌ WebSocket general error:', error);
  });

  // Reconnection events
  newSocket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Attempting to reconnect (${attemptNumber}/10)...`);
  });

  newSocket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconnected successfully after ${attemptNumber} attempts`);
    
    // Rejoin workspace after reconnection
    newSocket.emit('join_workspace', { workspaceId });
    newSocket.emit('user_online', {
      userId: userId,
      workspaceId: workspaceId,
      role: userRole,
      userName: workspace?.client?.name || 'Client'
    });
  });

  newSocket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection error:', error);
  });

  newSocket.on('reconnect_failed', () => {
    console.error('❌ WebSocket reconnection failed after all attempts');
    // Optionally show a non-intrusive notification to user
  });

  // Disconnect event
  newSocket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
    
    if (reason === 'io server disconnect') {
      // The server has forcefully disconnected the socket
      console.log('⚠️ Server disconnected the socket');
    }
    
    // Update other party status to offline
    setOtherPartyOnline(false);
  });


  // ===== Message Event Handlers =====

  // New shared message received
  newSocket.on('new_shared_message', (message) => {
    console.log('📨 New message received:', message);
    setSharedMessages(prev => [...prev, message]);
    setStats(prev => ({
      ...prev,
      messages: { ...prev.messages, total: prev.messages.total + 1 }
    }));
  });

  // User online status
  newSocket.on('user_online', (onlineUser) => {
    console.log('🟢 User online:', onlineUser);
    if (workspace?.freelancerId === onlineUser.userId) {
      setOtherPartyOnline(true);
    }
  });

  // User offline status
  newSocket.on('user_offline', (offlineUser) => {
    console.log('🔴 User offline:', offlineUser);
    if (workspace?.freelancerId === offlineUser.userId) {
      setOtherPartyOnline(false);
    }
  });

  // Initial workspace messages
  newSocket.on('workspace_messages', (messages) => {
    console.log('📬 Received workspace messages:', messages.length);
    setSharedMessages(messages);
    setStats(prev => ({
      ...prev,
      messages: { 
        ...prev.messages, 
        total: messages.length,
        unread: messages.filter(m => 
          m.senderRole !== 'client' && 
          !m.readAt
        ).length
      }
    }));
  });

  // New file uploaded
  newSocket.on('new_file_uploaded', (fileData) => {
    console.log('📁 New file uploaded:', fileData);
    setSharedFiles(prev => [fileData, ...prev]);
    setStats(prev => ({
      ...prev,
      files: {
        total: prev.files.total + 1,
        recent: [fileData, ...prev.files.recent.slice(0, 4)]
      }
    }));
  });

  // Milestone submitted
  newSocket.on('milestone_submitted', (milestoneData) => {
    console.log('📋 Milestone submitted:', milestoneData);
    setSharedMilestones(prev => prev.map(m => 
      m._id === milestoneData._id ? { ...m, ...milestoneData } : m
    ));
    calculateStats(workspace, sharedMilestones.map(m => 
      m._id === milestoneData._id ? { ...m, ...milestoneData } : m
    ));
  });

  // Milestone approved notification
  newSocket.on('milestone_approved', (data) => {
    console.log('✅ Milestone approved notification:', data);
    // Update UI or show notification
  });

  // Milestone changes requested
  newSocket.on('milestone_changes_requested', (data) => {
    console.log('✏️ Milestone changes requested:', data);
    // Update UI or show notification
  });

  // Typing indicators (optional)
  newSocket.on('user_typing', (data) => {
    if (data.userId !== userId) {
      console.log('✍️ User is typing...');
      // Could implement typing indicator UI here
    }
  });

  // Cleanup function
  return () => {
    console.log('🧹 Cleaning up WebSocket connection...');
    
    if (newSocket && newSocket.connected) {
      // Notify server that user is leaving
      newSocket.emit('leave_workspace', { workspaceId });
      newSocket.emit('user_offline', { 
        userId: userId, 
        workspaceId: workspaceId 
      });
      
      // Disconnect socket
      newSocket.disconnect();
    }
    
    // Clear socket reference
    setSocket(null);
  };
}, [workspaceId, userId, workspace?.freelancerId, userRole, workspace, calculateStats, sharedMilestones]);

// Make sure this function is defined and working
const createMockWorkspace = () => {
  console.log('🎭 Creating mock workspace immediately...');
  
  const mockWorkspace = {
    _id: workspaceId,
    workspaceId: workspaceId,
    title: 'Digital Marketing Project',
    status: 'active',
    overallProgress: 45,
    currentPhase: 2,
    totalBudget: 5000,
    startDate: new Date('2024-01-15'),
    estimatedEndDate: new Date('2024-03-15'),
    serviceType: 'Marketing Strategy',
    
    client: {
      _id: userId,
      name: 'You',
      email: 'client@example.com'
    },
    
    freelancer: {
      _id: 'freelancer123',
      name: 'John Designer',
      email: 'john@example.com',
      skills: ['Design', 'Marketing']
    },
    
    milestones: [
      {
        _id: '1',
        title: 'Initial Research',
        status: 'completed',
        phaseNumber: 1,
        amount: 1000
      },
      {
        _id: '2',
        title: 'Design Phase',
        status: 'awaiting_approval',
        phaseNumber: 2,
        amount: 2000
      }
    ],
    
    userRoleInWorkspace: 'client',
    userPermissions: {
      canApproveMilestones: true,
      canUploadFiles: true,
      canSendMessages: true
    },
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date()
  };
  
  setWorkspace(mockWorkspace);
  setSharedMilestones(mockWorkspace.milestones);
  calculateStats(mockWorkspace, mockWorkspace.milestones);
  
  // IMPORTANT: Set loading to false
  setTimeout(() => {
    setLoading(false);
  }, 500); // Small delay to show loading state briefly
  
  console.log('✅ Mock workspace created');
};


// ===== Fetch workspace data =====


useEffect(() => {
  console.log('🚀 ClientWorkspace useEffect running');
  
  if (!workspaceId || !userId) {
    console.log('⚠️ Missing workspaceId or userId');
    return;
  }

  // Call the fetchData function
  fetchData();
  
  // Add a safety timeout in case fetchData fails
  const safetyTimeout = setTimeout(() => {
    if (loading && !workspace) {
      console.log('⏰ Safety timeout - showing mock data');
      createMockWorkspace();
    }
  }, 3000);

  return () => clearTimeout(safetyTimeout);
}, [workspaceId, userId]);


// In ClientWorkspace.jsx, add this helper function
const getContractByWorkspaceId = async (workspaceId) => {
  try {
    // Try different endpoints
    const endpoints = [
      `/api/contracts?workspaceId=${workspaceId}`,
      `/api/client/contracts?workspaceId=${workspaceId}`,
      `/api/freelancer/contracts?workspaceId=${workspaceId}`
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.contracts && data.contracts.length > 0) {
            return data.contracts[0]; // Return first contract
          }
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed:`, err.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching contract:', error);
    return null;
  }
};




const handleTyping = useCallback((isTyping) => {
  if (socket && socket.connected) {
    socket.emit('typing', {
      workspaceId,
      userId,
      isTyping,
      userName: workspace?.client?.name || 'Client'
    });
  }
}, [socket, workspaceId, userId, workspace]);

// Update your message input to trigger typing events
const handleMessageInputChange = (e) => {
  setNewMessage(e.target.value);
  
  // Debounced typing indicator
  if (socket && socket.connected) {
    clearTimeout(typingTimeoutRef.current);
    handleTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  }
};

// Add this ref at the top of your component
const typingTimeoutRef = useRef(null);

// Don't forget to clear timeout on unmount
useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);

  // ===== Scroll to bottom of chat =====
  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [sharedMessages, activeTab]);

  // ===== Handler functions =====
  const handleApproveMilestone = async (milestoneId, feedback = '') => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Approving milestone ${milestoneId}`);
      
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/milestones/${milestoneId}/approve`, {
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
          // Update local state
          setSharedMilestones(prev => prev.map(m => 
            m._id === milestoneId ? { 
              ...m, 
              status: 'completed', 
              approvalDate: new Date().toISOString(),
              paymentStatus: 'pending_payment'
            } : m
          ));
          
          calculateStats(workspace, sharedMilestones.map(m => 
            m._id === milestoneId ? { 
              ...m, 
              status: 'completed', 
              approvalDate: new Date().toISOString(),
              paymentStatus: 'pending_payment'
            } : m
          ));
          
          alert('Milestone approved successfully!');
          
          // Notify freelancer via socket
          if (socket) {
            socket.emit('milestone_approved', { milestoneId, feedback });
          }
        }
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Failed to approve milestone');
    }
  };

  const handleRequestChanges = async (milestoneId, feedback) => {
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
        setSharedMilestones(prev => prev.map(m => 
          m._id === milestoneId ? { ...m, status: 'changes_requested' } : m
        ));
        
        calculateStats(workspace, sharedMilestones.map(m => 
          m._id === milestoneId ? { ...m, status: 'changes_requested' } : m
        ));
        
        alert('Changes requested successfully!');
        
        // Notify freelancer via socket
        if (socket) {
          socket.emit('milestone_changes_requested', { milestoneId, feedback });
        }
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      alert('Failed to request changes');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return false;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('workspaceId', workspaceId);
      formData.append('uploaderRole', 'client');

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newFile = data.file;
          setSharedFiles(prev => [newFile, ...prev]);
          setStats(prev => ({
            ...prev,
            files: {
              total: prev.files.total + 1,
              recent: [newFile, ...prev.files.recent.slice(0, 4)]
            }
          }));
          
          // Notify freelancer via socket
          if (socket) {
            socket.emit('file_uploaded', newFile);
          }
          
          alert('File uploaded successfully!');
          return true;
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
    return false;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const messageData = {
        content: newMessage.trim(),
        senderRole: 'client',
        workspaceId: workspaceId,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      if (socket) {
        socket.emit('send_message', messageData);
      }

      // Save via API
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
        const newMsg = data.message || {
          messageId: Date.now().toString(),
          ...messageData,
          senderName: workspace?.client?.name || 'Client'
        };

        setSharedMessages(prev => [...prev, newMsg]);
        setStats(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            total: prev.messages.total + 1
          }
        }));

        setNewMessage('');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleScheduleCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspaceId}/calls/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...callDetails,
          workspaceId: workspaceId,
          scheduledDate: `${callDetails.date}T${callDetails.time}:00`,
          status: 'scheduled'
        })
      });

      if (response.ok) {
        alert('Call scheduled successfully!');
        setShowScheduleModal(false);
        setCallDetails({
          title: '',
          date: '',
          time: '',
          duration: 30,
          description: ''
        });
      }
    } catch (error) {
      console.log('API schedule call endpoint not available');
      alert('Schedule call feature coming soon!');
      setShowScheduleModal(false);
    }
  };

  // ===== Helper Functions =====
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

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOtherParty = () => {
    if (!workspace) return null;
    return {
      id: workspace.freelancerId,
      name: workspace.freelancer?.name || 'Freelancer'
    };
  };

  const handleDownloadContract = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/contracts/${workspaceId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${workspaceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Could not download contract. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Failed to download contract');
    }
  };

  // ===== Loading state =====
  if (loading && !workspace) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <FaSpinner className="spinning-icon" />
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (apiError && !workspace) {
    return (
      <div className="error-container">
        <div className="error-content">
          <FaExclamationTriangle />
          <h3>Unable to load workspace</h3>
          <p>{apiError}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="primary-button">
              Refresh Page
            </button>
            <button onClick={() => navigate('/client/dashboard')} className="outline-button">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace && !loading) {
    return (
      <div className="error-container">
        <div className="error-content">
          <FaExclamationTriangle />
          <h3>Workspace not found</h3>
          <button onClick={() => navigate('/client/dashboard')} className="primary-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const otherParty = getOtherParty();

  // ===== Schedule Call Modal =====
  const ScheduleCallModal = () => (
    <div className={`workspace-modal-overlay ${showScheduleModal ? 'show' : ''}`}>
      <div className="workspace-modal-content">
        <div className="workspace-modal-header">
          <h3>Schedule a Call</h3>
          <button className="modal-close-button" onClick={() => setShowScheduleModal(false)}>
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
          <button className="outline-button" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={handleScheduleCall}
            disabled={!callDetails.title || !callDetails.date || !callDetails.time}
          >
            Schedule Call
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="client-workspace">
      {/* 🔵 TOP NAVBAR — REPLACES SIDEBAR COMPLETELY */}
      <div className="workspace-navbar-wrapper">

        {/* Project Title + Freelancer Info */}
        <div className="workspace-navbar-header">
          <div className="navbar-left">
            <h3 className="proj-title">{workspace?.title || "Untitled Project"}</h3>

            <div className="project-meta">
              <span><FaUser /> Freelancer: {otherParty?.name || 'Freelancer'}</span>
              <span className="project-status">{workspace?.status || 'active'}</span>
            </div>
          </div>
        </div>

        {/* 🔹 Navigation Button Tabs */}
        <div className="navbar-tabs-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`navbar-tab ${activeTab === tab.id ? "active" : ""}`}
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
        <header className="workspace-main-header">
          <div className="header-section-left">
            <div className="breadcrumb-nav">
              <button onClick={() => navigate('/client/dashboard')}>
                <FaHome /> Dashboard
              </button>
              <span>/</span>
              <button onClick={() => navigate('/client/workspaces')}>
                Workspaces
              </button>
              <span>/</span>
              <span className="current-page">{workspace.title || 'Project'}</span>
            </div>

            <div className="search-container">
              <FaSearch />
              <input
                type="text"
                placeholder="Search workspace..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="header-section-right">
            <div className="notification-wrapper">
              <button
                className="header-icon-button notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-indicator">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            <button className="header-icon-button">
              <FaCog />
            </button>
            <div className="user-account">
              <div className="user-avatar">
                {workspace.client?.name?.charAt(0) || 'C'}
              </div>
              <span>{workspace.client?.name || 'Client'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="workspace-content-area">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <ClientWorkspaceOverview
              workspace={workspace}
              milestones={sharedMilestones}
              otherParty={otherParty}
              otherPartyOnline={otherPartyOnline}
              setActiveSection={setActiveTab}
            />
          )}

          {/* Milestones Tab with Approval System */}
          {activeTab === 'milestones' && (
            <div className="milestones-container">
              <div className="content-section-header">
                <h2>Milestone Approvals</h2>
                <div className="milestone-summary">
                  <div className="summary-item">
                    <span className="label">Completed</span>
                    <span className="value">{stats.milestones.completed}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Pending Review</span>
                    <span className="value">{stats.milestones.awaitingApproval}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total</span>
                    <span className="value">{stats.milestones.total}</span>
                  </div>
                </div>
              </div>

              {sharedMilestones.length > 0 ? (
                <div className="milestones-list">
                  {sharedMilestones.map(milestone => (
                    <div key={milestone._id} className="milestone-item">
                      <div className="milestone-header">
                        <div className="milestone-title">
                          <h3>{milestone.title}</h3>
                          <p className="phase-label">Phase {milestone.phase}</p>
                        </div>
                        <div className="milestone-status-info">
                          <span className={`status-tag ${milestone.status?.replace('_', '-')}`}>
                            {milestone.status?.replace('_', ' ') || 'Pending'}
                          </span>
                          <span className="amount-display">{formatCurrency(milestone.amount)}</span>
                        </div>
                      </div>

                      <div className="milestone-details">
                        <p>{milestone.description}</p>
                        <div className="details-row">
                          <div className="detail-info">
                            <FaCalendarAlt />
                            <span>Due: {formatDate(milestone.dueDate)}</span>
                          </div>
                          <div className="detail-info">
                            <FaClock />
                            <span>Status: {milestone.paymentStatus || 'Not Paid'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Show files if milestone has submissions */}
                      {milestone.submission?.files && milestone.submission.files.length > 0 && (
                        <div className="milestone-files">
                          <h4>Submitted Files</h4>
                          <div className="files-list">
                            {milestone.submission.files.map((file, index) => (
                              <div key={index} className="file-item">
                                <FaFileAlt className="file-type-icon" />
                                <a href={file.url || '#'} target="_blank" rel="noopener noreferrer" className="file-name">
                                  {file.name}
                                </a>
                                <div className="file-actions-row">
                                  <button className="icon-button" onClick={() => window.open(file.url || '#', '_blank')}>
                                    <FaEye />
                                  </button>
                                  <button className="icon-button" onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = file.url || '#';
                                    a.download = file.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }}>
                                    <FaDownload />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show submission notes */}
                      {milestone.submission?.notes && (
                        <div className="milestone-files">
                          <h4>Submission Notes</h4>
                          <p>{milestone.submission.notes}</p>
                        </div>
                      )}

                      {/* Approval actions for pending milestones */}
                      {milestone.status === 'awaiting_approval' && (
                        <div className="feedback-section">
                          <h4>Review & Approve</h4>
                          <textarea
                            className="feedback-textarea"
                            placeholder="Add your feedback or approval notes..."
                            id={`feedback-${milestone._id}`}
                          />
                          <div className="feedback-actions">
                            <button
                              className="primary-button success"
                              onClick={() => handleApproveMilestone(
                                milestone._id,
                                document.getElementById(`feedback-${milestone._id}`)?.value || ''
                              )}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              className="outline-button warning"
                              onClick={() => handleRequestChanges(
                                milestone._id,
                                document.getElementById(`feedback-${milestone._id}`)?.value || 'Please make the requested changes.'
                              )}
                            >
                              <FaEdit /> Request Changes
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status message for completed milestones */}
                      {milestone.status === 'completed' && (
                        <div className="milestone-actions">
                          <span className="status-text success">
                            <FaCheck /> Approved on {formatDate(milestone.approvalDate)}
                          </span>
                          <button
                            className="primary-button"
                            onClick={() => setActiveTab('budget')}
                          >
                            <FaDollarSign /> Make Payment
                          </button>
                        </div>
                      )}

                      {/* Status message for changes requested */}
                      {milestone.status === 'changes_requested' && (
                        <div className="milestone-actions">
                          <span className="status-text warning">
                            <FaEdit /> Changes Requested
                          </span>
                          <p>Waiting for freelancer to resubmit with changes.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-content-state">
                  <FaCheckCircle />
                  <h3>No milestones yet</h3>
                  <p>Milestones will appear here once they're created in the contract</p>
                </div>
              )}
            </div>
          )}

          {/* Budget & Payments Tab with Stripe Integration */}
          {activeTab === 'budget' && (
            <ClientPaymentManager
              workspace={workspace}
              milestones={sharedMilestones}
              loading={loading}
              contractDetails={contractDetails}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ClientReportsDashboard
              workspace={workspace}
              milestones={sharedMilestones}
              files={sharedFiles}
              messages={sharedMessages}
            />
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <ClientNotes workspaceId={workspaceId} />
          )}

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <SharedMeetingScheduler
              workspace={workspace}
              userRole="client"
              loading={loading}
            />
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="messages-tab">
              <div className="content-section-header">
                <h2>Messages</h2>
                <div className="message-summary">
                  <span>{stats.messages.total} total messages</span>
                  <span style={{ color: otherPartyOnline ? '#10b981' : '#ef4444' }}>
                    <FaUser /> {otherParty?.name || 'Freelancer'} is {otherPartyOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="messages-wrapper">
                {sharedMessages.length > 0 ? (
                  sharedMessages.map((message, index) => (
                    <div
                      key={message.messageId || message._id || index}
                      className={`message-bubble ${message.senderRole === 'client' ? 'sent' : 'received'}`}
                    >
                      <div className="message-avatar-circle">
                        {message.senderRole === 'client' ? 'C' : 'F'}
                      </div>
                      <div className="message-content-wrapper">
                        <div className="message-meta">
                          <span className="message-sender">
                            {message.senderRole === 'client' ? 'You' : otherParty?.name || 'Freelancer'}
                          </span>
                          <span className="message-time">
                            {formatTime(message.timestamp || message.createdAt)} • {formatDate(message.timestamp || message.createdAt)}
                          </span>
                        </div>
                        <div className="message-text-content">{message.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-content-state">
                    <FaCommentDots />
                    <h3>No messages yet</h3>
                    <p>Start the conversation with your freelancer</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="message-input">
                <textarea
                  placeholder="Type your message here..."
                  rows="3"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="input-actions">
                  <button className="primary-button send-btn" onClick={handleSendMessage}>
                    <FaPaperPlane /> Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Files Tab with Upload */}
          {activeTab === 'files' && (
            <div className="files-tab">
              <div className="content-section-header">
                <h2>Shared Files</h2>
                <div className="file-actions">
                  <button
                    className="primary-button"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <FaUpload /> Upload File
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await handleFileUpload(file);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="files-grid-layout">
                {sharedFiles.length > 0 ? (
                  sharedFiles.map((file, index) => (
                    <div key={index} className="file-item-card">
                      <div className="file-type-icon">
                        {file.fileType?.includes('image') ? <FaImage /> :
                          file.fileType?.includes('pdf') ? <FaFileAlt /> :
                            file.fileType?.includes('video') ? <FaVideo /> :
                              file.fileType?.includes('audio') ? <FaMusic /> :
                                file.fileType?.includes('zip') || file.fileType?.includes('rar') ? <FaArchive /> :
                                  <FaFileAlt />}
                      </div>
                      <div className="file-info-content">
                        <h4 title={file.filename || file.name}>
                          {file.filename || file.name}
                        </h4>
                        <p>{formatFileSize(file.fileSize)}</p>
                        <span className="file-uploader-info">
                          By {file.uploadedBy?.name || 'Unknown'}
                          {file.uploaderRole === 'client' ? ' (You)' : ' (Freelancer)'}
                        </span>
                        <span className="file-date-info">
                          {formatDate(file.uploadDate || file.createdAt)}
                        </span>
                      </div>
                      <div className="file-actions-row">
                        <button
                          className="icon-button"
                          onClick={() => window.open(file.fileUrl || file.url, '_blank')}
                          title="View file"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = file.fileUrl || file.url;
                            a.download = file.filename || file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          title="Download file"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-content-state">
                    <FaFolderOpen />
                    <h3>No files shared yet</h3>
                    <p>Upload files to share with your freelancer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <ContractViewer
              workspace={workspace}
              contractDetails={contractDetails}
              milestones={sharedMilestones}
              onDownloadContract={handleDownloadContract}
            />
          )}
        </main>

        <footer className="workspace-footer">
          <div className="footer-left-section">
            <span className="workspace-id">Workspace ID: {workspace.workspaceId || workspaceId}</span>
            <span className="last-updated">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="footer-right-section">
            <button className="outline-button" onClick={() => navigate('/client/dashboard')}>
              <FaSignOutAlt /> Exit Workspace
            </button>
          </div>
        </footer>
      </div>

      {showScheduleModal && <ScheduleCallModal />}
    </div>
  );
};

export default ClientWorkspace;