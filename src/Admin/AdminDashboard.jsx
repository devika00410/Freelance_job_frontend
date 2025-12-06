import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './AdminDashboard.css';

// StatCard component
const StatCard = ({ title, value, icon, subtitle, color = 'blue' }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-content">
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      <div className="stat-icon">
        {icon}
      </div>
    </div>
  </div>
);

// Dashboard Overview Component
const DashboardOverview = ({ data }) => {
  if (!data) return null;

  const { stats, recentUsers, recentJobs } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      subtitle: `${stats.userStats?.find(u => u._id === 'client')?.count || 0} clients, ${stats.userStats?.find(u => u._id === 'freelancer')?.count || 0} freelancers`,
      color: 'blue'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: '💼',
      subtitle: `${stats.jobStats?.find(j => j._id === 'active')?.count || 0} active`,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: '💰',
      subtitle: `${stats.totalTransactions} transactions`,
      color: 'purple'
    },
    {
      title: 'Active Projects',
      value: stats.totalWorkspaces,
      icon: '📊',
      subtitle: `${stats.totalContracts} contracts`,
      color: 'orange'
    },
    {
      title: 'Pending Reports',
      value: stats.totalReports,
      icon: '⚠️',
      subtitle: 'Need attention',
      color: 'red'
    },
    {
      title: 'Platform Health',
      value: '99.9%',
      icon: '✅',
      subtitle: 'Uptime',
      color: 'teal'
    }
  ];

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="recent-activity">
        <div className="activity-column">
          <h3>Recent Users</h3>
          <div className="activity-list">
            {recentUsers?.map((user, index) => (
              <div key={index} className="activity-item">
                <div className="activity-info">
                  <strong>{user.name || user.profile?.name}</strong>
                  <span>{user.email}</span>
                </div>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="activity-column">
          <h3>Recent Jobs</h3>
          <div className="activity-list">
            {recentJobs?.map((job, index) => (
              <div key={index} className="activity-item">
                <div className="activity-info">
                  <strong>{job.title}</strong>
                  <span>${job.budget} • {job.clientId?.name || job.clientId?.companyName}</span>
                </div>
                <span className={`status-badge status-${job.status}`}>
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

// UserManagement Component with Real Data
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`http://localhost:3000/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspensionReason: 'Admin action' })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tab-content">
      <h2>User Management</h2>
      
      <div className="filters">
        <select 
          value={filters.role} 
          onChange={(e) => setFilters({...filters, role: e.target.value})}
        >
          <option value="all">All Roles</option>
          <option value="client">Clients</option>
          <option value="freelancer">Freelancers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.profile?.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'suspended' ? 'suspended' : 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="action-btn suspend-btn"
                    onClick={() => handleSuspendUser(user._id)}
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Transaction Monitoring Component with Real Data
const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`http://localhost:3000/api/admin/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (transactionId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/transactions/${transactionId}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: 'Payment verified by admin' })
      });

      if (response.ok) {
        fetchTransactions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tab-content">
      <h2>Transaction Monitoring</h2>
      
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="transaction-id">{transaction._id?.slice(-8)}</td>
                <td>{transaction.fromUser?.name || 'N/A'}</td>
                <td>{transaction.toUser?.name || 'N/A'}</td>
                <td className="amount">${transaction.amount}</td>
                <td>
                  <span className={`type-badge type-${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${transaction.status}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="action-btn verify-btn"
                    onClick={() => handleVerifyPayment(transaction._id)}
                  >
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Analytics Overview Component with Real Data
const AnalyticsOverview = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/dashboard/analytics?period=30d', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tab-content">
      <h2>Analytics Overview</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>User Registrations (Last 30 Days)</h3>
          <div className="analytics-data">
            {analyticsData?.userRegistrations?.length ? (
              <ul>
                {analyticsData.userRegistrations.slice(0, 10).map((item, index) => (
                  <li key={index}>
                    <span>{item._id.date}: </span>
                    <strong>{item.count} users</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No registration data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Service Categories</h3>
          <div className="analytics-data">
            {analyticsData?.serviceAnalytics?.length ? (
              <ul>
                {analyticsData.serviceAnalytics.map((item, index) => (
                  <li key={index}>
                    <span>{item._id}: </span>
                    <strong>{item.totalJobs} jobs</strong>
                    <span> (${item.totalBudget})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No service data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Revenue Analytics</h3>
          <div className="analytics-data">
            {analyticsData?.paymentAnalytics?.length ? (
              <div>
                <p>Total Transactions: {analyticsData.paymentAnalytics.reduce((sum, item) => sum + item.count, 0)}</p>
                <p>Total Revenue: ${analyticsData.paymentAnalytics.reduce((sum, item) => sum + item.totalAmount, 0)}</p>
              </div>
            ) : (
              <p>No revenue data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Management Component with Real Data
const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/reports?status=open', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data.reports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resolution: 'Resolved by admin',
          resolutionNotes: 'Issue has been addressed'
        })
      });

      if (response.ok) {
        fetchReports(); // Refresh the list
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tab-content">
      <h2>Report Management</h2>
      
      <div className="reports-list">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div key={report._id} className="report-item">
              <div className="report-header">
                <h3>{report.title}</h3>
                <span className={`priority-badge priority-${report.priority}`}>
                  {report.priority}
                </span>
              </div>
              <p className="report-description">{report.description}</p>
              <div className="report-details">
                <span>Category: {report.category}</span>
                <span>Reporter: {report.reporterId?.name || 'Unknown'}</span>
                <span>Reported: {report.reportedUserId?.name || 'Unknown'}</span>
              </div>
              <button 
                className="action-btn resolve-btn"
                onClick={() => handleResolveReport(report._id)}
              >
                Resolve
              </button>
            </div>
          ))
        ) : (
          <p>No pending reports</p>
        )}
      </div>
    </div>
  );
};

// Main AdminDashboard component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h3>Error loading dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            <span>Welcome, {user?.name || 'Admin'}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'overview' && <DashboardOverview data={dashboardData} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'transactions' && <TransactionMonitoring />}
        {activeTab === 'analytics' && <AnalyticsOverview />}
        {activeTab === 'reports' && <ReportManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;