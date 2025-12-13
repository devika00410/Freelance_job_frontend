import React, { useState } from 'react';
import { 
  FaCheckCircle, 
  FaEdit, 
  FaExclamationTriangle, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaDollarSign,
  FaCalendarAlt
} from 'react-icons/fa';
import './ClientMilestoneApprovals.css';

const ClientMilestoneApprovals = ({ workspace, milestones = [], loading, onApproveMilestone, onRequestChanges }) => {
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter milestones awaiting approval
  const pendingMilestones = milestones.filter(m => 
    m.status === 'awaiting_approval' || 
    m.status === 'awaiting-approval'
  );

  const completedMilestones = milestones.filter(m => 
    m.status === 'completed' || m.status === 'approved'
  );

  const handleQuickApprove = async (milestoneId) => {
    setSubmitting(true);
    try {
      await onApproveMilestone(milestoneId);
      setActiveMilestone(null);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChangesWithFeedback = async (milestoneId) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for requested changes');
      return;
    }

    setSubmitting(true);
    try {
      await onRequestChanges(milestoneId, feedback);
      setActiveMilestone(null);
      setFeedback('');
    } catch (error) {
      console.error('Request changes failed:', error);
      alert('Failed to request changes');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="client-features-loading">
        <div className="spinner"></div>
        <p>Loading approval tools...</p>
      </div>
    );
  }

  return (
    <div className="client-milestone-approvals">
      {/* Header */}
      <div className="approvals-header">
        <h2>
          <FaCheckCircle /> Milestone Approvals
        </h2>
        <div className="approval-stats">
          <span className="stat-badge pending">
            {pendingMilestones.length} Pending
          </span>
          <span className="stat-badge completed">
            {completedMilestones.length} Approved
          </span>
          <span className="stat-badge total">
            {milestones.length} Total
          </span>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingMilestones.length > 0 ? (
        <div className="pending-approvals-section">
          <h3>Awaiting Your Approval</h3>
          <div className="pending-milestones-grid">
            {pendingMilestones.map(milestone => (
              <div key={milestone._id} className="pending-milestone-card">
                <div className="milestone-header">
                  <div className="milestone-title-section">
                    <h4>Phase {milestone.phase || milestone.phaseNumber}: {milestone.title}</h4>
                    <span className="milestone-amount">
                      <FaDollarSign /> ${milestone.amount || 0}
                    </span>
                  </div>
                  <div className="milestone-submission-info">
                    {milestone.submissionDate && (
                      <span className="submission-date">
                        <FaClock /> Submitted: {formatDate(milestone.submissionDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="milestone-description">
                  <p>{milestone.description}</p>
                </div>

                {milestone.submission && (
                  <div className="submission-details">
                    <h5>Freelancer's Submission:</h5>
                    <p className="submission-notes">{milestone.submission.notes}</p>
                    {milestone.submission.files && milestone.submission.files.length > 0 && (
                      <div className="submission-files">
                        <h6>Files Submitted:</h6>
                        <div className="file-list">
                          {milestone.submission.files.map((file, index) => (
                            <a 
                              key={index}
                              href={file.url || file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              File {index + 1} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approval Actions */}
                <div className="approval-actions">
                  <div className="feedback-section">
                    <textarea
                      placeholder="Add feedback for the freelancer (optional for approval, required for changes)..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows="3"
                      disabled={submitting}
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() => handleQuickApprove(milestone._id)}
                      disabled={submitting}
                    >
                      <FaCheck /> Approve & Release Payment
                    </button>
                    
                    <button
                      className="btn-request-changes"
                      onClick={() => handleRequestChangesWithFeedback(milestone._id)}
                      disabled={submitting || !feedback.trim()}
                    >
                      <FaEdit /> Request Changes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-pending-approvals">
          <FaCheckCircle className="success-icon" />
          <h4>No pending approvals</h4>
          <p>All milestones are either in progress or completed</p>
        </div>
      )}

      {/* Approved Milestones History */}
      {completedMilestones.length > 0 && (
        <div className="approval-history-section">
          <h3>Approval History</h3>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Amount</th>
                  <th>Approved Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedMilestones.map(milestone => (
                  <tr key={milestone._id}>
                    <td>
                      <div className="milestone-info">
                        <span className="phase-badge">
                          Phase {milestone.phase || milestone.phaseNumber}
                        </span>
                        <span className="milestone-name">{milestone.title}</span>
                      </div>
                    </td>
                    <td className="amount-cell">${milestone.amount || 0}</td>
                    <td>
                      {milestone.approvalDate ? formatDate(milestone.approvalDate) : 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${milestone.status}`}>
                        {milestone.status === 'completed' ? 'Paid' : milestone.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="approval-tips">
        <h4>
          <FaExclamationTriangle /> Tips for Approving Work:
        </h4>
        <ul>
          <li>Review all submitted files thoroughly before approval</li>
          <li>Provide clear feedback when requesting changes</li>
          <li>Approval automatically releases payment to freelancer</li>
          <li>You can request multiple rounds of revisions if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default ClientMilestoneApprovals;