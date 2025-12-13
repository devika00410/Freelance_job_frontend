import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './PaymentOverview.css';
import { 
  FaMoneyBillWave, 
  FaChartLine, 
  FaClock, 
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { 
  MdPayment,
  MdAttachMoney,
  MdPendingActions,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';

const PaymentOverview = () => {
  const [overview, setOverview] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobs, setSelectedJobs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPaymentOverview();
  }, []);

  const fetchPaymentOverview = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/payments/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch payment overview');
      
      const data = await response.json();
      setOverview(data.overview);
      setPendingJobs(data.pendingJobs || []);
      setRecentTransactions(data.recentTransactions || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayment = async (jobId) => {
    if (!window.confirm('Release payment for this job?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/payments/release/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: 'Released by admin' })
      });

      if (!response.ok) throw new Error('Failed to release payment');
      
      const data = await response.json();
      alert(`✅ ${data.message}`);
      fetchPaymentOverview();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleBulkRelease = async () => {
    if (selectedJobs.length === 0) {
      alert('Please select at least one job');
      return;
    }

    if (!window.confirm(`Release payments for ${selectedJobs.length} selected jobs?`)) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/payments/bulk-release', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobIds: selectedJobs })
      });

      if (!response.ok) throw new Error('Failed to bulk release payments');
      
      const data = await response.json();
      alert(`✅ ${data.message}`);
      setSelectedJobs([]);
      fetchPaymentOverview();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const toggleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === pendingJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(pendingJobs.map(job => job._id));
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
      <div className="payment-overview-container">
        <div className="payment-loading-spinner"></div>
        <p>Loading payment overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-overview-container">
        <div className="payment-error-message">
          <h3>Error loading payment overview</h3>
          <p>{error}</p>
          <button onClick={fetchPaymentOverview} className="payment-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-overview-container">
      <div className="payment-header-section">
        <h2>Payment & Escrow Management</h2>
        <div className="payment-header-actions">
          {selectedJobs.length > 0 && (
            <button onClick={handleBulkRelease} className="payment-bulk-release-btn">
              <FaDownload /> Release {selectedJobs.length} Selected
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="payment-stats-cards">
        <div className="payment-stat-card payment-stat-escrow">
          <div className="payment-stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="payment-stat-content">
            <h3>Escrow Balance</h3>
            <div className="payment-stat-value">{formatCurrency(overview?.escrowBalance)}</div>
            <div className="payment-stat-sub">{overview?.jobsInEscrow} jobs in escrow</div>
          </div>
        </div>

        <div className="payment-stat-card payment-stat-revenue">
          <div className="payment-stat-icon">
            <FaChartLine />
          </div>
          <div className="payment-stat-content">
            <h3>Platform Revenue</h3>
            <div className="payment-stat-value">{formatCurrency(overview?.platformRevenue)}</div>
            <div className="payment-stat-sub">25% fee on all payments</div>
          </div>
        </div>

        <div className="payment-stat-card payment-stat-pending">
          <div className="payment-stat-icon">
            <FaClock />
          </div>
          <div className="payment-stat-content">
            <h3>Pending Releases</h3>
            <div className="payment-stat-value">{overview?.pendingReleases}</div>
            <div className="payment-stat-sub">Awaiting approval</div>
          </div>
        </div>

        <div className="payment-stat-card payment-stat-total">
          <div className="payment-stat-icon">
            <MdAttachMoney />
          </div>
          <div className="payment-stat-content">
            <h3>Total Processed</h3>
            <div className="payment-stat-value">{formatCurrency(overview?.totalProcessed)}</div>
            <div className="payment-stat-sub">All transactions</div>
          </div>
        </div>
      </div>

      {/* Pending Jobs Section */}
      <div className="payment-pending-jobs-section">
        <div className="payment-section-header">
          <h3>Pending Payment Releases ({pendingJobs.length})</h3>
          {pendingJobs.length > 0 && (
            <div className="payment-section-actions">
              <label className="payment-select-all">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === pendingJobs.length && pendingJobs.length > 0}
                  onChange={selectAllJobs}
                />
                Select All
              </label>
            </div>
          )}
        </div>

        {pendingJobs.length === 0 ? (
          <div className="payment-empty-pending">
            <div className="payment-empty-icon">
              <FaCheckCircle />
            </div>
            <h4>No pending payments</h4>
            <p>All payments have been processed.</p>
          </div>
        ) : (
          <div className="payment-pending-jobs-grid">
            {pendingJobs.map((job) => (
              <div key={job._id} className="payment-job-card">
                <div className="payment-job-card-header">
                  <div className="payment-job-select">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job._id)}
                      onChange={() => toggleSelectJob(job._id)}
                    />
                  </div>
                  <div className="payment-job-title">{job.title}</div>
                  <div className="payment-job-budget">{formatCurrency(job.budget)}</div>
                </div>
                
                <div className="payment-job-details">
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Client:</span>
                    <span className="payment-detail-value">{job.clientId?.name || 'Unknown'}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Freelancer:</span>
                    <span className="payment-detail-value">{job.freelancerId?.name || 'Unknown'}</span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Completed:</span>
                    <span className="payment-detail-value">
                      {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Status:</span>
                    <span className={`payment-status-badge payment-status-${job.paymentStatus}`}>
                      {job.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="payment-job-actions">
                  <button
                    onClick={() => handleReleasePayment(job._id)}
                    className="payment-release-btn"
                  >
                    <MdPayment /> Release Payment
                  </button>
                  <div className="payment-breakdown">
                    <span className="payment-fee">Fee: {formatCurrency(job.budget * 0.25)}</span>
                    <span className="payment-payout">Payout: {formatCurrency(job.budget * 0.75)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="payment-recent-transactions">
        <h3>Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p className="payment-no-transactions">No recent transactions</p>
        ) : (
          <table className="payment-transactions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>
                    <span className={`payment-type-badge payment-type-${transaction.type}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="payment-amount">{formatCurrency(transaction.amount)}</td>
                  <td>{transaction.fromUser?.name || 'Platform'}</td>
                  <td>{transaction.toUser?.name || 'Platform'}</td>
                  <td>
                    <span className={`payment-status-badge payment-status-${transaction.status}`}>
                      {transaction.status === 'completed' ? <FaCheckCircle /> : 
                       transaction.status === 'failed' ? <FaTimesCircle /> : 
                       <MdPendingActions />}
                      {transaction.status}
                    </span>
                  </td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Stats */}
      <div className="payment-quick-stats">
        <div className="payment-quick-stat-box">
          <h4>Today's Revenue</h4>
          <div className="payment-quick-stat-number">$0</div>
          <div className="payment-quick-stat-change payment-positive">+0%</div>
        </div>
        <div className="payment-quick-stat-box">
          <h4>Monthly Revenue</h4>
          <div className="payment-quick-stat-number">$0</div>
          <div className="payment-quick-stat-change payment-positive">+0%</div>
        </div>
        <div className="payment-quick-stat-box">
          <h4>Success Rate</h4>
          <div className="payment-quick-stat-number">100%</div>
          <div className="payment-quick-stat-change payment-neutral">0%</div>
        </div>
        <div className="payment-quick-stat-box">
          <h4>Avg. Transaction</h4>
          <div className="payment-quick-stat-number">$0</div>
          <div className="payment-quick-stat-change payment-neutral">-</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOverview;