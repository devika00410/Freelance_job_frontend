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
//   Grid,
//   Card,
//   CardContent,
//   CircularProgress,
//   TablePagination
// } from '@mui/material';
// import {
//   Visibility as ViewIcon,
//   Flag as FlagIcon,
//   CheckCircle as VerifyIcon,
//   Warning as WarningIcon
// } from '@mui/icons-material';

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 0,
    limit: 10
  });
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`/api/admin/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.transactions);
      setTotalTransactions(data.totalTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (transactionId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/transactions/${transactionId}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: 'Payment verified by admin' })
      });

      if (response.ok) {
        fetchTransactions(); // Refresh data
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const handleFlagTransaction = async (transactionId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/transactions/${transactionId}/flag`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          flagReason: 'Suspicious activity detected',
          adminNotes: 'Flagged for review'
        })
      });

      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error flagging transaction:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      under_review: 'info',
      verified: 'success'
    };
    return colors[status] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = {
      milestone_payment: 'primary',
      commission: 'secondary',
      refund: 'warning',
      withdrawal: 'info'
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Transaction Monitoring
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 0 })}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="milestone_payment">Milestone Payment</MenuItem>
              <MenuItem value="commission">Commission</MenuItem>
              <MenuItem value="refund">Refund</MenuItem>
              <MenuItem value="withdrawal">Withdrawal</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>From User</TableCell>
              <TableCell>To User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {transaction._id.slice(-8)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {transaction.fromUser?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {transaction.toUser?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    ${transaction.amount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={transaction.type} 
                    size="small" 
                    color={getTypeColor(transaction.type)}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={transaction.status} 
                    size="small" 
                    color={getStatusColor(transaction.status)}
                  />
                  {transaction.isFlagged && (
                    <WarningIcon color="warning" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleVerifyPayment(transaction._id)}
                    disabled={transaction.status === 'verified'}
                  >
                    <VerifyIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleFlagTransaction(transaction._id)}
                    disabled={transaction.isFlagged}
                  >
                    <FlagIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalTransactions}
        page={filters.page}
        onPageChange={(e, newPage) => setFilters({ ...filters, page: newPage })}
        rowsPerPage={filters.limit}
        onRowsPerPageChange={(e) => setFilters({ 
          ...filters, 
          limit: parseInt(e.target.value, 10), 
          page: 0 
        })}
      />
    </Box>
  );
};

export default TransactionMonitoring;