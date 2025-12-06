// ContractsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaArrowLeft,
    FaFileContract,
    FaCheck,
    FaTimes,
    FaClock,
    FaDollarSign,
    FaCalendarAlt,
    FaUser,
    FaDownload,
    FaEdit,
    FaEye,
    FaSearch,
    FaFilter,
    FaExclamationTriangle,
    FaPlus,
    FaChartBar,
    FaSpinner,
    FaFolderOpen,
    FaFolderPlus
} from 'react-icons/fa';
import { API_URL } from '../Config';
import './ContractsPage.css';

const ContractsPage = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [selectedContract, setSelectedContract] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy data for fallback
    const dummyContracts = [
        {
            _id: '1',
            contractId: 'CT-2024-001',
            title: 'E-commerce Website Development',
            serviceType: 'Web Development',
            status: 'active',
            totalBudget: 5000,
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            clientSigned: true,
            freelancerSigned: true,
            clientSignedAt: '2024-01-10',
            freelancerSignedAt: '2024-01-12',
            phases: [
                { phase: 1, title: 'Design & Planning', amount: 1500, status: 'paid' },
                { phase: 2, title: 'Frontend Development', amount: 2000, status: 'in-progress' },
                { phase: 3, title: 'Backend Integration', amount: 1500, status: 'pending' }
            ],
            freelancer: {
                _id: 'f1',
                name: 'Sarah Johnson',
                rating: 4.8,
                profilePhoto: null
            }
        }
    ];

    useEffect(() => {
        fetchContracts();
        fetchContractStats();
    }, []);

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/client/contracts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Log the response to check for workspaceId
            console.log('Contracts API Response:', response.data);

            setContracts(response.data.contracts || response.data);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            // Add workspaceId to dummy data
            setContracts(dummyContracts.map(contract => ({
                ...contract,
                workspaceId: 'demo-workspace-id'
            })));
        } finally {
            setLoading(false);
        }
    };

    const fetchContractStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/client/contracts/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching contract stats:', error);
            // Set default stats
            setStats({
                totalContracts: dummyContracts.length,
                activeContracts: dummyContracts.filter(c => c.status === 'active').length,
                completedContracts: 0,
                pendingSignatures: dummyContracts.filter(c => c.status === 'sent').length,
                totalContractValue: dummyContracts.reduce((sum, c) => sum + c.totalBudget, 0),
                totalPaid: dummyContracts.reduce((sum, c) =>
                    sum + c.phases.filter(p => p.status === 'paid').reduce((amt, p) => amt + p.amount, 0), 0)
            });
        }
    };

    const handleSignContract = async (contractId) => {
        try {
            const token = localStorage.getItem('token');

            // 1. CLIENT SIGNS THE CONTRACT
            const response = await axios.put(
                `${API_URL}/api/client/contracts/${contractId}/sign`,
                { signature: "Digital Signature" },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("Sign response:", response.data);

            if (!response.data.success) {
                alert(response.data.message || "Failed to sign contract");
                return;
            }

            let workspaceId =
                response.data.contract?.workspaceId ||
                response.data.workspaceId ||
                null;

            // 2. IF BACKEND DIDN'T AUTO-CREATE WORKSPACE, CALL CREATE-WORKSPACE ENDPOINT
            if (!workspaceId) {
                try {
                    const createRes = await axios.post(
                        `${API_URL}/client/contracts/${contractId}/create-workspace`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    workspaceId =
                        createRes.data.workspace?.workspaceId ||
                        createRes.data.workspaceId ||
                        null;
                } catch (err) {
                    console.error("Create workspace error:", err.response?.data || err.message);
                }
            }

            // 3. REDIRECT TO WORKSPACE
            if (workspaceId) {
                alert("Workspace ready. Redirecting…");
                navigate(`/workspace/${workspaceId}`);
                return;
            }

            // 4. FALLBACK IF WORKSPACE STILL NULL
            alert("Contract signed. Waiting for workspace.");
            fetchContracts();

        } catch (error) {
            console.error("Sign error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Error signing contract");
        }
    };


    const handleSendContract = async (contractId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/client/contracts/${contractId}/send`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                alert('Contract sent to freelancer!');
                fetchContracts();
            }
        } catch (error) {
            console.error('Error sending contract:', error);
            alert('Failed to send contract');
        }
    };

    const handleCancelContract = async (contractId) => {
        if (!window.confirm('Are you sure you want to cancel this contract?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/client/contracts/${contractId}/cancel`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                alert('Contract cancelled successfully!');
                fetchContracts();
            }
        } catch (error) {
            console.error('Error cancelling contract:', error);
            alert('Failed to cancel contract');
        }
    };

    // NEW: Add handleCreateWorkspace function
    const handleCreateWorkspace = async (contractId, contractTitle) => {
        if (!window.confirm(`Create workspace for contract: "${contractTitle}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            console.log('🔄 Creating workspace for contract:', contractId);

            const response = await axios.post(
                `${API_URL}/client/contracts/${contractId}/create-workspace`,
                { forceCreate: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Create workspace response:', response.data);

            if (response.data.success) {
                const { workspaceId, action } = response.data;

                if (action === 'created' || action === 'created_fallback') {
                    alert(`✅ Workspace created successfully! ID: ${workspaceId}\nRedirecting to workspace...`);
                    navigate(`/workspace/${workspaceId}`);
                } else if (action === 'existing') {
                    alert(`ℹ️ Workspace already exists. Redirecting...`);
                    navigate(`/workspace/${workspaceId}`);
                }

                // Refresh contracts list
                fetchContracts();
            } else {
                alert(`❌ ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error creating workspace:', error);
            alert(error.response?.data?.message || 'Failed to create workspace');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { class: 'contract-status-draft', label: 'Draft' },
            sent: { class: 'contract-status-sent', label: 'Sent' },
            pending: { class: 'contract-status-pending', label: 'Pending' },
            signed: { class: 'contract-status-signed', label: 'Signed' },
            active: { class: 'contract-status-active', label: 'Active' },
            completed: { class: 'contract-status-completed', label: 'Completed' },
            cancelled: { class: 'contract-status-cancelled', label: 'Cancelled' },
            disputed: { class: 'contract-status-disputed', label: 'Disputed' }
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <span className={`contract-status-badge ${config.class}`}>{config.label}</span>;
    };

    const calculateTotalPaid = (phases) => {
        return phases.filter(phase => phase.status === 'paid')
            .reduce((total, phase) => total + phase.amount, 0);
    };

    const getCurrentPhase = (phases) => {
        return phases.find(phase =>
            ['pending', 'in-progress'].includes(phase.status)
        ) || phases[phases.length - 1];
    };

    const filteredContracts = contracts.filter(contract => {
        const matchesFilter = filter === 'all' || contract.status === filter;
        const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.contractId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    if (loading) {
        return (
            <div className="contracts-loading-state">
                <FaSpinner className="contracts-loading-spinner" />
                <p>Loading contracts...</p>
            </div>
        );
    }

    return (
        <div className="contracts-management-page">
            <div className="contracts-management-container">
                {/* Header */}
                <div className="contracts-management-header">
                    <button
                        className="contracts-back-button"
                        onClick={() => navigate('/dashboard')}>
                        <FaArrowLeft />
                        Back to Dashboard
                    </button>
                    <div className="contracts-header-content">
                        <h1 className="contracts-page-title">Contracts Management</h1>
                        <p className="contracts-page-subtitle">
                            Manage your freelance contracts and agreements
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="contracts-stats-overview">
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon total-contracts">
                            <FaFileContract />
                        </div>
                        <div className="contract-stat-info">
                            <h3>{stats.totalContracts || contracts.length}</h3>
                            <p>Total Contracts</p>
                        </div>
                    </div>
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon active-contracts">
                            <FaCheck />
                        </div>
                        <div className="contract-stat-info">
                            <h3>{stats.activeContracts || contracts.filter(c => c.status === 'active').length}</h3>
                            <p>Active Contracts</p>
                        </div>
                    </div>
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon completed-contracts">
                            <FaChartBar />
                        </div>
                        <div className="contract-stat-info">
                            <h3>{stats.completedContracts || contracts.filter(c => c.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon pending-contracts">
                            <FaClock />
                        </div>
                        <div className="contract-stat-info">
                            <h3>{stats.pendingSignatures || contracts.filter(c => c.status === 'sent').length}</h3>
                            <p>Pending Signatures</p>
                        </div>
                    </div>
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon total-value">
                            <FaDollarSign />
                        </div>
                        <div className="contract-stat-info">
                            <h3>${stats.totalContractValue || contracts.reduce((sum, c) => sum + c.totalBudget, 0)}</h3>
                            <p>Total Contract Value</p>
                        </div>
                    </div>
                    <div className="contract-stat-card">
                        <div className="contract-stat-icon total-paid">
                            <FaDollarSign />
                        </div>
                        <div className="contract-stat-info">
                            <h3>${stats.totalPaid || contracts.reduce((sum, c) => sum + calculateTotalPaid(c.phases), 0)}</h3>
                            <p>Total Paid</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="contracts-controls-panel">
                    <div className="contracts-search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="contracts-filter-controls">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="contracts-filter-select">
                            <option value="all">All Contracts</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button
                        className="contracts-primary-button"
                        onClick={() => navigate('/contracts/create')}>
                        <FaPlus />
                        Create New Contract
                    </button>
                </div>

                {/* Contracts List */}
                <div className="contracts-list-container">
                    {filteredContracts.length === 0 ? (
                        <div className="contracts-empty-state">
                            <FaFileContract className="contracts-empty-icon" />
                            <h3>No contracts found</h3>
                            <p>There are no contracts matching your current filter.</p>
                            <button
                                className="contracts-primary-button"
                                onClick={() => navigate('/contracts/create')}
                            >
                                Create Your First Contract
                            </button>
                        </div>
                    ) : (
                        filteredContracts.map((contract) => (
                            <ContractCard
                                key={contract._id}
                                contract={contract}
                                onSign={handleSignContract}
                                onSend={handleSendContract}
                                onCancel={handleCancelContract}
                                onViewDetails={() => setSelectedContract(contract)}
                                onCreateWorkspace={handleCreateWorkspace}
                                calculateTotalPaid={calculateTotalPaid}
                                getCurrentPhase={getCurrentPhase}
                                getStatusBadge={getStatusBadge}
                                formatDate={formatDate} />
                        ))
                    )}
                </div>
            </div>

            {/* Contract Detail Modal */}
            {selectedContract && (
                <ContractDetailModal
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                    onCreateWorkspace={handleCreateWorkspace}
                    calculateTotalPaid={calculateTotalPaid}
                    getCurrentPhase={getCurrentPhase}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

// Contract Card Component - UPDATED
const ContractCard = ({
    contract,
    onSign,
    onSend,
    onCancel,
    onViewDetails,
    onCreateWorkspace,
    calculateTotalPaid,
    getCurrentPhase,
    getStatusBadge,
    formatDate
}) => {
    const totalPaid = calculateTotalPaid(contract.phases);
    const currentPhase = getCurrentPhase(contract.phases);
    const navigate = useNavigate();

    // Check if contract has valid workspace ID
    const hasValidWorkspaceId = contract.workspaceId &&
        contract.workspaceId !== 'null' &&
        contract.workspaceId !== null &&
        contract.workspaceId !== 'demo-workspace-id';

    return (
        <div className="contract-card-item">
            <div className="contract-card-header">
                <div className="contract-card-basic-info">
                    <h3 className="contract-card-title">{contract.title}</h3>
                    <span className="contract-card-id">{contract.contractId}</span>
                </div>
                <div className="contract-card-meta">
                    {getStatusBadge(contract.status)}
                    <span className="contract-card-date">
                        <FaCalendarAlt />
                        {formatDate(contract.startDate)} - {contract.endDate ? formatDate(contract.endDate) : 'Ongoing'}
                    </span>
                </div>
            </div>

            <div className="contract-card-content">
                <div className="contract-card-parties">
                    <div className="contract-party-info">
                        <strong>Service:</strong> {contract.serviceType}
                    </div>
                    {contract.freelancer && (
                        <div className="contract-party-info">
                            <strong>Freelancer:</strong> {contract.freelancer.name}
                        </div>
                    )}
                </div>

                <div className="contract-card-financials">
                    <div className="contract-financial-item">
                        <FaDollarSign />
                        <span>Total: ${contract.totalBudget}</span>
                    </div>
                    <div className="contract-financial-item">
                        <FaCheck />
                        <span>Paid: ${totalPaid}</span>
                    </div>
                    <div className="contract-financial-item">
                        <FaClock />
                        <span>Due: ${contract.totalBudget - totalPaid}</span>
                    </div>
                </div>

                <div className="contract-card-progress">
                    <div className="contract-progress-info">
                        <strong>Current Phase:</strong> {currentPhase?.title}
                    </div>
                    <div className="contract-phase-status">
                        <span className={`contract-phase-badge ${currentPhase?.status}`}>
                            {currentPhase?.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="contract-card-actions">
                <button className="contracts-secondary-button" onClick={onViewDetails}>
                    <FaEye />
                    View Details
                </button>

                {contract.status === 'draft' && (
                    <button className="contracts-primary-button" onClick={() => onSend(contract._id)}>
                        <FaCheck />
                        Send to Freelancer
                    </button>
                )}

                {/* {contract.status === 'sent' && !contract.clientSigned && (
                    <button className="contracts-primary-button" onClick={() => onSign(contract._id)}>
                        <FaCheck />
                        Sign Contract
                    </button>
                )} */}

                {['draft', 'sent', 'pending', 'active'].includes(contract.status) && (
                    <button className="contracts-cancel-button" onClick={() => onCancel(contract._id)}>
                        <FaTimes />
                        Cancel
                    </button>
                )}

                {/* ✅ Create Workspace Button (for active contracts without workspace) */}
             
                {contract.status === 'active' && contract.workspaceId && contract.workspaceId !== 'null' && (
                    <button
                        className="workspace-btn"
                        onClick={() => navigate(`/workspace/${contract.workspaceId}`)}>
                        <FaFolderOpen /> Open Workspace
                    </button>
                )}

                {contract.status === 'active' && (!contract.workspaceId || contract.workspaceId === 'null') && (
                    <button
                        className="workspace-create-btn"
                        onClick={() => onCreateWorkspace(contract.contractId, contract.title)}>
                        <FaFolderPlus /> Create Workspace
                    </button>
                )}
            </div>
        </div>
    );
};

// Contract Detail Modal Component - UPDATED
const ContractDetailModal = ({
    contract,
    onClose,
    onCreateWorkspace,
    calculateTotalPaid,
    getCurrentPhase,
    formatDate
}) => {
    const navigate = useNavigate();
    const totalPaid = calculateTotalPaid(contract.phases);
    const currentPhase = getCurrentPhase(contract.phases);

    // Check if contract has valid workspace ID
    const hasValidWorkspaceId = contract.workspaceId &&
        contract.workspaceId !== 'null' &&
        contract.workspaceId !== null &&
        contract.workspaceId !== 'demo-workspace-id';

    return (
        <div className="contract-modal-overlay">
            <div className="contract-detail-modal">
                <div className="contract-modal-header">
                    <h2>Contract Details</h2>
                    <button className="contract-modal-close" onClick={onClose}>×</button>
                </div>

                <div className="contract-modal-content">
                    <div className="contract-modal-section">
                        <h3>Contract Information</h3>
                        <div className="contract-detail-grid">
                            <div className="contract-detail-item">
                                <label>Contract ID</label>
                                <p>{contract.contractId}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Title</label>
                                <p>{contract.title}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Service Type</label>
                                <p>{contract.serviceType}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Status</label>
                                <p className={`contract-status-text ${contract.status}`}>{contract.status}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Workspace</label>
                                <p>
                                    {hasValidWorkspaceId ? (
                                        <span className="workspace-status-active">
                                            ✅ Available (ID: {contract.workspaceId.substring(0, 15)}...)
                                        </span>
                                    ) : (
                                        <span className="workspace-status-missing">
                                            ❌ Not Created
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="contract-modal-section">
                        <h3>Timeline</h3>
                        <div className="contract-detail-grid">
                            <div className="contract-detail-item">
                                <label>Start Date</label>
                                <p>{formatDate(contract.startDate)}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>End Date</label>
                                <p>{contract.endDate ? formatDate(contract.endDate) : 'Not set'}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Client Signed</label>
                                <p>{contract.clientSignedAt ? formatDate(contract.clientSignedAt) : 'Not signed'}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Freelancer Signed</label>
                                <p>{contract.freelancerSignedAt ? formatDate(contract.freelancerSignedAt) : 'Not signed'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="contract-modal-section">
                        <h3>Financial Summary</h3>
                        <div className="contract-financial-grid">
                            <div className="contract-financial-card">
                                <FaDollarSign />
                                <div>
                                    <label>Total Budget</label>
                                    <p>${contract.totalBudget}</p>
                                </div>
                            </div>
                            <div className="contract-financial-card">
                                <FaCheck />
                                <div>
                                    <label>Amount Paid</label>
                                    <p>${totalPaid}</p>
                                </div>
                            </div>
                            <div className="contract-financial-card">
                                <FaClock />
                                <div>
                                    <label>Balance Due</label>
                                    <p>${contract.totalBudget - totalPaid}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contract-modal-section">
                        <h3>Phases & Milestones</h3>
                        <div className="contract-phases-list">
                            {contract.phases.map((phase) => (
                                <div key={phase.phase} className={`contract-phase-item ${phase.status}`}>
                                    <div className="contract-phase-header">
                                        <h4>Phase {phase.phase}: {phase.title}</h4>
                                        <span className={`contract-phase-status-badge ${phase.status}`}>
                                            {phase.status}
                                        </span>
                                    </div>
                                    <div className="contract-phase-details">
                                        <span className="contract-phase-amount">${phase.amount}</span>
                                        {phase.completedDate && (
                                            <span className="contract-phase-date">
                                                Completed: {formatDate(phase.completedDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {contract.terms && (
                        <div className="contract-modal-section">
                            <h3>Terms & Conditions</h3>
                            <div className="contract-terms-content">
                                <p>{contract.terms}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="contract-modal-actions">
                    <button className="contracts-secondary-button" onClick={onClose}>
                        Close
                    </button>
                    <button className="contracts-primary-button">
                        <FaDownload />
                        Download PDF
                    </button>

                    {/* ✅ Create Workspace Button (for active contracts without workspace) */}
                    {contract.status === 'active' && !hasValidWorkspaceId && (
                        <button
                            className="workspace-create-btn"
                            onClick={() => onCreateWorkspace(contract._id || contract.contractId, contract.title)}
                        >
                            <FaFolderPlus /> Create Workspace
                        </button>
                    )}

                    {/* ✅ Open Workspace Button (for active contracts with valid workspace) */}
                    {contract.status === 'active' && hasValidWorkspaceId && (
                        <button
                            className="workspace-btn"
                            onClick={() => navigate(`/workspace/${contract.workspaceId}`)}
                        >
                            <FaFolderOpen /> Open Workspace
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractsPage;