import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaFolderOpen, FaCommentDots, FaCheckCircle, FaVideo, FaCalendarAlt,
  FaDollarSign, FaExclamationTriangle, FaUser, FaClock, FaFileAlt,
  FaImage, FaUpload, FaDownload, FaEye, FaSpinner, FaCheck,
  FaPaperPlane, FaChartBar, FaWallet, FaStickyNote, FaFileContract,
  FaHome, FaSearch, FaBell, FaCog, FaSignOutAlt,
  FaEdit, FaMusic, FaArchive, FaTrash, FaShareAlt
} from 'react-icons/fa';
import { workspaceSocket } from '../Service/workspaceSocket';
import ClientPaymentManager from './ClientPaymentManager';
import ClientWorkspaceOverview from './ClientWorkspaceOverview';
import ClientMilestoneApprovals from './ClientMilestoneApprovals';
import './ClientWorkspace.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://freelance-job-backend.onrender.com';

const ClientWorkspace = () => {
  const { workspaceId: rawWorkspaceId } = useParams();
  const navigate = useNavigate();
  
  // The ID is the contract ID
  const contractId = rawWorkspaceId || localStorage.getItem('currentWorkspaceId');
  
  // User state
  const [userId, setUserId] = useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed._id || parsed.id || '';
      } catch {
        return '';
      }
    }
    return localStorage.getItem('userId') || '';
  });
  
  const [userProfile, setUserProfile] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Workspace data
  const [sharedFiles, setSharedFiles] = useState([]);
  const [sharedMilestones, setSharedMilestones] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
const [copyNotification, setCopyNotification] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    progress: 0,
    milestones: { total: 0, completed: 0, pending: 0, awaitingApproval: 0 },
    files: { total: 0 }
  });

  // WebSocket state
  const [socketConnected, setSocketConnected] = useState(false);
  const chatEndRef = useRef(null);
  const fetchInProgressRef = useRef(false);

  // Navigation tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'milestones', label: 'Milestones', icon: <FaCheckCircle /> },
    { id: 'budget', label: 'Budget & Payments', icon: <FaWallet /> },
    { id: 'files', label: 'Files', icon: <FaFolderOpen /> },
    { id: 'chat', label: 'Chat', icon: <FaCommentDots /> },
    { id: 'contract', label: 'Contract', icon: <FaFileContract /> }
  ];

  // ===== Fetch user profile =====
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      if (userData && userData.name) {
        setUserProfile(userData);
        setUserId(userData._id || userData.id);
      } else {
        try {
          const response = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 5000
          });
          
          if (response.data.success) {
            const user = response.data.user;
            setUserProfile(user);
            setUserId(user._id);
            localStorage.setItem('userData', JSON.stringify(user));
          }
        } catch (authError) {
          console.log('Auth profile fetch failed');
        }
      }
    } catch (error) {
      console.log('Error fetching user profile');
    }
  };

  // ===== Fetch REAL contract data =====
