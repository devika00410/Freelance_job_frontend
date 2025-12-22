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
import { API_URL } from '../config';
import './ContractsPage.css';

const ContractsPage = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [selectedContract, setSelectedContract] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContracts();
        fetchContractStats();
    }, []);

    const fetchContracts = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 Fetching contracts...');

            const response = await axios.get(`${API_URL}/api/client/contracts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000
            });

            console.log('✅ Contracts API Response:', response.data);

            const contractsData = response.data.contracts || response.data || [];

            // Fetch workspaceId for each contract if not present
            const contractsWithWorkspace = await Promise.all(
                contractsData.map(async (contract) => {
                    if (!contract.workspaceId) {
                        try {
                            const workspaceResponse = await axios.get(
                                `${API_URL}/api/workspaces/contract/${contract._id}`,
                                {
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    timeout: 5000
                                }
                            );
                            if (workspaceResponse.data.workspaceId) {
                                contract.workspaceId = workspaceResponse.data.workspaceId;
                            }
                        } catch (wsError) {
                            console.log(`No workspace found for contract ${contract._id}`);
                        }
                    }
                    return contract;
                })
            );

            setContracts(contractsWithWorkspace);
        } catch (error) {
            console.error('❌ Error fetching contracts:', error);
            // Fetch from contracts page if main endpoint fails
            try {
                const token = localStorage.getItem('token');
                const fallbackResponse = await axios.get(
                    `${API_URL}/api/contracts`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                        timeout: 5000
                    }
                );
                if (fallbackResponse.data) {
                    setContracts(fallbackResponse.data.contracts || fallbackResponse.data || []);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                setContracts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchContractStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/client/contracts/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching contract stats:', error);
            // Calculate stats from contracts
            const totalContracts = contracts.length;
            const activeContracts = contracts.filter(c => c.status === 'active').length;
            const completedContracts = contracts.filter(c => c.status === 'completed').length;
            const pendingSignatures = contracts.filter(c => c.status === 'sent').length;
            const totalContractValue = contracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0);
            const totalPaid = contracts.reduce((sum, c) => {
                const phases = c.phases || [];
                return sum + phases
                    .filter(p => p.status === 'paid')
                    .reduce((amt, p) => amt + (p.amount || 0), 0);
            }, 0);

            setStats({
                totalContracts,
                activeContracts,
                completedContracts,
                pendingSignatures,
                totalContractValue,
                totalPaid
            });
        }
    };

    const handleSignContract = async (contractId) => {
        try {
            const token = localStorage.getItem('token');

            console.log(`✍️ Signing contract ${contractId}...`);

            // 1. Sign the contract
            const signResponse = await axios.put(
                `${API_URL}/api/client/contracts/${contractId}/sign`,
                { signature: "Digital Signature" },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            console.log("Sign response:", signResponse.data);

            if (!signResponse.data.success) {
                alert(signResponse.data.message || "Failed to sign contract");
                return;
            }

            let workspaceId = signResponse.data.contract?.workspaceId ||
                signResponse.data.workspaceId;

            // 2. If no workspace, create one
            if (!workspaceId) {
                try {
                    console.log('🔄 Creating workspace...');
                    const createRes = await axios.post(
                        `${API_URL}/api/contracts/${contractId}/create-workspace`,
                        {},
                        {
                            headers: { 'Authorization': `Bearer ${token}` },
                            timeout: 10000
                        }
                    );

                    workspaceId = createRes.data.workspaceId ||
                        createRes.data.workspace?.workspaceId;

                    console.log('✅ Workspace created:', workspaceId);
                } catch (createError) {
                    console.error("Create workspace error:", createError);
                    // Try alternative endpoint
                    try {
                        const altRes = await axios.post(
                            `${API_URL}/api/workspaces/create-from-contract/${contractId}`,
                            {},
                            { headers: { 'Authorization': `Bearer ${token}` } }
                        );
                        workspaceId = altRes.data.workspaceId;
                    } catch (altError) {
                        console.error("Alternative endpoint also failed:", altError);
                    }
                }
            }

            // 3. Update contract with workspace ID
            if (workspaceId) {
                // Update local state
                setContracts(prev => prev.map(contract =>
                    contract._id === contractId
                        ? { ...contract, workspaceId, status: 'active' }
                        : contract
                ));

                alert("✅ Contract signed! Workspace created.");

                // Redirect to workspace
                setTimeout(() => {
                    navigate(`/client/workspace/${workspaceId}`);
                }, 1000);
            } else {
                alert("✅ Contract signed! Please create workspace manually.");
                fetchContracts();
            }

        } catch (error) {
            console.error("❌ Sign error:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Error signing contract");
        }
    };

    const handleCreateWorkspace = async (contractId, contractTitle) => {
        if (!window.confirm(`Create workspace for contract: "${contractTitle}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            console.log('🔄 Creating workspace for contract:', contractId);

            // Try multiple endpoints for workspace creation
            const endpoints = [
                `${API_URL}/api/contracts/${contractId}/create-workspace`,
                `${API_URL}/api/workspaces/create-from-contract/${contractId}`,
                `${API_URL}/api/client/contracts/${contractId}/create-workspace`
            ];

            let workspaceId = null;
            let success = false;

            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await axios.post(
                        endpoint,
                        {},
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        }
                    );

                    console.log('Create workspace response:', response.data);

                    if (response.data.success || response.data.workspaceId) {
                        workspaceId = response.data.workspaceId ||
                            response.data.workspace?.workspaceId ||
                            response.data.workspace?._id;

                        if (workspaceId) {
                            success = true;
                            console.log(`✅ Workspace created via ${endpoint}:`, workspaceId);
                            break;
                        }
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
                    continue;
                }
            }

            if (success && workspaceId) {
                // Update contract in local state
                setContracts(prev => prev.map(contract =>
                    contract._id === contractId
                        ? { ...contract, workspaceId }
                        : contract
                ));

                alert(`✅ Workspace created successfully! Redirecting...`);

                // Redirect to workspace
                setTimeout(() => {
                    navigate(`/client/workspace/${workspaceId}`);
                }, 1500);
            } else {
                // Fallback: create using contract details
                alert(`⚠️ Could not create workspace via API. Using contract ID as workspace ID.`);

                // Use contract ID as workspace ID for now
                const tempWorkspaceId = contractId;

                // Update contract
                setContracts(prev => prev.map(contract =>
                    contract._id === contractId
                        ? { ...contract, workspaceId: tempWorkspaceId }
                        : contract
                ));

                // Navigate with contract ID as workspace ID
                setTimeout(() => {
                    navigate(`/client/workspace/${tempWorkspaceId}`);
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error creating workspace:', error);
            alert(error.response?.data?.message || 'Failed to create workspace');
        }
    };

    const handleSendContract = async (contractId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/api/client/contracts/${contractId}/send`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200 || response.data.success) {
                alert('✅ Contract sent to freelancer!');
                fetchContracts();
            }
        } catch (error) {
            console.error('❌ Error sending contract:', error);
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
                `${API_URL}/api/client/contracts/${contractId}/cancel`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200 || response.data.success) {
                alert('✅ Contract cancelled successfully!');
                fetchContracts();
            }
        } catch (error) {
            console.error('❌ Error cancelling contract:', error);
            alert('Failed to cancel contract');
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
        const phasesArray = phases || [];
        return phasesArray
            .filter(phase => phase.status === 'paid')
            .reduce((total, phase) => total + (phase.amount || 0), 0);
    };

    const getCurrentPhase = (phases) => {
        const phasesArray = phases || [];
        const current = phasesArray.find(phase =>
            ['pending', 'in-progress', 'awaiting_approval'].includes(phase.status)
        ) || phasesArray[phasesArray.length - 1];
        return current;
    };

    const filteredContracts = contracts.filter(contract => {
        const matchesFilter = filter === 'all' || contract.status === filter;
        const matchesSearch =
            (contract.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (contract.contractId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
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
                            <h3>${stats.totalContractValue || contracts.reduce((sum, c) => sum + (c.totalBudget || 0), 0)}</h3>
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

    const hasValidWorkspaceId = () => {
        const wsId = contract.workspaceId;

        if (!wsId) return false;

        if (typeof wsId === 'string') {
            return wsId.trim() !== '' &&
                wsId !== 'null' &&
                wsId !== 'undefined';
        }

        if (typeof wsId === 'object' && wsId !== null) {
            return wsId._id || wsId.workspaceId || wsId.id;
        }

        return false;
    };

    const hasWorkspace = hasValidWorkspaceId();

    return (
        <div className="contract-card-item">
            <div className="contract-card-header">
                <div className="contract-card-basic-info">
                    <h3 className="contract-card-title">{contract.title || 'Untitled Contract'}</h3>
                    <span className="contract-card-id">{contract.contractId || contract._id}</span>
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
                        <strong>Service:</strong> {contract.serviceType || 'Not specified'}
                    </div>
                    {contract.freelancer && (
                        <div className="contract-party-info">
                            <strong>Freelancer:</strong> {contract.freelancer.name || 'Freelancer'}
                        </div>
                    )}
                </div>

                <div className="contract-card-financials">
                    <div className="contract-financial-item">
                        <FaDollarSign />
                        <span>Total: ${contract.totalBudget || 0}</span>
                    </div>
                    <div className="contract-financial-item">
                        <FaCheck />
                        <span>Paid: ${totalPaid}</span>
                    </div>
                    <div className="contract-financial-item">
                        <FaClock />
                        <span>Due: ${(contract.totalBudget || 0) - totalPaid}</span>
                    </div>
                </div>

                <div className="contract-card-progress">
                    <div className="contract-progress-info">
                        <strong>Current Phase:</strong> {currentPhase?.title || 'No active phase'}
                    </div>
                    <div className="contract-phase-status">
                        <span className={`contract-phase-badge ${currentPhase?.status || 'pending'}`}>
                            {currentPhase?.status || 'pending'}
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

                {contract.status === 'sent' && !contract.clientSigned && (
                    <button className="contracts-primary-button" onClick={() => onSign(contract._id)}>
                        <FaCheck />
                        Sign Contract
                    </button>
                )}

                {['draft', 'sent', 'pending', 'active'].includes(contract.status) && (
                    <button className="contracts-cancel-button" onClick={() => onCancel(contract._id)}>
                        <FaTimes />
                        Cancel
                    </button>
                )}

                {/* Workspace buttons */}
                {/* {contract.status === 'active' && hasValidWorkspaceId && (
                    <button
                        className="workspace-btn"
                        onClick={() => navigate(`/client/workspace/${contract.workspaceId}`)}>
                        <FaFolderOpen /> Open Workspace
                    </button>
                )} */}

                {contract.status === 'active' && hasWorkspace && (
                    <button
                        className="workspace-btn"
                        onClick={() => {
                            // Safely get the workspace ID for navigation
                            let workspaceIdToNavigate = '';
                            if (typeof contract.workspaceId === 'string') {
                                workspaceIdToNavigate = contract.workspaceId;
                            } else if (contract.workspaceId?._id) {
                                workspaceIdToNavigate = contract.workspaceId._id;
                            } else if (contract.workspaceId?.workspaceId) {
                                workspaceIdToNavigate = contract.workspaceId.workspaceId;
                            } else {
                                workspaceIdToNavigate = contract._id; // fallback
                            }
                            navigate(`/client/workspace/${workspaceIdToNavigate}`);
                        }}>
                        <FaFolderOpen /> Open Workspace
                    </button>
                )}

                {contract.status === 'active' && !hasValidWorkspaceId && (
                    <button
                        className="workspace-create-btn"
                        onClick={() => onCreateWorkspace(contract._id, contract.title)}>
                        <FaFolderPlus /> Create Workspace
                    </button>
                )}
            </div>
        </div>
    );
};

// Contract Detail Modal Component
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

    // Helper function to safely render workspace ID
    const renderWorkspaceId = (workspaceId) => {
        if (!workspaceId) return '';

        // If it's a string
        if (typeof workspaceId === 'string') {
            return `(ID: ${workspaceId.substring(0, 10)}...)`;
        }

        // If it's an object with an _id property
        if (workspaceId._id && typeof workspaceId._id === 'string') {
            return `(ID: ${workspaceId._id.substring(0, 10)}...)`;
        }

        // If it's an object with a workspaceId property
        if (workspaceId.workspaceId && typeof workspaceId.workspaceId === 'string') {
            return `(ID: ${workspaceId.workspaceId.substring(0, 10)}...)`;
        }

        // If we can't determine the ID format
        return '(Workspace available)';
    };

    // Update the hasValidWorkspaceId check to be more robust
    const hasValidWorkspaceId = () => {
        const wsId = contract.workspaceId;

        if (!wsId) return false;

        // Check if it's a non-empty string
        if (typeof wsId === 'string') {
            return wsId.trim() !== '' &&
                wsId !== 'null' &&
                wsId !== 'undefined' &&
                wsId !== null;
        }

        // Check if it's an object with an ID
        if (typeof wsId === 'object' && wsId !== null) {
            return wsId._id || wsId.workspaceId || wsId.id;
        }

        return false;
    };

    // Use the function instead of the inline check
    const hasWorkspace = hasValidWorkspaceId();


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
                                <p>{contract.contractId || contract._id}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Title</label>
                                <p>{contract.title || 'Untitled Contract'}</p>
                            </div>
                            <div className="contract-detail-item">
                                <label>Service Type</label>
                                <p>{contract.serviceType || 'Not specified'}</p>
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
                                            ✅ Available {renderWorkspaceId(contract.workspaceId)}
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
                                    <p>${contract.totalBudget || 0}</p>
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
                                    <p>${(contract.totalBudget || 0) - totalPaid}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {contract.phases && contract.phases.length > 0 && (
                        <div className="contract-modal-section">
                            <h3>Phases & Milestones</h3>
                            <div className="contract-phases-list">
                                {contract.phases.map((phase, index) => (
                                    <div key={phase._id || `phase-${index}`} className={`contract-phase-item ${phase.status}`}>
                                        <div className="contract-phase-header">
                                            <h4>Phase {phase.phase || index + 1}: {phase.title || 'Untitled Phase'}</h4>
                                            <span className={`contract-phase-status-badge ${phase.status}`}>
                                                {phase.status}
                                            </span>
                                        </div>
                                        <div className="contract-phase-details">
                                            <span className="contract-phase-amount">${phase.amount || 0}</span>
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
                    )}

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

                    {/* Workspace buttons */}
                    {contract.status === 'active' && hasValidWorkspaceId && (
                        <button
                            className="workspace-btn"
                            onClick={() => navigate(`/client/workspace/${contract._id}`)}>
                            <FaFolderOpen /> Open Workspace
                        </button>
                    )}

                    {contract.status === 'active' && !hasValidWorkspaceId && (
                        <button
                            className="workspace-create-btn"
                            onClick={() => onCreateWorkspace(contract._id, contract.title)}>
                            <FaFolderPlus /> Create Workspace
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractsPage;