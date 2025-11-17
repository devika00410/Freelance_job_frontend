import React, { useState, useEffect } from 'react';
import { 
  FiBriefcase, 
  FiFileText, 
  FiDollarSign, 
  FiMessageSquare, 
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiEye,
  FiEdit,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage or your auth context
  const token = localStorage.getItem('token'); // or from context

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data
      const dashboardResponse = await axios.get('http://localhost:5000/api/client/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch recent jobs
      const jobsResponse = await axios.get('http://localhost:5000/api/client/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardResponse.data);
      setRecentJobs(jobsResponse.data.jobs || []);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle className="status-icon active" />;
      case 'draft': return <FiClock className="status-icon draft" />;
      case 'completed': return <FiCheckCircle className="status-icon completed" />;
      default: return <FiClock className="status-icon draft" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-badge active';
      case 'draft': return 'status-badge draft';
      case 'completed': return 'status-badge completed';
      default: return 'status-badge draft';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FiRefreshCw className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Client Dashboard</h1>
          <button className="new-job-btn">
            <FiPlus className="btn-icon" />
            <span>Post New Job</span>
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Grid - Using real data from your backend */}
        {dashboardData && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Jobs</p>
                  <p className="stat-value">{dashboardData.quickStats?.totalJobs || 0}</p>
                </div>
                <div className="stat-icon jobs">
                  <FiBriefcase />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Active Jobs</p>
                  <p className="stat-value">{dashboardData.quickStats?.activeJobs || 0}</p>
                </div>
                <div className="stat-icon active">
                  <FiCheckCircle />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Proposals</p>
                  <p className="stat-value">{dashboardData.quickStats?.totalProposals || 0}</p>
                </div>
                <div className="stat-icon proposals">
                  <FiFileText />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Pending Proposals</p>
                  <p className="stat-value">{dashboardData.quickStats?.pendingProposals || 0}</p>
                </div>
                <div className="stat-icon pending">
                  <FiClock />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Total Spent</p>
                  <p className="stat-value">${dashboardData.quickStats?.totalSpent || 0}</p>
                </div>
                <div className="stat-icon revenue">
                  <FiDollarSign />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <p className="stat-label">Active Chats</p>
                  <p className="stat-value">{dashboardData.quickStats?.activeChats || 0}</p>
                </div>
                <div className="stat-icon chats">
                  <FiMessageSquare />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Recent Activity - Using real data from your backend */}
          <div className="activity-card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="card-content">
              {dashboardData?.recentActivity?.length > 0 ? (
                <div className="activity-list">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <FiClock />
                      </div>
                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <p className="activity-time">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No recent activity</p>
              )}
            </div>
          </div>

          {/* Recent Jobs - Using real data from your backend */}
          <div className="jobs-card">
            <div className="card-header">
              <h2 className="card-title">Recent Jobs</h2>
            </div>
            <div className="card-content">
              {recentJobs.length > 0 ? (
                <div className="jobs-list">
                  {recentJobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="job-item">
                      <div className="job-header">
                        <h3 className="job-title">{job.title}</h3>
                        <span className={getStatusClass(job.status)}>
                          {getStatusIcon(job.status)}
                          <span className="status-text">{job.status}</span>
                        </span>
                      </div>
                      <div className="job-details">
                        <span>Proposals: {job.proposalCount || 0}</span>
                        <span>Budget: ${job.budget}</span>
                        <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="job-actions">
                        <button className="action-btn view">
                          <FiEye className="action-icon" />
                          View Details
                        </button>
                        <button className="action-btn edit">
                          <FiEdit className="action-icon" />
                          Edit Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No jobs posted yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;