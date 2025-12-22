import React, { useState } from 'react';
import {
  FaTasks,
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUser,
  FaFolderOpen,
  FaCommentDots,
  FaVideo,
  FaFileContract,
  FaArrowRight,
  FaDownload,
  FaShare,
  FaBell,
  FaCalendarCheck,
  FaStar,
  FaPercentage,
  FaRocket,
  FaChartBar, FaCopy
} from 'react-icons/fa';
import './ClientWorkspaceOverview.css';

const ClientWorkspaceOverview = ({ workspace, milestones = [], otherParty, otherPartyOnline, setActiveSection }) => {

const [copyNotification, setCopyNotification] = useState(false);
  // Calculate statistics
  const calculateStats = () => {
    const totalMilestones = milestones.length || 0;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const pendingApproval = milestones.filter(m => 
      m.status === 'awaiting_approval' || m.status === 'submitted'
    ).length;
    
    const totalBudget = workspace?.totalBudget || 5000;
    const spentAmount = milestones
      .filter(m => m.status === 'completed' || m.paymentStatus === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    
    const pendingPayment = milestones
      .filter(m => m.status === 'completed' && (!m.paymentStatus || m.paymentStatus !== 'paid'))
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    const progressPercentage = milestones.length > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    return {
      totalMilestones,
      completedMilestones,
      pendingApproval,
      totalBudget,
      spentAmount,
      pendingPayment,
      progressPercentage,
      remainingBudget: totalBudget - spentAmount,
      completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUpcomingMilestones = () => {
    const now = new Date();
    return milestones
      .filter(milestone => {
        if (!milestone.dueDate) return false;
        const dueDate = new Date(milestone.dueDate);
        return dueDate > now && milestone.status !== 'completed';
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'awaiting_approval': return 'warning';
      case 'submitted': return 'warning';
      case 'in_progress': return 'primary';
      case 'pending': return 'secondary';
      default: return 'light';
    }
  };

  const upcomingMilestones = getUpcomingMilestones();
  const pendingMilestones = milestones.filter(m => 
    m.status === 'awaiting_approval' || m.status === 'submitted'
  );

  const quickActions = [
    { id: 1, label: 'Review Work', icon: FaCheckCircle, section: 'milestones', color: 'success' },
    { id: 2, label: 'Make Payment', icon: FaMoneyBillWave, section: 'budget', color: 'warning' },
    { id: 3, label: 'Schedule Call', icon: FaVideo, section: 'meetings', color: 'primary' },
    { id: 4, label: 'Share Files', icon: FaFolderOpen, section: 'files', color: 'info' },
    { id: 5, label: 'Send Message', icon: FaCommentDots, section: 'chat', color: 'secondary' },
    { id: 6, label: 'View Reports', icon: FaChartBar, section: 'reports', color: 'danger' }
  ];

  return (
    <div className="client-workspace-overview">
      {/* Hero Section */}
      <div className="overview-hero">
        <div className="hero-content">
          <h1>Welcome to {workspace.title}</h1>
          <p className="project-description">{workspace.description || 'Manage your project and collaborate with your freelancer'}</p>
          
          <div className="project-meta-grid">
            <div className="meta-card">
              <div className="meta-icon">
                <FaUser />
              </div>
              <div>
                <span className="meta-label">Freelancer</span>
                <span className="meta-value">{otherParty?.name || 'Not assigned'}</span>
              </div>
              <span className={`online-badge ${otherPartyOnline ? 'online' : 'offline'}`}>
                {otherPartyOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <FaCalendarAlt />
              </div>
              <div>
                <span className="meta-label">Start Date</span>
                <span className="meta-value">{formatDate(workspace.startDate)}</span>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <FaCalendarCheck />
              </div>
              <div>
                <span className="meta-label">Est. Completion</span>
                <span className="meta-value">{formatDate(workspace.estimatedEndDate)}</span>
              </div>
            </div>
            
            <div className="meta-card">
              <div className="meta-icon">
                <FaPercentage />
              </div>
              <div>
                <span className="meta-label">Progress</span>
                <span className="meta-value">{stats.progressPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <div className="stat-card progress">
          <div className="stat-header">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-title">Project Progress</div>
          </div>
          <div className="stat-value">{stats.progressPercentage}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="stat-card milestones">
          <div className="stat-header">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-title">Milestones</div>
          </div>
          <div className="stat-value">{stats.completedMilestones}/{stats.totalMilestones}</div>
          <div className="stat-subtitle">{stats.completionRate}% completed</div>
        </div>

        <div className="stat-card budget">
          <div className="stat-header">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-title">Budget</div>
          </div>
          <div className="stat-value">${stats.spentAmount.toLocaleString()}</div>
          <div className="stat-subtitle">of ${stats.totalBudget.toLocaleString()}</div>
        </div>

        <div className="stat-card actions">
          <div className="stat-header">
            <div className="stat-icon">
              <FaBell />
            </div>
            <div className="stat-title">Pending Actions</div>
          </div>
          <div className="stat-value">{stats.pendingApproval}</div>
          <div className="stat-subtitle">awaiting review</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overview-grid">
        {/* Left Column */}
        <div className="overview-column">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-header">
              <h3><FaRocket /> Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  className={`quick-action-btn ${action.color}`}
                  onClick={() => setActiveSection(action.section)}
                >
                  <action.icon className="action-icon" />
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div className="section-card">
            <div className="section-header">
              <h3><FaCalendarAlt /> Upcoming Milestones</h3>
              {upcomingMilestones.length > 0 && (
                <button 
                  className="view-all-btn"
                  onClick={() => setActiveSection('milestones')}
                >
                  View All <FaArrowRight />
                </button>
              )}
            </div>
            
            {upcomingMilestones.length > 0 ? (
              <div className="upcoming-list">
                {upcomingMilestones.map(milestone => (
                  <div key={milestone._id} className="upcoming-item">
                    <div className="upcoming-content">
                      <div className="upcoming-header">
                        <h4>{milestone.title}</h4>
                        <span className={`status-badge ${getStatusColor(milestone.status)}`}>
                          {milestone.status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </div>
                      <p className="milestone-description">{milestone.description}</p>
                      <div className="milestone-footer">
                        <span className="amount">${milestone.amount || 0}</span>
                        <span className="due-date">Due: {formatDate(milestone.dueDate)}</span>
                      </div>
                    </div>
                    {milestone.status === 'awaiting_approval' && (
                      <button 
                        className="review-btn"
                        onClick={() => setActiveSection('milestones')}
                      >
                        Review Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No upcoming milestones scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="overview-column">
          {/* Pending Approvals */}
          <div className="section-card">
            <div className="section-header">
              <h3><FaCheckCircle /> Pending Approvals</h3>
              {pendingMilestones.length > 0 && (
                <button 
                  className="view-all-btn"
                  onClick={() => setActiveSection('milestones')}
                >
                  Review All <FaArrowRight />
                </button>
              )}
            </div>
            
            {pendingMilestones.length > 0 ? (
              <div className="pending-list">
                {pendingMilestones.slice(0, 3).map(milestone => (
                  <div key={milestone._id} className="pending-item">
                    <div className="pending-info">
                      <h4>{milestone.title}</h4>
                      <p>Phase {milestone.phase}</p>
                      <div className="pending-meta">
                        <span>${milestone.amount || 0}</span>
                        <span>Submitted: {formatDate(milestone.submittedDate)}</span>
                      </div>
                    </div>
                    <button 
                      className="action-btn primary"
                      onClick={() => setActiveSection('milestones')}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state success">
                <FaCheckCircle />
                <p>All caught up! No pending approvals</p>
              </div>
            )}
          </div>

          {/* Project Health */}
          <div className="section-card">
            <div className="section-header">
              <h3><FaStar /> Project Health</h3>
            </div>
            
            <div className="health-metrics">
              <div className="health-metric">
                <div className="metric-label">Timeline Adherence</div>
                <div className="metric-value">85%</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="health-metric">
                <div className="metric-label">Communication</div>
                <div className="metric-value">4.5/5</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '90%' }}></div>
                </div>
              </div>
              
              <div className="health-metric">
                <div className="metric-label">Quality Rating</div>
                <div className="metric-value">4.8/5</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Links */}
          <div className="section-card">
            <div className="section-header">
              <h3><FaFileContract /> Important Links</h3>
            </div>
            
            <div className="links-list">
              <button className="link-item" onClick={() => setActiveSection('contract')}>
                <FaFileContract />
                <span>View Contract</span>
                <FaArrowRight />
              </button>
              
              <button className="link-item" onClick={() => setActiveSection('files')}>
                <FaDownload />
                <span>Download Project Files</span>
                <FaArrowRight />
              </button>
              
              <button className="link-item">
                <FaShare />
                <span>Share Workspace</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Banner */}
      {stats.pendingApproval > 0 && (
        <div className="action-banner">
          <div className="banner-content">
            <FaExclamationTriangle />
            <div>
              <h4>Action Required</h4>
              <p>You have {stats.pendingApproval} milestone{stats.pendingApproval > 1 ? 's' : ''} awaiting your approval</p>
            </div>
          </div>
          <button 
            className="banner-btn"
            onClick={() => setActiveSection('milestones')}
          >
            Review Now
          </button>
        </div>
      )}
   
<div className="freelancer-id-section">
  <div className="freelancer-id-header">
    <FaUser />
    <h4>Freelancer Information</h4>
  </div>
  <div className="freelancer-id-display">
    <input
      type="text"
      value={otherParty?.id || workspace?.freelancerId || 'No ID available'}
      readOnly
      className="freelancer-id-value"
      id="freelancer-id-input"
    />
    <button
      className="copy-id-btn"
      onClick={async () => {
        const id = otherParty?.id || workspace?.freelancerId;
        if (id) {
          try {
            await navigator.clipboard.writeText(id);
            const btn = event.target;
            btn.innerHTML = '<FaCheck /> Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = '<FaCopy /> Copy ID';
              btn.classList.remove('copied');
            }, 2000);
            
            // Show notification
            setCopyNotification(true);
            setTimeout(() => setCopyNotification(false), 3000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        }
      }}
      disabled={!otherParty?.id && !workspace?.freelancerId}
    >
      <FaCopy /> Copy ID
    </button>
  </div>
  <p className="freelancer-info-note">
    Use this ID to make payments to the freelancer. Click "Copy ID" and paste it in the payment form.
  </p>
</div>


{copyNotification && (
  <div className="copy-notification">
    <FaCheck /> Freelancer ID copied to clipboard!
  </div>
)}
    </div>
    
  );
};

export default ClientWorkspaceOverview;