import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './VerificationCenter.css';

const VerificationCenter = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'client', 'freelancer'
  const { user } = useAuth();

  useEffect(() => {
    fetchVerificationQueue();
    fetchVerificationStats();
  }, [filter]);

  const fetchVerificationQueue = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/verification/queue?role=${filter}`, {
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

      if (!response.ok) throw new Error('Failed to fetch verification queue');
      
      const data = await response.json();
      setQueue(data.queue || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStats = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/verification/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch verification stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching verification stats:', err);
    }
  };

  const handleAutoVerify = async () => {
    if (!window.confirm('Auto-verify all eligible users?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/verification/auto-verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to auto-verify users');
      
      const data = await response.json();
      alert(`✅ ${data.message}`);
      fetchVerificationQueue();
      fetchVerificationStats();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleManualVerify = async (userId) => {
    if (!window.confirm('Manually verify this user?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/verification/manual/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: 'Manually verified by admin' })
      });

      if (!response.ok) throw new Error('Failed to verify user');
      
      alert('✅ User verified successfully!');
      fetchVerificationQueue();
      fetchVerificationStats();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 60) return 'verification-score-high';
    if (score >= 40) return 'verification-score-medium';
    return 'verification-score-low';
  };

  if (loading) {
    return (
      <div className="verification-center-container">
        <div className="verification-loading-spinner"></div>
        <p>Loading verification queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-center-container">
        <div className="verification-error-message">
          <h3>Error loading verification center</h3>
          <p>{error}</p>
          <button onClick={fetchVerificationQueue} className="verification-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-center-container">
      <div className="verification-header-section">
        <h2>User Verification Center</h2>
        <div className="verification-header-actions">
          <button onClick={handleAutoVerify} className="verification-auto-verify-btn">
            ⚡ Auto-Verify Eligible Users
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="verification-stats-section">
          <div className="verification-stat-card">
            <h3>Total Users</h3>
            <div className="verification-stat-value">{stats.totalUsers}</div>
          </div>
          <div className="verification-stat-card">
            <h3>Verified</h3>
            <div className="verification-stat-value">{stats.verifiedUsers}</div>
            <div className="verification-stat-sub">({stats.verificationRate}%)</div>
          </div>
          <div className="verification-stat-card">
            <h3>Pending</h3>
            <div className="verification-stat-value">{stats.pendingVerification}</div>
          </div>
          <div className="verification-stat-card">
            <h3>Auto Verified</h3>
            <div className="verification-stat-value">{stats.autoVerified}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="verification-filters-section">
        <div className="verification-filter-group">
          <label>Filter by Role:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="client">Clients Only</option>
            <option value="freelancer">Freelancers Only</option>
          </select>
        </div>
        <div className="verification-queue-count">
          {queue.length} user{queue.length !== 1 ? 's' : ''} pending verification
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="verification-table-container">
        {queue.length === 0 ? (
          <div className="verification-empty-queue">
            <div className="verification-empty-icon">✅</div>
            <h3>No users pending verification</h3>
            <p>All users are verified or auto-verified.</p>
          </div>
        ) : (
          <table className="verification-queue-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verification Score</th>
                <th>Missing Checks</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((user) => (
                <tr key={user._id}>
                  <td className="verification-user-info">
                    <div className="verification-user-avatar">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div className="verification-user-details">
                      <strong>{user.name || 'No Name'}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`verification-role-badge verification-role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="verification-score-container">
                      <div className={`verification-score-circle ${getScoreColor(user.verificationScore)}`}>
                        {user.verificationScore}
                      </div>
                      <div className="verification-score-label">
                        {user.canAutoVerify ? 'Auto-Verify Ready' : 'Needs Review'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="verification-missing-checks">
                      {user.verificationChecks?.length > 0 ? (
                        <ul>
                          {user.verificationChecks?.map((check, index) => (
                            <li key={index} className="verification-check-item">
                              <span className="verification-check-icon">✓</span>
                              {check.replace('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="verification-no-checks">No checks passed</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="verification-action-buttons">
                      <button
                        onClick={() => handleManualVerify(user._id)}
                        className="verification-verify-btn"
                        disabled={!user.canAutoVerify}
                      >
                        Verify
                      </button>
                      <button className="verification-view-btn">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="verification-quick-actions">
        <h3>Quick Actions</h3>
        <div className="verification-quick-action-buttons">
          <button onClick={handleAutoVerify} className="verification-action-btn verification-primary-btn">
            ⚡ Run Auto-Verification
          </button>
          <button className="verification-action-btn verification-secondary-btn">
            📧 Send Verification Reminders
          </button>
          <button className="verification-action-btn verification-tertiary-btn">
            📊 View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;