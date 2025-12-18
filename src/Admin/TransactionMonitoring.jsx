import React, { useState, useEffect } from 'react';
import {
  FaEye, FaFlag, FaCheckCircle, FaExclamationTriangle,
  FaSearch, FaFilter, FaDownload
} from 'react-icons/fa';
import { MdRefresh, MdArrowDropDown } from 'react-icons/md';
import './TransactionMonitoring.css'; // Create this file

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 0,
    limit: 10
  });

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
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="admin-transaction-monitoring">
      <div className="admin-section-header">
        <h2>Transaction Monitoring</h2>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-primary" onClick={fetchTransactions}>
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-card">
        <div className="admin-filter-row">
          <div className="admin-filter-group">
            <label>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 0 })}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
          
          <div className="admin-filter-group">
            <label>Type</label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 0 })}
            >
              <option value="all">All Types</option>
              <option value="milestone_payment">Milestone Payment</option>
              <option value="commission">Commission</option>
              <option value="refund">Refund</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>From User</th>
              <th>To User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>
                  <span className="admin-transaction-id">
                    {transaction._id?.slice(-8) || 'N/A'}
                  </span>
                </td>
                <td>{transaction.fromUser?.name || 'N/A'}</td>
                <td>{transaction.toUser?.name || 'N/A'}</td>
                <td>
                  <span className="admin-amount">${transaction.amount}</span>
                </td>
                <td>
                  <span className={`admin-badge admin-badge-${getStatusColor(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge admin-badge-${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                  {transaction.isFlagged && (
                    <FaExclamationTriangle className="admin-flagged-icon" />
                  )}
                </td>
                <td>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div className="admin-table-actions">
                    <button 
                      className="admin-icon-btn"
                      onClick={() => handleVerifyPayment(transaction._id)}
                      disabled={transaction.status === 'verified'}
                      title="Verify Payment"
                    >
                      <FaCheckCircle />
                    </button>
                    <button 
                      className="admin-icon-btn"
                      onClick={() => handleFlagTransaction(transaction._id)}
                      disabled={transaction.isFlagged}
                      title="Flag Transaction"
                    >
                      <FaFlag />
                    </button>
                    <button className="admin-icon-btn" title="View Details">
                      <FaEye />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {transactions.length === 0 && (
          <div className="admin-empty-state">
            <p>No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <button 
          className="admin-pagination-btn"
          disabled={filters.page === 0}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>
        <span>Page {filters.page + 1}</span>
        <button 
          className="admin-pagination-btn"
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionMonitoring;