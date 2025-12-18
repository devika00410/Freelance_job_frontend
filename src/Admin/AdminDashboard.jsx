import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// React Icons (keeping same)
import {
  FaUsers, FaBriefcase, FaMoneyBillWave, FaChartBar,
  FaExclamationTriangle, FaCheckCircle, FaUserCheck,
  FaSignOutAlt, FaHome, FaExchangeAlt, FaFileAlt,
  FaBell, FaArrowUp, FaSyncAlt, FaCog, FaSearch,
  FaFilter, FaDownload, FaEye, FaEdit, FaTrash,
  FaPlus, FaCalendarAlt, FaCreditCard, FaShieldAlt,
  FaDatabase, FaServer, FaNetworkWired, FaLock
} from 'react-icons/fa';
import {
  MdDashboard, MdVerifiedUser, MdPayment, MdAnalytics,
  MdPerson, MdReceipt, MdReport, MdSettings,
  MdNotifications, MdHelp, MdMenu, MdClose,
  MdArrowDropDown, MdArrowRight, MdRefresh
} from 'react-icons/md';
import {
  HiOutlineUserGroup, HiOutlineCash, HiOutlineChartBar,
  HiOutlineDocumentReport, HiOutlineCog, HiOutlineBell
} from 'react-icons/hi';

