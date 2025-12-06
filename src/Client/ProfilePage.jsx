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

    // DUMMY DATA - Keep for reference/testing
    const dummyProposals = [
        {
            _id: '1',
            status: 'pending',
            bidAmount: 1500,
            estimatedTimeline: 30,
            coverLetter: 'I am very interested in your e-commerce website project. With 5 years of experience in React and Node.js, I have built similar platforms for clients in the past. I can deliver a fully functional, responsive e-commerce site with payment integration and admin dashboard within your timeline.',
            submittedAt: '2024-01-15T10:30:00Z',
            attachments: [
                { name: 'portfolio.pdf', url: '#', type: 'pdf' },
                { name: 'previous-work.zip', url: '#', type: 'zip' }
            ],
            freelancer: {
                _id: 'f1',
                name: 'Sarah Johnson',
                title: 'Senior Full Stack Developer',
                profilePhoto: null,
                rating: 4.8,
                completedProjects: 47,
                skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'TypeScript', 'AWS'],
                location: 'New York, USA'
            }
        },
        // ... rest of dummy data
    ];

    const navigate = useNavigate();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔄 Fetching proposals...');
            
            const response = await axios.get('http://localhost:3000/api/client/proposals', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('📦 API Response:', response.data);
            
            if (response.data.proposals && Array.isArray(response.data.proposals)) {
                // Transform backend data to match frontend structure
                const transformedProposals = response.data.proposals.map(proposal => {
                    const freelancerData = proposal.freelancerId || proposal.freelancer || {};
                    
                    return {
                        _id: proposal._id || `proposal_${Date.now()}`,
                        status: proposal.status || 'pending',
                        bidAmount: proposal.proposalDetails?.totalAmount || 
                                   proposal.bidAmount || 
                                   proposal.totalAmount || 
                                   0,
                        estimatedTimeline: proposal.proposalDetails?.estimatedDays || 
                                         proposal.estimatedTimeline || 
                                         proposal.estimatedDays || 
                                         30,
                        coverLetter: proposal.coverLetter || 
                                    proposal.proposalDetails?.coverLetter || 
                                    'No cover letter provided.',
                        submittedAt: proposal.createdAt || proposal.submittedAt || new Date().toISOString(),
                        attachments: proposal.attachments || [],
                        freelancer: {
                            _id: freelancerData._id || `freelancer_${Date.now()}`,
                            name: freelancerData.profile?.name || 
                                  freelancerData.name || 
                                  'Unknown Freelancer',
                            title: freelancerData.profile?.title || 
                                   freelancerData.title || 
                                   'Freelancer',
                            profilePhoto: freelancerData.profile?.avatar || 
                                         freelancerData.avatar || 
                                         freelancerData.profilePhoto || 
                                         null,
                            rating: freelancerData.rating || 
                                   freelancerData.profile?.rating || 
                                   4.5,
                            completedProjects: freelancerData.freelancerStats?.completedProjects || 
                                             freelancerData.completedProjects || 
                                             0,
                            skills: freelancerData.skills || [],
                            location: freelancerData.profile?.location || 
                                     freelancerData.location || 
                                     ''
                        }
                    };
                });
                
                console.log('🔄 Transformed proposals:', transformedProposals);
                setProposals(transformedProposals);
            } else {
                console.log('⚠️ No proposals data received, using dummy data');
                // Fallback to dummy data for testing
                setProposals(dummyProposals);
            }
        } catch (error) {
            console.error('❌ Error fetching proposals:', error);
            console.log('🔄 Using dummy data as fallback');
            // Fallback to dummy data on error
            setProposals(dummyProposals);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProposal = async (proposalId) => {
        if (!window.confirm('Are you sure you want to accept this proposal? This will notify the freelancer and move to contract phase.')) {
            return;
        }
        
        // Update local state immediately
        setProposals(prev => prev.map(p =>
            p._id === proposalId ? { ...p, status: 'accepted' } : p
        ));
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/proposals/${proposalId}/accept`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                alert('Proposal accepted! Freelancer has been notified.');
                fetchProposals(); // Refresh the list
                // Navigate to create contract if needed
                if (response.data.freelancerId && response.data.projectId) {
                    navigate('/contracts/create', {
                        state: {
                            proposalId: proposalId,
                            freelancerId: response.data.freelancerId,
                            projectId: response.data.projectId
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error accepting proposal:', error);
            alert(error.response?.data?.message || 'Failed to accept proposal');
            // Revert local state on error
            fetchProposals();
        }
    };

    const handleRejectProposal = async (proposalId) => {
        if (!window.confirm('Are you sure you want to reject this proposal?')) {
            return;
        }

        // Update local state immediately
        setProposals(prev => prev.map(p =>
            p._id === proposalId ? { ...p, status: 'rejected' } : p
        ));
        
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
                alert('Proposal rejected.');
                fetchProposals(); // Refresh
            }
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            alert(error.response?.data?.message || 'Failed to reject proposal');
            // Revert local state on error
            fetchProposals();
        }
    };

    const filteredProposals = proposals.filter(proposal => {
        if (filter === 'all') return true;
        return proposal.status === filter;
    });

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

    const downloadAttachment = (attachment) => {
        window.open(attachment.url, '_blank');
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
                                {proposals.filter(p => p.status === 'pending').length}
                            </span>
                            <span className="stat-label">Pending</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {proposals.filter(p => p.status === 'accepted').length}
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
                                onAccept={handleAcceptProposal}
                                onReject={handleRejectProposal}
                                onViewProfile={() => navigate(`/freelancer/${proposal.freelancer?._id || 'unknown'}`)}
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
                    onClose={() => setSelectedProposal(null)}
                    onDownload={downloadAttachment}
                    onViewProfile={() => {
                        navigate(`/freelancer/${selectedProposal.freelancer?._id || 'unknown'}`);
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
const ProposalCard = ({ proposal, onAccept, onReject, onViewProfile, onViewDetails }) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { class: 'status-pending', label: 'Pending Review' },
            accepted: { class: 'status-accepted', label: 'Accepted' },
            rejected: { class: 'status-rejected', label: 'Rejected' },
            submitted: { class: 'status-pending', label: 'Submitted' },
            under_review: { class: 'status-pending', label: 'Under Review' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    // Safe data extraction
    const freelancer = proposal.freelancer || {};
    const status = proposal.status || 'pending';
    const coverLetter = proposal.coverLetter || 'No cover letter provided.';
    const bidAmount = proposal.bidAmount || 0;
    const estimatedTimeline = proposal.estimatedTimeline || 30;
    const submittedAt = proposal.submittedAt || proposal.createdAt || new Date().toISOString();
    const attachments = proposal.attachments || [];
    const skills = freelancer.skills || [];

    return (
        <div className="proposal-card">
            <div className="proposal-header">
                <div className="freelancer-info">
                    <div className="freelancer-avatar">
                        {freelancer.profilePhoto || freelancer.avatar ? (
                            <img
                                src={freelancer.profilePhoto || freelancer.avatar}
                                alt={freelancer.name || 'Freelancer'}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<FaUser />';
                                }}
                            />
                        ) : (
                            <FaUser />
                        )}
                    </div>
                    <div className="freelancer-details">
                        <h3 className="freelancer-name">{freelancer.name || 'Unknown Freelancer'}</h3>
                        <div className="freelancer-meta">
                            <span className="freelancer-title">{freelancer.title || 'Freelancer'}</span>
                            <div className="rating">
                                <FaStar className="star-icon" />
                                <span>{freelancer.rating || '4.5'}</span>
                                <span className="review-count">
                                    ({freelancer.completedProjects || 0} projects)
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
                {status === 'pending' || status === 'submitted' ? (
                    <>
                        <button
                            className="btn-reject"
                            onClick={() => onReject(proposal._id)}
                        >
                            <FaTimes />
                            Reject
                        </button>
                        <button
                            className="btn-accept"
                            onClick={() => onAccept(proposal._id)}
                        >
                            <FaCheck />
                            Accept Proposal
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

// Proposal Detail Modal Component
const ProposalDetailModal = ({ proposal, onClose, onDownload, onViewProfile, onAccept, onReject }) => {
    // Safe data extraction
    const freelancer = proposal.freelancer || {};
    const status = proposal.status || 'pending';
    const bidAmount = proposal.bidAmount || 0;
    const estimatedTimeline = proposal.estimatedTimeline || 30;
    const submittedAt = proposal.submittedAt || proposal.createdAt || new Date().toISOString();
    const coverLetter = proposal.coverLetter || 'No cover letter provided.';
    const attachments = proposal.attachments || [];
    const skills = freelancer.skills || [];

    return (
        <div className="modal-overlay">
            <div className="proposal-modal">
                <div className="modal-header">
                    <h2>Proposal Details</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    <div className="modal-section">
                        <h3>Freelancer Information</h3>
                        <div className="freelancer-detail">
                            <div className="detail-avatar">
                                {freelancer.profilePhoto || freelancer.avatar ? (
                                    <img
                                        src={freelancer.profilePhoto || freelancer.avatar}
                                        alt={freelancer.name || 'Freelancer'}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<FaUser />';
                                        }}
                                    />
                                ) : (
                                    <FaUser />
                                )}
                            </div>
                            <div className="detail-info">
                                <h4>{freelancer.name || 'Unknown Freelancer'}</h4>
                                <p>{freelancer.title || 'Freelancer'}</p>
                                <div className="detail-rating">
                                    <FaStar className="star-icon" />
                                    <span>{freelancer.rating || '4.5'}</span>
                                    <span>({freelancer.completedProjects || 0} projects completed)</span>
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
                                         status === 'under_review' ? 'Under Review' : status}
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
                    {(status === 'pending' || status === 'submitted') && (
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