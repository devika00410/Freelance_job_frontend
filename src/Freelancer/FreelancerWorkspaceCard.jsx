import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaProjectDiagram,
  FaChevronRight,
  FaUser,
  FaDollarSign,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaFileContract,
  FaTasks,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import './FreelancerDashboard.css';

const FreelancerWorkspaceCard = ({ workspace }) => {
  const navigate = useNavigate();
  
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || 'active';
    
    switch(statusLower) {
      case 'active':
      case 'in-progress':
      case 'in_progress':
        return {
          color: '#10b981', // Green
          bgColor: '#d1fae5',
          borderColor: '#a7f3d0',
          label: 'Active',
          icon: <FaChartLine />
        };
      case 'completed':
        return {
          color: '#6b7280', // Gray
          bgColor: '#f3f4f6',
          borderColor: '#d1d5db',
          label: 'Completed',
          icon: <FaCheckCircle />
        };
      case 'on-hold':
      case 'on_hold':
        return {
          color: '#f59e0b', // Amber
          bgColor: '#fef3c7',
          borderColor: '#fcd34d',
          label: 'On Hold',
          icon: <FaClock />
        };
      case 'pending':
        return {
          color: '#8b5cf6', // Purple
          bgColor: '#ede9fe',
          borderColor: '#c4b5fd',
          label: 'Pending',
          icon: <FaTasks />
        };
      default:
        return {
          color: '#4299e1', // Light Blue
          bgColor: '#ebf8ff',
          borderColor: '#bee3f8',
          label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active',
          icon: <FaProjectDiagram />
        };
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const workspaceId = workspace._id || workspace.workspaceId;
    
    if (!workspaceId) {
      console.error('ERROR: No workspace ID found!');
      return;
    }
    
    navigate(`/freelancer/workspace/${workspaceId}`);
  };

  // Helper functions
  const getDisplayTitle = () => {
    return workspace.projectTitle || workspace.title || 'Untitled Project';
  };

  const getClientName = () => {
    return workspace.clientName || workspace.client?.name || 'Client';
  };

  const getClientInitials = () => {
    const name = getClientName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getBudget = () => {
    const budget = workspace.totalBudget || workspace.budget || 0;
    return budget.toLocaleString();
  };

  const getProgress = () => {
    return workspace.overallProgress || workspace.progress || 0;
  };

  const getDeadline = () => {
    if (workspace.deadline) {
      return new Date(workspace.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (workspace.endDate) {
      return new Date(workspace.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return 'No deadline set';
  };

  const getStartDate = () => {
    if (workspace.startDate) {
      return new Date(workspace.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return 'Not started';
  };

  const getMilestoneCount = () => {
    return workspace.milestoneCount || workspace.milestones?.length || 0;
  };

  const getCompletedMilestones = () => {
    return workspace.completedMilestones || workspace.milestones?.filter(m => m.status === 'completed')?.length || 0;
  };

  const statusConfig = getStatusConfig(workspace.status);

  return (
    <div 
      className="freelancer-workspace-card"
      onClick={handleClick}
      style={{ 
        cursor: 'pointer',
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        marginBottom: '0',
        transition: 'all 0.3s ease',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#4299e1';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            <FaProjectDiagram />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 4px 0',
              color: '#1a202c',
              fontSize: '1.1rem',
              fontWeight: '700',
              lineHeight: '1.3'
            }}>
              {getDisplayTitle()}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: statusConfig.bgColor,
                border: `1px solid ${statusConfig.borderColor}`,
                fontSize: '0.75rem',
                fontWeight: '600',
                color: statusConfig.color
              }}>
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </div>
              <span style={{
                fontSize: '0.8rem',
                color: '#718096',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaFileContract size={12} />
                <span>Contract</span>
              </span>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#f7fafc',
          color: '#4299e1',
          transition: 'all 0.2s'
        }}>
          <FaChevronRight />
        </div>
      </div>

      {/* Progress Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#2d3748'
          }}>
            Project Progress
          </span>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: '700',
            color: '#2c5282'
          }}>
            {getProgress()}%
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#edf2f7',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '4px'
        }}>
          <div style={{
            height: '100%',
            width: `${getProgress()}%`,
            background: 'linear-gradient(90deg, #4299e1 0%, #3182ce 100%)',
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#718096'
        }}>
          <span>Started: {getStartDate()}</span>
          <span>Deadline: {getDeadline()}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '12px',
        background: '#f7fafc',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#4299e1'
          }}>
            <FaDollarSign size={14} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              ${getBudget()}
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#718096',
            textAlign: 'center'
          }}>
            Budget
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#10b981'
          }}>
            <FaTasks size={14} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              {getCompletedMilestones()}/{getMilestoneCount()}
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#718096',
            textAlign: 'center'
          }}>
            Milestones
          </span>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#d69e2e'
          }}>
            <FaClock size={14} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#1a202c'
            }}>
              {workspace.daysLeft || '30'}d
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#718096',
            textAlign: 'center'
          }}>
            Days Left
          </span>
        </div>
      </div>

      {/* Footer Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f0f4f8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {getClientInitials()}
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              {getClientName()}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#718096'
            }}>
              {workspace.clientCompany || 'Client'}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(90deg, #4299e1 0%, #3182ce 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>Open Workspace</span>
          <FaArrowRight size={12} />
        </button>
      </div>

      {/* Timeline Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: getProgress() === 100 ? '#10b981' : 
                   getProgress() >= 75 ? '#4299e1' : 
                   getProgress() >= 50 ? '#d69e2e' : '#e53e3e',
        boxShadow: `0 0 0 3px ${getProgress() === 100 ? '#d1fae5' : 
                                getProgress() >= 75 ? '#ebf8ff' : 
                                getProgress() >= 50 ? '#fef3c7' : '#fed7d7'}`
      }} />
    </div>
  );
};

export default FreelancerWorkspaceCard;