// Import components
import VerificationCenter from './VerificationCenter';
import PaymentOverview from './PaymentOverview';
import AnalyticsCharts from './AnalyticsCharts';
import QuickActions from './QuickActions';
import AdminStatsWidget from './AdminStatsWidget';
import UserManagement from './UserManagement';
import TransactionMonitoring from './TransactionMonitoring';
import ReportManagement from './ReportManagement';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, subtitle, trend, color = 'primary' }) => (
  <div className={`admin-stat-card admin-stat-${color}`}>
    <div className="admin-stat-content">
      <div className="admin-stat-info">
        <h3 className="admin-stat-title">{title}</h3>
        <div className="admin-stat-value">{value}</div>
        {subtitle && <div className="admin-stat-subtitle">{subtitle}</div>}
        {trend && <div className={`admin-stat-trend ${trend.type}`}>{trend.value}</div>}
      </div>
      <div className="admin-stat-icon">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// Dashboard Overview Component
const DashboardOverviewComponent = ({ data }) => {
  if (!data) return null;

  const { stats, recentUsers, recentJobs } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      subtitle: `${stats.userStats?.find(u => u._id === 'client')?.count || 0} clients, ${stats.userStats?.find(u => u._id === 'freelancer')?.count || 0} freelancers`,
      color: 'primary',
      trend: { type: 'up', value: '+12%' }
    },
    {
      title: 'Active Jobs',
      value: stats.totalJobs,
      icon: FaBriefcase,
      subtitle: `${stats.jobStats?.find(j => j._id === 'active')?.count || 0} active, ${stats.jobStats?.find(j => j._id === 'pending')?.count || 0} pending`,
      color: 'success',
      trend: { type: 'up', value: '+8%' }
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: FaMoneyBillWave,
      subtitle: `${stats.totalTransactions} transactions`,
      color: 'warning',
      trend: { type: 'up', value: '+15%' }
    },
    {
      title: 'Active Projects',
      value: stats.totalWorkspaces,
      icon: FaChartBar,
      subtitle: `${stats.totalContracts} contracts`,
      color: 'info',
      trend: { type: 'stable', value: '↔️' }
    },
    {
      title: 'Pending Reports',
      value: stats.totalReports,
      icon: FaExclamationTriangle,
      subtitle: 'Require attention',
      color: 'danger',
      trend: { type: 'down', value: '-3%' }
    },
    {
      title: 'Platform Health',
      value: '99.9%',
      icon: FaCheckCircle,
      subtitle: 'Uptime status',
      color: 'teal',
      trend: { type: 'stable', value: '100%' }
    }
  ];

  return (
    <div className="admin-dashboard-overview">
      <div className="admin-stats-grid">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="admin-recent-activity">
        <div className="admin-activity-column">
          <div className="admin-column-header">
            <HiOutlineUserGroup className="admin-column-icon" />
            <h3>Recent Users</h3>
            <button className="admin-view-all">View All <MdArrowRight /></button>
          </div>
          <div className="admin-activity-list">
            {recentUsers?.map((user, index) => (
              <div key={index} className="admin-activity-item">
                <div className="admin-user-avatar">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </div>
                <div className="admin-activity-info">
                  <strong>{user.name || user.profile?.name || 'No Name'}</strong>
                  <span>{user.email}</span>
                </div>
                <span className={`admin-role-badge admin-role-${user.role}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-activity-column">
          <div className="admin-column-header">
            <FaBriefcase className="admin-column-icon" />
            <h3>Recent Jobs</h3>
            <button className="admin-view-all">View All <MdArrowRight /></button>
          </div>
          <div className="admin-activity-list">
            {recentJobs?.map((job, index) => (
              <div key={index} className="admin-activity-item">
                <div className="admin-job-icon">
                  <FaBriefcase />
                </div>
                <div className="admin-activity-info">
                  <strong>{job.title}</strong>
                  <span>${job.budget} • {job.clientId?.name || job.clientId?.companyName || 'Unknown'}</span>
                </div>
                <span className={`admin-status-badge admin-status-${job.status}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getAdminToken = () => {
  return localStorage.getItem('admin_token') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('token');
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getAdminToken();

      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.status}`);

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner">
          <div className="admin-spinner-circle"></div>
        </div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-screen">
        <div className="admin-error-content">
          <FaExclamationTriangle className="admin-error-icon" />
          <h3>Error loading dashboard</h3>
          <p>{error}</p>
          <div className="admin-error-actions">
            <button onClick={fetchDashboardData} className="admin-btn admin-btn-primary">
              <MdRefresh /> Retry
            </button>
            <button onClick={() => window.location.href = '/admin/login'} className="admin-btn admin-btn-secondary">
              <FaHome /> Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <FaShieldAlt />
            </div>
            <h2>AdminPanel</h2>
          </div>
          <button className="admin-close-sidebar" onClick={() => setSidebarOpen(false)}>
            <MdClose />
          </button>
        </div>

        <div className="admin-sidebar-user">
          <div className="admin-user-avatar-large">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="admin-user-info">
            <h4>{user?.name || 'Administrator'}</h4>
            <span className="admin-user-role">Super Admin</span>
            <span className="admin-user-email">{user?.email || 'admin@example.com'}</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <span className="admin-nav-label">MAIN</span>
            <button
              className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
            >
              <MdDashboard /> Dashboard
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
            >
              <MdAnalytics /> Analytics
            </button>
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">MANAGEMENT</span>
            <button
              className={`admin-nav-item ${activeTab === 'verification' ? 'active' : ''}`}
              onClick={() => { setActiveTab('verification'); setSidebarOpen(false); }}
            >
              <MdVerifiedUser /> Verification
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }}
            >
              <MdPayment /> Payments
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('subscriptions'); setSidebarOpen(false); }}
            >
              <FaMoneyBillWave /> Subscriptions
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
            >
              <MdPerson /> Users
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('transactions'); setSidebarOpen(false); }}
            >
              <MdReceipt /> Transactions
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
            >
              <MdReport /> Reports
            </button>
          </div>

          <div className="admin-nav-section">
            <span className="admin-nav-label">SYSTEM</span>
            <button className="admin-nav-item">
              <MdSettings /> Settings
            </button>
            <button className="admin-nav-item">
              <HiOutlineCog /> System Logs
            </button>
            <button className="admin-nav-item">
              <FaLock /> Security
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MdMenu />
            </button>
            <div className="admin-breadcrumb">
              <span>Admin Panel</span>
              <MdArrowRight />
              <span className="admin-current-page">
                {activeTab === 'overview' ? 'Dashboard' :
                  activeTab === 'verification' ? 'Verification Center' :
                    activeTab === 'payments' ? 'Payment Management' :
                      activeTab === 'analytics' ? 'Analytics' :
                        activeTab === 'users' ? 'User Management' :
                          activeTab === 'transactions' ? 'Transactions' :
                            activeTab === 'reports' ? 'Reports' : 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-search-box">
              <FaSearch className="admin-search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="admin-notification-btn">
              <HiOutlineBell />
              <span className="admin-notification-badge">3</span>
            </button>
            <button className="admin-quick-action-btn">
              <FaPlus /> New
            </button>
          </div>
        </header>

        {/* Stats Widget */}
        <div className="admin-stats-section">
          <AdminStatsWidget />
        </div>

        {/* Content Area */}
        <main className="admin-content">
          {activeTab === 'overview' && (
            <div className="admin-overview-container">
              <div className="admin-overview-main">
                <DashboardOverviewComponent data={dashboardData} />
              </div>
              <div className="admin-overview-sidebar">
                <QuickActions />
              </div>
            </div>
          )}
          {activeTab === 'verification' && <VerificationCenter />}
          {activeTab === 'payments' && <PaymentOverview />}
          {activeTab === 'analytics' && <AnalyticsCharts />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'transactions' && <TransactionMonitoring />}
          {activeTab === 'reports' && <ReportManagement />}
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <div className="admin-footer-content">
            <div className="admin-system-info">
              <span><FaServer /> Server: <span className="admin-status-online">Online</span></span>
              <span><FaNetworkWired /> Uptime: 99.9%</span>
              <span><FaDatabase /> Response: 120ms</span>
              <span><MdRefresh /> Updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="admin-footer-links">
              <span>© 2025 AdminPanel v2.0</span>
              <button onClick={() => window.location.reload()}>
                <FaSyncAlt /> Refresh
              </button>
              <button onClick={() => window.scrollTo(0, 0)}>
                <FaArrowUp /> Top
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;