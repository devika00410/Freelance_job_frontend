// src/components/ClientWorkspaceCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaProjectDiagram,
  FaChevronRight,
  FaUser,
  FaDollarSign,
  FaClock
} from 'react-icons/fa';
import './ClientWorkspaceCard.css';

const ClientWorkspaceCard = ({ workspace }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return '#28a745';
      case 'in-progress': 
      case 'in_progress': return '#007bff';
      case 'completed': return '#6c757d';
      case 'on-hold': 
      case 'on_hold': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📍 Client Workspace Card Clicked!');
    console.log('Workspace ID:', workspace._id || workspace.workspaceId);
    console.log('Workspace Title:', workspace.projectTitle || workspace.title);
   
    const workspaceId = workspace._id || workspace.workspaceId;
    
    if (!workspaceId) {
      console.error('ERROR: No workspace ID found!');
      alert('No workspace ID found');
      return;
    }
    
    // Use CLIENT role-based route
    navigate(`/client/workspace/${workspaceId}`);
  };

  const getDisplayTitle = () => {
    return workspace.projectTitle || workspace.title || 'Project';
  };

  const getFreelancerName = () => {
    return workspace.freelancerName || workspace.freelancer?.name || 'Freelancer';
  };

  const getBudget = () => {
    return workspace.totalBudget || workspace.budget || 0;
  };

  const getProgress = () => {
    return workspace.overallProgress || 0;
  };

  const getCurrentPhase = () => {
    return workspace.currentPhase || 1;
  };

  const getStatus = () => {
    return workspace.status || 'active';
  };

  return (
    <div 
      className="workspace-card"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="workspace-card-header">
        <div className="workspace-icon">
          <FaProjectDiagram />
        </div>
        <div className="workspace-title-section">
          <h4 className="workspace-title">{getDisplayTitle()}</h4>
          <div className="workspace-meta">
            <span className="workspace-status">
              <span 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor(getStatus()) }}
              />
              {getStatus()}
            </span>
            <span className="workspace-phase">
              Phase {getCurrentPhase()}
            </span>
          </div>
        </div>
        <div className="workspace-actions">
          <FaChevronRight />
        </div>
      </div>

      <div className="workspace-card-body">
        <div className="workspace-info">
          <div className="workspace-client">
            <FaUser />
            <div>
              <span className="info-label">Freelancer</span>
              <span className="info-value">{getFreelancerName()}</span>
            </div>
          </div>
          <div className="workspace-budget">
            <FaDollarSign />
            <div>
              <span className="info-label">Budget</span>
              <span className="info-value">${getBudget()}</span>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-percentage">{getProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="workspace-card-footer">
        <div className="last-updated">
          <FaClock className="clock-icon" />
          <span>Updated recently</span>
        </div>
      </div>
    </div>
  );
};

export default ClientWorkspaceCard;