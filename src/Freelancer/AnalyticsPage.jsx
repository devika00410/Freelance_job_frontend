import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './AnalyticsPage.css';

import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaFileAlt,
  FaUsers,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaPercent,
  FaDatabase,
  FaCog,
  FaSync
} from 'react-icons/fa';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedProjects: 0,
    activeProjects: 0,
    proposalSuccessRate: 0,
    avgRating: 4.5,
    clientSatisfaction: 95
  });

  const periods = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartBar },
    { id: 'earnings', label: 'Earnings', icon: FaMoneyBillWave },
    { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
    { id: 'proposals', label: 'Proposals', icon: FaFileAlt },
    { id: 'clients', label: 'Clients', icon: FaUsers },
    { id: 'performance', label: 'Performance', icon: FaStar }
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch main analytics
      const analyticsResponse = await axios.get(`${API_URL}/api/freelancer/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period }
      });

      // Fetch dashboard stats for overview
      const statsResponse = await axios.get(`${API_URL}/api/freelancer/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.analytics);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Export data
  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `freelancer-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Calculate trends
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 100, direction: 'up' };
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      direction: percentage >= 0 ? 'up' : 'down'
    };
  };

  // Prepare earnings chart data
  const prepareEarningsChartData = () => {
    if (!analytics?.earningsOverTime) return [];
    
    return analytics.earningsOverTime.map(item => ({
      date: item._id,
      earnings: item.total
    }));
  };

  // Prepare project status data
  const prepareProjectStatusData = () => {
    if (!analytics?.projects) return [];
    
    return analytics.projects.map(item => ({
      name: item._id,
      value: item.count,
      budget: item.totalBudget
    }));
  };

  // Prepare proposal data
  const prepareProposalData = () => {
    if (!analytics?.proposals) return [];
    
    const totalProposals = analytics.proposals.reduce((sum, item) => sum + item.count, 0);
    
    return analytics.proposals.map(item => ({
      name: item._id,
      value: item.count,
      percentage: totalProposals > 0 ? Math.round((item.count / totalProposals) * 100) : 0
    }));
  };

  // Prepare workspace activity data
  const prepareWorkspaceData = () => {
    if (!analytics?.workspaces) return [];
    
    return analytics.workspaces.map(item => ({
      date: item._id,
      count: item.count
    }));
  };

  // Effect for initial load
  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading && !refreshing) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>
            <FaChartBar /> Analytics Dashboard
          </h1>
          <p className="header-subtitle">
            Track your performance and growth metrics in real-time
          </p>
        </div>
        <div className="header-right">
          <div className="header-controls">
            <div className="period-selector">
              <FaCalendarAlt />
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="period-select"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn-refresh"
              onClick={refreshData}
              disabled={refreshing}
            >
              <FaSync className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="btn-export"
              onClick={exportData}
              disabled={!analytics}
            >
              <FaDownload /> Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-content">
          {/* Key Metrics */}
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon earnings">
                  <FaMoneyBillWave />
                </div>
                <div className="metric-trend positive">
                  <FaArrowUp /> 15%
                </div>
              </div>
              <div className="metric-content">
                <h3>${stats.totalEarnings?.toLocaleString() || 0}</h3>
                <p>Total Earnings</p>
                <div className="metric-detail">
                  <span className="detail-label">This month:</span>
                  <span className="detail-value">${stats.monthlyEarnings?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon projects">
                  <FaProjectDiagram />
                </div>
                <div className="metric-trend positive">
                  <FaArrowUp /> 8%
                </div>
              </div>
              <div className="metric-content">
                <h3>{stats.completedProjects || 0}</h3>
                <p>Completed Projects</p>
                <div className="metric-detail">
                  <span className="detail-label">Active:</span>
                  <span className="detail-value">{stats.activeProjects || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon proposals">
                  <FaFileAlt />
                </div>
                <div className="metric-trend negative">
                  <FaArrowDown /> 2%
                </div>
              </div>
              <div className="metric-content">
                <h3>{stats.totalProposals || 0}</h3>
                <p>Total Proposals</p>
                <div className="metric-detail">
                  <span className="detail-label">Accepted:</span>
                  <span className="detail-value">{stats.acceptedProposals || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon rating">
                  <FaStar />
                </div>
                <div className="metric-trend positive">
                  <FaArrowUp /> 0.2
                </div>
              </div>
              <div className="metric-content">
                <h3>{stats.rating?.toFixed(1) || 4.5}/5</h3>
                <p>Average Rating</p>
                <div className="metric-detail">
                  <span className="detail-label">Success Rate:</span>
                  <span className="detail-value">{stats.successRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Earnings Chart */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Earnings Over Time</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <div className="legend-color earnings"></div>
                    Earnings
                  </span>
                </div>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareEarningsChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Earnings']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Status */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Project Status</h3>
                <div className="chart-legend">
                  {prepareProjectStatusData().map((item, index) => (
                    <span key={index} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareProjectStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareProjectStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} projects ($${props.payload.budget?.toLocaleString() || 0})`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Proposal Success Rate */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Proposal Success Rate</h3>
                <div className="chart-stats">
                  <span className="stat-item">
                    <FaPercent /> Success: {stats.proposalSuccessRate || 0}%
                  </span>
                </div>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareProposalData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} proposals (${props.payload.percentage}%)`,
                        name
                      ]}
                    />
                    <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Workspace Activity */}
            <div className="chart-container">
              <div className="chart-header">
                <h3>Workspace Activity</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <div className="legend-color workspace"></div>
                    Active Workspaces
                  </span>
                </div>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareWorkspaceData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#ff7300" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="performance-summary">
            <h3>Performance Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon">
                  <FaClock />
                </div>
                <div className="summary-content">
                  <h4>On-Time Delivery</h4>
                  <div className="summary-value">
                    <span className="value">{stats.onTimeDelivery || 0}%</span>
                    <span className="trend positive">
                      <FaArrowUp /> 5%
                    </span>
                  </div>
                  <p className="summary-description">
                    Projects delivered on or before deadline
                  </p>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">
                  <FaCheckCircle />
                </div>
                <div className="summary-content">
                  <h4>Client Satisfaction</h4>
                  <div className="summary-value">
                    <span className="value">{stats.clientSatisfaction || 95}%</span>
                    <span className="trend positive">
                      <FaArrowUp /> 3%
                    </span>
                  </div>
                  <p className="summary-description">
                    Positive client feedback and ratings
                  </p>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">
                  <FaDatabase />
                </div>
                <div className="summary-content">
                  <h4>Profile Strength</h4>
                  <div className="summary-value">
                    <span className="value">{stats.freelancerScore || 0}/100</span>
                    <span className="trend positive">
                      <FaArrowUp /> 10 points
                    </span>
                  </div>
                  <p className="summary-description">
                    Overall profile completion and quality
                  </p>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-icon">
                  <FaCog />
                </div>
                <div className="summary-content">
                  <h4>Active Engagements</h4>
                  <div className="summary-value">
                    <span className="value">{stats.activeProjects || 0}</span>
                    <span className="trend neutral">
                      No change
                    </span>
                  </div>
                  <p className="summary-description">
                    Currently active projects and workspaces
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="analytics-content">
          <h2>Earnings Analytics</h2>
          <p>Detailed breakdown of your earnings and revenue streams</p>
          {/* Add earnings-specific charts and data */}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="analytics-content">
          <h2>Project Analytics</h2>
          <p>Track your project performance and delivery metrics</p>
          {/* Add projects-specific charts and data */}
        </div>
      )}

      {/* Proposals Tab */}
      {activeTab === 'proposals' && (
        <div className="analytics-content">
          <h2>Proposal Analytics</h2>
          <p>Analyze your proposal success and conversion rates</p>
          {/* Add proposals-specific charts and data */}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="analytics-content">
          <h2>Client Analytics</h2>
          <p>Understand your client relationships and retention</p>
          {/* Add clients-specific charts and data */}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="analytics-content">
          <h2>Performance Analytics</h2>
          <p>Track your overall performance and improvement areas</p>
          {/* Add performance-specific charts and data */}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;