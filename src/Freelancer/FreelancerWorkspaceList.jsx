import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaProjectDiagram, FaSearch, FaSpinner, FaPlus, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import FreelancerWorkspaceCard from './FreelancerWorkspaceCard';
import axios from 'axios';
import { API_URL } from '../Config';
import './FreelancerWorkspaceList.css';

const FreelancerWorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchWorkspaces();
  }, []);
  
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching freelancer workspaces from:', `${API_URL}/api/freelancer/workspaces`);
      
      const response = await axios.get(
        `${API_URL}/api/freelancer/workspaces`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('📦 Workspaces API Response:', response.data);
      
      if (response.data.success) {
        setWorkspaces(response.data.workspaces || []);
        console.log(`✅ Loaded ${response.data.workspaces?.length || 0} workspaces`);
      } else {
        setError(response.data.message || 'Failed to load workspaces');
        setWorkspaces([]);
      }
    } catch (error) {
      console.error('❌ Error fetching workspaces:', error);
      
      // Try alternative endpoints if the main one fails
      await tryAlternativeEndpoints();
    } finally {
      setLoading(false);
    }
  };
  
  const tryAlternativeEndpoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setError('User information missing. Please login again.');
        return;
      }
      
      console.log('🔄 Trying alternative endpoints...');
      
      // Try endpoint 1: Get from contracts with workspaceId
      try {
        const contractsResponse = await axios.get(
          `${API_URL}/api/contracts/freelancer/contracts`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { status: 'active' }
          }
        );
        
        if (contractsResponse.data.success) {
          const activeContracts = contractsResponse.data.contracts || [];
          const contractsWithWorkspace = activeContracts.filter(
            contract => contract.workspaceId && contract.workspaceId !== 'null'
          );
          
          if (contractsWithWorkspace.length > 0) {
            console.log(`✅ Found ${contractsWithWorkspace.length} contracts with workspaces`);
            
            // Transform contract data to workspace format
            const transformedWorkspaces = contractsWithWorkspace.map(contract => ({
              _id: contract.workspaceId,
              workspaceId: contract.workspaceId,
              projectTitle: contract.title || 'Project',
              status: 'active',
              clientName: contract.clientId?.name || 'Client',
              contractId: contract.contractId,
              projectId: contract.projectId?._id || contract.projectId,
              freelancerId: contract.freelancerId,
              clientId: contract.clientId?._id || contract.clientId,
              budget: contract.totalBudget || 0,
              overallProgress: 0,
              currentPhase: 1
            }));
            
            setWorkspaces(transformedWorkspaces);
            return;
          }
        }
      } catch (contractError) {
        console.log('Contracts endpoint failed, trying next...');
      }
      
      // Try endpoint 2: Generic workspace endpoint
      try {
        const genericResponse = await axios.get(
          `${API_URL}/api/workspaces`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (genericResponse.data.success) {
          // Filter for freelancer's workspaces
          const allWorkspaces = genericResponse.data.workspaces || [];
          const freelancerWorkspaces = allWorkspaces.filter(
            ws => ws.freelancerId === userId || ws.freelancerId?._id === userId
          );
          
          setWorkspaces(freelancerWorkspaces);
          return;
        }
      } catch (genericError) {
        console.log('Generic workspaces endpoint failed');
      }
      
      // If all endpoints fail
      setError('Unable to connect to server. Please check your connection.');
      setWorkspaces([]);
      
    } catch (fallbackError) {
      console.error('All fallback endpoints failed:', fallbackError);
      setError('Server connection failed. Please try again later.');
    }
  };
  
  const handleRetry = () => {
    fetchWorkspaces();
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading your workspaces...</p>
        <small>Fetching active projects...</small>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <h3>Unable to Load Workspaces</h3>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="btn-primary">
            <FaSyncAlt /> Try Again
          </button>
          <Link to="/freelancer/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>
        <div className="debug-info">
          <small>API URL: {API_URL}</small>
          <small>Token present: {localStorage.getItem('token') ? 'Yes' : 'No'}</small>
          <small>User ID: {localStorage.getItem('userId') || 'Not found'}</small>
        </div>
      </div>
    );
  }
  
  return (
    <div className="freelancer-workspace-list-container">
      <div className="workspace-list-header">
        <div className="header-left">
          <h1>My Workspaces</h1>
          <p className="workspace-count">
            {workspaces.length} active workspace{workspaces.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="header-right">
          <button onClick={handleRetry} className="btn-refresh" title="Refresh workspaces">
            <FaSyncAlt />
          </button>
          <Link to="/freelancer/jobs" className="btn-primary">
            <FaPlus /> Find More Work
          </Link>
        </div>
      </div>
      
      {workspaces.length === 0 ? (
        <div className="empty-state">
          <FaProjectDiagram className="empty-icon" />
          <h3>No Active Workspaces</h3>
          <p>You don't have any active projects with workspaces yet.</p>
          <p className="empty-subtext">
            Workspaces are automatically created when both you and the client sign a contract.
          </p>
          <div className="empty-actions">
            <Link to="/freelancer/jobs" className="btn-primary">
              Browse Available Jobs
            </Link>
            <Link to="/freelancer/contracts" className="btn-secondary">
              View My Contracts
            </Link>
          </div>
          <div className="empty-tips">
            <h4>How to get a workspace:</h4>
            <ul>
              <li>✓ Apply for jobs that match your skills</li>
              <li>✓ Get your proposal accepted by a client</li>
              <li>✓ Sign the contract when it's sent to you</li>
              <li>✓ Workspace will be created when both parties sign</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          <div className="workspaces-grid">
            {workspaces.map(workspace => (
              <FreelancerWorkspaceCard 
                key={workspace._id || workspace.workspaceId} 
                workspace={workspace} 
              />
            ))}
          </div>
          
          {/* Stats section */}
          <div className="workspace-stats">
            <div className="stat-card">
              <span className="stat-number">{workspaces.length}</span>
              <span className="stat-label">Active Projects</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {workspaces.filter(ws => ws.status === 'active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {workspaces.filter(ws => ws.status === 'in-progress' || ws.status === 'in_progress').length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                ${workspaces.reduce((sum, ws) => sum + (ws.budget || 0), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total Value</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FreelancerWorkspaceList;