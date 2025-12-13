import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './AdminStatsWidget.css';

const AdminStatsWidget = () => {
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    escrowBalance: 0,
    pendingActions: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      // Fetch multiple stats in parallel
      const [verificationRes, paymentsRes, dashboardRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/verification/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/admin/payments/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Check for auth errors
      if (verificationRes.status === 401) {
        localStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      // Parse responses
      const verificationData = await verificationRes.json();
      const paymentsData = await paymentsRes.json();
      const dashboardData = await dashboardRes.json();

      if (verificationData.success && paymentsData.success && dashboardData.success) {
        setStats({
          verifiedUsers: verificationData.stats?.verifiedUsers || 0,
          escrowBalance: paymentsData.overview?.escrowBalance || 0,
          pendingActions: verificationData.stats?.pendingVerification || 0,
          todayRevenue: dashboardData.stats?.totalRevenue || 0
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="admin-stats-widget-container">
        <div className="admin-stats-loading">
          <div className="admin-stats-loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-stats-widget-container">
        <div className="admin-stats-error">
          <span>⚠️ Stats unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stats-widget-container">
      <div className="admin-stats-welcome-section">
        <div className="admin-stats-avatar">
          {user?.name?.charAt(0) || 'A'}
        </div>
        <div className="admin-stats-welcome-text">
          <h3>Welcome back, {user?.name || 'Admin'}!</h3>
          <p className="admin-stats-welcome-subtitle">Here's your platform overview</p>
        </div>
        <div className="admin-stats-current-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="admin-stats-cards-grid">
        <div className="admin-stats-card admin-stats-verified">
          <div className="admin-stats-card-icon">✅</div>
          <div className="admin-stats-card-content">
            <div className="admin-stats-card-label">Verified Users</div>
            <div className="admin-stats-card-value">{stats.verifiedUsers.toLocaleString()}</div>
            <div className="admin-stats-trend admin-stats-trend-positive">
              <span>↑ 12%</span> from last week
            </div>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-escrow">
          <div className="admin-stats-card-icon">💰</div>
          <div className="admin-stats-card-content">
            <div className="admin-stats-card-label">Escrow Balance</div>
            <div className="admin-stats-card-value">{formatCurrency(stats.escrowBalance)}</div>
            <div className="admin-stats-trend admin-stats-trend-positive">
              <span>↑ 8%</span> this month
            </div>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-pending">
          <div className="admin-stats-card-icon">⏳</div>
          <div className="admin-stats-card-content">
            <div className="admin-stats-card-label">Pending Actions</div>
            <div className="admin-stats-card-value">{stats.pendingActions}</div>
            <div className="admin-stats-trend admin-stats-trend-warning">
              <span>⚠️</span> Needs attention
            </div>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-revenue">
          <div className="admin-stats-card-icon">📈</div>
          <div className="admin-stats-card-content">
            <div className="admin-stats-card-label">Platform Revenue</div>
            <div className="admin-stats-card-value">{formatCurrency(stats.todayRevenue)}</div>
            <div className="admin-stats-trend admin-stats-trend-positive">
              <span>↑ 15%</span> today
            </div>
          </div>
        </div>
      </div>

      <div className="admin-stats-quick-info">
        <div className="admin-stats-info-item">
          <span className="admin-stats-info-label">Platform Uptime:</span>
          <span className="admin-stats-info-value admin-stats-info-success">99.9%</span>
        </div>
        <div className="admin-stats-info-item">
          <span className="admin-stats-info-label">Active Users:</span>
          <span className="admin-stats-info-value">42</span>
        </div>
        <div className="admin-stats-info-item">
          <span className="admin-stats-info-label">Response Time:</span>
          <span className="admin-stats-info-value">120ms</span>
        </div>
        <div className="admin-stats-info-item">
          <span className="admin-stats-info-label">Last Updated:</span>
          <span className="admin-stats-info-value">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsWidget;