import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaArrowLeft,
    FaUser,
    FaStar,
    FaCheck,
    FaTimes,
    FaFileAlt,
    FaEye,
    FaDownload,
    FaClock,
    FaDollarSign,
    FaCalendarAlt
} from 'react-icons/fa';
import './ProposalsPage.css';

const ProposalsPage = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProposals();
    }, []);

    const formatDate = (dateString) => {
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
const fetchProposals = async () => {
    try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get('http://localhost:3000/api/client/proposals', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Proposals API Response:', response.data);
        
        // FIX: Check if response.data.proposals exists and is an array
        if (response.data.proposals && Array.isArray(response.data.proposals)) {
            const transformedProposals = response.data.proposals.map(proposal => {
                console.log('Processing proposal:', proposal);
                
                // Handle different response structures
                const freelancerData = proposal.freelancerId || proposal.freelancer || {};
                const projectData = proposal.projectId || proposal.project || {};
                
                // ⭐️ FIX: Extract freelancer name CORRECTLY
                let freelancerName = 'Unknown Freelancer';
                let freelancerId = '';
                
                if (typeof freelancerData === 'object' && freelancerData !== null) {
                    freelancerName = freelancerData.name || 
                                   freelancerData.profile?.name || 
                                   freelancerData.fullName || 
                                   'Unknown Freelancer';
                    freelancerId = freelancerData._id || freelancerData.id || '';
                } else if (typeof freelancerData === 'string') {
                    // If it's just an ID string, we need to fetch details separately
                    freelancerId = freelancerData;
                    freelancerName = 'Unknown Freelancer';
                }
                
                // ⭐️ FIX: Extract project title
                let projectTitle = 'Project';
                let projectId = '';
                
                if (typeof projectData === 'object' && projectData !== null) {
                    projectTitle = projectData.title || 'Project';
                    projectId = projectData._id || projectData.id || '';
                } else if (typeof projectData === 'string') {
                    projectId = projectData;
                    projectTitle = 'Project';
                }
                
                // Get bid amount
                let bidAmount = 0;
                if (proposal.bidAmount) {
                    bidAmount = proposal.bidAmount;
                } else if (proposal.proposalDetails?.totalAmount) {
                    bidAmount = proposal.proposalDetails.totalAmount;
                } else if (proposal.amount) {
                    bidAmount = proposal.amount;
                }
                
                // Get timeline
                let estimatedTimeline = 30;
                if (proposal.estimatedTimeline) {
                    estimatedTimeline = proposal.estimatedTimeline;
                } else if (proposal.proposalDetails?.estimatedDays) {
                    estimatedTimeline = proposal.proposalDetails.estimatedDays;
                } else if (proposal.estimatedDays) {
                    estimatedTimeline = proposal.estimatedDays;
                }
                
                // ⭐️ FIX: Return COMPLETE data for contract creation
                return {
                    _id: proposal._id || proposal.id,
                    status: proposal.status || 'pending',
                    bidAmount: bidAmount,
                    estimatedTimeline: `${estimatedTimeline} days`,
                    coverLetter: proposal.coverLetter || 
                               proposal.proposalDetails?.coverLetter || 
                               proposal.description || 
                               '',
                    submittedAt: proposal.createdAt || proposal.submittedAt || new Date().toISOString(),
                    attachments: proposal.attachments || [],
                    projectTitle: projectTitle,
                    projectId: projectId,
                    
                    // ⭐️ CRITICAL FIX: Include ALL necessary data for contract
                    proposalId: proposal._id || proposal.id,
                    freelancerId: freelancerId,
                    freelancerName: freelancerName,
                    serviceType: proposal.serviceType || projectData.category || 'Web Development',
                    
                    // Freelancer data
                    freelancer: {
                        _id: freelancerId,
                        name: freelancerName,
                        title: freelancerData.title || freelancerData.profile?.title || 'Freelancer',
                        avatar: freelancerData.avatar || freelancerData.profile?.avatar || freelancerData.profilePicture || null,
                        rating: freelancerData.rating || freelancerData.profile?.rating || 4.5,
                        completedProjects: freelancerData.completedProjects || 
                                         freelancerData.freelancerStats?.completedProjects || 
                                         freelancerData.stats?.completedProjects || 
                                         0,
                        skills: freelancerData.skills || freelancerData.profile?.skills || [],
                        location: freelancerData.location || freelancerData.profile?.location || ''
                    }
                };
            });
            
            console.log('✅ Transformed proposals:', transformedProposals);
            setProposals(transformedProposals);
        } else {
            console.warn('⚠️ No proposals found or invalid response structure:', response.data);
            setProposals([]);
        }
    } catch (error) {
        console.error('❌ Error fetching proposals:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        let errorMessage = 'Failed to load proposals';
        if (error.response?.status === 401) {
            errorMessage = 'Please login again';
            navigate('/login');
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        
        alert(`❌ ${errorMessage}`);
        setProposals([]);
    } finally {
        setLoading(false);
    }
};
const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to accept this proposal?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName'); // ⭐️ GET CLIENT NAME
        
        console.log('🚀 Accepting proposal:', proposalId, 'User ID:', userId, 'Client Name:', userName);
        
        // 1. Mark proposal as accepted in backend
        console.log('📤 Updating proposal status to "accepted" in backend...');
        const acceptResponse = await axios.post(
            `http://localhost:3000/api/client/proposals/${proposalId}/accept`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!acceptResponse.data.success) {
            throw new Error(acceptResponse.data.message || 'Failed to accept proposal in backend');
        }
        
        console.log('✅ Proposal accepted in backend:', acceptResponse.data);
        
        // 2. Get the proposal from our local state
        const localProposal = proposals.find(p => p._id === proposalId);
        
        if (!localProposal) {
            throw new Error('Proposal not found in local data');
        }
        
        // ⭐️⭐️⭐️ CRITICAL FIX: Extract freelancer name properly ⭐️⭐️⭐️
        let freelancerName = 'Freelancer';
        let freelancerId = '';
        
        // Check multiple locations for freelancer info
        if (localProposal.freelancer && typeof localProposal.freelancer === 'object') {
            freelancerName = localProposal.freelancer.name || localProposal.freelancer.username || 'Freelancer';
            freelancerId = localProposal.freelancer._id || localProposal.freelancer.id || '';
        } else if (localProposal.freelancerName) {
            freelancerName = localProposal.freelancerName;
        } else if (localProposal.freelancerId && typeof localProposal.freelancerId === 'object') {
            freelancerName = localProposal.freelancerId.name || localProposal.freelancerId.username || 'Freelancer';
            freelancerId = localProposal.freelancerId._id || '';
        }
        
        console.log('✅ Extracted freelancer info:', { freelancerName, freelancerId });
        
        // 3. Prepare COMPLETE contract data
        const contractData = {
            // Proposal info
            proposalId: localProposal._id || localProposal.proposalId,
            
            // ⭐️ CRITICAL: Freelancer info (MUST have name)
            freelancerId: freelancerId || localProposal.freelancerId?._id || localProposal.freelancerId,
            freelancerName: freelancerName,
            
            // ⭐️ CRITICAL: Client info (from localStorage)
            clientId: userId,
            clientName: userName || 'Client',
            
            // Project info
            projectTitle: localProposal.projectTitle || localProposal.project?.title || 'Project',
            projectId: localProposal.projectId || localProposal.project?._id,
            bidAmount: localProposal.bidAmount || localProposal.amount || 0,
            estimatedTimeline: `${localProposal.estimatedTimeline || localProposal.estimatedDays || 30} days`,
            serviceType: localProposal.serviceType || 'Development',
            
            // Additional info for contract
            coverLetter: localProposal.coverLetter,
            skills: localProposal.freelancer?.skills || localProposal.skills || [],
            rating: localProposal.freelancer?.rating || 0,
            
            // Status info
            acceptedAt: new Date().toISOString(),
            backendResponse: acceptResponse.data
        };
        
        console.log('📋 Prepared COMPLETE contract data:', contractData);
        
        // 4. Store in localStorage as RELIABLE backup (KEY FIX)
        localStorage.setItem('acceptedProposalData', JSON.stringify({
            ...contractData,
            storedAt: new Date().toISOString(),
            source: 'ProposalsPage_handleAcceptProposal'
        }));
        
        console.log('💾 Saved to localStorage as "acceptedProposalData"');
        
        // 5. Update local state
        setProposals(prev => prev.map(p => 
            p._id === proposalId ? { 
                ...p, 
                status: 'accepted', 
                acceptedAt: new Date().toISOString() 
            } : p
        ));
        
        // 6. Navigate to create contract page WITH COMPLETE DATA
        console.log('➡️ Navigating to contract creation page with complete data...');
        navigate('/contracts/create', {
            state: contractData,
            replace: true // Prevent going back to proposals
        });
        
    } catch (error) {
        console.error('❌ Error accepting proposal:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        let errorMessage = 'Failed to accept proposal';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        if (error.response?.status === 404) {
            errorMessage = 'Proposal not found. It may have been deleted.';
        } else if (error.response?.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
            navigate('/login');
        } else if (error.response?.status === 403) {
            errorMessage = 'You do not have permission to accept this proposal.';
        }
        
        alert(`❌ ${errorMessage}`);
    }
};


const handleRejectProposal = async (proposalId) => {
        if (!window.confirm('Are you sure you want to reject this proposal?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/proposals/${proposalId}/reject`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Proposal rejected successfully.');
                fetchProposals(); // Refresh the list
            } else {
                alert(response.data.message || 'Failed to reject proposal');
            }
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            alert(error.response?.data?.message || 'Failed to reject proposal');
        }
    };

    const filteredProposals = proposals.filter(proposal => {
        if (filter === 'all') return true;
        if (filter === 'accepted') {
            return proposal.status === 'accepted' || proposal.status === 'contract_sent';
        }
        return proposal.status === filter;
    });

    const downloadAttachment = (attachment) => {
        if (attachment && attachment.url) {
            window.open(attachment.url, '_blank');
        } else {
            alert('Attachment URL is not available');
        }
    };

    if (loading) {
        return (
            <div className="proposals-loading">
                <div className="loading-spinner"></div>
                <p>Loading proposals...</p>
            </div>
        );
    }

    return (
        <div className="proposals-page">
            <div className="proposals-container">
                {/* Header */}
                <div className="proposals-header">
                    <button
                        className="back-navigation"
                        onClick={() => navigate('/dashboard')}>
                        <FaArrowLeft />
                        Back to Dashboard
                    </button>
                    <div className="header-content">
                        <h1 className="page-title">Project Proposals</h1>
                        <p className="page-subtitle">
                            Review and manage proposals from talented freelancers
                        </p>
                    </div>
                </div>

                {/* Stats and Filters */}
                <div className="proposals-controls">
                    <div className="proposals-stats">
                        <div className="stat-item">
                            <span className="stat-number">{proposals.length}</span>
                            <span className="stat-label">Total Proposals</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {proposals.filter(p => p.status === 'pending' || p.status === 'submitted').length}
                            </span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {proposals.filter(p => p.status === 'accepted' || p.status === 'contract_sent').length}
                            </span>
                            <span className="stat-label">Accepted</span>
                        </div>
                    </div>

                    <div className="filter-controls">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Proposals</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="contract_sent">Contract Sent</option>
                        </select>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="proposals-list">
                    {filteredProposals.length === 0 ? (
                        <div className="no-proposals">
                            <FaFileAlt className="no-proposals-icon" />
                            <h3>No proposals found</h3>
                            <p>There are no proposals matching your current filter.</p>
                        </div>
                    ) : (
                        filteredProposals.map((proposal) => (
                            <ProposalCard
                                key={proposal._id}
                                proposal={proposal}
                                formatDate={formatDate}
                                onAccept={handleAcceptProposal}
                                onReject={handleRejectProposal}
                                onViewProfile={() => navigate(`/freelancer/profile/${proposal.freelancer?._id || 'unknown'}`)}
                                onViewDetails={() => setSelectedProposal(proposal)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Proposal Detail Modal */}
            {selectedProposal && (
                <ProposalDetailModal
                    proposal={selectedProposal}
                    formatDate={formatDate}
                    onClose={() => setSelectedProposal(null)}
                    onDownload={downloadAttachment}
                    onViewProfile={() => {
                        navigate(`/freelancer/profile/${selectedProposal.freelancer?._id || 'unknown'}`);
                        setSelectedProposal(null);
                    }}
                    onAccept={() => {
                        handleAcceptProposal(selectedProposal._id);
                        setSelectedProposal(null);
                    }}
                    onReject={() => {
                        handleRejectProposal(selectedProposal._id);
                        setSelectedProposal(null);
                    }}
                />
            )}
        </div>
    );
};

// Proposal Card Component
const ProposalCard = ({ proposal, formatDate, onAccept, onReject, onViewProfile, onViewDetails }) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending Review' },
            accepted: { class: 'status-accepted', label: 'Accepted' },
            rejected: { class: 'status-rejected', label: 'Rejected' },
            submitted: { class: 'status-pending', label: 'Submitted' },
            under_review: { class: 'status-pending', label: 'Under Review' },
            contract_sent: { class: 'status-contract-sent', label: 'Contract Sent' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    const freelancer = proposal?.freelancer || {};
    const status = proposal?.status || 'pending';
    const coverLetter = proposal?.coverLetter || 'No cover letter provided.';
    const bidAmount = proposal?.bidAmount || 0;
    const estimatedTimeline = proposal?.estimatedTimeline || 30;
    const submittedAt = proposal?.submittedAt || proposal?.createdAt || new Date().toISOString();
    const attachments = proposal?.attachments || [];
    const skills = freelancer?.skills || [];

    return (
        <div className="proposal-card">
            <div className="proposal-header">
                <div className="freelancer-info">
                    <div className="freelancer-avatar">
                        {freelancer?.avatar ? (
                            <img
                                src={freelancer.avatar}
                                alt={freelancer?.name || 'Freelancer'}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                <FaUser />
                            </div>
                        )}
                    </div>
                    <div className="freelancer-details">
                        <h3 className="freelancer-name">{freelancer?.name || 'Unknown Freelancer'}</h3>
                        <div className="freelancer-meta">
                            <span className="freelancer-title">{freelancer?.title || 'Freelancer'}</span>
                            <div className="rating">
                                <FaStar className="star-icon" />
                                <span>{freelancer?.rating?.toFixed(1) || '4.5'}</span>
                                <span className="review-count">
                                    ({freelancer?.completedProjects || 0} projects)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="proposal-meta">
                    {getStatusBadge(status)}
                    <span className="proposal-date">
                        <FaClock />
                        {formatDate(submittedAt)}
                    </span>
                </div>
            </div>

            <div className="proposal-content">
                <div className="proposal-text">
                    <p>{coverLetter.length > 200 ? `${coverLetter.substring(0, 200)}...` : coverLetter}</p>
                </div>

                <div className="proposal-details">
                    <div className="detail-item">
                        <FaDollarSign />
                        <span>Bid: ${bidAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                        <FaCalendarAlt />
                        <span>Timeline: {estimatedTimeline} days</span>
                    </div>
                    {attachments.length > 0 && (
                        <div className="detail-item">
                            <FaFileAlt />
                            <span>{attachments.length} attachment(s)</span>
                        </div>
                    )}
                </div>

                {skills.length > 0 && (
                    <div className="skills-section">
                        <h4>Skills:</h4>
                        <div className="skills-tags">
                            {skills.slice(0, 5).map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))}
                            {skills.length > 5 && (
                                <span className="skill-tag-more">
                                    +{skills.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="proposal-actions">
                <button
                    className="btn-secondary"
                    onClick={onViewDetails}
                >
                    <FaEye />
                    View Details
                </button>
                <button
                    className="btn-secondary"
                    onClick={onViewProfile}
                >
                    <FaUser />
                    View Profile
                </button>
                {(status === 'pending' || status === 'submitted' || status === 'under_review') && (
                    <>
                        <button
                            className="btn-reject"
                            onClick={() => onReject(proposal?._id)}
                        >
                            <FaTimes />
                            Reject
                        </button>
                        <button
                            className="btn-accept"
                            onClick={() => onAccept(proposal?._id)}
                        >
                            <FaCheck />
                            Accept Proposal
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Proposal Detail Modal Component
const ProposalDetailModal = ({ proposal, formatDate, onClose, onDownload, onViewProfile, onAccept, onReject }) => {
    const freelancer = proposal?.freelancer || {};
    const status = proposal?.status || 'pending';
    const bidAmount = proposal?.bidAmount || 0;
    const estimatedTimeline = proposal?.estimatedTimeline || 30;
    const submittedAt = proposal?.submittedAt || proposal?.createdAt || new Date().toISOString();
    const coverLetter = proposal?.coverLetter || 'No cover letter provided.';
    const attachments = proposal?.attachments || [];
    const skills = freelancer?.skills || [];
    const projectTitle = proposal?.projectTitle || 'Project';

    return (
        <div className="modal-overlay">
            <div className="proposal-modal">
                <div className="modal-header">
                    <h2>Proposal Details</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    <div className="modal-section">
                        <h3>Project Information</h3>
                        <div className="project-info">
                            <p><strong>Project:</strong> {projectTitle}</p>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>Freelancer Information</h3>
                        <div className="freelancer-detail">
                            <div className="detail-avatar">
                                {freelancer?.avatar ? (
                                    <img
                                        src={freelancer.avatar}
                                        alt={freelancer?.name || 'Freelancer'}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div className="detail-info">
                                <h4>{freelancer?.name || 'Unknown Freelancer'}</h4>
                                <p>{freelancer?.title || 'Freelancer'}</p>
                                <div className="detail-rating">
                                    <FaStar className="star-icon" />
                                    <span>{freelancer?.rating?.toFixed(1) || '4.5'}</span>
                                    <span>({freelancer?.completedProjects || 0} projects completed)</span>
                                </div>
                                <button className="btn-profile" onClick={onViewProfile}>
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>Proposal Details</h3>
                        <div className="proposal-detail-grid">
                            <div className="detail-card">
                                <FaDollarSign />
                                <div>
                                    <label>Bid Amount</label>
                                    <p>${bidAmount.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="detail-card">
                                <FaCalendarAlt />
                                <div>
                                    <label>Estimated Timeline</label>
                                    <p>{estimatedTimeline} days</p>
                                </div>
                            </div>
                            <div className="detail-card">
                                <FaClock />
                                <div>
                                    <label>Submitted</label>
                                    <p>{formatDate(submittedAt)}</p>
                                </div>
                            </div>
                            <div className="detail-card">
                                <div>
                                    <label>Status</label>
                                    <p className={`status-text status-${status}`}>
                                        {status === 'pending' ? 'Pending Review' :
                                         status === 'accepted' ? 'Accepted' :
                                         status === 'rejected' ? 'Rejected' :
                                         status === 'submitted' ? 'Submitted' :
                                         status === 'under_review' ? 'Under Review' :
                                         status === 'contract_sent' ? 'Contract Sent' : status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>Cover Letter</h3>
                        <div className="cover-letter">
                            <p>{coverLetter}</p>
                        </div>
                    </div>

                    {attachments.length > 0 && (
                        <div className="modal-section">
                            <h3>Attachments ({attachments.length})</h3>
                            <div className="attachments-list">
                                {attachments.map((attachment, index) => (
                                    <div key={index} className="attachment-item">
                                        <FaFileAlt />
                                        <span className="attachment-name">{attachment.name || `Attachment ${index + 1}`}</span>
                                        <button
                                            className="btn-download"
                                            onClick={() => onDownload(attachment)}
                                        >
                                            <FaDownload />
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {skills.length > 0 && (
                        <div className="modal-section">
                            <h3>Skills & Expertise</h3>
                            <div className="skills-grid">
                                {skills.map((skill, index) => (
                                    <span key={index} className="skill-tag-large">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {(status === 'pending' || status === 'submitted' || status === 'under_review') && (
                        <div className="action-buttons">
                            <button className="btn-reject" onClick={onReject}>
                                <FaTimes />
                                Reject Proposal
                            </button>
                            <button className="btn-accept" onClick={onAccept}>
                                <FaCheck />
                                Accept Proposal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProposalsPage;