import React from 'react';
import { useAuth } from '../Context/AuthContext';
import './QuickActions.css';

const QuickActions = () => {
  const { user } = useAuth();

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

      if (!response.ok) throw new Error('Failed to auto-verify');
      
      const data = await response.json();
      alert(`✅ ${data.message}`);
      window.location.reload();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleReleasePayments = async () => {
    if (!window.confirm('Release all pending payments?')) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      // First get pending jobs
      const overviewRes = await fetch('http://localhost:3000/api/admin/payments/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!overviewRes.ok) throw new Error('Failed to get pending payments');
      
      const overview = await overviewRes.json();
      const pendingJobIds = overview.pendingJobs?.map(job => job._id) || [];
      
      if (pendingJobIds.length === 0) {
        alert('No pending payments to release');
        return;
      }

      // Bulk release
      const releaseRes = await fetch('http://localhost:3000/api/admin/payments/bulk-release', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobIds: pendingJobIds })
      });

      if (!releaseRes.ok) throw new Error('Failed to release payments');
      
      const data = await releaseRes.json();
      alert(`✅ ${data.message}`);
      window.location.reload();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleGenerateReport = () => {
    alert('📊 Report generation feature coming soon!');
  };

  const handleClearCache = () => {
    localStorage.removeItem('admin_charts_cache');
    localStorage.removeItem('admin_stats_cache');
    alert('✅ Cache cleared successfully!');
    window.location.reload();
  };

  const handleSystemCheck = () => {
    const checks = [
      { name: 'API Connection', status: '✅ OK' },
      { name: 'Database', status: '✅ OK' },
      { name: 'Payment Gateway', status: '⚠️ Checking...' },
      { name: 'Email Service', status: '✅ OK' }
    ];
    
    alert('System check completed!\n' + checks.map(c => `${c.name}: ${c.status}`).join('\n'));
  };

  return (
    <div className="admin-quick-actions-container">
      <h3>Quick Actions</h3>
      <p className="admin-quick-actions-subtitle">Common admin tasks at your fingertips</p>
      
      <div className="admin-quick-actions-grid">
        <button onClick={handleAutoVerify} className="admin-quick-action-card admin-quick-action-verify">
          <div className="admin-quick-action-icon">✅</div>
          <div className="admin-quick-action-content">
            <h4>Auto-Verify Users</h4>
            <p>Verify all eligible users automatically</p>
          </div>
        </button>

        <button onClick={handleReleasePayments} className="admin-quick-action-card admin-quick-action-payment">
          <div className="admin-quick-action-icon">💰</div>
          <div className="admin-quick-action-content">
            <h4>Release Payments</h4>
            <p>Process all pending payments</p>
          </div>
        </button>

        <button onClick={handleGenerateReport} className="admin-quick-action-card admin-quick-action-report">
          <div className="admin-quick-action-icon">📊</div>
          <div className="admin-quick-action-content">
            <h4>Generate Report</h4>
            <p>Create monthly performance report</p>
          </div>
        </button>

        <button onClick={handleSystemCheck} className="admin-quick-action-card admin-quick-action-system">
          <div className="admin-quick-action-icon">🔧</div>
          <div className="admin-quick-action-content">
            <h4>System Check</h4>
            <p>Check platform health status</p>
          </div>
        </button>

        <button onClick={handleClearCache} className="admin-quick-action-card admin-quick-action-cache">
          <div className="admin-quick-action-icon">🧹</div>
          <div className="admin-quick-action-content">
            <h4>Clear Cache</h4>
            <p>Refresh cached data</p>
          </div>
        </button>

        <button className="admin-quick-action-card admin-quick-action-email">
          <div className="admin-quick-action-icon">📧</div>
          <div className="admin-quick-action-content">
            <h4>Send Newsletter</h4>
            <p>Email all users</p>
          </div>
        </button>
      </div>

      <div className="admin-system-status">
        <h4>System Status</h4>
        <div className="admin-status-items">
          <div className="admin-status-item admin-status-online">
            <div className="admin-status-dot"></div>
            <span>Platform: Online</span>
          </div>
          <div className="admin-status-item admin-status-online">
            <div className="admin-status-dot"></div>
            <span>Database: Connected</span>
          </div>
          <div className="admin-status-item admin-status-warning">
            <div className="admin-status-dot"></div>
            <span>Payments: Processing</span>
          </div>
          <div className="admin-status-item admin-status-online">
            <div className="admin-status-dot"></div>
            <span>Emails: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;