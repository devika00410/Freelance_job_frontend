import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  // Layout & Navigation
  FaHome, FaBriefcase, FaFileContract, FaCreditCard, FaChartBar,
  FaComments, FaLifeRing, FaCog, FaUser, FaBell, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaSearch, FaChevronDown,
  // Stats Icons
  FaMoneyBillWave, FaProjectDiagram, FaFileAlt, FaUsers,
  FaClock, FaCheckCircle, FaArrowUp, FaArrowDown, FaStar,
  // Action Icons
  FaPlus, FaEnvelope, FaCalendarAlt, FaDownload,
  // Edit Profile Icon
  FaEdit,
  // Notification Icon
  FaRegBell
} from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import ClientWorkspaceCard from './ClientWorkspaceCard';
import './DashboardPage.css'

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats states
  const [stats, setStats] = useState({
    totalProjects: 24,
    activeProjects: 8,
    totalSpent: 45200,
    pendingProposals: 5,
    acceptanceRate: 78,
    activeContracts: 12
  });

  // User states
  const [user, setUser] = useState({
    name: localStorage.getItem('userName') || 'Client',
    email: localStorage.getItem('userEmail') || 'client@email.com',
    role: localStorage.getItem('userRole') || 'Client'
  });

  // Activity and notifications states
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [contracts, setContracts] = useState([]);
  
  // Proposal states
  const [proposalCount, setProposalCount] = useState(0);
  const [proposalsLoading, setProposalsLoading] = useState(true);

  // Real-time states
  const [realtimeStats, setRealtimeStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  // Refs for click outside handling
  const searchResultsRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Check if profile exists
  const [hasProfile, setHasProfile] = useState(
    localStorage.getItem('clientProfile') !== null
  );

  // Profile completion check
  const isProfileComplete = () => {
    const profile = JSON.parse(localStorage.getItem('clientProfile') || '{}');
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

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch user profile
      await fetchUserProfile(token);

      // Fetch all data in parallel
      const [
        statsResponse,
        freelancersResponse,
        activityResponse,
        workspacesResponse,
        notificationsResponse,
        realtimeStatsResponse,
        proposalsResponse,
        contractsResponse
      ] = await Promise.allSettled([
        axios.get('http://localhost:3000/api/client/dashboard-stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/recommended-freelancers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/recent-activities', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/workspaces', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/notifications/today', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/real-time-stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/client/proposals/count', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/client/contracts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        const statsData = statsResponse.value.data;
        setStats(prev => ({
          ...prev,
          totalProjects: statsData.totalProjects || prev.totalProjects,
          activeProjects: statsData.activeProjects || prev.activeProjects,
          totalSpent: statsData.totalSpent || prev.totalSpent,
          pendingProposals: statsData.pendingProposals || prev.pendingProposals,
          acceptanceRate: statsData.acceptanceRate || prev.acceptanceRate,
          activeContracts: statsData.activeContracts || prev.activeContracts
        }));
      }

      // Process real-time stats
      if (realtimeStatsResponse.status === 'fulfilled' && realtimeStatsResponse.value.data.success) {
        setRealtimeStats(realtimeStatsResponse.value.data);
      }

      // Process recommended freelancers
      if (freelancersResponse.status === 'fulfilled' && freelancersResponse.value.data.success) {
        setRecommendedFreelancers(freelancersResponse.value.data.freelancers || []);
      }

      // Process recent activities
      if (activityResponse.status === 'fulfilled' && activityResponse.value.data.success) {
        const activities = formatActivities(activityResponse.value.data.activities || []);
        setRecentActivity(activities.slice(0, 5)); // Show only 5 most recent
      }

      // Process workspaces
      if (workspacesResponse.status === 'fulfilled' && workspacesResponse.value.data.success) {
        setWorkspaces(workspacesResponse.value.data.workspaces || []);
      }

      // Process proposals count
      if (proposalsResponse.status === 'fulfilled' && proposalsResponse.value.data.success) {
        setProposalCount(proposalsResponse.value.data.count || 0);
        setProposalsLoading(false);
      }

      // Process contracts
      if (contractsResponse.status === 'fulfilled' && contractsResponse.value.data.success) {
        setContracts(contractsResponse.value.data.contracts || contractsResponse.value.data.data || []);
      }

      // Process notifications
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.data.success) {
        const todayNotifications = notificationsResponse.value.data.notifications || [];
        setNotifications(todayNotifications);
        setUnreadCount(todayNotifications.filter(n => !n.isRead).length);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/api/client/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const profile = response.data.profile;
        setUserProfile(profile);
        setHasProfile(true);
        localStorage.setItem('clientProfile', JSON.stringify(profile));

        // Update user name from profile
        if (profile.basicInfo?.fullName) {
          const updatedUser = {
            ...user,
            name: profile.basicInfo.fullName
          };
          setUser(updatedUser);
          localStorage.setItem('userName', profile.basicInfo.fullName);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Format activities
  const formatActivities = (activities) => {
    return activities.map(activity => {
      const timeAgo = getTimeAgo(activity.createdAt);
      let type = 'general';
      let icon = <FaBell />;

      switch (activity.type) {
        case 'proposal':
          type = 'proposal';
          icon = <FaFileAlt />;
          break;
        case 'contract':
          type = 'contract';
          icon = <FaFileContract />;
          break;
        case 'payment':
          type = 'payment';
          icon = <FaMoneyBillWave />;
          break;
        case 'message':
          type = 'message';
          icon = <FaEnvelope />;
          break;
        case 'workspace':
          type = 'workspace';
          icon = <FaProjectDiagram />;
          break;
        case 'milestone':
          type = 'milestone';
          icon = <FaCheckCircle />;
          break;
      }

      return {
        ...activity,
        time: timeAgo,
        type,
        icon,
        status: activity.isRead ? 'read' : 'unread'
      };
    });
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Handle real-time search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/client/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchQuery, limit: 5 }
      });

      if (response.data.success) {
        setSearchResults(response.data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults(null);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/client/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/client/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();

    // Poll for updates every 30 seconds
    const pollInterval = setInterval(() => {
      fetchTodayNotifications();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  // Fetch today's notifications
  const fetchTodayNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/client/notifications/today', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const todayNotifications = response.data.notifications || [];
        setNotifications(todayNotifications);
        setUnreadCount(todayNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Get user initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Profile navigation
  const handleProfileNavigation = () => {
    if (hasProfile) {
      const existingProfile = JSON.parse(localStorage.getItem('clientProfile') || '{}');
      navigate('/client/profile/edit', { state: { existingProfile } });
    } else {
      navigate('/client/profile/create');
    }
  };

  // Quick Actions
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
      action: () => guardedNavigate('/contracts'),
      path: '/contracts'
    }
  ];

  // ===== COMPONENTS =====

  // Notifications Dropdown Component
  const NotificationsDropdown = () => {
    const todayNotifications = notifications.slice(0, 3); // Show only 3 latest

    return (
      <div className="notifications-dropdown" ref={notificationsRef}>
        <div className="notifications-header">
          <h4>Today's Notifications</h4>
          {unreadCount > 0 && (
            <button
              className="mark-all-read"
              onClick={markAllNotificationsAsRead}
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="notifications-list">
          {todayNotifications.length > 0 ? (
            todayNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                onClick={() => markNotificationAsRead(notification._id)}
              >
                <div className={`notification-type-icon ${notification.type}`}>
                  {notification.type === 'proposal' && <FaFileAlt />}
                  {notification.type === 'message' && <FaEnvelope />}
                  {notification.type === 'payment' && <FaMoneyBillWave />}
                  {notification.type === 'contract' && <FaFileContract />}
                  {notification.type === 'workspace' && <FaProjectDiagram />}
                  {notification.type === 'milestone' && <FaCheckCircle />}
                  {!['proposal', 'message', 'payment', 'contract', 'workspace', 'milestone'].includes(notification.type) && <FaBell />}
                </div>
                <div className="notification-content">
                  <p className="notification-text">{notification.message}</p>
                  <span className="notification-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="notification-unread-dot"></div>
                )}
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <FaRegBell />
              <p>No new notifications today</p>
            </div>
          )}
        </div>

        <div className="notifications-footer">
          <Link
            to="/client/notifications"
            onClick={() => setShowNotifications(false)}
          >
            View all notifications
          </Link>
        </div>
      </div>
    );
  };

  // Search Results Component
  const SearchResultsDropdown = () => {
    if (!searchResults || !showSearchResults) return null;

    return (
      <div className="search-results" ref={searchResultsRef}>
        {searchResults.jobs && searchResults.jobs.length > 0 && (
          <div className="search-results-section">
            <h5>Projects ({searchResults.jobs.length})</h5>
            {searchResults.jobs.map((job) => (
              <div
                key={job._id}
                className="search-result-item"
                onClick={() => {
                  navigate(`/projects/${job._id}`);
                  setShowSearchResults(false);
                }}
              >
                <div className="search-result-icon">
                  <FaBriefcase />
                </div>
                <div className="search-result-content">
                  <h6>{job.title}</h6>
                  <p>{job.description?.substring(0, 60)}...</p>
                  <span className="search-result-meta">
                    ${job.budget} • {job.skillsRequired?.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.freelancers && searchResults.freelancers.length > 0 && (
          <div className="search-results-section">
            <h5>Freelancers ({searchResults.freelancers.length})</h5>
            {searchResults.freelancers.map((freelancer) => (
              <div
                key={freelancer._id}
                className="search-result-item"
                onClick={() => {
                  navigate(`/freelancer/${freelancer._id}`);
                  setShowSearchResults(false);
                }}
              >
                <div className="search-result-icon">
                  <FaUser />
                </div>
                <div className="search-result-content">
                  <h6>{freelancer.name || freelancer.profile?.name}</h6>
                  <p>{freelancer.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!searchResults.jobs || searchResults.jobs.length === 0) &&
          (!searchResults.freelancers || searchResults.freelancers.length === 0) && (
            <div className="no-search-results">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
      </div>
    );
  };

  // Profile Dropdown Component
  const ProfileDropdown = () => {
    const profileId = localStorage.getItem('profileId');

    return (
      <div className="profile-dropdown" ref={profileDropdownRef}>
        <div className="dropdown-header">
          <div className="dropdown-user-info">
            <div className="dropdown-avatar">
              {getInitials(user.name)}
            </div>
            <div>
              <h5>{user.name}</h5>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        <div className="dropdown-menu">
          <Link
            to={`/profile/${profileId}`}
            className="dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaUser /> Public Profile
          </Link>

          <Link
            to="/client/profile"
            className="dropdown-item"
            onClick={() => {
              setShowProfileDropdown(false);
              handleProfileNavigation();
            }}
          >
            <FaEdit /> {hasProfile ? 'Edit Profile' : 'Create Profile'}
          </Link>

          <Link
            to="/client/settings"
            className="dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaCog /> Settings
          </Link>

          <Link
            to="/client/analytics"
            className="dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaChartBar /> Analytics
          </Link>

          <div className="dropdown-divider"></div>

          <button
            className="dropdown-item logout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userName');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userRole');
              localStorage.removeItem('clientProfile');
              navigate('/login');
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => {
    const profileId = localStorage.getItem('profileId') || '';

    return (
      <div className={`side-navbar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-heading">
          <h2>WorkHub</h2>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-navigation">
          <div className="nav-category">
            <h3>MAIN</h3>

            <button className="nav-button current" onClick={() => guardedNavigate("/dashboard")}>
              <FaHome />
              <span>Dashboard</span>
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/project")}>
              <FaBriefcase />
              <span>Projects</span>
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/client/workspace")}>
              <FaProjectDiagram />
              <span>Workspaces</span>
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/contracts")}>
              <FaFileContract />
              <span>Contracts</span>
            </button>
          </div>

          <div className="nav-category">
            <h3>FINANCIAL</h3>

            <button className="nav-button" onClick={() => guardedNavigate("/payments")}>
              <FaCreditCard />
              <span>Payments</span>
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/billing")}>
              <FaMoneyBillWave />
              <span>Billing & Invoices</span>
            </button>
          </div>

          <div className="nav-category">
            <h3>ANALYTICS</h3>

            <button className="nav-button" onClick={() => guardedNavigate("/analytics")}>
              <FaChartBar />
              <span>Analytics</span>
            </button>
          </div>

          <div className="nav-category">
            <h3>COMMUNICATION</h3>

            <button className="nav-button" onClick={() => guardedNavigate("/messages")}>
              <FaComments />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="notification-indicator">{unreadCount}</span>
              )}
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/notifications")}>
              <FaBell />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notification-indicator">{unreadCount}</span>
              )}
            </button>
          </div>

          <div className="nav-category">
            <h3>TOOLS</h3>

            <button className="nav-button" onClick={() => guardedNavigate("/ai-assistant")}>
              <FaRobot />
              <span>AI Assistant</span>
            </button>

            <button className="nav-button" onClick={() => guardedNavigate("/support")}>
              <FaLifeRing />
              <span>Support</span>
            </button>
          </div>

          <div className="nav-category">
            <h3>ACCOUNT</h3>

            <button className="nav-button" onClick={() => guardedNavigate("/client/profile")}>
              <FaUser />
              <span>Profile</span>
            </button>

            <button className="nav-button" onClick={() => navigate("/settings")}>
              <FaCog />
              <span>Settings</span>
            </button>

            <button
              className="nav-button signout"
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
  };

  // Activity Item Component
  const ActivityItem = ({ activity }) => (
    <div className={`activity-list-item ${activity.status}-item`}>
      <div className="activity-icon-holder">
        {activity.icon}
      </div>
      <div className="activity-content-holder">
        <p>{activity.message}</p>
        <span className="activity-timestamp">{activity.time}</span>
      </div>
    </div>
  );

  // Circular Chart Component
  const CircularChart = ({ percentage, label, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="chart-display-card">
        <div className="chart-display-header">
          <h3>{label}</h3>
        </div>
        <div className="chart-display-holder">
          <div className="circular-chart-holder">
            <svg viewBox="0 0 120 120">
              <circle
                className="circle-background"
                cx="60"
                cy="60"
                r={radius}
              />
              <circle
                className={`progress-circle ${color}`}
                cx="60"
                cy="60"
                r={radius}
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <div className="chart-center-text">
              <span className="chart-percentage">{percentage}%</span>
              <span className="chart-title">{label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="main-dashboard-area">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="main-dashboard-area">
        <header className="top-dashboard-header">
          <div className="header-left-section">
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name}! Here's what's happening with your projects.</p>
          </div>
          <div className="header-right-section">
            {/* Search Bar */}
            <div className="search-container" ref={searchResultsRef}>
              <form className="search-form" onSubmit={handleSearch}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects, freelancers, messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults && setShowSearchResults(true)}
                />
              </form>
              <SearchResultsDropdown />
            </div>

            {/* Notifications */}
            <div className="notification-wrapper">
              <button
                className="notification-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </button>
              {showNotifications && <NotificationsDropdown />}
            </div>

            {/* Profile */}
            <div className="profile-wrapper">
              <button
                className="profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="user-avatar-img">
                  {getInitials(user.name)}
                </div>
                <div className="user-details">
                  <div className="user-display-name">{user.name}</div>
                  <div className="user-role-display">{user.role}</div>
                </div>
                <FaChevronDown className={`chevron-icon ${showProfileDropdown ? 'open' : ''}`} />
              </button>
              {showProfileDropdown && <ProfileDropdown />}
            </div>
          </div>
        </header>

        <div className="dashboard-content-wrapper">
          {/* Charts and Quick Actions in Single Column */}
          <div className="charts-layout">
            {/* Charts Row - 4 charts in one row */}
            <div className="charts-row-container">
              <CircularChart percentage={78} label="Acceptance Rate" color="progress-circle-success" />
              <CircularChart percentage={85} label="Project Completion" color="progress-circle-projects" />
              <CircularChart percentage={65} label="Budget Utilization" color="progress-circle-budget" />
              <CircularChart percentage={25} label="Pending Tasks" color="progress-circle-pending" />
            </div>

            {/* Quick Actions Section - Right below the charts */}
            <div className="quick-actions-panel">
              <div className="quick-actions-heading">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions-grid-layout">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="quick-action-tile"
                    onClick={action.action}>
                    <div className="quick-action-icon-holder">
                      <action.icon />
                    </div>
                    <div className="quick-action-details">
                      <h4>{action.label}</h4>
                      <p>{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <section className="stats-panel">
            <div className="panel-header">
              <h2>Project Overview</h2>
              <Link to="/analytics" className="view-all-link">
                View Detailed Analytics
              </Link>
            </div>
            <div className="stats-grid-layout">
              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaProjectDiagram />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>{stats.totalProjects}</h3>
                  <p>Total Projects</p>
                  <div className="stat-trend-indicator positive-trend">
                    <FaArrowUp />
                    <span>12% increase</span>
                  </div>
                </div>
              </div>

              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaBriefcase />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>{stats.activeProjects}</h3>
                  <p>Active Projects</p>
                  <div className="stat-trend-indicator positive-trend">
                    <FaArrowUp />
                    <span>9% increase</span>
                  </div>
                </div>
              </div>

              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>${stats.totalSpent.toLocaleString()}</h3>
                  <p>Total Spent</p>
                  <div className="stat-trend-indicator positive-trend">
                    <FaArrowUp />
                    <span>8% increase</span>
                  </div>
                </div>
              </div>

              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaFileAlt />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>{proposalsLoading ? '...' : proposalCount}</h3>
                  <p>Pending Proposals</p>
                  <div className="stat-trend-indicator negative-trend">
                    <FaArrowDown />
                    <span>2% decrease</span>
                  </div>
                </div>
              </div>

              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaCheckCircle />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>{stats.acceptanceRate}%</h3>
                  <p>Acceptance Rate</p>
                  <div className="stat-trend-indicator positive-trend">
                    <FaArrowUp />
                    <span>18% increase</span>
                  </div>
                </div>
              </div>

              <div className="stat-display-card">
                <div className="stat-card-header">
                  <div className="stat-icon-holder">
                    <FaFileContract />
                  </div>
                </div>
                <div className="stat-card-content">
                  <h3>{stats.activeContracts}</h3>
                  <p>Active Contracts</p>
                  <div className="stat-trend-indicator positive-trend">
                    <FaArrowUp />
                    <span>3% increase</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Section */}
          <section className="activity-panel">
            <div className="panel-header">
              <h2>Recent Activity</h2>
              <Link to="/notifications" className="view-all-link">
                View All Activity
              </Link>
            </div>
            <div className="activity-list-container">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                <div className="no-activities">
                  <FaRegBell />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Assistant Quick Access */}
          <section className="ai-assistant-section">
            <div className="ai-content-wrapper">
              <div className="ai-icon-large">
                <FaRobot />
              </div>
              <div className="ai-text-content">
                <h3>Need help with your project?</h3>
                <p>Use our AI Assistant to generate project requirements, create milestones, and get expert suggestions tailored to your needs.</p>
              </div>
              <button
                className="ai-action-button"
                onClick={() => navigate('/ai-assistant')}>
                Try AI Assistant
              </button>
            </div>
          </section>
          
          <section className="workspaces-display-panel">
            <div className="panel-header">
              <h2>Active Workspaces</h2>
              <Link to="/client/workspace" className="view-all-link">
                View All Workspaces
              </Link>
            </div>

            {workspaces.length > 0 ? (
              <div className="workspaces-grid-layout">
                {workspaces.slice(0, 3).map(workspace => (
                  <ClientWorkspaceCard key={workspace._id} workspace={workspace} />
                ))}
              </div>
            ) : (
              <div className="no-workspaces-state">
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