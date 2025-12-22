import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    page: 0,
    limit: 10,
    search: ''
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: '' });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action) => {
    try {
      const token = localStorage.getItem('adminToken');
      let endpoint = '';
      let method = 'PUT';

      switch (action) {
        case 'suspend':
          endpoint = 'suspend';
          break;
        case 'activate':
          endpoint = 'activate';
          break;
        case 'verify':
          endpoint = 'verify';
          break;
        case 'delete':
          endpoint = '';
          method = 'DELETE';
          break;
        default:
          return;
      }

      const response = await fetch(`/api/admin/users/${selectedUser._id}/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: action === 'verify' ? JSON.stringify({ verificationStatus: 'verified' }) : undefined
      });

      if (response.ok) {
        fetchUsers(); // Refresh data
        setActionDialog({ open: false, action: '' });
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      suspended: 'error',
      pending: 'warning'
    };
    return colors[status] || 'default';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'secondary',
      client: 'primary',
      freelancer: 'info'
    };
    return colors[role] || 'default';
  };

  return (
    <div className="user-management-container">
      <h2 className="page-title">User Management</h2>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-field">
            <label htmlFor="role-filter">Role</label>
            <select
              id="role-filter"
              className="filter-select"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 0 })}
            >
              <option value="all">All Roles</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="filter-field search-field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              className="search-input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
              placeholder="Search by name or email..."
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="user-row">
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.profile?.name}</div>
                      {user.profile?.company && (
                        <div className="user-company">{user.profile.company}</div>
                      )}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-chip role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip status-${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <span className={`verification-chip ${user.verification?.status === 'verified' ? 'verified' : 'pending'}`}>
                      {user.verification?.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn verify-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionDialog({ open: true, action: 'verify' });
                        }}
                        disabled={user.verification?.status === 'verified'}
                        title="Verify User"
                      >
                        ✓
                      </button>
                      <button
                        className="action-btn suspend-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionDialog({ open: true, action: user.status === 'suspended' ? 'activate' : 'suspend' });
                        }}
                        title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                      >
                        {user.status === 'suspended' ? '↻' : '⏸'}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          setSelectedUser(user);
                          setActionDialog({ open: true, action: 'delete' });
                        }}
                        title="Delete User"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 0}
          >
            Previous
          </button>
          <span className="page-info">
            Page {filters.page + 1} of {Math.ceil(totalUsers / filters.limit)}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={(filters.page + 1) * filters.limit >= totalUsers}
          >
            Next
          </button>
        </div>
        <div className="rows-per-page">
          <label htmlFor="rows-per-page">Rows per page:</label>
          <select
            id="rows-per-page"
            value={filters.limit}
            onChange={(e) => setFilters({
              ...filters,
              limit: parseInt(e.target.value, 10),
              page: 0
            })}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      {actionDialog.open && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Confirm {actionDialog.action}</h3>
            </div>
            <div className="dialog-body">
              <p>
                Are you sure you want to {actionDialog.action} user {selectedUser?.profile?.name}?
              </p>
            </div>
            <div className="dialog-footer">
              <button
                className="dialog-btn cancel-btn"
                onClick={() => setActionDialog({ open: false, action: '' })}
              >
                Cancel
              </button>
              <button
                className={`dialog-btn confirm-btn ${actionDialog.action === 'delete' ? 'delete-confirm' : ''}`}
                onClick={() => handleUserAction(actionDialog.action)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;