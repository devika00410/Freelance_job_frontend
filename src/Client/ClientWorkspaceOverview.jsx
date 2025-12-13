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
  FaStar
} from 'react-icons/fa';
import './ClientWorkspaceOverview.css'

const ClientWorkspaceOverview = ({ workspace, milestones = [], otherParty, otherPartyOnline, setActiveSection }) => {
  const [quickActions, setQuickActions] = useState([
    { id: 1, label: 'Approve Work', icon: FaCheckCircle, section: 'milestones', color: 'success' },
    { id: 2, label: 'Make Payment', icon: FaMoneyBillWave, section: 'budget', color: 'warning' },
    { id: 3, label: 'Schedule Meeting', icon: FaVideo, section: 'meetings', color: 'primary' },
    { id: 4, label: 'View Files', icon: FaFolderOpen, section: 'files', color: 'info' },
    { id: 5, label: 'Send Message', icon: FaCommentDots, section: 'chat', color: 'secondary' },
    { id: 6, label: 'Generate Report', icon: FaChartLine, section: 'reports', color: 'danger' }
  ]);

  // Calculate statistics
  const calculateStats = () => {
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const pendingApproval = milestones.filter(m => 
      m.status === 'awaiting_approval' || m.status === 'awaiting-approval'
    ).length;
    const totalBudget = workspace?.totalBudget || 0;
    const spentAmount = milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const pendingPayment = milestones
      .filter(m => m.status === 'completed' && (!m.paymentStatus || m.paymentStatus !== 'paid'))
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    return {
      totalMilestones,
      completedMilestones,
      pendingApproval,
      totalBudget,
      spentAmount,
      pendingPayment,
      progressPercentage: workspace?.overallProgress || 0,
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
    const upcoming = milestones.filter(milestone => {
      if (!milestone.dueDate) return false;
      const dueDate = new Date(milestone.dueDate);
      return dueDate > now && milestone.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return upcoming.slice(0, 3); // Return only 3 upcoming milestones
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'awaiting_approval': return 'warning';
      case 'in_progress': return 'primary';
      case 'pending': return 'secondary';
      default: return 'light';
    }
  };

  const upcomingMilestones = getUpcomingMilestones();
  const recentActivity = milestones
    .filter(m => m.submissionDate || m.approvalDate)
    .sort((a, b) => {
      const dateA = new Date(a.submissionDate || a.approvalDate);
      const dateB = new Date(b.submissionDate || b.approvalDate);
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="client-workspace-overview">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome to {workspace.title}</h1>
          <p className="project-description">{workspace.description || 'Manage your project and collaborate with your freelancer'}</p>
          
          <div className="project-meta">
            <div className="meta-item">
              <FaUser />
              <div>
                <span className="meta-label">Freelancer</span>
                <span className="meta-value">{otherParty?.name || 'Not assigned'}</span>
              </div>
            </div>
            <div className="meta-item">
              <FaCalendarAlt />
              <div>
                <span className="meta-label">Start Date</span>
                <span className="meta-value">{formatDate(workspace.startDate)}</span>
              </div>
            </div>
            <div className="meta-item">
              <FaCalendarCheck />
              <div>
                <span className="meta-label">Est. Completion</span>
                <span className="meta-value">{formatDate(workspace.estimatedEndDate)}</span>
              </div>
            </div>
            <div className="meta-item">
              <span className={`online-status ${otherPartyOnline ? 'online' : 'offline'}`}>
                {otherPartyOnline ? '● Online' : '○ Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className={`quick-action-btn ${action.color}`}
                onClick={() => setActiveSection(action.section)}
              >
                <action.icon />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.progressPercentage}%</h3>
            <p>Project Progress</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completedMilestones}/{stats.totalMilestones}</h3>
            <p>Milestones Completed</p>
            <small>{stats.completionRate}% completion rate</small>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingApproval}</h3>
            <p>Pending Approvals</p>
            <small>Awaiting your review</small>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>${stats.spentAmount.toLocaleString()}</h3>
            <p>Budget Spent</p>
            <small>${stats.remainingBudget.toLocaleString()} remaining</small>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="overview-columns">
        {/* Left Column */}
        <div className="column">
          {/* Upcoming Milestones */}
          <div className="section-card">
            <div className="section-header">
              <h3>
                <FaCalendarAlt /> Upcoming Milestones
              </h3>
              <button 
                className="view-all-btn"
                onClick={() => setActiveSection('milestones')}
              >
                View All <FaArrowRight />
              </button>
            </div>
            
            {upcomingMilestones.length > 0 ? (
              <div className="upcoming-list">
                {upcomingMilestones.map(milestone => (
                  <div key={milestone._id} className="upcoming-item">
                    <div className="upcoming-info">
                      <h4>{milestone.title}</h4>
                      <p className="milestone-description">{milestone.description}</p>
                      <div className="milestone-meta">
                        <span className="amount">${milestone.amount}</span>
                        <span className="due-date">Due: {formatDate(milestone.dueDate)}</span>
                        <span className={`status-badge ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ')}
                        </span>
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

          {/* Recent Activity */}
          <div className="section-card">
            <div className="section-header">
              <h3>
                <FaBell /> Recent Activity
              </h3>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.approvalDate ? (
                        <FaCheckCircle className="approved" />
                      ) : (
                        <FaClock className="submitted" />
                      )}
                    </div>
                    <div className="activity-content">
                      <p>
                        <strong>{activity.title}</strong> was{' '}
                        {activity.approvalDate ? 'approved' : 'submitted for review'}
                      </p>
                      <small>
                        {formatDate(activity.approvalDate || activity.submissionDate)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="column">
          {/* Project Health */}
          <div className="section-card">
            <div className="section-header">
              <h3>
                <FaStar /> Project Health
              </h3>
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
                <div className="metric-label">Communication Score</div>
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
              
              <div className="health-metric">
                <div className="metric-label">Budget Utilization</div>
                <div className="metric-value">
                  {((stats.spentAmount / stats.totalBudget) * 100).toFixed(1)}%
                </div>
                <div className="metric-bar">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(stats.spentAmount / stats.totalBudget) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Links */}
          <div className="section-card">
            <div className="section-header">
              <h3>
                <FaFileContract /> Important Links
              </h3>
            </div>
            
            <div className="links-list">
              <button className="link-item">
                <FaFileContract />
                <span>View Contract</span>
                <FaArrowRight />
              </button>
              
              <button className="link-item">
                <FaDownload />
                <span>Download Project Brief</span>
                <FaArrowRight />
              </button>
              
              <button className="link-item">
                <FaShare />
                <span>Share Workspace</span>
                <FaArrowRight />
              </button>
              
              <button className="link-item">
                <FaExclamationTriangle />
                <span>Report Issue</span>
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="section-card tips-card">
            <div className="section-header">
              <h3>
                <FaStar /> Quick Tips
              </h3>
            </div>
            
            <div className="tips-list">
              <div className="tip-item">
                <div className="tip-icon">💡</div>
                <div className="tip-content">
                  <strong>Review work promptly</strong>
                  <p>Timely approvals keep the project moving smoothly</p>
                </div>
              </div>
              
              <div className="tip-item">
                <div className="tip-icon">💰</div>
                <div className="tip-content">
                  <strong>Release payments on time</strong>
                  <p>This helps maintain a good relationship with your freelancer</p>
                </div>
              </div>
              
              <div className="tip-item">
                <div className="tip-icon">🗣️</div>
                <div className="tip-content">
                  <strong>Communicate clearly</strong>
                  <p>Provide specific feedback for requested changes</p>
                </div>
              </div>
              
              <div className="tip-item">
                <div className="tip-icon">📁</div>
                <div className="tip-content">
                  <strong>Keep files organized</strong>
                  <p>Download and backup important project files</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="reminder-card">
          <FaExclamationTriangle />
          <div>
            <h4>Action Required</h4>
            <p>
              {stats.pendingApproval > 0 
                ? `You have ${stats.pendingApproval} milestone${stats.pendingApproval > 1 ? 's' : ''} awaiting your approval`
                : 'All caught up! No pending actions'}
            </p>
          </div>
          {stats.pendingApproval > 0 && (
            <button 
              className="action-btn"
              onClick={() => setActiveSection('milestones')}
            >
              Review Now
            </button>
          )}
        </div>

        <div className="next-steps">
          <h4>Next Steps</h4>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <span>Review submitted work in Milestones tab</span>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <span>Release payments for approved work</span>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <span>Schedule regular check-ins with your freelancer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWorkspaceOverview;
