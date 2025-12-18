// components/admin/SubscriptionManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubscriptionManagement.css';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUserCircle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSpinner
} from 'react-icons/fa';
import { MdPayment, MdEmail } from 'react-icons/md';

const SubscriptionManagement = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [subscriptionsRes, statsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/admin/pending-subscriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/admin/revenue-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setPendingSubscriptions(subscriptionsRes.data);
      setRevenueStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subscriptionId) => {
    if (!window.confirm('Approve this subscription? The user will gain immediate access.')) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/admin/approve-subscription`, 
        { subscriptionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Subscription approved successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (subscriptionId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    if (!window.confirm(`Reject this subscription? Reason: ${reason}`)) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/admin/cancel-subscription`, 
        { subscriptionId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Subscription rejected');
      fetchData();
    } catch (error) {
      alert('Error rejecting subscription');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="subscription-management-loading">
        <FaSpinner className="spinner" />
        <p>Loading subscription data...</p>
      </div>
    );
  }

  return (
    <div className="subscription-management-container">
      <div className="subscription-header">
        <h1>Subscription Management</h1>
        <div className="subscription-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>Monthly Revenue</h3>
              <div className="stat-value">{formatCurrency(revenueStats?.monthlyRecurringRevenue)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaUserCircle />
            </div>
            <div className="stat-content">
              <h3>Active Subscriptions</h3>
              <div className="stat-value">{revenueStats?.activeSubscriptions || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Pending Approval</h3>
              <div className="stat-value">{pendingSubscriptions.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-content">
        {/* Pending Subscriptions */}
        <div className="pending-subscriptions-section">
          <div className="section-header">
            <h2>Pending Approvals ({pendingSubscriptions.length})</h2>
            <button 
              onClick={fetchData} 
              className="refresh-btn"
              disabled={processing}
            >
              Refresh
            </button>
          </div>

          {pendingSubscriptions.length === 0 ? (
            <div className="no-pending">
              <FaCheckCircle className="success-icon" />
              <h3>No pending subscriptions</h3>
              <p>All subscriptions have been processed.</p>
            </div>
          ) : (
            <div className="subscriptions-grid">
              {pendingSubscriptions.map((sub) => (
                <div key={sub._id} className="subscription-card pending">
                  <div className="card-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {sub.userId?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="user-details">
                        <h4>{sub.userId?.name || 'Unknown User'}</h4>
                        <p className="user-email">
                          <MdEmail /> {sub.userId?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="subscription-type">
                      <span className={`plan-badge ${sub.planId}`}>
                        {sub.planId.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="card-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <strong>{formatCurrency(sub.amount)}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Billing:</span>
                      <span className="billing-cycle">{sub.billingCycle}</span>
                    </div>
                    <div className="detail-row">
                      <span>Requested:</span>
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className="status-badge pending-badge">Pending</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handleApprove(sub._id)}
                      className="action-btn approve-btn"
                      disabled={processing}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(sub._id)}
                      className="action-btn reject-btn"
                      disabled={processing}
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <MdPayment />
              </div>
              <div className="activity-content">
                <p><strong>Today's Revenue:</strong> {formatCurrency(revenueStats?.todayRevenue)}</p>
                <small>{new Date().toLocaleDateString()}</small>
              </div>
            </div>
            {/* Add more activity items */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;