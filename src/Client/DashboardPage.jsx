import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
import { useAuth } from '../Context/AuthContext';
import ClientWorkspaceCard from './ClientWorkspaceCard';
import './DashboardPage.css'


const DashboardPage = () => {


  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
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
    name: '',
    email: '',
    role: ''
  });
  const [proposalCount, setProposalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Add state for proposals loading
  const [proposalsLoading, setProposalsLoading] = useState(true);

  const isProfileComplete = () => {
  const profile = JSON.parse(localStorage.getItem('clientProfile'));
  return profile?.profileCompleted === true;
};

const guardedNavigate = (path) => {

  if (path.includes('profile')) {
    navigate('/client/profile');
    return;
  }
  
  if (!isProfileComplete()) {
    alert('Please complete your profile before accessing dashboard features.');
    navigate('/client/profile');
    return;
  }
  navigate(path);
};

  useEffect(() => {
    setRecentActivity([
      { type: 'proposal', message: 'New proposal from John Doe for "Website Redesign"', time: '2 hours ago', status: 'new' },
      { type: 'milestone', message: 'Milestone 1 completed for "E-commerce App"', time: '5 hours ago', status: 'completed' },
      { type: 'payment', message: 'Payment of $1,500 received', time: '1 day ago', status: 'success' },
      { type: 'message', message: 'New message from Sarah Wilson', time: '2 days ago', status: 'unread' }
    ]);
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use authUser from context if available
        if (authUser && authUser.name) {
          setUser({
            name: authUser.name,
            email: authUser.email || '',
            role: authUser.role || 'Client'
          });
          console.log('✅ Using auth context user:', authUser.name);
        } else {
          // Fallback: Try to fetch from API
          const token = localStorage.getItem('token');
          if (token) {
            const response = await axios.get('http://localhost:3000/api/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
              setUser({
                name: response.data.user.name,
                email: response.data.user.email,
                role: response.data.user.role
              });
              console.log('✅ Fetched user from API:', response.data.user.name);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching user data:', error);
        // Set default
        setUser({
          name: 'Client',
          email: '',
          role: 'Client'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  // Fetch proposal count
  useEffect(() => {
    const fetchProposalCount = async () => {
      setProposalsLoading(true);
      try {
        // Temporary mock data
        setProposalCount(5);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setProposalsLoading(false);
      }
    };
    if (token) {
      fetchProposalCount();
    }
  }, [token]);


  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/client/contracts`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setContracts(response.data.contracts || response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    };

    if (token) {
      fetchContracts();
    }
  }, [token]);

  const quickActions = [
    {
      icon: FaPlus,
      label: 'Create New Project',
      description: 'Post a new job and hire freelancers',
      action: () => guardedNavigate('/projects/new'),
      path: '/projects/new'
    },
    {
      icon: FaSearch,
      label: 'Browse Freelancers',
      description: 'Find skilled professionals',
      action: () => guardedNavigate('/find-work'), 
      path: '/find-work' 
    },
    {
      icon: FaRobot,
      label: 'View Proposals',
      description: proposalsLoading ? 'Loading proposals...' : `You have ${proposalCount} new proposals`,
      action: () => guardedNavigate('/proposals'),
      path: '/proposals'
    },
    {
      icon: FaFileContract,
      label: 'Review Contracts',
      description: 'Manage your active contracts',
      action: () =>guardedNavigate('/contracts'),
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
          onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

<nav className="sidebar-nav">

  <div className="nav-section">
    <h3>MAIN</h3>

    <button className="nav-item active" onClick={() => guardedNavigate("/dashboard")}>
      <FaHome />
      <span>Dashboard</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/project")}>
      <FaBriefcase />
      <span>Projects</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/client/workspace")}>
      <FaProjectDiagram />
      <span>Workspaces</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/contracts")}>
      <FaFileContract />
      <span>Contracts</span>
    </button>
  </div>

  <div className="nav-section">
    <h3>FINANCIAL</h3>

    <button className="nav-item" onClick={() => guardedNavigate("/payments")}>
      <FaCreditCard />
      <span>Payments</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/billing")}>
      <FaMoneyBillWave />
      <span>Billing & Invoices</span>
    </button>
  </div>

  <div className="nav-section">
    <h3>ANALYTICS</h3>

    <button className="nav-item" onClick={() => guardedNavigate("/analytics")}>
      <FaChartBar />
      <span>Analytics</span>
    </button>
  </div>

  <div className="nav-section">
    <h3>COMMUNICATION</h3>

    <button className="nav-item" onClick={() => guardedNavigate("/messages")}>
      <FaComments />
      <span>Messages</span>
      <span className="badge">3</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/notifications")}>
      <FaBell />
      <span>Notifications</span>
      <span className="badge">5</span>
    </button>
  </div>

  <div className="nav-section">
    <h3>TOOLS</h3>

    <button className="nav-item" onClick={() => guardedNavigate("/ai-assistant")}>
      <FaRobot />
      <span>AI Assistant</span>
    </button>

    <button className="nav-item" onClick={() => guardedNavigate("/support")}>
      <FaLifeRing />
      <span>Support</span>
    </button>
  </div>

  <div className="nav-section">
    <h3>ACCOUNT</h3>

    {/* ALWAYS ALLOWED */}
    {/* Change from navigate("/profile") to guardedNavigate("/client/profile") */}
<button className="nav-item" onClick={() => guardedNavigate("/client/profile")}>
  <FaUser />
  <span>Profile</span>
</button>

    <button className="nav-item" onClick={() => navigate("/settings")}>
      <FaCog />
      <span>Settings</span>
    </button>

    {/* LOGOUT */}
    <button
      className="nav-item logout"
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("client");
        localStorage.removeItem("freelancer");
        localStorage.removeItem("role");
        window.location.href = "/";
      }}
    >
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
            <div className="quick-actions-container">
              <div className="quick-actions-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="quick-action-item"
                    onClick={action.action}>
                    <div className="quick-action-icon">
                      <action.icon />
                    </div>
                    <div className="quick-action-content">
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
                  <h3>{proposalsLoading ? '...' : proposalCount}</h3>
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
          <section className="workspaces-section">
            <div className="section-header">
              <h2>Active Workspaces</h2>
              <Link to="/contracts" className="view-all-btn">
                View All Contracts
              </Link>
            </div>

            {workspaces.length > 0 ? (
              <div className="workspaces-grid">
                {workspaces.slice(0, 3).map(workspace => (
                  <ClientWorkspaceCard key={workspace._id} workspace={workspace} />
                ))}
              </div>
            ) : (
              <div className="no-workspaces">
                <FaProjectDiagram />
                <h3>No active workspaces</h3>
                <p>Start a new project or sign a contract to begin collaborating.</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/projects/new')}>
                  Create New Project
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;