// DashboardPage.jsx - Updated Quick Actions section
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  // Layout & Navigation
  FaHome, FaBriefcase, FaFileContract, FaCreditCard, FaChartBar,
  FaComments, FaLifeRing, FaCog, FaUser, FaBell, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaSearch,
  // Stats Icons
  FaMoneyBillWave, FaProjectDiagram, FaFileAlt, FaUsers,
  FaClock, FaCheckCircle, FaArrowUp, FaArrowDown,
  // Action Icons
  FaPlus, FaEnvelope, FaCalendarAlt, FaDownload
} from 'react-icons/fa';
import './DashboardPage.css'

const DashboardPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 24,
    activeProjects: 8,
    totalSpent: 45200,
    pendingProposals: 5,
    acceptanceRate: 78,
    activeContracts: 12
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Client'
  });

  useEffect(() => {
    setRecentActivity([
      { type: 'proposal', message: 'New proposal from John Doe for "Website Redesign"', time: '2 hours ago', status: 'new' },
      { type: 'milestone', message: 'Milestone 1 completed for "E-commerce App"', time: '5 hours ago', status: 'completed' },
      { type: 'payment', message: 'Payment of $1,500 received', time: '1 day ago', status: 'success' },
      { type: 'message', message: 'New message from Sarah Wilson', time: '2 days ago', status: 'unread' }
    ]);
  }, []);

  const quickActions = [
    { 
      icon: FaPlus, 
      label: 'Create New Project', 
      description: 'Post a new job and hire freelancers', 
      action: () => navigate('/projects/new'),
      path: '/projects/new'
    },
    { 
      icon: FaSearch, 
      label: 'Browse Freelancers', 
      description: 'Find skilled professionals', 
      action: () => navigate('/freelancers'),
      path: '/freelancers'
    },
    { 
      icon: FaRobot, 
      label: 'AI Project Assistant', 
      description: 'Get help planning your project', 
      action: () => navigate('/ai-assistant'),
      path: '/ai-assistant'
    },
    { 
      icon: FaFileContract, 
      label: 'Review Contracts', 
      description: 'Manage your active contracts', 
      action: () => navigate('/contracts'),
      path: '/contracts'
    }
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const Sidebar = () => (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>WorkHub</h2>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>MAIN</h3>
          <Link to="/dashboard" className="nav-item active">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/project" className="nav-item">
            <FaBriefcase />
            <span>Projects</span>
          </Link>
          <Link to="/workspace" className="nav-item">
            <FaProjectDiagram />
            <span>Workspace</span>
          </Link>
          <Link to="/contracts" className="nav-item">
            <FaFileContract />
            <span>Contracts</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>FINANCIAL</h3>
          <Link to="/payments" className="nav-item">
            <FaCreditCard />
            <span>Payments</span>
          </Link>
          <Link to="/billing" className="nav-item">
            <FaMoneyBillWave />
            <span>Billing & Invoices</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>ANALYTICS</h3>
          <Link to="/analytics" className="nav-item">
            <FaChartBar />
            <span>Analytics</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>COMMUNICATION</h3>
          <Link to="/messages" className="nav-item">
            <FaComments />
            <span>Messages</span>
            <span className="badge">3</span>
          </Link>
          <Link to="/notifications" className="nav-item">
            <FaBell />
            <span>Notifications</span>
            <span className="badge">5</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>TOOLS</h3>
          <Link to="/ai-assistant" className="nav-item">
            <FaRobot />
            <span>AI Assistant</span>
          </Link>
          <Link to="/support" className="nav-item">
            <FaLifeRing />
            <span>Support</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>ACCOUNT</h3>
          <Link to="/profile" className="nav-item">
            <FaUser />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <FaCog />
            <span>Settings</span>
          </Link>
          <button className="nav-item logout" onClick={() => {/* handle logout */}}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className={`activity-item ${activity.status}`}>
      <div className="activity-icon">
        {activity.type === 'proposal' && <FaFileAlt />}
        {activity.type === 'milestone' && <FaCheckCircle />}
        {activity.type === 'payment' && <FaMoneyBillWave />}
        {activity.type === 'message' && <FaEnvelope />}
      </div>
      <div className="activity-content">
        <p>{activity.message}</p>
        <span className="activity-time">{activity.time}</span>
      </div>
    </div>
  );

  // Circular Chart Component
  const CircularChart = ({ percentage, label, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3>{label}</h3>
        </div>
        <div className="chart-container">
          <div className="circular-chart">
            <svg viewBox="0 0 120 120">
              <circle
                className="circle-bg"
                cx="60"
                cy="60"
                r={radius}
              />
              <circle
                className={`circle ${color}`}
                cx="60"
                cy="60"
                r={radius}
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <div className="chart-text">
              <span className="chart-value">{percentage}%</span>
              <span className="chart-label">{label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening with your projects.</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FaSearch />
              <input type="text" placeholder="Search projects, messages, contracts..." />
            </div>
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">5</span>
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

       
<div className="dashboard-content">
  {/* Charts and Quick Actions in Single Column */}
  <div className="charts-grid">
    {/* Charts Row - 4 charts in one row */}
    <div className="charts-row">
      <CircularChart percentage={78} label="Acceptance Rate" color="circle-success" />
      <CircularChart percentage={85} label="Project Completion" color="circle-projects" />
      <CircularChart percentage={65} label="Budget Utilization" color="circle-budget" />
      <CircularChart percentage={25} label="Pending Tasks" color="circle-pending" />
    </div>
    
    {/* Quick Actions Section - Right below the charts */}
    <div className="quick-actions-section">
  <div className="section-header">
    <h3>Quick Actions</h3>
  </div>
  <div className="action-buttons">
    {quickActions.map((action, index) => (
      <Link
        key={index}
        to={action.path}
        className="action-button"
        onClick={action.action}>
        <div className="action-icon">
          <action.icon />
        </div>
        <div className="action-text">
          <h4>{action.label}</h4>
          <p>{action.description}</p>
        </div>
      </Link>
    ))}
  </div>
</div>
</div>

  
          {/* Stats Section */}
          <section className="stats-section">
            <div className="section-header">
              <h2>Project Overview</h2>
              <Link to="/analytics" className="view-all-btn">
                View Detailed Analytics
              </Link>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaProjectDiagram />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalProjects}</h3>
                  <p>Total Projects</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>12% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaBriefcase />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.activeProjects}</h3>
                  <p>Active Projects</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>9% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>${stats.totalSpent.toLocaleString()}</h3>
                  <p>Total Spent</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>8% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaFileAlt />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.pendingProposals}</h3>
                  <p>Pending Proposals</p>
                  <div className="stat-trend negative">
                    <FaArrowDown />
                    <span>2% decrease</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaCheckCircle />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.acceptanceRate}%</h3>
                  <p>Acceptance Rate</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>18% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaFileContract />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.activeContracts}</h3>
                  <p>Active Contracts</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>3% increase</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Section */}
          <section className="activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <Link to="/notifications" className="view-all-btn">
                View All Activity
              </Link>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </section>

          {/* AI Assistant Quick Access */}
          <section className="ai-section">
            <div className="ai-content">
              <div className="ai-icon">
                <FaRobot />
              </div>
              <div className="ai-text">
                <h3>Need help with your project?</h3>
                <p>Use our AI Assistant to generate project requirements, create milestones, and get expert suggestions tailored to your needs.</p>
              </div>
              <button 
                className="ai-button"
                onClick={() => navigate('/ai-assistant')}>
                Try AI Assistant
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;