import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaFileInvoiceDollar, 
  FaWallet, 
  FaHistory, 
  FaClock, 
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaEye,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaCreditCard,
  FaPrint,
  FaShare,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaReceipt,
  FaTag,
  FaCalendar,
  FaUser,
  FaProjectDiagram,
  FaExchangeAlt,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';
import './ClientBillingInvoices.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ClientBillingInvoices = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Main data states
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [billingStats, setBillingStats] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fetch client profile
  useEffect(() => {
    fetchClientProfile();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (clientProfile) {
      fetchData();
    }
  }, [activeTab, filters, pagination.page, clientProfile]);

  const fetchClientProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (userData._id) {
        setClientProfile(userData);
      } else {
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setClientProfile(response.data.user);
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const clientId = clientProfile._id;
      
      switch (activeTab) {
        case 'overview':
          await fetchBillingOverview(token, clientId);
          break;
        case 'invoices':
          await fetchInvoices(token, clientId);
          break;
        case 'transactions':
          await fetchTransactions(token, clientId);
          break;
        case 'receipts':
          await fetchReceipts(token, clientId);
          break;
        default:
          await fetchBillingOverview(token, clientId);
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingOverview = async (token, clientId) => {
    try {
      // Fetch multiple endpoints for overview
      const [invoicesRes, transactionsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/client/invoices/summary`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { clientId }
        }),
        axios.get(`${API_URL}/api/client/transactions/summary`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { clientId }
        }),
        axios.get(`${API_URL}/api/client/billing/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { clientId }
        })
      ]);

      const stats = {
        invoices: invoicesRes.data || {},
        transactions: transactionsRes.data || {},
        billing: statsRes.data || {}
      };
      
      setBillingStats(stats);
    } catch (error) {
      console.error('Error fetching overview:', error);
      // Try individual endpoints if combined fails
      await fetchBillingOverviewFallback(token, clientId);
    }
  };

  const fetchBillingOverviewFallback = async (token, clientId) => {
    const stats = {
      invoices: { total: 0, paid: 0, pending: 0, overdue: 0 },
      transactions: { total: 0, successful: 0, failed: 0, totalAmount: 0 },
      billing: { monthlySpending: [], topFreelancers: [] }
    };
    
    setBillingStats(stats);
  };

  const fetchInvoices = async (token, clientId) => {
    try {
      const params = {
        clientId,
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await axios.get(`${API_URL}/api/client/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setInvoices(response.data.invoices || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      setError('Failed to load invoices. Please try again.');
    }
  };

  const fetchTransactions = async (token, clientId) => {
    try {
      const params = {
        clientId,
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        search: searchTerm
      };
      
      const response = await axios.get(`${API_URL}/api/client/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setTransactions(response.data.transactions || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setError('Failed to load transactions. Please try again.');
    }
  };

  const fetchReceipts = async (token, clientId) => {
    try {
      const response = await axios.get(`${API_URL}/api/client/receipts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { clientId }
      });

      if (response.data.success) {
        // Process receipts data
        console.log('Receipts data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/client/invoices/${invoiceId}/pay`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Payment initiated successfully!');
        fetchData(); // Refresh data
      } else {
        alert(response.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error paying invoice:', error);
      alert(error.response?.data?.message || 'Payment failed');
    }
  };

  const handleDownloadInvoice = async (invoiceId, format = 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/client/invoices/${invoiceId}/download`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { format },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const handleViewInvoice = (invoice) => {
    // Open invoice in modal or new page
    console.log('View invoice:', invoice);
    // You can implement a modal here
  };

  const handleExportData = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        clientId: clientProfile._id,
        type,
        ...filters
      };
      
      const response = await axios.get(`${API_URL}/api/client/billing/export`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billing-${type}-${new Date().toISOString().split('T')[0]}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'success', icon: <FaCheckCircle />, text: 'Paid' },
      pending: { color: 'warning', icon: <FaClock />, text: 'Pending' },
      overdue: { color: 'danger', icon: <FaExclamationTriangle />, text: 'Overdue' },
      draft: { color: 'info', icon: <FaFileInvoiceDollar />, text: 'Draft' },
      failed: { color: 'danger', icon: <FaTimesCircle />, text: 'Failed' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', icon: <FaInfoCircle />, text: status };
    
    return (
      <span className={`status-badge status-${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: <FaCreditCard />,
      bank_transfer: <FaExchangeAlt />,
      upi: <FaMoneyBillWave />,
      wallet: <FaWallet />,
      paypal: <FaCreditCard />,
      stripe: <FaCreditCard />
    };
    
    return icons[method] || <FaMoneyBillWave />;
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="overview-tab">
      <div className="stats-cards-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaFileInvoiceDollar />
          </div>
          <div className="stat-content">
            <h3>{billingStats?.invoices?.total || 0}</h3>
            <p>Total Invoices</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(billingStats?.transactions?.totalAmount || 0)}</h3>
            <p>Total Paid</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{billingStats?.invoices?.pending || 0}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(billingStats?.billing?.averageInvoice || 0)}</h3>
            <p>Average Invoice</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Invoices</h3>
          <button className="btn-text" onClick={() => setActiveTab('invoices')}>
            View All
          </button>
        </div>
        
        {invoices.slice(0, 5).length > 0 ? (
          <div className="recent-list">
            {invoices.slice(0, 5).map(invoice => (
              <div key={invoice._id} className="recent-item">
                <div className="recent-main">
                  <div className="recent-icon">
                    <FaFileInvoiceDollar />
                  </div>
                  <div className="recent-details">
                    <h4>Invoice #{invoice.invoiceNumber}</h4>
                    <p>Freelancer: {invoice.freelancerName || 'Unknown'}</p>
                    <span className="recent-date">Due: {formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
                <div className="recent-side">
                  <div className="recent-amount">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <FaFileInvoiceDollar />
            <p>No invoices found</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn-text" onClick={() => setActiveTab('transactions')}>
            View All
          </button>
        </div>
        
        {transactions.slice(0, 5).length > 0 ? (
          <div className="recent-list">
            {transactions.slice(0, 5).map(transaction => (
              <div key={transaction._id} className="recent-item">
                <div className="recent-main">
                  <div className="recent-icon">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                  </div>
                  <div className="recent-details">
                    <h4>{transaction.description}</h4>
                    <p>To: {transaction.freelancerName || 'Freelancer'}</p>
                    <span className="recent-date">{formatDate(transaction.date)}</span>
                  </div>
                </div>
                <div className="recent-side">
                  <div className={`recent-amount ${transaction.type === 'payment' ? 'negative' : 'positive'}`}>
                    {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <FaHistory />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );

  // Invoices Tab Component
  const InvoicesTab = () => (
    <div className="invoices-tab">
      <div className="tab-header">
        <h3>All Invoices</h3>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
            
            <input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
            
            <input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
            
            <button
              className="btn-secondary"
              onClick={() => setFilters({
                status: 'all',
                dateFrom: '',
                dateTo: '',
                minAmount: '',
                maxAmount: ''
              })}
            >
              <FaFilter /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="invoices-list">
        {loading ? (
          <div className="loading-data">
            <FaSpinner className="spinner" />
            <p>Loading invoices...</p>
          </div>
        ) : invoices.length > 0 ? (
          <>
            {invoices.map(invoice => (
              <div key={invoice._id} className="invoice-card">
                <div className="invoice-header">
                  <div className="invoice-title">
                    <h4>Invoice #{invoice.invoiceNumber}</h4>
                    <span className="invoice-project">{invoice.projectTitle || 'General Service'}</span>
                  </div>
                  <div className="invoice-status">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
                
                <div className="invoice-body">
                  <div className="invoice-details">
                    <div className="detail-item">
                      <span>Freelancer:</span>
                      <strong>{invoice.freelancerName || 'Unknown'}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Issue Date:</span>
                      <span>{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Due Date:</span>
                      <span>{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span>
                      <strong className="invoice-amount">
                        {formatCurrency(invoice.totalAmount)}
                      </strong>
                    </div>
                  </div>
                  
                  <div className="invoice-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleViewInvoice(invoice)}
                      title="View Invoice"
                    >
                      <FaEye />
                    </button>
                    
                    <button
                      className="btn-icon"
                      onClick={() => handleDownloadInvoice(invoice._id, 'pdf')}
                      title="Download PDF"
                    >
                      <FaDownload />
                    </button>
                    
                    <button
                      className="btn-icon"
                      onClick={() => handleDownloadInvoice(invoice._id, 'excel')}
                      title="Download Excel"
                    >
                      <FaFileExcel />
                    </button>
                    
                    {invoice.status === 'pending' && (
                      <button
                        className="btn-primary"
                        onClick={() => handlePayInvoice(invoice._id)}
                      >
                        <FaWallet /> Pay Now
                      </button>
                    )}
                    
                    {invoice.status === 'paid' && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleDownloadInvoice(invoice._id, 'pdf')}
                      >
                        <FaReceipt /> View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">
            <FaFileInvoiceDollar />
            <p>No invoices found</p>
            <p className="no-data-sub">Your invoices will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  // Transactions Tab Component
  const TransactionsTab = () => (
    <div className="transactions-tab">
      <div className="tab-header">
        <h3>Payment History</h3>
        <div className="header-actions">
          <div className="filter-buttons">
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
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
            
            <input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
            
            <button
              className="btn-secondary"
              onClick={() => handleExportData('excel')}
            >
              <FaFileExcel /> Export to Excel
            </button>
          </div>
        </div>
      </div>

      <div className="transactions-list">
        {loading ? (
          <div className="loading-data">
            <FaSpinner className="spinner" />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="transactions-table">
              <div className="table-header">
                <div className="table-cell">Date</div>
                <div className="table-cell">Description</div>
                <div className="table-cell">Freelancer</div>
                <div className="table-cell">Payment Method</div>
                <div className="table-cell">Amount</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Actions</div>
              </div>
              
              {transactions.map(transaction => (
                <div key={transaction._id} className="table-row">
                  <div className="table-cell">
                    {formatDate(transaction.date)}
                  </div>
                  <div className="table-cell">
                    <strong>{transaction.description}</strong>
                    {transaction.invoiceNumber && (
                      <small>Invoice #{transaction.invoiceNumber}</small>
                    )}
                  </div>
                  <div className="table-cell">
                    {transaction.freelancerName || 'Freelancer'}
                  </div>
                  <div className="table-cell">
                    <span className="payment-method">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      {transaction.paymentMethod?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`amount ${transaction.type === 'payment' ? 'negative' : 'positive'}`}>
                      {transaction.type === 'payment' ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                  <div className="table-cell">
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="table-cell">
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => console.log('View transaction:', transaction)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-icon"
                        title="Download Receipt"
                        onClick={() => handleDownloadInvoice(transaction.invoiceId, 'pdf')}
                        disabled={!transaction.invoiceId}
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-data">
            <FaHistory />
            <p>No transactions found</p>
            <p className="no-data-sub">Your payment history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  // Main Tabs Navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'invoices', label: 'Invoices', icon: <FaFileInvoiceDollar /> },
    { id: 'transactions', label: 'Transactions', icon: <FaHistory /> },
    { id: 'receipts', label: 'Receipts', icon: <FaReceipt /> }
  ];

  if (error && !clientProfile) {
    return (
      <div className="billing-error">
        <div className="error-content">
          <FaExclamationTriangle />
          <h3>Unable to Load Billing Data</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-billing-container">
      <div className="billing-header">
        <h1>Billing & Invoices</h1>
        <p>Manage your invoices, payments, and billing history</p>
      </div>
      
      {/* Client Info Bar */}
      <div className="client-info-bar">
        <div className="client-details">
          <div className="client-avatar">
            {clientProfile?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h4>{clientProfile?.name || 'Client'}</h4>
            <p>{clientProfile?.email || 'No email'}</p>
          </div>
        </div>
        <div className="client-stats">
          <div className="stat-item">
            <span>Total Spent</span>
            <strong>{formatCurrency(billingStats?.transactions?.totalAmount || 0)}</strong>
          </div>
          <div className="stat-item">
            <span>Active Invoices</span>
            <strong>{billingStats?.invoices?.pending || 0}</strong>
          </div>
          <div className="stat-item">
            <span>On-time Payments</span>
            <strong>{billingStats?.billing?.onTimePercentage || 0}%</strong>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="billing-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {loading && activeTab !== 'overview' ? (
          <div className="loading-full">
            <FaSpinner className="spinner" />
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'receipts' && (
              <div className="receipts-tab">
                <div className="no-data">
                  <FaReceipt />
                  <p>Receipts feature coming soon</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientBillingInvoices;