import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './NotificationPage.css';

import {
  FaBell,
  FaCheckCircle,
  FaTimes,
  FaEnvelope,
  FaFileAlt,
  FaMoneyBillWave,
  FaFileContract,
  FaProjectDiagram,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaStar,
  FaExclamationTriangle,
  FaCheck,
  FaClock,
  FaSync,
  FaSearch,
  FaInbox
} from 'react-icons/fa';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    today: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'All Notifications', icon: FaInbox },
    { id: 'unread', label: 'Unread', icon: FaEyeSlash },
    { id: 'read', label: 'Read', icon: FaEye },
    { id: 'today', label: 'Today', icon: FaCalendarAlt },
    { id: 'proposal', label: 'Proposals', icon: FaFileAlt },
    { id: 'message', label: 'Messages', icon: FaEnvelope },
    { id: 'payment', label: 'Payments', icon: FaMoneyBillWave },
    { id: 'contract', label: 'Contracts', icon: FaFileContract },
    { id: 'workspace', label: 'Workspaces', icon: FaProjectDiagram },
    { id: 'system', label: 'System', icon: FaBell }
  ];

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: currentPage,
        limit: 20
      };
      
      if (activeFilter !== 'all') {
        if (['unread', 'read'].includes(activeFilter)) {
          params.isRead = activeFilter === 'read';
        } else if (activeFilter === 'today') {
          // Handle today filter client-side
        } else {
          params.type = activeFilter;
        }
      }

      const response = await axios.get(`${API_URL}/api/freelancer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        let filtered = response.data.notifications;
        
        // Apply today filter if needed
        if (activeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filtered = filtered.filter(n => new Date(n.createdAt) >= today);
        }

        // Apply search filter
        if (searchTerm) {
          filtered = filtered.filter(n => 
            n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setNotifications(response.data.notifications);
        setFilteredNotifications(filtered);
        setTotalPages(response.data.totalPages || 1);
        
        // Calculate stats
        calculateStats(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, currentPage, searchTerm]);

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/freelancer/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          today: response.data.todayUnread || 0,
          unread: response.data.totalUnread || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, []);

  // Calculate stats
  const calculateStats = (notifs) => {
    const total = notifs.length;
    const unread = notifs.filter(n => !n.isRead).length;
    const read = total - unread;
    const today = notifs.filter(n => {
      const notificationDate = new Date(n.createdAt);
      const todayDate = new Date();
      return notificationDate.toDateString() === todayDate.toDateString();
    }).length;
    
    setStats({ total, unread, read, today });
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/freelancer/notifications/${notificationId}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      ));
      
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1
      }));
      
      // Refresh the list
      fetchNotificationCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/freelancer/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
      
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
      
      // Refresh
      fetchNotificationCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/freelancer/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: prev.unread - (notifications.find(n => n._id === notificationId)?.isRead ? 0 : 1),
        read: prev.read - (notifications.find(n => n._id === notificationId)?.isRead ? 1 : 0)
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setRefreshing(true);
    fetchNotifications();
    fetchNotificationCount();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'proposal_submitted':
      case 'proposal_accepted':
      case 'proposal_rejected':
      case 'proposal_viewed':
        return { icon: FaFileAlt, color: '#2196F3', bg: '#E3F2FD' };
      case 'message_received':
        return { icon: FaEnvelope, color: '#4CAF50', bg: '#E8F5E9' };
      case 'payment_received':
        return { icon: FaMoneyBillWave, color: '#9C27B0', bg: '#F3E5F5' };
      case 'contract_sent':
      case 'contract_accepted':
      case 'contract_completed':
        return { icon: FaFileContract, color: '#FF9800', bg: '#FFF3E0' };
      case 'milestone_submitted':
      case 'milestone_approved':
        return { icon: FaCheckCircle, color: '#00BCD4', bg: '#E0F7FA' };
      case 'workspace_created':
      case 'workspace_updated':
        return { icon: FaProjectDiagram, color: '#795548', bg: '#EFEBE9' };
      case 'review_received':
        return { icon: FaStar, color: '#FFC107', bg: '#FFF8E1' };
      case 'warning':
        return { icon: FaExclamationTriangle, color: '#F44336', bg: '#FFEBEE' };
      case 'success':
        return { icon: FaCheck, color: '#4CAF50', bg: '#E8F5E9' };
      default:
        return { icon: FaBell, color: '#607D8B', bg: '#ECEFF1' };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    
    // Navigate based on notification type
    if (notification.data?.jobId) {
      navigate(`/freelancer/jobs/${notification.data.jobId}`);
    } else if (notification.data?.contractId) {
      navigate(`/freelancer/contracts/${notification.data.contractId}`);
    } else if (notification.data?.workspaceId) {
      navigate(`/workspace/${notification.data.workspaceId}`);
    } else if (notification.data?.messageId) {
      navigate(`/freelancer/messages`);
    }
  };

  // Effect for initial load
  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
  }, [fetchNotifications, fetchNotificationCount]);

  // Effect for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || activeFilter === 'today') {
        fetchNotifications();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeFilter, fetchNotifications]);

  if (loading && !refreshing) {
    return (
      <div className="notification-page">
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-page">
      {/* Header */}
      <div className="notification-header">
        <div className="header-left">
          <h1>
            <FaBell /> Notifications
          </h1>
          <p className="header-subtitle">
            Stay updated with your work activities
          </p>
        </div>
        <div className="header-right">
          <div className="header-actions">
            <button 
              className="btn-refresh"
              onClick={refreshNotifications}
              disabled={refreshing}
            >
              <FaSync className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="btn-mark-all-read"
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
            >
              <FaCheckCircle /> Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaBell />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Notifications</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon unread">
            <FaEyeSlash />
          </div>
          <div className="stat-content">
            <h3>{stats.unread}</h3>
            <p>Unread</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon read">
            <FaEye />
          </div>
          <div className="stat-content">
            <h3>{stats.read}</h3>
            <p>Read</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon today">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Today</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="notification-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-section">
            <h4>
              <FaFilter /> Filter by
            </h4>
            <div className="filter-buttons">
              {filters.map(filter => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setCurrentPage(1);
                    }}
                  >
                    <Icon />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell className="empty-icon" />
            <h3>No notifications found</h3>
            <p>
              {searchTerm 
                ? `No notifications match "${searchTerm}"`
                : activeFilter === 'unread' 
                  ? 'All notifications are read!'
                  : 'You\'re all caught up!'}
            </p>
            {searchTerm && (
              <button 
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {filteredNotifications.map(notification => {
                const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                
                return (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon" style={{ backgroundColor: bg, color: color }}>
                      <Icon />
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <div className="notification-meta">
                          <span className="notification-time">
                            <FaCalendarAlt /> {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="unread-badge">New</span>
                          )}
                        </div>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="notification-data">
                          {Object.entries(notification.data).map(([key, value]) => (
                            <span key={key} className="data-item">
                              <strong>{key}:</strong> {value}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="notification-actions">
                        {!notification.isRead && (
                          <button
                            className="btn-mark-read"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            title="Mark as read"
                          >
                            <FaCheck /> Mark as read
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="notification-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Quick Actions</h4>
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
          >
            <FaCheckCircle /> Mark all read
          </button>
          <button
            className="action-btn"
            onClick={() => {
              setActiveFilter('unread');
              setCurrentPage(1);
            }}
          >
            <FaEyeSlash /> View unread only
          </button>
          <button
            className="action-btn"
            onClick={() => {
              setActiveFilter('today');
              setCurrentPage(1);
            }}
          >
            <FaCalendarAlt /> Today's notifications
          </button>
          <button
            className="action-btn"
            onClick={() => navigate('/freelancer/settings')}
          >
            <FaBell /> Notification settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;