import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileContract, FaCheckCircle, FaClock, FaTimesCircle,
  FaFilter, FaSort, FaEye, FaDownload, FaUser,
  FaMoneyBillWave, FaCalendar, FaChartLine, FaSearch,
  FaExclamationTriangle, FaEdit, FaPercentage,
  FaSignature, FaFileSignature, FaFolderOpen
} from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from "../config";
import './ContractsManagement.css';

const ContractsManagement = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest',
    search: ''
  });
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [changeRequest, setChangeRequest] = useState('');
  const [freelancerSignature, setFreelancerSignature] = useState('');

  useEffect(() => {
    fetchContracts();
    fetchContractStats();
  }, [filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/contracts/freelancer/contracts`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined
        }
      });

      console.log('📋 Contracts API Response:', response.data);

      if (response.data.success) {
        let sortedContracts = response.data.contracts || [];

        // Apply sorting
        switch (filters.sortBy) {
          case 'newest':
            sortedContracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'oldest':
            sortedContracts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case 'value_high':
            sortedContracts.sort((a, b) => (b.totalBudget || 0) - (a.totalBudget || 0));
            break;
          case 'value_low':
            sortedContracts.sort((a, b) => (a.totalBudget || 0) - (b.totalBudget || 0));
            break;
          default:
            break;
        }

        console.log(`✅ Loaded ${sortedContracts.length} contracts`);
        setContracts(sortedContracts);
      } else {
        console.error('❌ Failed to fetch contracts:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/contracts/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.overview || {});
      }
    } catch (error) {
      console.error('❌ Error fetching contract stats:', error);
    }
  };

  const handleContractAction = async (contractId, action, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let data = {};

      switch (action) {
        case 'sign':
          endpoint = `contracts/${contractId}/sign`;
          break;
        case 'decline':
          endpoint = `contracts/${contractId}/decline`;
          data = { declineReason: reason };
          break;
        case 'request-changes':
          endpoint = `contracts/${contractId}/request-changes`;
          data = { requestedChanges: reason };
          break;
        default:
          return;
      }

      const response = await axios({
        method: action === 'sign' ? 'put' : 'post',
        url: `${API_URL}/freelancer/${endpoint}`,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert(`✅ Contract ${action === 'sign' ? 'signed' : action === 'decline' ? 'declined' : 'changes requested'} successfully!`);

        // Update local state
        setContracts(prev => prev.map(contract =>
          contract._id === contractId ? {
            ...contract,
            status: action === 'sign' ? 'signed' : action === 'decline' ? 'declined' : 'pending_changes',
            freelancerSigned: action === 'sign' ? true : contract.freelancerSigned
          } : contract
        ));

        fetchContractStats(); // Refresh stats
        setShowActionModal(false);
        setShowSignatureModal(false);
        setChangeRequest('');
        setActionType('');
        setFreelancerSignature('');
      }
    } catch (error) {
      console.error('❌ Error performing contract action:', error);
      alert(`❌ Failed to ${action} contract: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewDetails = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/freelancer/contracts/${contractId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedContract(response.data.contract);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('❌ Error fetching contract details:', error);
      alert('Failed to load contract details');
    }
  };

  const openSignatureModal = (contract) => {
    console.log('📝 Opening signature modal for contract:', contract.contractId);
    setSelectedContract(contract);
    setShowSignatureModal(true);
    setFreelancerSignature('');
  };

  const openActionModal = (contract, action) => {
    setSelectedContract(contract);
    setActionType(action);
    setShowActionModal(true);
  };



 const handleFreelancerSignContract = async () => {
  if (!selectedContract) return;

  const contractId = selectedContract._id || selectedContract.contractId;
  const token = localStorage.getItem("token");

  console.log('🔍 Signing contract debug:', {
    contractId,
    selectedContract: selectedContract,
    freelancerSignature: freelancerSignature.trim(),
    API_URL: API_URL
  });

  try {
    const response = await axios.put(
      `${API_URL}/api/contracts/freelancer/contracts/${contractId}/sign`,
      { signature: freelancerSignature.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Sign contract response:', response.data);

    if (response.data.success) {
      setShowSignatureModal(false);
      setFreelancerSignature("");
      fetchContracts();
      alert("Contract signed successfully!");
    } else {
      alert(response.data.message || "Failed to sign contract");
    }
  } catch (error) {
    console.error("Error signing contract:", {
      error: error,
      response: error.response?.data,
      status: error.response?.status
    });
    alert(error.response?.data?.message || "Error signing contract");
  }
};



  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'pending':
      case 'sent':
        return 'contracts-status-pending';
      case 'signed':
      case 'active':
        return 'contracts-status-active';
      case 'completed':
        return 'contracts-status-completed';
      case 'cancelled':
      case 'declined':
      case 'disputed':
        return 'contracts-status-cancelled';
      case 'changes_requested':
      case 'pending_changes':
        return 'contracts-status-changes';
      default:
        return 'contracts-status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
      case 'pending':
      case 'sent':
        return <FaClock />;
      case 'signed':
      case 'active':
        return <FaCheckCircle />;
      case 'completed':
        return <FaCheckCircle />;
      case 'cancelled':
      case 'declined':
      case 'disputed':
        return <FaTimesCircle />;
      case 'changes_requested':
      case 'pending_changes':
        return <FaEdit />;
      default:
        return <FaClock />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Stats Cards Component
  const ContractsStats = () => (
    <div className="contracts-stats-grid">
      <div className="contracts-stat-card">
        <div className="contracts-stat-icon contracts-stat-total">
          <FaFileContract />
        </div>
        <div className="contracts-stat-content">
          <h3>{stats.totalContracts || 0}</h3>
          <p>Total Contracts</p>
        </div>
      </div>

      <div className="contracts-stat-card">
        <div className="contracts-stat-icon contracts-stat-pending">
          <FaClock />
        </div>
        <div className="contracts-stat-content">
          <h3>{stats.pendingContracts || contracts.filter(c => ['sent', 'pending'].includes(c.status)).length}</h3>
          <p>Pending Review</p>
          <div className="contracts-stat-subtext">
            Awaiting your action
          </div>
        </div>
      </div>

      <div className="contracts-stat-card">
        <div className="contracts-stat-icon contracts-stat-active">
          <FaCheckCircle />
        </div>
        <div className="contracts-stat-content">
          <h3>{stats.activeContracts || contracts.filter(c => c.status === 'active').length}</h3>
          <p>Active Projects</p>
          <div className="contracts-stat-subtext">
            Currently working
          </div>
        </div>
      </div>

      <div className="contracts-stat-card">
        <div className="contracts-stat-icon contracts-stat-value">
          <FaMoneyBillWave />
        </div>
        <div className="contracts-stat-content">
          <h3>{formatCurrency(stats.totalEarnings || contracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0))}</h3>
          <p>Total Value</p>
        </div>
      </div>
    </div>
  );

  // Contract Card Component
  const ContractCard = ({ contract }) => {
    const canSign = ['sent', 'pending', 'draft'].includes(contract.status) && !contract.freelancerSigned;
    const canViewWorkspace = contract.status === 'active' && contract.workspaceId;

    return (
      <div className="contracts-card">
        <div className="contracts-card-header">
          <div className="contracts-project-info">
            <h4 className="contracts-project-title">{contract.title || 'Untitled Contract'}</h4>
            <div className="contracts-client-info">
              <FaUser className="contracts-client-icon" />
              <span className="contracts-client-name">
                {contract.clientId?.name || contract.clientName || 'Unknown Client'}
              </span>
              {contract.clientId?.rating && (
                <span className="contracts-client-rating">
                  ⭐ {contract.clientId.rating}
                </span>
              )}
            </div>
          </div>
          <div className="contracts-status">
            <span className={`contracts-status-badge ${getStatusColor(contract.status)}`}>
              {getStatusIcon(contract.status)}
              {contract.status?.replace('_', ' ').charAt(0).toUpperCase() + contract.status?.slice(1).replace('_', ' ') || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="contracts-card-content">
          <div className="contracts-terms-grid">
            <div className="contracts-term-item">
              <FaMoneyBillWave className="contracts-term-icon" />
              <div className="contracts-term-details">
                <span className="contracts-term-label">Contract Value</span>
                <span className="contracts-term-value">
                  {formatCurrency(contract.totalBudget)}
                </span>
              </div>
            </div>

            <div className="contracts-term-item">
              <FaCalendar className="contracts-term-icon" />
              <div className="contracts-term-details">
                <span className="contracts-term-label">Timeline</span>
                <span className="contracts-term-value">
                  {contract.timeline || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="contracts-term-item">
              <FaPercentage className="contracts-term-icon" />
              <div className="contracts-term-details">
                <span className="contracts-term-label">Phases</span>
                <span className="contracts-term-value">
                  {contract.phases?.length || 0} phases
                </span>
              </div>
            </div>
          </div>

          <div className="contracts-description">
            <p>{contract.terms?.substring(0, 120) || 'No specific terms provided...'}</p>
          </div>
        </div>

        <div className="contracts-card-footer">
          <div className="contracts-dates">
            <span className="contracts-date">Created: {formatDate(contract.createdAt)}</span>
            {contract.updatedAt !== contract.createdAt && (
              <span className="contracts-date">Updated: {formatDate(contract.updatedAt)}</span>
            )}
          </div>
          <div className="contracts-actions">
            <button
              className="contracts-view-btn"
              onClick={() => handleViewDetails(contract.contractId || contract._id)}
            >
              <FaEye /> View Details
            </button>

            {canSign && (
              <button
                className="contracts-sign-btn"
                onClick={() => openSignatureModal(contract)}
              >
                <FaSignature /> Sign Contract
              </button>
            )}

            {contract.status === 'pending' && !canSign && (
              <div className="contracts-action-buttons">
                <button
                  className="contracts-accept-btn"
                  onClick={() => openSignatureModal(contract)}
                >
                  <FaSignature /> Sign & Accept
                </button>
                <button
                  className="contracts-request-btn"
                  onClick={() => openActionModal(contract, 'request-changes')}
                >
                  <FaEdit /> Request Changes
                </button>
                <button
                  className="contracts-decline-btn"
                  onClick={() => openActionModal(contract, 'decline')}
                >
                  <FaTimesCircle /> Decline
                </button>
              </div>
            )}

            {contract.status === 'active' && contract.workspaceId && (
              <button
                className="workspace-btn"
                onClick={() => navigate(`/workspace/${contract.workspaceId}`)}>
                <FaFolderOpen /> Open Workspace
              </button>
            )}

            {contract.status === 'active' && !canViewWorkspace && (
              <button className="contracts-download-btn">
                <FaDownload /> Download
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Signature Modal Component
  const SignatureModal = () => (
    <div className={`contracts-modal ${showSignatureModal ? 'contracts-modal-show' : ''}`}>
      <div className="contracts-modal-content">
        <div className="contracts-modal-header">
          <h3>Digital Signature</h3>
          <button
            className="contracts-modal-close"
            onClick={() => {
              setShowSignatureModal(false);
              setFreelancerSignature('');
            }}
          >
            ×
          </button>
        </div>

        <div className="contracts-modal-body">
          {selectedContract && (
            <div className="contracts-signature-content">
              <div className="contracts-signature-instructions">
                <FaFileSignature className="contracts-signature-icon" />
                <h4>Sign Contract: {selectedContract.title}</h4>
                <p>
                  By providing your digital signature, you agree to all terms
                  and conditions of this contract. Your signature will be
                  legally binding.
                </p>
              </div>

              <div className="contracts-signature-preview">
                <div className="contracts-signature-preview-header">
                  <h5>Contract Summary</h5>
                </div>
                <div className="contracts-signature-preview-content">
                  <p><strong>Project:</strong> {selectedContract.title || 'Untitled Contract'}</p>
                  <p><strong>Client:</strong> {selectedContract.clientId?.name || selectedContract.clientName || 'Unknown Client'}</p>
                  <p><strong>Total Value:</strong> {formatCurrency(selectedContract.totalBudget)}</p>
                  <p><strong>Timeline:</strong> {selectedContract.timeline || 'Not specified'}</p>
                  <p><strong>Service Type:</strong> {selectedContract.serviceType || 'Not specified'}</p>
                </div>
              </div>

              <div className="contracts-signature-input">
                <label>Your Digital Signature *</label>
                <p className="contracts-signature-help">
                  Type your full legal name as your digital signature
                </p>
                <input
                  type="text"
                  value={freelancerSignature}
                  onChange={(e) => {
                    e.preventDefault();
                    setFreelancerSignature(e.target.value);
                  }}
                  placeholder="Enter your full name (e.g., John Doe)"
                  className="contracts-signature-field"
                />
                <div className="contracts-signature-example">
                  <small>Example: John Alexander Doe</small>
                </div>
              </div>

              <div className="contracts-signature-warning">
                <FaExclamationTriangle />
                <div>
                  <strong>Important:</strong>
                  <ul>
                    <li>This is a legally binding digital signature</li>
                    <li>Ensure you have read and understood all terms</li>
                    <li>Your signature cannot be changed after submission</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="contracts-modal-footer">
          <button
            className="contracts-cancel-btn"
            onClick={() => {
              setShowSignatureModal(false);
              setFreelancerSignature('');
            }}
          >
            Cancel
          </button>
          <button
            className="contracts-sign-submit-btn"
            onClick={handleFreelancerSignContract}
            disabled={!freelancerSignature.trim()}
          >
            <FaSignature /> Sign Contract
          </button>

        </div>
      </div>
    </div>
  );

  // Contract Details Modal
  const ContractDetailsModal = () => (
    <div className={`contracts-modal ${showDetailsModal ? 'contracts-modal-show' : ''}`}>
      <div className="contracts-modal-content contracts-modal-large">
        <div className="contracts-modal-header">
          <h3>Contract Details</h3>
          <button
            className="contracts-modal-close"
            onClick={() => setShowDetailsModal(false)}
          >
            ×
          </button>
        </div>

        <div className="contracts-modal-body">
          {selectedContract && (
            <div className="contracts-details">
              <div className="contracts-details-header">
                <h4>{selectedContract.title || 'Untitled Contract'}</h4>
                <span className={`contracts-status-badge ${getStatusColor(selectedContract.status)}`}>
                  {getStatusIcon(selectedContract.status)}
                  {selectedContract.status?.replace('_', ' ').charAt(0).toUpperCase() + selectedContract.status?.slice(1).replace('_', ' ') || 'Unknown'}
                </span>
              </div>

              <div className="contracts-details-section">
                <h5>Client Information</h5>
                <div className="contracts-client-details">
                  <p><strong>Name:</strong> {selectedContract.clientId?.name || selectedContract.clientName || 'Unknown'}</p>
                  {selectedContract.clientId?.email && <p><strong>Email:</strong> {selectedContract.clientId.email}</p>}
                  {selectedContract.clientId?.companyName && <p><strong>Company:</strong> {selectedContract.clientId.companyName}</p>}
                  {selectedContract.clientId?.phone && <p><strong>Phone:</strong> {selectedContract.clientId.phone}</p>}
                </div>
              </div>

              <div className="contracts-details-section">
                <h5>Contract Terms</h5>
                <div className="contracts-terms-details">
                  <div className="contracts-terms-grid-detailed">
                    <div className="contracts-term-detailed">
                      <strong>Total Value:</strong>
                      <span>{formatCurrency(selectedContract.totalBudget)}</span>
                    </div>
                    <div className="contracts-term-detailed">
                      <strong>Timeline:</strong>
                      <span>{selectedContract.timeline || 'Not specified'}</span>
                    </div>
                    <div className="contracts-term-detailed">
                      <strong>Service Type:</strong>
                      <span>{selectedContract.serviceType || 'Not specified'}</span>
                    </div>
                    <div className="contracts-term-detailed">
                      <strong>Start Date:</strong>
                      <span>{formatDate(selectedContract.startDate)}</span>
                    </div>
                    {selectedContract.endDate && (
                      <div className="contracts-term-detailed">
                        <strong>End Date:</strong>
                        <span>{formatDate(selectedContract.endDate)}</span>
                      </div>
                    )}
                    <div className="contracts-term-detailed">
                      <strong>Contract ID:</strong>
                      <span className="contract-id">{selectedContract.contractId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedContract.phases && selectedContract.phases.length > 0 && (
                <div className="contracts-details-section">
                  <h5>Payment Phases</h5>
                  <div className="contracts-milestones-list">
                    {selectedContract.phases.map((phase, index) => (
                      <div key={index} className="contracts-milestone-item">
                        <div className="contracts-milestone-header">
                          <span className="contracts-milestone-title">{phase.title || `Phase ${phase.phase}`}</span>
                          <span className="contracts-milestone-amount">{formatCurrency(phase.amount)}</span>
                        </div>
                        <div className="contracts-milestone-dates">
                          <span className={`contracts-milestone-status ${phase.status}`}>
                            Status: {phase.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="contracts-details-section">
                <h5>Signature Status</h5>
                <div className="contracts-signature-status">
                  <div className="contracts-signature-status-item">
                    <strong>Client Signature:</strong>
                    <span className={selectedContract.clientSigned ? 'signed' : 'unsigned'}>
                      {selectedContract.clientSigned ? '✓ Signed' : '✗ Not Signed'}
                      {selectedContract.clientSignedAt && ` on ${formatDate(selectedContract.clientSignedAt)}`}
                    </span>
                  </div>
                  <div className="contracts-signature-status-item">
                    <strong>Your Signature:</strong>
                    <span className={selectedContract.freelancerSigned ? 'signed' : 'unsigned'}>
                      {selectedContract.freelancerSigned ? '✓ Signed' : '✗ Not Signed'}
                      {selectedContract.freelancerSignedAt && ` on ${formatDate(selectedContract.freelancerSignedAt)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="contracts-details-section">
                <h5>Terms & Conditions</h5>
                <div className="contracts-terms-content">
                  <p>{selectedContract.terms || 'No specific terms and conditions provided.'}</p>
                </div>
              </div>

              <div className="contracts-details-section">
                <h5>Timeline</h5>
                <div className="contracts-timeline">
                  <p><strong>Created:</strong> {formatDate(selectedContract.createdAt)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(selectedContract.updatedAt)}</p>
                  {selectedContract.freelancerSignedAt && (
                    <p><strong>You Signed:</strong> {formatDate(selectedContract.freelancerSignedAt)}</p>
                  )}
                  {selectedContract.clientSignedAt && (
                    <p><strong>Client Signed:</strong> {formatDate(selectedContract.clientSignedAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="contracts-modal-footer">
          <button
            className="contracts-close-btn"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
          {selectedContract && ['sent', 'pending', 'draft'].includes(selectedContract.status) && !selectedContract.freelancerSigned && (
            <div className="contracts-modal-actions">
              <button
                className="contracts-sign-btn"
                onClick={() => openSignatureModal(contract)}
              >
                <FaSignature /> Sign Contract
              </button>

              <button
                className="contracts-request-btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  setTimeout(() => openActionModal(selectedContract, 'request-changes'), 100);
                }}
              >
                <FaEdit /> Request Changes
              </button>
              <button
                className="contracts-decline-btn"
                onClick={() => {
                  setShowDetailsModal(false);
                  setTimeout(() => openActionModal(selectedContract, 'decline'), 100);
                }}
              >
                <FaTimesCircle /> Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Action Modal (Accept/Decline/Request Changes)
  const ActionModal = () => (
    <div className={`contracts-modal ${showActionModal ? 'contracts-modal-show' : ''}`}>
      <div className="contracts-modal-content">
        <div className="contracts-modal-header">
          <h3>
            {actionType === 'sign' && 'Accept Contract'}
            {actionType === 'decline' && 'Decline Contract'}
            {actionType === 'request-changes' && 'Request Changes'}
          </h3>
          <button
            className="contracts-modal-close"
            onClick={() => {
              setShowActionModal(false);
              setChangeRequest('');
              setActionType('');
            }}
          >
            ×
          </button>
        </div>

        <div className="contracts-modal-body">
          {selectedContract && (
            <div className="contracts-action-content">
              <p>
                {actionType === 'sign' && 'Are you sure you want to accept this contract? This will start the project.'}
                {actionType === 'decline' && 'Please provide a reason for declining this contract:'}
                {actionType === 'request-changes' && 'Please specify what changes you would like to request:'}
              </p>

              {(actionType === 'decline' || actionType === 'request-changes') && (
                <div className="contracts-reason-input">
                  <textarea
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder={
                      actionType === 'decline'
                        ? 'Enter your reason for declining...'
                        : 'Describe the changes you would like...'
                    }
                    rows="4"
                    className="contracts-reason-textarea"
                  />
                </div>
              )}

              <div className="contracts-action-warning">
                <FaExclamationTriangle />
                <span>
                  {actionType === 'sign' && 'By accepting, you agree to all terms and conditions.'}
                  {actionType === 'decline' && 'This action cannot be undone. The client will be notified.'}
                  {actionType === 'request-changes' && 'The client will review your requested changes and may update the contract.'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="contracts-modal-footer">
          <button
            className="contracts-cancel-btn"
            onClick={() => {
              setShowActionModal(false);
              setChangeRequest('');
              setActionType('');
            }}
          >
            Cancel
          </button>
          <button
            className={
              actionType === 'sign' ? 'contracts-accept-btn' :
                actionType === 'decline' ? 'contracts-decline-btn' :
                  'contracts-request-btn'
            }
            onClick={() => handleContractAction(selectedContract.contractId || selectedContract._id, actionType, changeRequest)}
            disabled={(actionType === 'decline' || actionType === 'request-changes') && !changeRequest.trim()}
          >
            {actionType === 'sign' && 'Accept Contract'}
            {actionType === 'decline' && 'Decline Contract'}
            {actionType === 'request-changes' && 'Submit Changes Request'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="contracts-management">
      <div className="contracts-header">
        <h1 className="contracts-title">Contract Management</h1>
        <p className="contracts-subtitle">Review and manage your project contracts</p>
      </div>

      <ContractsStats />

      <div className="contracts-controls">
        <div className="contracts-filters">
          <div className="contracts-filter-group">
            <label className="contracts-filter-label">Status</label>
            <select
              className="contracts-filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Contracts</option>
              <option value="sent">Sent (Pending Signature)</option>
              <option value="pending">Pending Review</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="contracts-filter-group">
            <label className="contracts-filter-label">Sort By</label>
            <select
              className="contracts-filter-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="value_high">Value (High to Low)</option>
              <option value="value_low">Value (Low to High)</option>
            </select>
          </div>

          <div className="contracts-search-group">
            <label className="contracts-filter-label">Search Contracts</label>
            <div className="contracts-search">
              <FaSearch className="contracts-search-icon" />
              <input
                type="text"
                className="contracts-search-input"
                placeholder="Search by project name or client..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              {filters.search && (
                <button
                  className="contracts-search-clear"
                  onClick={() => setFilters({ ...filters, search: '' })}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="contracts-controls-actions">
          <button
            className="contracts-filter-reset"
            onClick={() => setFilters({ status: 'all', sortBy: 'newest', search: '' })}
          >
            Reset Filters
          </button>
          <div className="contracts-summary">
            <span className="contracts-count">
              {contracts.length} contract{contracts.length !== 1 ? 's' : ''} found
            </span>
            {contracts.filter(c => ['sent', 'pending'].includes(c.status)).length > 0 && (
              <span className="contracts-pending-count">
                ({contracts.filter(c => ['sent', 'pending'].includes(c.status)).length} pending)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="contracts-content">
        {loading ? (
          <div className="contracts-loading">
            <div className="contracts-loading-spinner"></div>
            <p>Loading your contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="contracts-empty">
            <FaFileContract className="contracts-empty-icon" />
            <h3>No contracts found</h3>
            <p>
              {filters.status !== 'all' || filters.search
                ? 'Try adjusting your filters to see more contracts.'
                : "You don't have any contracts yet. Keep submitting proposals to receive contract offers!"
              }
            </p>
          </div>
        ) : (
          <div className="contracts-list">
            {contracts.map(contract => (
              <ContractCard key={contract.contractId || contract._id} contract={contract} />
            ))}
          </div>
        )}
      </div>

      <SignatureModal />
      <ContractDetailsModal />
      <ActionModal />
    </div>
  );
};

export default ContractsManagement;