import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FreelancerWorkspaceCard from './FreelancerWorkspaceCard'; 
import { API_URL } from '../config'
import {
  // Layout & Navigation
  FaHome, FaBriefcase, FaFileContract, FaCreditCard, FaChartBar,
  FaComments, FaLifeRing, FaCog, FaUser, FaBell, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaSearch,
  // Stats Icons
  FaMoneyBillWave, FaProjectDiagram, FaFileAlt, FaUsers,
  FaClock, FaCheckCircle, FaArrowUp, FaArrowDown, FaStar,
  // Action Icons
  FaPlus, FaEnvelope, FaCalendarAlt, FaDownload, FaWallet, FaPortrait,
  // Edit Profile Icon
  FaEdit,
  // Workspace Card Icons
  FaChevronRight, FaDollarSign
} from 'react-icons/fa';
import axios from 'axios';
import './FreelancerDashboard.css';

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    activeProjects: 0,
    freelancerScore: 75,
    rating: 4.5,
    totalEarnings: 0,
    successRate: 92,
    onTimeDelivery: 88,
    totalProposals: 0,
    activeProposals: 0,
    acceptedProposals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [recentWorkspace, setRecentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]); // ADDED
  
  // Get user data from localStorage
  const [user, setUser] = useState({
    name: localStorage.getItem('userName') || 'Freelancer Name',
    email: localStorage.getItem('userEmail') || 'freelancer@email.com',
    role: localStorage.getItem('userRole') || 'Freelancer'
  });

  // Check if profile exists
  const [hasProfile, setHasProfile] = useState(
    localStorage.getItem('freelancerProfile') !== null
  );

  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    thisMonth: 0
  });

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEarnings(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  // ===== ADDED: Fetch Workspaces Function =====
  const fetchFreelancerWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response= await axios.get(
     `${API_URL}/api/freelancer/workspaces`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
      
      if (response.data.success) {
        setWorkspaces(response.data.workspaces || []);
      }
    } catch (error) {
  console.error('Error fetching workspaces:', error);
  setWorkspaces([]); 
}
  };

  useEffect(() => {
    fetchFreelancerDashboard();
    checkProfileStatus();
    fetchFreelancerWorkspaces(); // ADDED
    // Check for newly created workspaces
   
// Replace the entire checkWorkspace function (lines 233-254) with:
const checkWorkspace = async () => {
  // Check localStorage for new workspaces from contract signing
  const workspaceId = localStorage.getItem('currentWorkspaceId');
  const lastRedirect = localStorage.getItem('lastWorkspaceRedirect');
  
  if (workspaceId && lastRedirect) {
    const timeSince = new Date() - new Date(lastRedirect);
    // If redirected less than 5 minutes ago, show notification
    if (timeSince < 5 * 60 * 1000) {
      setNotification({
        type: 'workspace',
        message: 'New workspace created!',
        workspaceId,
        show: true
      });
    }
  }
  
  // Clear these items after checking
  localStorage.removeItem('currentWorkspaceId');
  localStorage.removeItem('lastWorkspaceRedirect');
  
  // Don't make the API call that doesn't exist
  console.log('Workspace notification check complete');
};
    checkWorkspace();
  }, []); 

  // Check profile status
  const checkProfileStatus = () => {
    const profileExists = localStorage.getItem('freelancerProfile') !== null;
    setHasProfile(profileExists);
  };

  // Mock data functions
  const getMockDashboardData = () => ({
    monthlyEarnings: 3250,
    activeProjects: 3,
    freelancerScore: 85,
    rating: 4.7,
    totalEarnings: 18750,
    successRate: 95,
    onTimeDelivery: 92,
    totalProposals: 24,
    activeProposals: 5,
    acceptedProposals: 8
  });

  const getMockActivityData = () => [
    { type: 'proposal', message: 'Your proposal for "Website Redesign" was viewed', time: '2 hours ago', status: 'viewed' },
    { type: 'message', message: 'New message from Sarah Wilson about "E-commerce Project"', time: '5 hours ago', status: 'unread' },
    { type: 'payment', message: 'Payment of $1,200 received for "Mobile App Development"', time: '1 day ago', status: 'success' },
    { type: 'contract', message: 'New contract offer from Tech Solutions Inc.', time: '2 days ago', status: 'new' },
    { type: 'milestone', message: 'Milestone completed for "Dashboard Design" project', time: '3 days ago', status: 'completed' }
  ];

  const getMockRecommendedJobs = () => [
    {
      _id: '1',
      title: 'Full Stack Developer for E-commerce Platform',
      description: 'We need an experienced full stack developer to build a modern e-commerce platform with React, Node.js, and MongoDB. The project includes user authentication, payment integration, and admin dashboard.',
      budget: 3000,
      skillsRequired: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe'],
      clientId: { name: 'TechCorp Inc.', rating: 4.8 }
    },
    {
      _id: '2',
      title: 'UI/UX Designer for Mobile App',
      description: 'Looking for a talented UI/UX designer to create wireframes and prototypes for a fitness tracking mobile application. Must have experience with Figma and mobile design patterns.',
      budget: 2500,
      skillsRequired: ['Figma', 'UI/UX Design', 'Mobile Design', 'Wireframing', 'Prototyping'],
      clientId: { name: 'FitLife Studios', rating: 4.9 }
    },
    {
      _id: '3',
      title: 'React Native Developer',
      description: 'Seeking React Native developer to help build cross-platform mobile application. Experience with Redux, Firebase, and mobile deployment required.',
      budget: 4000,
      skillsRequired: ['React Native', 'Redux', 'Firebase', 'iOS', 'Android'],
      clientId: { name: 'StartUp Ventures', rating: 4.7 }
    }
  ];

  // Fetch freelancer dashboard data
  const fetchFreelancerDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
      `${API_URL}/api/freelancer/dashboard`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
        
        if (response.data.success) {
          setStats({
            monthlyEarnings: response.data.monthlyEarnings || 0,
            activeProjects: response.data.activeProjects || 0,
            freelancerScore: response.data.freelancerScore || 75,
            rating: response.data.rating || 4.5,
            totalEarnings: response.data.totalEarnings || 0,
            successRate: response.data.successRate || 85,
            onTimeDelivery: response.data.onTimeDelivery || 80,
            totalProposals: response.data.quickStats?.totalProposals || 0,
            activeProposals: response.data.quickStats?.activeProposals || 0,
            acceptedProposals: response.data.quickStats?.acceptedProposals || 0
          });
          
          // Update user data from backend if available
          if (response.data.user) {
            const userData = {
              name: response.data.user.name || user.name,
              email: response.data.user.email || user.email,
              role: response.data.user.role || user.role
            };
            setUser(userData);
            
            // Also update localStorage
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('userRole', userData.role);
          }
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Use mock data as fallback
        const mockData = getMockDashboardData();
        setStats(mockData);
      }
      
      // Set mock activity and jobs (you can add API calls here later)
      setRecentActivity(getMockActivityData());
      setRecommendedJobs(getMockRecommendedJobs());
      
    } catch (error) {
      console.error('Error fetching freelancer dashboard:', error);
      // Final fallback - use mock data
      setStats(getMockDashboardData());
      setRecentActivity(getMockActivityData());
      setRecommendedJobs(getMockRecommendedJobs());
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile navigation - create or edit based on profile existence
  const handleProfileNavigation = () => {
    if (hasProfile) {
      // Navigate to edit profile page with existing data
      const existingProfile = JSON.parse(localStorage.getItem('freelancerProfile') || '{}');
      navigate('/freelancer/profile/edit', { state: { existingProfile } });
    } else {
      // Navigate to create profile page
      navigate('/freelancer/profile/create');
    }
  };

  const quickActions = [
    { 
      icon: FaSearch, 
      label: 'Find Work', 
      description: 'Browse available projects and jobs', 
      action: () => navigate('/freelancer/jobs'),
      path: '/freelancer/jobs'
    },
    { 
      icon: FaWallet, 
      label: 'View Earnings', 
      description: `$${stats.totalEarnings} total earned`, 
      action: () => navigate('/freelancer/earnings'),
      path: '/freelancer/earnings'
    },
    { 
      icon: FaPortrait, 
      label: 'Update Portfolio', 
      description: 'Showcase your work and skills', 
      action: () => navigate('/freelancer/portfolio'),
      path: '/freelancer/portfolio'
    },
    { 
      icon: FaFileAlt, 
      label: 'My Applications', 
      description: `${stats.activeProposals} active proposals`, 
      action: () => navigate('/freelancer/proposals'),
      path: '/freelancer/proposals'
    }
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // ===== NOTIFICATION BANNER COMPONENT =====
  const NotificationBanner = () => {
    if (!notification || !notification.show) return null;
    
    return (
      <div className="notification-banner">
        <div className="notification-content">
          <FaBell className="notification-icon" />
          <div className="notification-message">
            <strong>{notification.message}</strong>
            <p>Workspace ID: {notification.workspaceId}</p>
          </div>
        </div>
        <div className="notification-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              navigate(`/workspace/${notification.workspaceId}`);
              setNotification(null);
              localStorage.removeItem('currentWorkspaceId');
              localStorage.removeItem('lastWorkspaceRedirect');
            }}
          >
            <FaProjectDiagram /> Open Workspace
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              setNotification(null);
              localStorage.removeItem('currentWorkspaceId');
              localStorage.removeItem('lastWorkspaceRedirect');
            }}
          >
            <FaTimes /> Dismiss
          </button>
        </div>
      </div>
    );
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
          <Link to="/freelancer/dashboard" className="nav-item active">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/freelancer/jobs" className="nav-item">
            <FaBriefcase />
            <span>Find Work</span>
          </Link>
          <Link to="/freelancer/workspace" className="nav-item"> 
            <FaProjectDiagram />
            <span>Workspaces</span>
          </Link>
          <Link to="/freelancer/proposals" className="nav-item">
            <FaFileAlt />
            <span>My Proposals</span>
          </Link>
          <Link to="/freelancer/contracts" className="nav-item">
            <FaFileContract />
            <span>Contracts</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>FINANCIAL</h3>
          <Link to="/freelancer/earnings" className="nav-item">
            <FaCreditCard />
            <span>Earnings</span>
          </Link>
          <Link to="/freelancer/invoices" className="nav-item">
            <FaMoneyBillWave />
            <span>Invoices</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>PORTFOLIO</h3>
          <Link to="/freelancer/portfolio" className="nav-item">
            <FaPortrait />
            <span>My Portfolio</span>
          </Link>
          <Link to="/freelancer/profile/:id" className="nav-item">
            <FaUser />
            <span>Public Profile</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>ANALYTICS</h3>
          <Link to="/freelancer/analytics" className="nav-item">
            <FaChartBar />
            <span>Analytics</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>COMMUNICATION</h3>
          <Link to="/freelancer/messages" className="nav-item">
            <FaComments />
            <span>Messages</span>
            <span className="badge">3</span>
          </Link>
          <Link to="/freelancer/notifications" className="nav-item">
            <FaBell />
            <span>Notifications</span>
            <span className="badge">5</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>TOOLS</h3>
          <Link to="/freelancer/ai-assistant" className="nav-item">
            <FaRobot />
            <span>AI Assistant</span>
          </Link>
          <Link to="/freelancer/support" className="nav-item">
            <FaLifeRing />
            <span>Support</span>
          </Link>
        </div>

        <div className="nav-section">
          <h3>ACCOUNT</h3>
          {hasProfile ? (
            <Link 
              to="/freelancer/profile/edit" 
              className="nav-item"
              onClick={() => {
                const existingProfile = JSON.parse(localStorage.getItem('freelancerProfile') || '{}');
                navigate('/freelancer/profile/edit', { state: { existingProfile } });
              }}
            >
              <FaEdit />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <Link to="/freelancer/profile/create" className="nav-item">
              <FaUser />
              <span>Create Profile</span>
            </Link>
          )}
          
          <Link to="/freelancer/settings" className="nav-item">
            <FaCog />
            <span>Settings</span>
          </Link>
          <button className="nav-item logout" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            localStorage.removeItem('freelancerProfile');
            navigate('/login');
          }}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );

  // ActivityItem component
  const ActivityItem = ({ activity }) => (
    <div className={`activity-item ${activity.status}`}>
      <div className="activity-icon">
        {activity.type === 'proposal' && <FaFileAlt />}
        {activity.type === 'milestone' && <FaCheckCircle />}
        {activity.type === 'payment' && <FaMoneyBillWave />}
        {activity.type === 'message' && <FaEnvelope />}
        {activity.type === 'contract' && <FaFileContract />}
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

  // Job Card Component
  const JobCard = ({ job }) => (
    <div className="job-card">
      <div className="job-header">
        <h4>{job.title}</h4>
        <span className="job-budget">${job.budget}</span>
      </div>
      <p className="job-description">
        {job.description?.length > 100 
          ? `${job.description.substring(0, 100)}...` 
          : job.description
        }
      </p>
      <div className="job-skills">
        {job.skillsRequired?.slice(0, 3).map((skill, index) => (
          <span key={index} className="skill-tag">{skill}</span>
        ))}
        {job.skillsRequired?.length > 3 && (
          <span className="skill-more">+{job.skillsRequired.length - 3} more</span>
        )}
      </div>
      <div className="job-footer">
        <div className="job-client">
          <span className="client-name">{job.clientId?.name || job.clientId?.profile?.name || 'Unknown Client'}</span>
          {job.clientId?.rating && (
            <span className="client-rating">
              <FaStar /> {job.clientId.rating}
            </span>
          )}
        </div>
        <button 
          className="apply-btn"
          onClick={() => navigate(`/freelancer/jobs/${job._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Freelancer Dashboard</h1>
            <p>Welcome back, {user.name}! Here's your work overview and opportunities.</p>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <FaSearch />
              <input type="text" placeholder="Search jobs, clients, messages..." />
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
        
        <NotificationBanner />
        
        <div className="dashboard-content">
          {/* Charts and Quick Actions */}
          <div className="charts-grid">
            {/* Charts Row */}
            <div className="charts-row">
              <CircularChart percentage={stats.successRate} label="Success Rate" color="circle-success" />
              <CircularChart percentage={stats.onTimeDelivery} label="On-Time Delivery" color="circle-projects" />
              <CircularChart percentage={stats.freelancerScore} label="Freelancer Score" color="circle-budget" />
              <CircularChart percentage={(stats.acceptedProposals / stats.totalProposals) * 100 || 0} label="Proposal Success" color="circle-pending" />
            </div>
            
            {/* Quick Actions Section */}
            <div className="quick-actions-container">
              <div className="quick-actions-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="quick-action-item"
                    onClick={action.action}>
                    <div className="quick-action-icon">
                      <action.icon />
                    </div>
                    <div className="quick-action-content">
                      <h4>{action.label}</h4>
                      <p>{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== ADDED: Workspaces Section ===== */}
          <section className="workspaces-section">
            <div className="section-header">
              <h2>Active Workspaces</h2>
              <Link to="/freelancer/workspace" className="view-all-btn">
                View All
              </Link>
            </div>
            
            {workspaces.length > 0 ? (
              <div className="workspaces-grid">
                {workspaces.slice(0, 3).map(workspace => (
                 <FreelancerWorkspaceCard key={workspace._id} workspace={workspace} />
                ))}
              </div>
            ) : (
              <div className="no-workspaces">
                <FaProjectDiagram />
                <h3>No active workspaces</h3>
                <p>Start working on a project or get hired to begin collaborating.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/freelancer/jobs')}>
                  Browse Jobs
                </button>
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="stats-section">
            <div className="section-header">
              <h2>Performance Overview</h2>
              <Link to="/freelancer/analytics" className="view-all-btn">
                View Detailed Analytics
              </Link>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>${stats.monthlyEarnings.toLocaleString()}</h3>
                  <p>Monthly Earnings</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>15% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaProjectDiagram />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.activeProjects}</h3>
                  <p>Active Projects</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>2 new projects</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaStar />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.rating}/5</h3>
                  <p>Average Rating</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>0.2 increase</span>
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
                  <h3>{stats.totalProposals}</h3>
                  <p>Total Proposals</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>5 this month</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaWallet />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>${stats.totalEarnings.toLocaleString()}</h3>
                  <p>Total Earnings</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>22% increase</span>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                </div>
                <div className="stat-content">
                  <h3>{stats.acceptedProposals}</h3>
                  <p>Accepted Proposals</p>
                  <div className="stat-trend positive">
                    <FaArrowUp />
                    <span>8% acceptance rate</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Jobs Section */}
          <section className="jobs-section">
            <div className="section-header">
              <h2>Recommended Jobs</h2>
              <Link to="/freelancer/jobs" className="view-all-btn">
                Browse All Jobs
              </Link>
            </div>
            <div className="jobs-grid">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job, index) => (
                  <JobCard key={job._id || index} job={job} />
                ))
              ) : (
                <div className="no-jobs">
                  <p>No recommended jobs found. Update your skills to get better matches.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity Section */}
          <section className="activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <Link to="/freelancer/notifications" className="view-all-btn">
                View All Activity
              </Link>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </section>

          {/* AI Assistant Section */}
          <section className="ai-section">
            <div className="ai-content">
              <div className="ai-icon">
                <FaRobot />
              </div>
              <div className="ai-text">
                <h3>Need help finding work?</h3>
                <p>Use our AI Assistant to optimize your profile, find perfect job matches, and improve your proposals.</p>
              </div>
              <button 
                className="ai-button"
                onClick={() => navigate('/freelancer/ai-assistant')}>
                Try AI Assistant
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;