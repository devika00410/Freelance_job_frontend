import React, { useState, useEffect } from 'react';
import {
  FaBriefcase, FaClock, FaCheckCircle, FaTimesCircle,
  FaFilter, FaSort, FaEye, FaUndo, FaChartLine,
  FaMoneyBillWave, FaCalendar, FaUser, FaSearch
} from 'react-icons/fa';
import axios from 'axios';
import './ApplicationsDashboard.css';

const ApplicationsDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest',
    search: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchApplicationStats();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/proposals', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined
        }
      });

      if (response.data.success) {
        let sortedApplications = response.data.proposals || [];
        
        // Apply sorting
        switch (filters.sortBy) {
          case 'newest':
            sortedApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'oldest':
            sortedApplications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case 'budget_high':
            sortedApplications.sort((a, b) => (b.proposalDetails?.totalAmount || 0) - (a.proposalDetails?.totalAmount || 0));
            break;
          case 'budget_low':
            sortedApplications.sort((a, b) => (a.proposalDetails?.totalAmount || 0) - (b.proposalDetails?.totalAmount || 0));
            break;
          default:
            break;
        }

        setApplications(sortedApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/proposals/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching application stats:', error);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `http://localhost:3000/api/freelancer/proposals/${applicationId}/withdraw`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.data.success) {
          // Update local state
          setApplications(prev => prev.map(app => 
            app._id === applicationId ? { ...app, status: 'withdrawn' } : app
          ));
          fetchApplicationStats(); // Refresh stats
        }
      } catch (error) {
        console.error('Error withdrawing application:', error);
        alert('Failed to withdraw application. Please try again.');
      }
    }
  };

  const handleViewDetails = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/freelancer/proposals/${applicationId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedApplication(response.data.proposal);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return 'applications-status-pending';
      case 'accepted':
        return 'applications-status-accepted';
      case 'rejected':
        return 'applications-status-rejected';
      case 'withdrawn':
        return 'applications-status-withdrawn';
      default:
        return 'applications-status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
      case 'pending':
        return <FaClock />;
      case 'accepted':
        return <FaCheckCircle />;
      case 'rejected':
        return <FaTimesCircle />;
      case 'withdrawn':
        return <FaUndo />;
      default:
        return <FaClock />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Stats Cards Component
  const ApplicationsStats = () => (
    <div className="applications-stats-grid">
      <div className="applications-stat-card applications-stat-total">
        <div className="applications-stat-icon">
          <FaBriefcase />
        </div>
        <div className="applications-stat-content">
          <h3>{stats.totalProposals || 0}</h3>
          <p>Total Applications</p>
        </div>
      </div>

      <div className="applications-stat-card applications-stat-pending">
        <div className="applications-stat-icon">
          <FaClock />
        </div>
        <div className="applications-stat-content">
          <h3>{stats.pendingProposals || 0}</h3>
          <p>Pending</p>
        </div>
      </div>

      <div className="applications-stat-card applications-stat-accepted">
        <div className="applications-stat-icon">
          <FaCheckCircle />
        </div>
        <div className="applications-stat-content">
          <h3>{stats.acceptedProposals || 0}</h3>
          <p>Accepted</p>
        </div>
      </div>

      <div className="applications-stat-card applications-stat-success">
        <div className="applications-stat-icon">
          <FaChartLine />
        </div>
        <div className="applications-stat-content">
          <h3>{stats.successRate || 0}%</h3>
          <p>Success Rate</p>
        </div>
      </div>
    </div>
  );

  // Application Card Component
  const ApplicationCard = ({ application }) => (
    <div className="applications-card">
      <div className="applications-card-header">
        <div className="applications-job-info">
          <h4 className="applications-job-title">{application.projectId?.title || 'Unknown Job'}</h4>
          <div className="applications-client-info">
            <FaUser className="applications-client-icon" />
            <span className="applications-client-name">
              {application.clientId?.profile?.name || application.clientId?.name || 'Unknown Client'}
            </span>
            {application.clientId?.rating && (
              <span className="applications-client-rating">
                ⭐ {application.clientId.rating}
              </span>
            )}
          </div>
        </div>
        <div className="applications-status">
          <span className={`applications-status-badge ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="applications-card-content">
        <div className="applications-proposal-details">
          <div className="applications-proposal-item">
            <FaMoneyBillWave className="applications-proposal-icon" />
            <span className="applications-proposal-label">Proposed Amount:</span>
            <span className="applications-proposal-value">
              {formatCurrency(application.proposalDetails?.totalAmount)}
            </span>
          </div>
          <div className="applications-proposal-item">
            <FaCalendar className="applications-proposal-icon" />
            <span className="applications-proposal-label">Timeline:</span>
            <span className="applications-proposal-value">
              {application.proposalDetails?.estimatedDays || 'N/A'} days
            </span>
          </div>
        </div>

        <p className="applications-cover-letter">
          {application.proposalDetails?.coverLetter?.length > 150 
            ? `${application.proposalDetails.coverLetter.substring(0, 150)}...`
            : application.proposalDetails?.coverLetter || 'No cover letter provided'
          }
        </p>
      </div>

      <div className="applications-card-footer">
        <div className="applications-dates">
          <span className="applications-date">Applied: {formatDate(application.createdAt)}</span>
          {application.updatedAt !== application.createdAt && (
            <span className="applications-date">Updated: {formatDate(application.updatedAt)}</span>
          )}
        </div>
        <div className="applications-actions">
          <button 
            className="applications-view-btn"
            onClick={() => handleViewDetails(application._id)}
          >
            <FaEye /> View Details
          </button>
          {(application.status === 'submitted' || application.status === 'pending') && (
            <button 
              className="applications-withdraw-btn"
              onClick={() => handleWithdrawApplication(application._id)}
            >
              <FaUndo /> Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Application Details Modal
  const ApplicationDetailsModal = () => (
    <div className={`applications-modal ${showDetailsModal ? 'applications-modal-show' : ''}`}>
      <div className="applications-modal-content">
        <div className="applications-modal-header">
          <h3>Application Details</h3>
          <button 
            className="applications-modal-close"
            onClick={() => setShowDetailsModal(false)}
          >
            ×
          </button>
        </div>

        <div className="applications-modal-body">
          {selectedApplication && (
            <div className="applications-details">
              <div className="applications-details-header">
                <h4>{selectedApplication.projectId?.title || 'Unknown Job'}</h4>
                <span className={`applications-status-badge ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </span>
              </div>

              <div className="applications-details-section">
                <h5>Client Information</h5>
                <div className="applications-client-details">
                  <p><strong>Name:</strong> {selectedApplication.clientId?.profile?.name || selectedApplication.clientId?.name || 'Unknown'}</p>
                  <p><strong>Company:</strong> {selectedApplication.clientId?.profile?.company || 'Not specified'}</p>
                  {selectedApplication.clientId?.rating && (
                    <p><strong>Rating:</strong> ⭐ {selectedApplication.clientId.rating}</p>
                  )}
                </div>
              </div>

              <div className="applications-details-section">
                <h5>Job Details</h5>
                <div className="applications-job-details">
                  <p><strong>Budget:</strong> {formatCurrency(selectedApplication.projectId?.budget)}</p>
                  <p><strong>Category:</strong> {selectedApplication.projectId?.category || 'Not specified'}</p>
                  <p><strong>Skills Required:</strong> {selectedApplication.projectId?.skillsRequired?.join(', ') || 'Not specified'}</p>
                </div>
              </div>

              <div className="applications-details-section">
                <h5>Your Proposal</h5>
                <div className="applications-proposal-details-full">
                  <p><strong>Proposed Amount:</strong> {formatCurrency(selectedApplication.proposalDetails?.totalAmount)}</p>
                  <p><strong>Estimated Timeline:</strong> {selectedApplication.proposalDetails?.estimatedDays || 'N/A'} days</p>
                  <div className="applications-cover-letter-full">
                    <strong>Cover Letter:</strong>
                    <p>{selectedApplication.proposalDetails?.coverLetter || 'No cover letter provided'}</p>
                  </div>
                </div>
              </div>

              <div className="applications-details-section">
                <h5>Timeline</h5>
                <div className="applications-timeline">
                  <p><strong>Applied:</strong> {formatDate(selectedApplication.createdAt)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(selectedApplication.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="applications-modal-footer">
          <button 
            className="applications-close-btn"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
          {(selectedApplication?.status === 'submitted' || selectedApplication?.status === 'pending') && (
            <button 
              className="applications-withdraw-btn"
              onClick={() => {
                handleWithdrawApplication(selectedApplication._id);
                setShowDetailsModal(false);
              }}
            >
              Withdraw Application
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="applications-dashboard">
      <div className="applications-header">
        <h1 className="applications-title">My Applications</h1>
        <p className="applications-subtitle">Track and manage your job applications</p>
      </div>

      <ApplicationsStats />

      <div className="applications-controls">
        <div className="applications-filters">
          <div className="applications-filter-group">
            <label className="applications-filter-label">Status</label>
            <select 
              className="applications-filter-select"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Applications</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="applications-filter-group">
            <label className="applications-filter-label">Sort By</label>
            <select 
              className="applications-filter-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Budget (High to Low)</option>
              <option value="budget_low">Budget (Low to High)</option>
            </select>
          </div>

          <div className="applications-filter-group">
            <label className="applications-filter-label">Search</label>
            <div className="applications-search">
              <FaSearch className="applications-search-icon" />
              <input
                type="text"
                className="applications-search-input"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="applications-summary">
          <span className="applications-count">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      <div className="applications-content">
        {loading ? (
          <div className="applications-loading">
            <div className="applications-loading-spinner"></div>
            <p>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="applications-empty">
            <FaBriefcase className="applications-empty-icon" />
            <h3>No applications found</h3>
            <p>
              {filters.status !== 'all' || filters.search 
                ? 'Try adjusting your filters to see more applications.'
                : "You haven't applied to any jobs yet. Start browsing jobs to submit your first application!"
              }
            </p>
            {!filters.search && filters.status === 'all' && (
              <button className="applications-browse-btn">
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="applications-list">
            {applications.map(application => (
              <ApplicationCard key={application._id} application={application} />
            ))}
          </div>
        )}
      </div>

      <ApplicationDetailsModal />
    </div>
  );
};

export default ApplicationsDashboard;