// FreelancerEarnings.jsx
import React, { useState, useEffect } from 'react';
import {
  FaMoneyBillWave, FaWallet, FaClock, FaChartLine,
  FaDownload, FaFilter, FaCalendar, FaProjectDiagram,
  FaUser, FaCheckCircle, FaTimes, FaCreditCard,
  FaArrowUp, FaArrowDown, FaHistory, FaPiggyBank
} from 'react-icons/fa';
import axios from 'axios';
import './FreelancerEarnings.css';

const FreelancerEarnings = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({
    currentMonthEarnings: 0,
    currentMonthTransactions: 0,
    totalEarnings: 0,
    totalTransactions: 0,
    pendingEarnings: 0,
    pendingTransactions: 0,
    earningsByService: []
  });
  const [transactions, setTransactions] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [projectEarnings, setProjectEarnings] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    accountDetails: ''
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'monthly') {
      fetchMonthlyEarnings();
    } else if (activeTab === 'projects') {
      fetchProjectEarnings();
    } else if (activeTab === 'pending') {
      fetchPendingPayments();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filters, pagination.currentPage]);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setOverview(response.data.overview);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: 10,
          ...filters
        }
      });
      if (response.data.success) {
        setTransactions(response.data.transactions);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalTransactions: response.data.totalTransactions
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/monthly', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { months: 6 }
      });
      if (response.data.success) {
        setMonthlyEarnings(response.data.monthlyEarnings);
      }
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
    }
  };

  const fetchProjectEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/by-project', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setProjectEarnings(response.data.projectEarnings);
      }
    } catch (error) {
      console.error('Error fetching project earnings:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setPendingPayments(response.data.pendingPayments);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/earnings/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/freelancer/earnings/withdraw', 
        withdrawData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdrawModal(false);
        setWithdrawData({ amount: '', paymentMethod: 'bank_transfer', accountDetails: '' });
        fetchOverview(); // Refresh data
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert(error.response?.data?.message || 'Error submitting withdrawal request');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' });
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="earnings-overview">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(overview.currentMonthEarnings)}</h3>
            <p>This Month's Earnings</p>
            <span className="card-subtitle">{overview.currentMonthTransactions} transactions</span>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">
            <FaWallet />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(overview.totalEarnings)}</h3>
            <p>Total Earnings</p>
            <span className="card-subtitle">{overview.totalTransactions} total transactions</span>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <FaClock />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(overview.pendingEarnings)}</h3>
            <p>Pending Payments</p>
            <span className="card-subtitle">{overview.pendingTransactions} payments</span>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(overview.totalEarnings / Math.max(overview.totalTransactions, 1))}</h3>
            <p>Average Payment</p>
            <span className="card-subtitle">Per transaction</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row">
        <button 
          className="btn-withdraw"
          onClick={() => setShowWithdrawModal(true)}
          disabled={overview.totalEarnings === 0}
        >
          <FaDownload />
          Withdraw Funds
        </button>
        <div className="action-stats">
          <span>Available for withdrawal: {formatCurrency(overview.totalEarnings)}</span>
        </div>
      </div>

      {/* Earnings by Service Type */}
      {overview.earningsByService && overview.earningsByService.length > 0 && (
        <div className="earnings-by-service">
          <h3>Earnings by Service Type</h3>
          <div className="service-list">
            {overview.earningsByService.map((service, index) => (
              <div key={index} className="service-item">
                <div className="service-info">
                  <span className="service-name">{service._id || 'General'}</span>
                  <span className="service-projects">{service.projectCount} projects</span>
                </div>
                <div className="service-amount">
                  {formatCurrency(service.totalValue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Transactions Tab
  const TransactionsTab = () => (
    <div className="transactions-tab">
      <div className="tab-header">
        <h3>Transaction History</h3>
        <div className="filters">
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="earning">Earnings</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
          <button 
            className="btn-clear-filters"
            onClick={() => setFilters({type: 'all', status: 'all', startDate: '', endDate: ''})}
          >
            <FaTimes /> Clear
          </button>
        </div>
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="no-data">
            <FaHistory />
            <p>No transactions found</p>
          </div>
        ) : (
          transactions.map(transaction => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-main">
                <div className="transaction-icon">
                  {transaction.type === 'earning' ? <FaMoneyBillWave /> : <FaDownload />}
                </div>
                <div className="transaction-details">
                  <h4>{transaction.description}</h4>
                  <p>
                    {transaction.relatedProject?.title && `Project: ${transaction.relatedProject.title}`}
                    {transaction.relatedProject?.clientId?.name && ` • Client: ${transaction.relatedProject.clientId.name}`}
                  </p>
                  <span className="transaction-date">{formatDate(transaction.date)}</span>
                </div>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type === 'earning' ? 'positive' : 'negative'}`}>
                  {transaction.type === 'earning' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
                <span className={`status ${transaction.status}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
          >
            Previous
          </button>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  // Monthly Earnings Tab
  const MonthlyEarningsTab = () => (
    <div className="monthly-earnings-tab">
      <h3>Monthly Earnings Breakdown (Last 6 Months)</h3>
      <div className="monthly-chart">
        {monthlyEarnings.length === 0 ? (
          <div className="no-data">
            <FaChartLine />
            <p>No earnings data available</p>
          </div>
        ) : (
          <div className="chart-bars">
            {monthlyEarnings.map((month, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(month.totalEarnings / Math.max(...monthlyEarnings.map(m => m.totalEarnings))) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="chart-label">
                  <span>{getMonthName(month.month).substring(0, 3)}</span>
                  <span className="amount">{formatCurrency(month.totalEarnings)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="monthly-details">
        {monthlyEarnings.map((month, index) => (
          <div key={index} className="month-detail">
            <span className="month-name">{getMonthName(month.month)} {month.year}</span>
            <div className="month-stats">
              <span>{formatCurrency(month.totalEarnings)}</span>
              <small>{month.transactionCount} transactions</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Project Earnings Tab
  const ProjectEarningsTab = () => (
    <div className="project-earnings-tab">
      <h3>Earnings by Project</h3>
      <div className="projects-list">
        {projectEarnings.length === 0 ? (
          <div className="no-data">
            <FaProjectDiagram />
            <p>No project earnings data available</p>
          </div>
        ) : (
          projectEarnings.map((project, index) => (
            <div key={index} className="project-earning-item">
              <div className="project-info">
                <h4>{project.projectTitle || 'Unknown Project'}</h4>
                <p>
                  {project.clientName && `Client: ${project.clientName}`}
                  {project.clientCompany && ` • ${project.clientCompany}`}
                </p>
                <div className="project-dates">
                  <span>First: {formatDate(project.firstPayment)}</span>
                  <span>Last: {formatDate(project.lastPayment)}</span>
                </div>
              </div>
              <div className="project-earnings">
                <div className="total-earnings">
                  {formatCurrency(project.totalEarnings)}
                </div>
                <div className="transaction-count">
                  {project.transactionCount} payments
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Pending Payments Tab
  const PendingPaymentsTab = () => (
    <div className="pending-payments-tab">
      <div className="tab-header">
        <h3>Pending Payments</h3>
        <div className="pending-summary">
          <span>Total Pending: {formatCurrency(pendingPayments.reduce((sum, payment) => sum + payment.amount, 0))}</span>
          <span>{pendingPayments.length} payments</span>
        </div>
      </div>

      <div className="pending-list">
        {pendingPayments.length === 0 ? (
          <div className="no-data">
            <FaCheckCircle />
            <p>No pending payments</p>
          </div>
        ) : (
          pendingPayments.map(payment => (
            <div key={payment._id} className="pending-item">
              <div className="pending-main">
                <div className="pending-icon">
                  <FaClock />
                </div>
                <div className="pending-details">
                  <h4>{payment.description}</h4>
                  <p>
                    {payment.relatedProject?.title && `Project: ${payment.relatedProject.title}`}
                    {payment.relatedProject?.clientId?.name && ` • Client: ${payment.relatedProject.clientId.name}`}
                  </p>
                  <span className="expected-date">
                    Expected: {formatDate(payment.date)}
                  </span>
                </div>
              </div>
              <div className="pending-amount">
                {formatCurrency(payment.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Stats Tab
  const StatsTab = () => (
    <div className="stats-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Current Year</h4>
          <div className="stat-value">{formatCurrency(stats.currentYear?.yearlyEarnings || 0)}</div>
          <div className="stat-details">
            <span>{stats.currentYear?.transactionCount || 0} transactions</span>
            <span>Avg: {formatCurrency(stats.currentYear?.averageTransaction || 0)}</span>
          </div>
        </div>

        <div className="stat-card">
          <h4>Lifetime Earnings</h4>
          <div className="stat-value">{formatCurrency(stats.lifetime?.totalEarnings || 0)}</div>
          <div className="stat-details">
            <span>{stats.lifetime?.totalTransactions || 0} total transactions</span>
            <span>Avg: {formatCurrency(stats.lifetime?.avgTransactionSize || 0)}</span>
          </div>
        </div>

        <div className="stat-card">
          <h4>Largest Payment</h4>
          <div className="stat-value">{formatCurrency(stats.currentYear?.largestTransaction || 0)}</div>
          <div className="stat-details">
            <span>This year</span>
          </div>
        </div>
      </div>

      {stats.paymentMethods && stats.paymentMethods.length > 0 && (
        <div className="payment-methods">
          <h4>Payment Methods</h4>
          <div className="methods-list">
            {stats.paymentMethods.map((method, index) => (
              <div key={index} className="method-item">
                <span className="method-name">{method._id || 'Unknown'}</span>
                <div className="method-stats">
                  <span>{formatCurrency(method.totalAmount)}</span>
                  <small>{method.count} payments</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Withdraw Modal
  const WithdrawModal = () => (
    <div className={`modal ${showWithdrawModal ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Withdraw Funds</h3>
          <button className="close-modal" onClick={() => setShowWithdrawModal(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Amount to Withdraw</label>
            <input
              type="number"
              value={withdrawData.amount}
              onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
              placeholder="Enter amount"
              max={overview.totalEarnings}
            />
            <small>Available: {formatCurrency(overview.totalEarnings)}</small>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={withdrawData.paymentMethod}
              onChange={(e) => setWithdrawData({...withdrawData, paymentMethod: e.target.value})}
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="wise">Wise</option>
            </select>
          </div>

          <div className="form-group">
            <label>Account Details</label>
            <textarea
              value={withdrawData.accountDetails}
              onChange={(e) => setWithdrawData({...withdrawData, accountDetails: e.target.value})}
              placeholder="Enter your account details for withdrawal"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button 
              className="btn-cancel"
              onClick={() => setShowWithdrawModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-withdraw-confirm"
              onClick={handleWithdraw}
              disabled={!withdrawData.amount || withdrawData.amount <= 0 || withdrawData.amount > overview.totalEarnings}
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="earnings-loading">
        <div className="loading-spinner"></div>
        <p>Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className="freelancer-earnings">
      <div className="earnings-header">
        <h1>Earnings & Payments</h1>
        <p>Track your earnings, payments, and financial performance</p>
      </div>

      <div className="earnings-tabs">
        <nav className="tab-navigation">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            <FaHistory /> Transactions
          </button>
          <button 
            className={activeTab === 'monthly' ? 'active' : ''}
            onClick={() => setActiveTab('monthly')}
          >
            <FaCalendar /> Monthly
          </button>
          <button 
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            <FaProjectDiagram /> By Project
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            <FaClock /> Pending
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            <FaPiggyBank /> Statistics
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'monthly' && <MonthlyEarningsTab />}
          {activeTab === 'projects' && <ProjectEarningsTab />}
          {activeTab === 'pending' && <PendingPaymentsTab />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>

      <WithdrawModal />
    </div>
  );
};

export default FreelancerEarnings;