import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './AnalyticsCharts.css';
import { 
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaBolt,
  // FaRefresh
} from 'react-icons/fa';
import { 
  MdShowChart,
  MdBarChart,
  MdPieChart,
  MdTrendingUp,
  MdTimeline
} from 'react-icons/md';

// Simple chart components
const AnalyticsLineChart = ({ data, title, color = '#14a800' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-chart-container">
        <h3>{title}</h3>
        <p className="analytics-no-data">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.revenue || d.value || 0));
  
  return (
    <div className="analytics-chart-container">
      <h3><FaChartLine /> {title}</h3>
      <div className="analytics-line-chart">
        {data.map((item, index) => {
          const height = maxValue > 0 ? ((item.revenue || item.value || 0) / maxValue) * 100 : 0;
          return (
            <div key={index} className="analytics-chart-bar-container">
              <div className="analytics-chart-bar" style={{ height: `${height}%`, backgroundColor: color }}>
                <div className="analytics-bar-value">${(item.revenue || item.value || 0).toLocaleString()}</div>
              </div>
              <div className="analytics-bar-label">{item.date || item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalyticsBarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-chart-container">
        <h3>{title}</h3>
        <p className="analytics-no-data">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count || d.value || 0));
  
  return (
    <div className="analytics-chart-container">
      <h3><FaChartBar /> {title}</h3>
      <div className="analytics-bar-chart">
        {data.map((item, index) => {
          const height = maxValue > 0 ? ((item.count || item.value || 0) / maxValue) * 100 : 0;
          return (
            <div key={index} className="analytics-chart-bar-container">
              <div className="analytics-chart-bar" style={{ height: `${height}%` }}>
                <div className="analytics-bar-value">{item.count || item.value || 0}</div>
              </div>
              <div className="analytics-bar-label">{item._id || item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalyticsPieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-chart-container">
        <h3>{title}</h3>
        <p className="analytics-no-data">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || item.value || 0), 0);
  
  return (
    <div className="analytics-chart-container">
      <h3><FaChartPie /> {title}</h3>
      <div className="analytics-pie-chart">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count || item.value || 0) / total) * 100 : 0;
          return (
            <div key={index} className="analytics-pie-item">
              <div className="analytics-pie-color" style={{ backgroundColor: getAnalyticsColor(index) }}></div>
              <div className="analytics-pie-label">{item._id || item.label}</div>
              <div className="analytics-pie-value">{Math.round(percentage)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getAnalyticsColor = (index) => {
  const colors = ['#14a800', '#5bbc2e', '#37b24d', '#51cf66', '#8b5cf6', '#06b6d4'];
  return colors[index % colors.length];
};

const AnalyticsCharts = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [jobData, setJobData] = useState(null);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');
  const { user } = useAuth();

  useEffect(() => {
    fetchAllCharts();
  }, [period]);

  const fetchAllCharts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      
      // Fetch all chart data in parallel
      const [revenueRes, usersRes, jobsRes, healthRes] = await Promise.all([
        fetch(`http://localhost:3000/api/admin/charts/revenue?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/api/admin/charts/users?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/admin/charts/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/admin/charts/health', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Check for auth errors
      if (revenueRes.status === 401 || usersRes.status === 401) {
        localStorage.clear();
        window.location.href = '/admin/login';
        return;
      }

      // Parse responses
      const revenue = await revenueRes.json();
      const users = await usersRes.json();
      const jobs = await jobsRes.json();
      const health = await healthRes.json();

      if (revenue.success) setRevenueData(revenue.data || []);
      if (users.success) setUserData(users.dailyData || []);
      if (jobs.success) setJobData(jobs.stats);
      if (health.success) setPlatformHealth(health.health);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching charts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenueData = () => {
    return revenueData.map(item => ({
      date: item.date.split('-').slice(1).join('-'), // Show only month-day
      revenue: item.revenue,
      value: item.revenue
    }));
  };

  const formatUserData = () => {
    if (!userData || userData.length === 0) return [];
    
    const last7Days = userData.slice(-7); // Get last 7 days
    return last7Days.map(item => ({
      label: item.day,
      clients: item.clients,
      freelancers: item.freelancers,
      value: item.total
    }));
  };

  if (loading) {
    return (
      <div className="analytics-charts-container">
        <div className="analytics-loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-charts-container">
        <div className="analytics-error-message">
          <h3>Error loading analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAllCharts} className="analytics-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-charts-container">
      <div className="analytics-header-section">
        <h2><MdTimeline /> Analytics Dashboard</h2>
        <div className="analytics-period-selector">
          <label>Time Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Platform Health Stats */}
      {platformHealth && (
        <div className="analytics-platform-health">
          <h3>Platform Health</h3>
          <div className="analytics-health-stats">
            <div className="analytics-health-card">
              <div className="analytics-health-icon">
                <FaUsers />
              </div>
              <div className="analytics-health-content">
                <div className="analytics-health-value">{platformHealth.activeUsers}</div>
                <div className="analytics-health-label">Active Users</div>
              </div>
            </div>
            <div className="analytics-health-card">
              <div className="analytics-health-icon">
                <FaUserPlus />
              </div>
              <div className="analytics-health-content">
                <div className="analytics-health-value">{platformHealth.newRegistrations?.last24h || 0}</div>
                <div className="analytics-health-label">New Registrations (24h)</div>
              </div>
            </div>
            <div className="analytics-health-card">
              <div className="analytics-health-icon">
                <FaCheckCircle />
              </div>
              <div className="analytics-health-content">
                <div className="analytics-health-value">{platformHealth.transactions?.successRate || 0}%</div>
                <div className="analytics-health-label">Transaction Success Rate</div>
              </div>
            </div>
            <div className="analytics-health-card">
              <div className="analytics-health-icon">
                <FaBolt />
              </div>
              <div className="analytics-health-content">
                <div className="analytics-health-value">{platformHealth.performance?.avgResponseTime || 0}ms</div>
                <div className="analytics-health-label">Avg Response Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        <div className="analytics-chart-wrapper analytics-large-chart">
          <AnalyticsLineChart 
            data={formatRevenueData()} 
            title="Revenue Trend" 
            color="#14a800"
          />
          {revenueData.length > 0 && (
            <div className="analytics-chart-summary">
              <div className="analytics-summary-item">
                <span className="analytics-summary-label">Total Revenue:</span>
                <span className="analytics-summary-value">
                  ${revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-summary-label">Avg Daily:</span>
                <span className="analytics-summary-value">
                  ${(revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length).toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="analytics-chart-wrapper">
          <AnalyticsBarChart 
            data={formatUserData()} 
            title="User Growth (Last 7 Days)"
          />
          {userData.length > 0 && (
            <div className="analytics-chart-summary">
              <div className="analytics-summary-item">
                <span className="analytics-summary-label">Total Users:</span>
                <span className="analytics-summary-value">
                  {userData.reduce((sum, item) => sum + item.total, 0)}
                </span>
              </div>
              <div className="analytics-summary-item">
                <span className="analytics-summary-label">Daily Avg:</span>
                <span className="analytics-summary-value">
                  {Math.round(userData.reduce((sum, item) => sum + item.total, 0) / userData.length)}
                </span>
              </div>
            </div>
          )}
        </div>

        {jobData?.statusDistribution && (
          <div className="analytics-chart-wrapper">
            <AnalyticsPieChart 
              data={jobData.statusDistribution.slice(0, 5)} 
              title="Job Status Distribution"
            />
          </div>
        )}

        {jobData?.categoryDistribution && (
          <div className="analytics-chart-wrapper">
            <AnalyticsBarChart 
              data={jobData.categoryDistribution.slice(0, 5)} 
              title="Top Categories"
            />
          </div>
        )}
      </div>

      {/* Job Statistics Summary */}
      {jobData && (
        <div className="analytics-job-summary">
          <h3>Job Statistics</h3>
          <div className="analytics-job-stats-grid">
            <div className="analytics-job-stat-item">
              <div className="analytics-job-stat-number">{jobData.totals?.total || 0}</div>
              <div className="analytics-job-stat-label">Total Jobs</div>
            </div>
            <div className="analytics-job-stat-item">
              <div className="analytics-job-stat-number">{jobData.totals?.completed || 0}</div>
              <div className="analytics-job-stat-label">Completed</div>
            </div>
            <div className="analytics-job-stat-item">
              <div className="analytics-job-stat-number">{jobData.totals?.active || 0}</div>
              <div className="analytics-job-stat-label">Active</div>
            </div>
            <div className="analytics-job-stat-item">
              <div className="analytics-job-stat-number">{jobData.successRate || 0}%</div>
              <div className="analytics-job-stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Data Refresh */}
      <div className="analytics-refresh-section">
        <button onClick={fetchAllCharts} className="analytics-refresh-btn">
          <FaRefresh /> Refresh Data
        </button>
        <div className="analytics-last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;