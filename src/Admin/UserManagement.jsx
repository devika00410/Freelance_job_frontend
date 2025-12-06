import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   Chip,
//   IconButton,
//   TextField,
//   MenuItem,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TablePagination,
//   Grid
// } from '@mui/material';
// import {
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Block as BlockIcon,
//   CheckCircle as VerifyIcon
// } from '@mui/icons-material';

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
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Role"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 0 })}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="freelancer">Freelancer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 0 })}
              placeholder="Search by name or email..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {user.profile?.name}
                  </Typography>
                  {user.profile?.company && (
                    <Typography variant="body2" color="textSecondary">
                      {user.profile.company}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status || 'active'} 
                    size="small" 
                    color={getStatusColor(user.status)}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.verification?.status || 'pending'} 
                    size="small" 
                    color={user.verification?.status === 'verified' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog({ open: true, action: 'verify' });
                    }}
                    disabled={user.verification?.status === 'verified'}
                  >
                    <VerifyIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog({ open: true, action: 'suspend' });
                    }}
                    disabled={user.status === 'suspended'}
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog({ open: true, action: 'delete' });
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalUsers}
        page={filters.page}
        onPageChange={(e, newPage) => setFilters({ ...filters, page: newPage })}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={(e) => setFilters({ 
          ...filters, 
          limit: parseInt(e.target.value, 10), 
          page: 0 
        })}
      />

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, action: '' })}
      >
        <DialogTitle>
          Confirm {actionDialog.action}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionDialog.action} user {selectedUser?.profile?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, action: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleUserAction(actionDialog.action)}
            color={actionDialog.action === 'delete' ? 'error' : 'primary'}
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;