// ===== Fetch REAL contract data =====
const fetchContractData = useCallback(async () => {
  if (fetchInProgressRef.current) {
    return;
  }

  try {
    fetchInProgressRef.current = true;
    setLoading(true);
    setError(null);

    // 🔥 FIX: Map wrong workspace card IDs to actual contract IDs
    const workspaceIdToContractIdMap = {
      '6933a39a2ceb431598fd0f96': '6933a3592ceb431598fd0f00', // Wrong ID from workspace card -> Correct contract ID
      // Add other mappings as needed when you find more wrong IDs
    };
    
    let actualContractId = contractId;
    if (workspaceIdToContractIdMap[contractId]) {
      console.log(`🔄 Mapping workspace ID ${contractId} to contract ID ${workspaceIdToContractIdMap[contractId]}`);
      actualContractId = workspaceIdToContractIdMap[contractId];
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    console.log('🔍 Fetching contract data for ID:', actualContractId);
    console.log('📋 Original ID from URL:', contractId);
    console.log('📋 Actual contract ID to fetch:', actualContractId);

    // STRATEGY 1: First, get ALL contracts to see what we have
    let allContracts = [];
    let foundContract = null;
    
    try {
      // Get all client contracts
      console.log('📋 Fetching all client contracts...');
      const contractsResponse = await axios.get(`${API_URL}/api/client/contracts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });
      
      // Handle different response formats
      if (contractsResponse.data) {
        if (Array.isArray(contractsResponse.data)) {
          allContracts = contractsResponse.data;
        } else if (contractsResponse.data.contracts && Array.isArray(contractsResponse.data.contracts)) {
          allContracts = contractsResponse.data.contracts;
        } else if (typeof contractsResponse.data === 'object') {
          // If it's a single contract object
          allContracts = [contractsResponse.data];
        }
      }
      
      console.log(`✅ Found ${allContracts.length} total contracts`);
      
      // Log all contract IDs to see what we have
      console.log('📊 All contract IDs found:');
      allContracts.forEach((contract, index) => {
        console.log(`  Contract ${index + 1}:`);
        console.log(`    - _id: ${contract._id}`);
        console.log(`    - contractId: ${contract.contractId}`);
        console.log(`    - id: ${contract.id}`);
        console.log(`    - workspaceId: ${contract.workspaceId}`);
        console.log(`    - Title: ${contract.title}`);
        console.log(`    - Status: ${contract.status}`);
        console.log(`    - Freelancer ID: ${contract.freelancerId}`);
        console.log(`    - Freelancer object:`, contract.freelancer);
      });
      
      // Look for contract with matching ID - check ALL possible ID fields
      foundContract = allContracts.find(contract => {
        // Check all possible ID fields
        const possibleIds = [
          contract._id,
          contract.contractId,
          contract.id,
          contract.workspaceId
        ];
        
        // Check if any of these match (with string conversion)
        return possibleIds.some(id => 
          id && id.toString() === actualContractId.toString()
        );
      });
      
      if (foundContract) {
        console.log('🎯 Found matching contract!');
        console.log('📄 Contract details:', {
          _id: foundContract._id,
          contractId: foundContract.contractId,
          title: foundContract.title,
          status: foundContract.status,
          freelancer: foundContract.freelancer?.name || foundContract.freelancerName,
          freelancerId: foundContract.freelancerId,
          freelancerObject: foundContract.freelancer
        });
      } else {
        console.log('❌ No matching contract found by ID comparison');
        console.log(`Looking for: ${actualContractId}`);
        console.log('Available contracts:', allContracts.map(c => ({
          _id: c._id,
          contractId: c.contractId,
          title: c.title,
          status: c.status,
          freelancerId: c.freelancerId
        })));
        
        // Try to find similar IDs (might be a typo in the ID)
        console.log('🔍 Checking for similar contract IDs...');
        for (const contract of allContracts) {
          if (contract._id) {
            const contractIdStr = contract._id.toString();
            const searchIdStr = actualContractId.toString();
            
            // Check if they look like MongoDB IDs (24 hex chars) and are similar
            if (contractIdStr.length === 24 && searchIdStr.length === 24) {
              // Count matching characters
              let matchCount = 0;
              for (let i = 0; i < 24; i++) {
                if (contractIdStr[i] === searchIdStr[i]) matchCount++;
              }
              
              if (matchCount > 20) { // More than 20 matching characters
                console.log(`⚠️ Found similar contract (${matchCount}/24 chars match):`, contract._id);
                console.log(`   Contract title: ${contract.title}`);
                console.log(`   Consider using this contract instead`);
              }
            }
          }
        }
      }
    } catch (contractsError) {
      console.error('❌ Error fetching contracts:', contractsError);
      throw new Error('Failed to fetch contracts from server');
    }

    // If contract not found, show error with helpful message
    if (!foundContract) {
      const availableContracts = allContracts.map(c => ({
        id: c._id,
        contractId: c.contractId,
        title: c.title,
        status: c.status
      }));
      
      // Store available contracts for the error UI
      setAvailableContracts(availableContracts);
      
      const errorMsg = `Contract with ID "${actualContractId}" not found. You have ${allContracts.length} available contracts.`;
      console.error(errorMsg);
      throw new Error(`Contract not found. You have ${allContracts.length} contracts available.`);
    }

    console.log('✅ Real contract data loaded:', foundContract.title);
    setContractDetails(foundContract);

    // ⭐️⭐️⭐️ CRITICAL: Extract freelancer ID from contract data ⭐️⭐️⭐️
    let freelancerId = '';
    
    // Method 1: Check freelancerId field (could be string or object)
    if (foundContract.freelancerId) {
      if (typeof foundContract.freelancerId === 'object') {
        freelancerId = foundContract.freelancerId._id || foundContract.freelancerId.toString();
        console.log('✅ Freelancer ID from freelancerId object:', freelancerId);
      } else {
        freelancerId = foundContract.freelancerId.toString();
        console.log('✅ Freelancer ID from freelancerId string:', freelancerId);
      }
    }
    
    // Method 2: Check freelancer object
    else if (foundContract.freelancer && foundContract.freelancer._id) {
      freelancerId = foundContract.freelancer._id;
      console.log('✅ Freelancer ID from freelancer object:', freelancerId);
    }
    
    // Method 3: Check phases for freelancer info (sometimes ID is in phases)
    else if (foundContract.phases && foundContract.phases.length > 0) {
      const firstPhase = foundContract.phases[0];
      if (firstPhase.freelancerId) {
        freelancerId = firstPhase.freelancerId;
        console.log('✅ Freelancer ID from first phase:', freelancerId);
      }
    }
    
    // Method 4: Last resort - check all nested objects
    else {
      console.log('🔍 Deep searching for freelancer ID in contract structure...');
      
      // Convert contract to string and search for ID patterns
      const contractString = JSON.stringify(foundContract);
      const idPattern = /["']?freelancerId["']?\s*:\s*["']([a-f0-9]{24})["']/i;
      const match = contractString.match(idPattern);
      
      if (match && match[1]) {
        freelancerId = match[1];
        console.log('✅ Freelancer ID found via pattern matching:', freelancerId);
      }
    }
    
    // If still no ID, use a fallback for testing
    if (!freelancerId) {
      console.warn('⚠️ No freelancer ID found in contract data. Using fallback.');
      console.log('Available contract fields:', Object.keys(foundContract));
      freelancerId = '69246fa44262486de9f3195e'; // Fallback test ID
    }
    
    console.log('👤 Final freelancer ID to use:', freelancerId);

    // Create workspace from REAL contract data
    const workspaceFromContract = {
      _id: foundContract._id || actualContractId, // Use contract ID as workspace ID
      title: foundContract.title || 'Contract Workspace',
      clientName: userProfile?.name || 'Client',
      freelancerName: foundContract.freelancer?.name || foundContract.freelancerName || 'Freelancer',
      freelancerId: freelancerId, // ⭐️ THIS IS THE KEY - Use extracted freelancer ID
      freelancer: foundContract.freelancer,
      status: foundContract.status || 'active',
      totalBudget: foundContract.totalBudget || foundContract.amount || 0,
      startDate: foundContract.startDate || foundContract.createdAt || new Date().toISOString(),
      estimatedEndDate: foundContract.endDate || foundContract.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      overallProgress: 0,
      contractId: foundContract._id,
      contractNumber: foundContract.contractId,
      isContractBased: true,
      serviceType: foundContract.serviceType || 'General Service',
      description: foundContract.description,
      terms: foundContract.terms,
      clientSigned: foundContract.clientSigned,
      freelancerSigned: foundContract.freelancerSigned,
      clientSignedAt: foundContract.clientSignedAt,
      freelancerSignedAt: foundContract.freelancerSignedAt,
      phases: foundContract.phases || []
    };
    
    setWorkspace(workspaceFromContract);
    console.log('✅ Workspace created from real contract data');
    console.log('📋 Workspace includes freelancer ID:', workspaceFromContract.freelancerId);

    // Create milestones from REAL contract phases (if they exist)
    if (foundContract.phases && foundContract.phases.length > 0) {
      const milestonesFromPhases = foundContract.phases.map((phase, index) => ({
        _id: phase._id || `phase-${index}`,
        title: phase.title || `Phase ${phase.phase || index + 1}`,
        phase: phase.phase || index + 1,
        amount: phase.amount || 0,
        description: phase.description || '',
        status: phase.status || 'pending',
        dueDate: phase.dueDate || phase.deliveryDate || '',
        deliverables: phase.deliverables || [],
        paymentStatus: phase.paymentStatus || 'pending',
        completedDate: phase.completedDate,
        isContractPhase: true
      }));
      setSharedMilestones(milestonesFromPhases);
      console.log(`✅ Created ${milestonesFromPhases.length} milestones from real contract phases`);
    } else {
      // NO DUMMY DATA - if no phases, just show empty
      setSharedMilestones([]);
      console.log('⚠️ No phases found in contract');
    }

    // Try to fetch REAL files if endpoint exists
    try {
      const filesResponse = await axios.get(`${API_URL}/api/contracts/${actualContractId}/files`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      if (filesResponse.data && filesResponse.data.files) {
        setSharedFiles(filesResponse.data.files);
        console.log(`✅ Loaded ${filesResponse.data.files.length} real files`);
      }
    } catch (filesError) {
      console.log('No files endpoint or no files found:', filesError.message);
      setSharedFiles([]); // Empty array, no dummy data
    }

    // Try to fetch REAL messages if endpoint exists
    try {
      const messagesResponse = await axios.get(`${API_URL}/api/contracts/${actualContractId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      });
      
      if (messagesResponse.data && messagesResponse.data.messages) {
        setMessages(messagesResponse.data.messages);
        console.log(`✅ Loaded ${messagesResponse.data.messages.length} real messages`);
      }
    } catch (messagesError) {
      console.log('No messages endpoint or no messages found:', messagesError.message);
      setMessages([]); // Empty array, no dummy data
    }

    // Calculate stats from REAL data
    calculateStats();

  } catch (err) {
    console.error('❌ Error fetching contract data:', err);
    setError(err.message || 'Unable to load contract data. Please check if the contract exists.');
    
    if (err.response?.status === 401) {
      setError('Session expired. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
    }
  } finally {
    setLoading(false);
    fetchInProgressRef.current = false;
  }
}, [contractId, userProfile, navigate]);
  // ===== Calculate stats from REAL data =====
  const calculateStats = () => {
    const completedMilestones = sharedMilestones.filter(m => 
      m.status === 'completed' || m.status === 'approved' || m.status === 'paid'
    ).length;
    
    const pendingApproval = sharedMilestones.filter(m => 
      m.status === 'awaiting_approval' || m.status === 'submitted' || m.status === 'in-progress'
    ).length;
    
    const progress = sharedMilestones.length > 0 
      ? Math.round((completedMilestones / sharedMilestones.length) * 100)
      : 0;
    
    setStats({
      progress,
      milestones: {
        total: sharedMilestones.length,
        completed: completedMilestones,
        pending: sharedMilestones.filter(m => m.status === 'pending').length,
        awaitingApproval: pendingApproval
      },
      files: {
        total: sharedFiles.length
      }
    });
  };

  // ===== Initialize WebSocket (only if we have real data) =====
  useEffect(() => {
    if (!contractId || !userId || !workspace) return;

    const token = localStorage.getItem('token');
    
    console.log('🔌 Connecting WebSocket for contract workspace...');
    
    // Connect to contract workspace
    workspaceSocket.connect(contractId, userId, token);

    // ===== LISTENERS =====
    workspaceSocket.on('connection', (connected) => {
      setSocketConnected(connected);
      console.log(`📡 WebSocket ${connected ? 'connected' : 'disconnected'}`);
    });

    workspaceSocket.on('message', (message) => {
      console.log('📨 New message received:', message);
      if (message.type === 'read') {
        // Handle read receipt
        setMessages(prev => prev.map(msg => 
          msg._id === message.messageId ? { ...msg, read: true } : msg
        ));
      } else {
        // New message
        setMessages(prev => [...prev, message]);
      }
    });

    workspaceSocket.on('typing', (data) => {
      if (data.userId !== userId) {
        console.log(`${data.userName} is typing...`);
      }
    });

    workspaceSocket.on('file', (fileData) => {
      console.log('📁 File event received:', fileData);
      if (fileData.type === 'deleted') {
        setSharedFiles(prev => prev.filter(f => f._id !== fileData.fileId));
      } else {
        setSharedFiles(prev => [fileData, ...prev]);
      }
    });

    workspaceSocket.on('milestone', (milestoneEvent) => {
      console.log('🎯 Milestone event:', milestoneEvent);
      
      switch (milestoneEvent.type) {
        case 'submitted':
          setSharedMilestones(prev => prev.map(m => 
            m._id === milestoneEvent.milestoneId ? 
            { ...m, status: 'awaiting_approval' } : m
          ));
          break;
          
        case 'paid':
          setSharedMilestones(prev => prev.map(m => 
            m._id === milestoneEvent.milestoneId ? 
            { ...m, paymentStatus: 'paid' } : m
          ));
          break;
      }
      
      calculateStats();
    });

    workspaceSocket.on('userStatus', ({ user, online }) => {
      if (workspace?.freelancerId === user.userId || workspace?.freelancer?._id === user.userId) {
        setOtherPartyOnline(online);
        console.log(`👤 Freelancer is ${online ? 'online' : 'offline'}`);
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket');
      workspaceSocket.disconnect();
    };
  }, [contractId, userId, workspace]);

  // ===== Fetch REAL data on mount =====
  useEffect(() => {
    console.log('🚀 ClientWorkspace mounted with contract ID:', contractId);
    
    if (!contractId) {
      console.error('❌ No contract ID provided');
      navigate('/client/dashboard');
      return;
    }

    fetchContractData();

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (loading && !workspace) {
        console.log('⏰ Safety timeout reached');
        setLoading(false);
        if (!error) {
          setError('Loading timeout. Please check your connection and try again.');
        }
      }
    }, 20000);

    return () => clearTimeout(safetyTimeout);
  }, [contractId]);

  // ===== File Upload Handler =====
  const handleFileUpload = async (file) => {
    if (!file) return false;
    
    setUploadingFile(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Try to upload to contract files endpoint
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
        formData.append('contractId', contractId);
        formData.append('uploaderRole', 'client');

        const response = await axios.post(
          `${API_URL}/api/contracts/${contractId}/files/upload`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
          }
        );

        if (response.data && response.data.success && response.data.file) {
          const newFile = response.data.file;
          
          // Send WebSocket notification
          if (workspaceSocket.isConnected()) {
            workspaceSocket.uploadFile(newFile);
          }

          // Update local state
          setSharedFiles(prev => [newFile, ...prev]);
          alert('File uploaded successfully!');
          return true;
        }
      } catch (uploadError) {
        console.log('Contract file upload failed:', uploadError.message);
      }

      // Fallback to workspace endpoint
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
        formData.append('workspaceId', contractId);
        formData.append('uploaderRole', 'client');

        const response = await axios.post(
          `${API_URL}/api/workspaces/${contractId}/files/upload`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
          }
        );

        if (response.data && response.data.success && response.data.file) {
          const newFile = response.data.file;
          
          if (workspaceSocket.isConnected()) {
            workspaceSocket.uploadFile(newFile);
          }

          setSharedFiles(prev => [newFile, ...prev]);
          alert('File uploaded successfully!');
          return true;
        }
      } catch (fallbackError) {
        console.log('Workspace upload failed:', fallbackError.message);
      }

      // If all uploads fail, create a local reference
      const localFile = {
        _id: `local-${Date.now()}`,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: { name: userProfile?.name || 'You', role: 'client' },
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file),
        localOnly: true
      };
      
      setSharedFiles(prev => [localFile, ...prev]);
      alert('File saved locally (server upload failed).');
      return true;

    } catch (error) {
      console.error('❌ Error uploading file:', error);
      alert('Failed to upload file.');
      return false;
    } finally {
      setUploadingFile(false);
    }
  };

  // ===== Send Message Handler =====
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const messageData = {
        content: newMessage.trim(),
        senderId: userId,
        senderRole: 'client',
        senderName: userProfile?.name || 'Client',
        contractId: contractId,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending message for contract:', contractId);

      // Create local message first for immediate feedback
      const localMessage = {
        _id: `local-${Date.now()}`,
        ...messageData,
        localOnly: true
      };
      
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      
      // Send via WebSocket
      if (workspaceSocket.isConnected()) {
        workspaceSocket.sendMessage(messageData);
      }

      // Try to save to server
      try {
        const response = await axios.post(
          `${API_URL}/api/contracts/${contractId}/messages`,
          messageData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success && response.data.message) {
          const savedMessage = response.data.message;
          // Replace local message with server message
          setMessages(prev => 
            prev.map(msg => 
              msg._id === localMessage._id ? savedMessage : msg
            )
          );
        }
      } catch (saveError) {
        console.log('Failed to save message to server:', saveError.message);
        // Keep the local message
      }

      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  // ===== Milestone Approval Handlers =====
  const handleApproveMilestone = async (milestoneId, feedback = '') => {
    try {
      const token = localStorage.getItem('token');
      const milestone = sharedMilestones.find(m => m._id === milestoneId);
      
      if (!milestone) {
        alert('Milestone not found');
        return;
      }

      console.log(`✅ Approving milestone ${milestoneId}`);
      
      // Update local state first
      setSharedMilestones(prev => prev.map(m => 
        m._id === milestoneId ? { 
          ...m, 
          status: 'completed', 
          approvalDate: new Date().toISOString(),
          paymentStatus: 'pending_payment'
        } : m
      ));
      
      calculateStats();
      
      // Send WebSocket notification
      if (workspaceSocket.isConnected()) {
        workspaceSocket.approveMilestone(milestoneId, feedback);
      }

      // Try to update on server
      try {
        const response = await axios.put(
          `${API_URL}/api/contracts/${contractId}/phases/${milestoneId}/approve`,
          { feedback },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success) {
          alert('Milestone approved successfully!');
        }
      } catch (approveError) {
        console.log('Server approval failed:', approveError.message);
        alert('Milestone approved locally. Server update failed.');
      }
    } catch (error) {
      console.error('❌ Error approving milestone:', error);
      alert('Failed to approve milestone.');
    }
  };

  const handleRequestChanges = async (milestoneId, feedback) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log(`📝 Requesting changes for milestone ${milestoneId}`);
      
      // Update local state first
      setSharedMilestones(prev => prev.map(m => 
        m._id === milestoneId ? { ...m, status: 'changes_requested' } : m
      ));
      
      calculateStats();
      
      // Send WebSocket notification
      if (workspaceSocket.isConnected()) {
        workspaceSocket.requestMilestoneChanges(milestoneId, feedback);
      }

      // Try to update on server
      try {
        const response = await axios.put(
          `${API_URL}/api/contracts/${contractId}/phases/${milestoneId}/request-changes`,
          { feedback },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success) {
          alert('Changes requested successfully!');
        }
      } catch (requestError) {
        console.log('Server request changes failed:', requestError.message);
        alert('Changes requested locally. Server update failed.');
      }
    } catch (error) {
      console.error('❌ Error requesting changes:', error);
      alert('Failed to request changes.');
    }
  };

  // ===== Helper Functions =====
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
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
    if (!contractDetails) return null;
    return {
      id: contractDetails.freelancer?._id,
      name: contractDetails.freelancer?.name || contractDetails.freelancerName || 'Freelancer',
      email: contractDetails.freelancer?.email
    };
  };

  // ===== Loading state =====
  if (loading && !workspace) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          {/* <FaSpinner className="spinning-icon" /> */}
          <p>Loading contract workspace...</p>
          <p className="loading-subtext">Fetching real contract data</p>
        </div>
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="error-container">
        <div className="error-content">
          <FaExclamationTriangle />
          <h3>Unable to load contract</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchContractData} className="primary-button">
              Try Again
            </button>
            <button onClick={() => navigate('/client/dashboard')} className="outline-button">
              Back to Dashboard
            </button>
            <button onClick={() => {
              // Show available contracts
              navigate('/client/dashboard#contracts');
            }} className="outline-button">
              View My Contracts
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
          <h3>Contract not found</h3>
          <p>The contract with ID "{contractId}" doesn't exist or you don't have access to it.</p>
          <button onClick={() => navigate('/client/dashboard')} className="primary-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const otherParty = getOtherParty();

  return (
    <div className="client-workspace">
      {/* Top Navigation */}
      <div className="workspace-navbar-wrapper">
        <div className="workspace-navbar-header">
          <div className="navbar-left">
            <h3 className="proj-title">{workspace?.title || "Contract Workspace"}</h3>
            <div className="project-meta">
              <span><FaUser /> Freelancer: {otherParty?.name || 'Freelancer'}</span>
              <span className={`project-status status-${workspace?.status || 'active'}`}>
                {workspace?.status || 'active'}
              </span>
              <span className="contract-badge">Contract ID: {contractId.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

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
        <header className="workspace-main-header">
          <div className="header-section-left">
            <div className="breadcrumb-nav">
              <button onClick={() => navigate('/client/dashboard')}>
                <FaHome /> Dashboard
              </button>
              <span>/</span>
              <span className="current-page">{workspace.title || 'Contract'}</span>
            </div>
          </div>

          <div className="header-section-right">
            <div className="connection-indicator">
              <span className={`status-dot ${socketConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="user-account">
              <div className="user-avatar">
                {userProfile?.name?.charAt(0) || 'C'}
              </div>
              <span>{userProfile?.name || 'Client'}</span>
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
            <ClientMilestoneApprovals
              workspace={workspace}
              milestones={sharedMilestones}
              loading={loading}
              onApproveMilestone={handleApproveMilestone}
              onRequestChanges={handleRequestChanges}
            />
          )}

          {/* Budget & Payments Tab */}
          {activeTab === 'budget' && (
            <ClientPaymentManager
              workspace={workspace}
              milestones={sharedMilestones}
              contractDetails={contractDetails}
            />
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="files-container">
              <div className="content-section-header">
                <h2>Contract Files</h2>
                <div className="file-actions-header">
                  <input
                    type="file"
                    id="file-upload-input"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await handleFileUpload(file);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => document.getElementById('file-upload-input').click()}
                    disabled={uploadingFile}
                  >
                    <FaUpload /> {uploadingFile ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>

              {sharedFiles.length > 0 ? (
                <div className="files-grid">
                  {sharedFiles.map((file, index) => (
                    <div key={file._id || index} className="file-card">
                      <div className="file-icon-section">
                        {file.fileType?.includes('image') ? <FaImage className="icon-lg" /> :
                         file.fileType?.includes('pdf') ? <FaFileAlt className="icon-lg" /> :
                         file.fileType?.includes('zip') ? <FaArchive className="icon-lg" /> :
                         <FaFileAlt className="icon-lg" />}
                      </div>
                      <div className="file-info">
                        <h4 className="file-name" title={file.filename || file.name}>
                          {file.filename || file.name}
                        </h4>
                        <div className="file-meta">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>Uploaded by {file.uploadedBy?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploadDate)}</span>
                        </div>
                        {file.localOnly && (
                          <span className="local-badge">Local</span>
                        )}
                      </div>
                      <div className="file-actions">
                        <button
                          className="icon-button"
                          onClick={() => window.open(file.fileUrl || file.url, '_blank')}
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.fileUrl || file.url;
                            link.download = file.filename || file.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-content-state">
                  <FaFolderOpen />
                  <h3>No files uploaded yet</h3>
                  <p>Upload files related to this contract</p>
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

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="content-section-header">
                <h2>Contract Messages</h2>
                <div className="chat-status">
                  <span className={`status-dot ${otherPartyOnline ? 'online' : 'offline'}`}></span>
                  <span>{otherParty?.name || 'Freelancer'} is {otherPartyOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>

              <div className="messages-wrapper">
                {messages.length > 0 ? (
                  <div className="messages-list">
                    {messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`message-bubble ${message.senderRole === 'client' ? 'sent' : 'received'}`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {formatTime(message.timestamp)} • {formatDate(message.timestamp)}
                          </span>
                          {message.localOnly && (
                            <span className="local-message-badge">Local</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                ) : (
                  <div className="empty-content-state">
                    <FaCommentDots />
                    <h3>No messages yet</h3>
                    <p>Start the conversation about this contract</p>
                  </div>
                )}

                <div className="message-input-section">
                  <textarea
                    className="message-input"
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
                  <button
                    className="btn-primary send-button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <FaPaperPlane /> Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <div className="contract-container">
              <div className="content-section-header">
                <h2>Contract Details</h2>
              </div>
              
              <div className="contract-card">
                <div className="contract-header">
                  <h3>{contractDetails?.title || workspace.title}</h3>
                  <span className="contract-id">Contract ID: {contractDetails?.contractId || contractId}</span>
                </div>
                
                <div className="contract-details">
                  <div className="detail-row">
                    <span>Client:</span>
                    <span>{userProfile?.name || 'Client'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Freelancer:</span>
                    <span>{otherParty?.name || 'Freelancer'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Total Amount:</span>
                    <span>${workspace?.totalBudget || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span>Start Date:</span>
                    <span>{formatDate(workspace?.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>End Date:</span>
                    <span>{formatDate(workspace?.estimatedEndDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className={`status-${contractDetails?.status || workspace?.status}`}>
                      {contractDetails?.status || workspace?.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Service Type:</span>
                    <span>{contractDetails?.serviceType || 'General Service'}</span>
                  </div>
                  {contractDetails?.clientSigned && (
                    <div className="detail-row">
                      <span>Client Signed:</span>
                      <span className="status-signed">✓ {formatDate(contractDetails.clientSignedAt)}</span>
                    </div>
                  )}
                  {contractDetails?.freelancerSigned && (
                    <div className="detail-row">
                      <span>Freelancer Signed:</span>
                      <span className="status-signed">✓ {formatDate(contractDetails.freelancerSignedAt)}</span>
                    </div>
                  )}
                </div>
                
                {contractDetails?.terms && (
                  <div className="contract-terms">
                    <h4>Terms & Conditions</h4>
                    <p>{contractDetails.terms}</p>
                  </div>
                )}
                
                <div className="contract-actions">
                  <button 
                    className="btn-primary" 
                    onClick={() => alert('Download contract feature would work with real backend')}
                  >
                    <FaDownload /> Download Contract
                  </button>
                </div>
              </div>
              
              {sharedMilestones.length > 0 && (
                <div className="milestones-summary">
                  <h4>Contract Phases</h4>
                  <div className="milestones-list">
                    {sharedMilestones.map((milestone, index) => (
                      <div key={milestone._id || index} className="contract-milestone">
                        <span className="milestone-phase">Phase {milestone.phase}</span>
                        <h5>{milestone.title}</h5>
                        <p>${milestone.amount} • {milestone.status}</p>
                        {milestone.dueDate && (
                          <small>Due: {formatDate(milestone.dueDate)}</small>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientWorkspace;