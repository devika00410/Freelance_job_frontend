import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FreelancerWorkspaceCard from './FreelancerWorkspaceCard';
import { API_URL } from '../config';
import axios from 'axios';
import {
  // Layout & Navigation
  FaHome, FaBriefcase, FaFileContract, FaCreditCard, FaChartBar,
  FaComments, FaLifeRing, FaCog, FaUser, FaBell, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaSearch, FaChevronDown, FaChevronRight,
  // Stats Icons
  FaMoneyBillWave, FaProjectDiagram, FaFileAlt, FaUsers,
  FaClock, FaCheckCircle, FaArrowUp, FaArrowDown, FaStar,
  // Action Icons
  FaPlus, FaEnvelope, FaCalendarAlt, FaDownload, FaWallet, FaPortrait,
  // Edit Profile Icon
  FaEdit,
  // Notification Icon
  FaRegBell
} from 'react-icons/fa';
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
  const [workspaces, setWorkspaces] = useState([]);

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

  const searchResultsRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Get user data from localStorage
  const [user, setUser] = useState({
    name: localStorage.getItem('userName') || 'Freelancer',
    email: localStorage.getItem('userEmail') || 'freelancer@email.com',
    role: localStorage.getItem('userRole') || 'Freelancer'
  });

  // Check if profile exists
  const [hasProfile, setHasProfile] = useState(
    localStorage.getItem('freelancerProfile') !== null
  );

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch user profile for job matching
      await fetchUserProfile(token);

      // Fetch all data in parallel
      const [
        statsResponse,
        jobsResponse,
        activityResponse,
        workspacesResponse,
        notificationsResponse,
        realtimeStatsResponse
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/api/freelancer/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/freelancer/recommended-jobs`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/freelancer/recent-activities`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/freelancer/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/freelancer/notifications/today`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/freelancer/real-time-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        const statsData = statsResponse.value.data;
        setStats({
          monthlyEarnings: statsData.monthlyEarnings || 0,
          activeProjects: statsData.activeProjects || 0,
          freelancerScore: statsData.profileScore || 75,
          rating: statsData.averageRating || 4.5,
          totalEarnings: statsData.totalEarnings || 0,
          successRate: statsData.successRate || 92,
          onTimeDelivery: statsData.onTimeDeliveryRate || 88,
          totalProposals: statsData.totalProposals || 0,
          activeProposals: statsData.activeProposals || 0,
          acceptedProposals: statsData.acceptedProposals || 0
        });
      }

      // Process real-time stats
      if (realtimeStatsResponse.status === 'fulfilled' && realtimeStatsResponse.value.data.success) {
        setRealtimeStats(realtimeStatsResponse.value.data);
      }

      // Process recommended jobs
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.data.success) {
        const jobs = jobsResponse.value.data.jobs || [];
        // Match jobs with freelancer profile
        const matchedJobs = userProfile ?
          matchJobsWithProfile(jobs, userProfile) :
          jobs;
        setRecommendedJobs(matchedJobs);
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

  // Fetch user profile for job matching
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/freelancer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const profile = response.data.profile;
        setUserProfile(profile);
        setHasProfile(true);
        localStorage.setItem('freelancerProfile', JSON.stringify(profile));

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

  // Match jobs with freelancer profile
  const matchJobsWithProfile = (jobs, profile) => {
    if (!profile || !jobs.length) return jobs;

    const primaryService = profile.professionalService?.primaryService;
    const skills = profile.skillsTools?.skills || [];
    const experienceLevel = profile.skillsTools?.experienceLevel || 'Intermediate';

    return jobs.map(job => {
      let matchScore = 0;

      // Match by service category (40%)
      if (job.serviceCategory === primaryService) {
        matchScore += 40;
      }

      // Match by skills (40%)
      if (job.skillsRequired && skills.length) {
        const matchingSkills = job.skillsRequired.filter(skill =>
          skills.includes(skill)
        );
        const skillMatch = (matchingSkills.length / job.skillsRequired.length) * 40;
        matchScore += skillMatch;
      }

      // Match by experience level (20%)
      if (job.experienceLevel === experienceLevel) {
        matchScore += 20;
      }

      return {
        ...job,
        matchScore: Math.min(Math.round(matchScore), 100)
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score
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
      const response = await axios.get(`${API_URL}/api/freelancer/search`, {
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
      await axios.put(`${API_URL}/api/freelancer/notifications/${notificationId}/read`, {}, {
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
      await axios.put(`${API_URL}/api/freelancer/notifications/mark-all-read`, {}, {
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
      const response = await axios.get(`${API_URL}/api/freelancer/notifications/today`, {
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

  // Check for workspace notifications
  useEffect(() => {
    const workspaceId = localStorage.getItem('currentWorkspaceId');
    const lastRedirect = localStorage.getItem('lastWorkspaceRedirect');

    if (workspaceId && lastRedirect) {
      const timeSince = new Date() - new Date(lastRedirect);
      if (timeSince < 5 * 60 * 1000) {
        setNotification({
          type: 'workspace',
          message: 'New workspace created!',
          workspaceId,
          show: true
        });
      }
    }

    localStorage.removeItem('currentWorkspaceId');
    localStorage.removeItem('lastWorkspaceRedirect');
  }, []);

  // Profile navigation
  const handleProfileNavigation = () => {
    if (hasProfile) {
      const existingProfile = JSON.parse(localStorage.getItem('freelancerProfile') || '{}');
      navigate('/freelancer/profile/edit', { state: { existingProfile } });
    } else {
      navigate('/freelancer/profile/create');
    }
  };

  // Get user initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Quick Actions
  const quickActions = [
    {
      icon: FaSearch,
      label: 'Find Work',
      description: `${recommendedJobs.length} matching jobs`,
      action: () => navigate('/freelancer/jobs')
    },
    {
      icon: FaWallet,
      label: 'View Earnings',
      description: `$${stats.totalEarnings.toLocaleString()} earned`,
      action: () => navigate('/freelancer/earnings')
    },
    {
      icon: FaPortrait,
      label: 'Update Portfolio',
      description: 'Showcase your work',
      action: () => navigate('/freelancer/portfolio')
    },
    {
      icon: FaFileAlt,
      label: 'My Applications',
      description: `${stats.activeProposals} active proposals`,
      action: () => navigate('/freelancer/proposals')
    }
  ];

  // ===== COMPONENTS =====

  // Notification Banner Component
  const NotificationBanner = () => {
    if (!notification || !notification.show) return null;

    return (
      <div className="freelancer-notification-banner">
        <div className="freelancer-notification-content">
          <FaBell className="freelancer-notification-icon" />
          <div className="freelancer-notification-message">
            <strong>{notification.message}</strong>
            <p>Workspace ID: {notification.workspaceId}</p>
          </div>
        </div>
        <div className="freelancer-notification-actions">
          <button
            className="freelancer-btn-primary"
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
            className="freelancer-btn-secondary"
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

  // Notifications Dropdown Component
  const NotificationsDropdown = () => {
    const todayNotifications = notifications.slice(0, 3); // Show only 3 latest

    return (
      <div className="freelancer-notifications-dropdown" ref={notificationsRef}>
        <div className="freelancer-notifications-header">
          <h4>Today's Notifications</h4>
          {unreadCount > 0 && (
            <button
              className="freelancer-mark-all-read"
              onClick={markAllNotificationsAsRead}
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="freelancer-notifications-list">
          {todayNotifications.length > 0 ? (
            todayNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`freelancer-notification-item ${notification.isRead ? 'read' : 'unread'}`}
                onClick={() => markNotificationAsRead(notification._id)}
              >
                <div className={`freelancer-notification-type-icon ${notification.type}`}>
                  {notification.type === 'proposal' && <FaFileAlt />}
                  {notification.type === 'message' && <FaEnvelope />}
                  {notification.type === 'payment' && <FaMoneyBillWave />}
                  {notification.type === 'contract' && <FaFileContract />}
                  {notification.type === 'workspace' && <FaProjectDiagram />}
                  {notification.type === 'milestone' && <FaCheckCircle />}
                  {!['proposal', 'message', 'payment', 'contract', 'workspace', 'milestone'].includes(notification.type) && <FaBell />}
                </div>
                <div className="freelancer-notification-content">
                  <p className="freelancer-notification-text">{notification.message}</p>
                  <span className="freelancer-notification-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                </div>
                {!notification.isRead && (
                  <div className="freelancer-notification-unread-dot"></div>
                )}
              </div>
            ))
          ) : (
            <div className="freelancer-no-notifications">
              <FaRegBell />
              <p>No new notifications today</p>
            </div>
          )}
        </div>

        <div className="freelancer-notifications-footer">
          <Link
            to="/freelancer/notifications"
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
      <div className="freelancer-search-results" ref={searchResultsRef}>
        {searchResults.jobs && searchResults.jobs.length > 0 && (
          <div className="freelancer-search-results-section">
            <h5>Jobs ({searchResults.jobs.length})</h5>
            {searchResults.jobs.map((job) => (
              <div
                key={job._id}
                className="freelancer-search-result-item"
                onClick={() => {
                  navigate(`/freelancer/jobs/${job._id}`);
                  setShowSearchResults(false);
                }}
              >
                <div className="freelancer-search-result-icon">
                  <FaBriefcase />
                </div>
                <div className="freelancer-search-result-content">
                  <h6>{job.title}</h6>
                  <p>{job.description?.substring(0, 60)}...</p>
                  <span className="freelancer-search-result-meta">
                    ${job.budget} • {job.skillsRequired?.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.clients && searchResults.clients.length > 0 && (
          <div className="freelancer-search-results-section">
            <h5>Clients ({searchResults.clients.length})</h5>
            {searchResults.clients.map((client) => (
              <div
                key={client._id}
                className="freelancer-search-result-item"
                onClick={() => {
                  navigate(`/client/${client._id}`);
                  setShowSearchResults(false);
                }}
              >
                <div className="freelancer-search-result-icon">
                  <FaUser />
                </div>
                <div className="freelancer-search-result-content">
                  <h6>{client.name}</h6>
                  <p>{client.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!searchResults.jobs || searchResults.jobs.length === 0) &&
          (!searchResults.clients || searchResults.clients.length === 0) && (
            <div className="freelancer-no-search-results">
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
      <div className="freelancer-profile-dropdown" ref={profileDropdownRef}>
        <div className="freelancer-dropdown-header">
          <div className="freelancer-dropdown-user-info">
            <div className="freelancer-dropdown-avatar">
              {getInitials(user.name)}
            </div>
            <div>
              <h5>{user.name}</h5>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        <div className="freelancer-dropdown-menu">
          <Link
            to={`/profile/${profileId}`}
            className="freelancer-dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaUser /> Public Profile
          </Link>

          <Link
            to="/freelancer/profile"
            className="freelancer-dropdown-item"
            onClick={() => {
              setShowProfileDropdown(false);
              handleProfileNavigation();
            }}
          >
            <FaEdit /> {hasProfile ? 'Edit Profile' : 'Create Profile'}
          </Link>

          <Link
            to="/freelancer/settings"
            className="freelancer-dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaCog /> Settings
          </Link>

          <Link
            to="/freelancer/analytics"
            className="freelancer-dropdown-item"
            onClick={() => setShowProfileDropdown(false)}
          >
            <FaChartBar /> Analytics
          </Link>

          <div className="freelancer-dropdown-divider"></div>

          <button
            className="freelancer-dropdown-item logout"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userName');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userRole');
              localStorage.removeItem('freelancerProfile');
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
      <div className={`freelancer-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="freelancer-sidebar-header">
          <h2>WorkHub</h2>
          <button
            className="freelancer-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="freelancer-sidebar-nav">
          <div className="freelancer-nav-section">
            <h3>MAIN</h3>
            <Link to="/freelancer/dashboard" className="freelancer-nav-item active">
              <FaHome />
              <span>Dashboard</span>
            </Link>
            <Link to="/freelancer/jobs" className="freelancer-nav-item">
              <FaBriefcase />
              <span>Find Work</span>
            </Link>
            <Link to="/freelancer/workspace" className="freelancer-nav-item">
              <FaProjectDiagram />
              <span>Workspaces</span>
            </Link>
            <Link to="/freelancer/proposals" className="freelancer-nav-item">
              <FaFileAlt />
              <span>My Proposals</span>
            </Link>
            <Link to="/freelancer/contracts" className="freelancer-nav-item">
              <FaFileContract />
              <span>Contracts</span>
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>FINANCIAL</h3>
            <Link to="/freelancer/earnings" className="freelancer-nav-item">
              <FaCreditCard />
              <span>Earnings</span>
            </Link>
            <Link to="/freelancer/invoices" className="freelancer-nav-item">
              <FaMoneyBillWave />
              <span>Invoices</span>
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>PORTFOLIO</h3>
            <Link to={`/profile/${profileId}`} className="freelancer-nav-item">
              <FaUser />
              <span>View Profile</span>
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>ANALYTICS</h3>
            <Link to="/freelancer/analytics" className="freelancer-nav-item">
              <FaChartBar />
              <span>Analytics</span>
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>COMMUNICATION</h3>
            <Link to="/freelancer/messages" className="freelancer-nav-item">
              <FaComments />
              <span>Messages</span>
              <span className="freelancer-badge">3</span>
            </Link>
            <Link to="/freelancer/notifications" className="freelancer-nav-item">
              <FaBell />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="freelancer-badge">{unreadCount}</span>
              )}
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>TOOLS</h3>
            <Link to="/freelancer/ai-assistant" className="freelancer-nav-item">
              <FaRobot />
              <span>AI Assistant</span>
            </Link>
            <Link to="/freelancer/support" className="freelancer-nav-item">
              <FaLifeRing />
              <span>Support</span>
            </Link>
          </div>

          <div className="freelancer-nav-section">
            <h3>ACCOUNT</h3>
            {hasProfile ? (
              <Link
                to="/freelancer/profile/edit"
                className="freelancer-nav-item"
                onClick={() => {
                  const existingProfile = JSON.parse(localStorage.getItem('freelancerProfile') || '{}');
                  navigate('/freelancer/profile/edit', { state: { existingProfile } });
                }}
              >
                <FaEdit />
                <span>Edit Profile</span>
              </Link>
            ) : (
              <Link to="/freelancer/profile/create" className="freelancer-nav-item">
                <FaUser />
                <span>Create Profile</span>
              </Link>
            )}

            <Link to="/freelancer/settings" className="freelancer-nav-item">
              <FaCog />
              <span>Settings</span>
            </Link>
            <button className="freelancer-nav-item logout" onClick={() => {
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
  };

  // Activity Item Component
  const ActivityItem = ({ activity }) => (
    <div className={`freelancer-activity-item ${activity.status}`}>
      <div className={`freelancer-activity-icon ${activity.type}`}>
        {activity.icon}
      </div>
      <div className="freelancer-activity-content">
        <p>{activity.message}</p>
        <span className="freelancer-activity-time">{activity.time}</span>
      </div>
    </div>
  );

  // Job Card Component with match score
  const JobCard = ({ job }) => (
    <div className="freelancer-job-card">
      <div className="freelancer-job-header">
        <h4>{job.title}</h4>
        <span className="freelancer-job-budget">${job.budget?.toLocaleString() || 'Negotiable'}</span>
      </div>
      <p className="freelancer-job-description">
        {job.description?.length > 100
          ? `${job.description.substring(0, 100)}...`
          : job.description || 'No description provided'
        }
      </p>
      <div className="freelancer-job-skills">
        {job.skillsRequired?.slice(0, 3).map((skill, index) => (
          <span key={index} className="freelancer-skill-tag">{skill}</span>
        ))}
        {job.skillsRequired?.length > 3 && (
          <span className="freelancer-skill-more">+{job.skillsRequired.length - 3} more</span>
        )}
      </div>

      {job.matchScore && job.matchScore > 0 && (
        <div className="freelancer-job-match">
          <div className="freelancer-match-bar">
            <div
              className="freelancer-match-fill"
              style={{ width: `${job.matchScore}%` }}
            ></div>
          </div>
          <span className="freelancer-match-percentage">{job.matchScore}% match</span>
        </div>
      )}

      <div className="freelancer-job-footer">
        <div className="freelancer-job-client">
          <span className="freelancer-client-name">
            {job.clientId?.name || job.clientId?.profile?.name || 'Client'}
          </span>
          {job.clientId?.rating && (
            <span className="freelancer-client-rating">
              <FaStar /> {job.clientId.rating.toFixed(1)}
            </span>
          )}
        </div>
        <button
          className="freelancer-apply-btn"
          onClick={() => navigate(`/freelancer/jobs/${job._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );

  // Circular Chart Component
  const CircularChart = ({ percentage, label, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="freelancer-chart-card">
        <div className="freelancer-chart-header">
          <h3>{label}</h3>
        </div>
        <div className="freelancer-chart-container">
          <div className="freelancer-circular-chart">
            <svg viewBox="0 0 120 120">
              <circle
                className="freelancer-circle-bg"
                cx="60"
                cy="60"
                r={radius}
              />
              <circle
                className={`freelancer-circle ${color}`}
                cx="60"
                cy="60"
                r={radius}
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <div className="freelancer-chart-text">
              <span className="freelancer-chart-value">{percentage}%</span>
              <span className="freelancer-chart-label">{label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Loading State
  if (isLoading) {
    return (
      <div className="freelancer-dashboard-container">
        <Sidebar />
        <main className="freelancer-dashboard-main">
          <div className="freelancer-loading-container">
            <div className="freelancer-loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="freelancer-dashboard-container">
      <Sidebar />

      <main className="freelancer-dashboard-main">
        <header className="freelancer-dashboard-header">
          <div className="freelancer-header-left">
            <h1>Freelancer Dashboard</h1>
            <p>Welcome back, {user.name}! Here's your work overview and opportunities.</p>
          </div>
          <div className="freelancer-header-right">
            {/* Search Bar */}
            <div className="freelancer-search-container" ref={searchResultsRef}>
              <form className="freelancer-search-bar" onSubmit={handleSearch}>
                {/* <FaSearch /> */}
                <input
                  type="text"
                  placeholder="Search jobs, clients, messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults && setShowSearchResults(true)}
                />
              </form>
              <button type="submit" className="freelancer-search-btn" onClick={handleSearch}>
                Search
              </button>
              <SearchResultsDropdown />
            </div>

            {/* Notifications */}
            <div className="freelancer-notification-wrapper">
              <button
                className="freelancer-notification-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="freelancer-notification-count">{unreadCount}</span>
                )}
              </button>
              {showNotifications && <NotificationsDropdown />}
            </div>

            {/* Profile */}
            <div className="freelancer-profile-wrapper">
              <button
                className="freelancer-profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="freelancer-user-avatar">
                  {getInitials(user.name)}
                </div>
                <div className="freelancer-user-info">
                  <div className="freelancer-user-name">{user.name}</div>
                  <div className="freelancer-user-role">{user.role}</div>
                </div>
                <FaChevronDown className={`freelancer-chevron ${showProfileDropdown ? 'open' : ''}`} />
              </button>
              {showProfileDropdown && <ProfileDropdown />}
            </div>
          </div>
        </header>

        {/* Original Notification Banner */}
        <NotificationBanner />

        <div className="freelancer-dashboard-content">
          {/* Stats Section - Top section */}
          <section className="freelancer-stats-section">
            <div className="freelancer-section-header">
              <h2>Performance Overview</h2>
              <Link to="/freelancer/analytics" className="freelancer-view-all-btn">
                View Detailed Analytics
              </Link>
            </div>
            <div className="freelancer-stats-grid">
              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaMoneyBillWave />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>${stats.monthlyEarnings.toLocaleString()}</h3>
                  <p>Monthly Earnings</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>15% increase</span>
                  </div>
                </div>
              </div>

              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaProjectDiagram />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>{stats.activeProjects}</h3>
                  <p>Active Projects</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>2 new projects</span>
                  </div>
                </div>
              </div>

              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaStar />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>{stats.rating}/5</h3>
                  <p>Average Rating</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>0.2 increase</span>
                  </div>
                </div>
              </div>

              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaCheckCircle />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>{stats.totalProposals}</h3>
                  <p>Total Proposals</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>5 this month</span>
                  </div>
                </div>
              </div>

              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaWallet />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>${stats.totalEarnings.toLocaleString()}</h3>
                  <p>Total Earnings</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>22% increase</span>
                  </div>
                </div>
              </div>

              <div className="freelancer-stat-card">
                <div className="freelancer-stat-header">
                  <div className="freelancer-stat-icon">
                    <FaUsers />
                  </div>
                </div>
                <div className="freelancer-stat-content">
                  <h3>{stats.acceptedProposals}</h3>
                  <p>Accepted Proposals</p>
                  <div className="freelancer-stat-trend positive">
                    <FaArrowUp />
                    <span>8% acceptance rate</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Section - Below stats */}
          <section className="freelancer-quick-actions-section">
            <div className="freelancer-section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="freelancer-quick-actions-grid">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="freelancer-quick-action-item"
                  onClick={action.action}>
                  <div className="freelancer-quick-action-icon">
                    <action.icon />
                  </div>
                  <div className="freelancer-quick-action-content">
                    <h4>{action.label}</h4>
                    <p>{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Performance Metrics Section - Charts */}
          <section className="freelancer-performance-section">
            <div className="freelancer-section-header">
              <h2>Performance Metrics</h2>
            </div>
            <div className="freelancer-performance-grid">
              <CircularChart percentage={stats.successRate} label="Success Rate" color="success" />
              <CircularChart percentage={stats.onTimeDelivery} label="On-Time Delivery" color="projects" />
              <CircularChart percentage={stats.freelancerScore} label="Profile Score" color="budget" />
              <CircularChart
                percentage={stats.totalProposals > 0 ?
                  Math.round((stats.acceptedProposals / stats.totalProposals) * 100) : 0}
                label="Proposal Success"
                color="pending"
              />
            </div>
          </section>

          {/* Active Workspaces */}
          <section className="freelancer-workspaces-section">
            <div className="freelancer-section-header">
              <h2>Active Workspaces</h2>
              <Link to="/freelancer/workspace" className="freelancer-view-all-btn">
                View All
              </Link>
            </div>

            {workspaces.length > 0 ? (
              <div className="freelancer-workspaces-grid">
                {workspaces.slice(0, 3).map(workspace => (
                  <FreelancerWorkspaceCard key={workspace._id} workspace={workspace} />
                ))}
              </div>
            ) : (
              <div className="freelancer-no-workspaces">
                <FaProjectDiagram />
                <h3>No active workspaces</h3>
                <p>Start working on a project or get hired to begin collaborating.</p>
                <button
                  className="freelancer-btn-primary"
                  onClick={() => navigate('/freelancer/jobs')}>
                  Browse Jobs
                </button>
              </div>
            )}
          </section>

          {/* Recommended Jobs */}
          <section className="freelancer-jobs-section">
            <div className="freelancer-section-header">
              <h2>Recommended Jobs</h2>
              <Link to="/freelancer/jobs" className="freelancer-view-all-btn">
                Browse All Jobs
              </Link>
            </div>
            <div className="freelancer-jobs-grid">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job, index) => (
                  <JobCard key={job._id || index} job={job} />
                ))
              ) : (
                <div className="freelancer-no-jobs">
                  <p>No recommended jobs found. Update your skills to get better matches.</p>
                  <button
                    className="freelancer-btn-primary"
                    onClick={handleProfileNavigation}
                  >
                    {hasProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="freelancer-activity-section">
            <div className="freelancer-section-header">
              <h2>Recent Activity</h2>
              <Link to="/freelancer/notifications" className="freelancer-view-all-btn">
                View All Activity
              </Link>
            </div>
            <div className="freelancer-activity-list">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </section>

          {/* AI Assistant */}
          <section className="freelancer-ai-section">
            <div className="freelancer-ai-content">
              <div className="freelancer-ai-icon">
                <FaRobot />
              </div>
              <div className="freelancer-ai-text">
                <h3>Need help finding work?</h3>
                <p>Use our AI Assistant to optimize your profile, find perfect job matches, and improve your proposals.</p>
              </div>
              <button
                className="freelancer-ai-button"
                onClick={() => navigate('/freelancer/ai-assistant')}>
                Try AI Assistant
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
// Loading State
export default FreelancerDashboard;