import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaDollarSign,
  FaEdit,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaClock,
  FaChartLine,
  FaFileInvoiceDollar,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaUserCheck,
  FaFileContract
} from 'react-icons/fa';

const ClientFeatures = ({
  workspace,
  milestones,
  onApproveMilestone,
  onRequestChanges,
  onReleasePayment,
  loading = false
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPendingApprovals = () => {
    return milestones.filter(m => 
      m.status === 'awaiting_approval' || 
      m.status === 'awaiting-approval' ||
      m.status === 'submitted'
    );
  };

  const getTotalBudget = () => {
    return milestones.reduce((total, m) => total + (m.amount || 0), 0);
  };

  const getPaidAmount = () => {
    return milestones
      .filter(m => m.status === 'completed')
      .reduce((total, m) => total + (m.amount || 0), 0);
  };

  const getPendingPayments = () => {
    return getPendingApprovals().reduce((total, m) => total + (m.amount || 0), 0);
  };

  const handleApprove = (milestoneId) => {
    if (!feedback.trim() && window.confirm('Approve without feedback?')) {
      onApproveMilestone(milestoneId, 'Approved! Great work.');
    } else if (feedback.trim()) {
      onApproveMilestone(milestoneId, feedback);
      setFeedback('');
    }
  };

  const handleRequestChanges = (milestoneId) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for requested changes');
      return;
    }
    onRequestChanges(milestoneId, feedback);
    setFeedback('');
  };

  const handleReleasePayment = (milestoneId) => {
    onReleasePayment(milestoneId, paymentMethod);
  };

  const pendingApprovals = getPendingApprovals();
  const totalBudget = getTotalBudget();
  const paidAmount = getPaidAmount();
  const pendingPayments = getPendingPayments();

  return (
    <div className="client-features-container">
      {/* Budget & Payments Overview */}
      <div className="budget-overview-section">
        <h3 className="section-title">
          <FaMoneyBillWave /> Budget & Payments
        </h3>
        
        <div className="budget-stats">
          <div className="budget-card total-budget">
            <div className="budget-icon">
              <FaFileInvoiceDollar />
            </div>
            <div className="budget-info">
              <span className="budget-label">Total Budget</span>
              <span className="budget-amount">${totalBudget}</span>
            </div>
          </div>
          
          <div className="budget-card paid-amount">
            <div className="budget-icon">
              <FaCheckCircle />
            </div>
            <div className="budget-info">
              <span className="budget-label">Amount Paid</span>
              <span className="budget-amount">${paidAmount}</span>
            </div>
          </div>
          
          <div className="budget-card pending-payments">
            <div className="budget-icon">
              <FaClock />
            </div>
            <div className="budget-info">
              <span className="budget-label">Pending Payments</span>
              <span className="budget-amount">${pendingPayments}</span>
            </div>
          </div>
          
          <div className="budget-card remaining-budget">
            <div className="budget-icon">
              <FaChartLine />
            </div>
            <div className="budget-info">
              <span className="budget-label">Remaining</span>
              <span className="budget-amount">${totalBudget - paidAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="approvals-section">
        <h3 className="section-title">
          <FaUserCheck /> Pending Approvals
          {pendingApprovals.length > 0 && (
            <span className="badge-count">{pendingApprovals.length}</span>
          )}
        </h3>
        
        {pendingApprovals.length > 0 ? (
          <div className="approvals-list">
            {pendingApprovals.map(milestone => (
              <div key={milestone._id} className="approval-item">
                <div className="approval-info">
                  <h4>Phase {milestone.phase}: {milestone.title}</h4>
                  <p className="milestone-description">{milestone.description}</p>
                  
                  <div className="milestone-details">
                    <div className="detail-item">
                      <FaDollarSign />
                      <span>${milestone.amount || 0}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt />
                      <span>Submitted: {formatDate(milestone.submittedAt)}</span>
                    </div>
                  </div>
                  
                  {milestone.submission && (
                    <div className="submission-details">
                      <h5>Submission Details:</h5>
                      <p>{milestone.submission.notes}</p>
                      
                      {milestone.submission.files && milestone.submission.files.length > 0 && (
                        <div className="submission-files">
                          <h6>Attached Files:</h6>
                          <ul>
                            {milestone.submission.files.map((file, index) => (
                              <li key={index}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  {file.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="approval-actions">
                  <div className="feedback-section">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback or approval notes..."
                      rows="3"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="action-buttons">
                    <button
                      className="btn-success"
                      onClick={() => handleApprove(milestone._id)}
                      disabled={loading}
                    >
                      <FaCheck /> Approve & Release Payment
                    </button>
                    
                    <button
                      className="btn-warning"
                      onClick={() => handleRequestChanges(milestone._id)}
                      disabled={loading || !feedback.trim()}
                    >
                      <FaEdit /> Request Changes
                    </button>
                    
                    <button
                      className="btn-secondary"
                      onClick={() => handleReleasePayment(milestone._id)}
                      disabled={loading}
                    >
                      <FaDollarSign /> Release Payment Only
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-pending-approvals">
            <p>No pending approvals. All work is up to date!</p>
          </div>
        )}
      </div>

      {/* Payment Schedule */}
      <div className="payment-schedule-section">
        <h3 className="section-title">
          <FaCalendarAlt /> Payment Schedule
        </h3>
        
        <div className="payment-timeline">
          {milestones.map(milestone => (
            <div key={milestone._id} className="payment-item">
              <div className="payment-phase">
                <div className={`phase-status ${milestone.status}`}>
                  {milestone.status === 'completed' && <FaCheck />}
                  {milestone.status === 'awaiting_approval' && <FaClock />}
                  {milestone.status === 'in-progress' && <FaSpinner className="spinning" />}
                  {milestone.status === 'pending' && <span>{milestone.phase}</span>}
                </div>
                
                <div className="payment-info">
                  <h5>Phase {milestone.phase}: {milestone.title}</h5>
                  <div className="payment-details">
                    <span className="payment-amount">${milestone.amount}</span>
                    <span className="payment-due">Due: {formatDate(milestone.dueDate)}</span>
                    <span className={`payment-status ${milestone.paymentStatus || 'pending'}`}>
                      {milestone.paymentStatus || 'Not Paid'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="payment-actions">
                {milestone.status === 'completed' && !milestone.paymentStatus && (
                  <button
                    className="btn-small"
                    onClick={() => handleReleasePayment(milestone._id)}
                  >
                    Mark as Paid
                  </button>
                )}
                
                {milestone.paymentStatus === 'paid' && (
                  <span className="paid-badge">
                    <FaCheckCircle /> Paid on {formatDate(milestone.paidDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Oversight */}
      <div className="project-oversight-section">
        <h3 className="section-title">
          <FaChartLine /> Project Oversight
        </h3>
        
        <div className="oversight-metrics">
          <div className="metric-card">
            <div className="metric-value">
              {milestones.filter(m => m.status === 'completed').length} / {milestones.length}
            </div>
            <div className="metric-label">Milestones Completed</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {Math.round((paidAmount / totalBudget) * 100)}%
            </div>
            <div className="metric-label">Budget Utilized</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {workspace.overallProgress || 0}%
            </div>
            <div className="metric-label">Overall Progress</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {pendingApprovals.length}
            </div>
            <div className="metric-label">Pending Reviews</div>
          </div>
        </div>
        
        {/* Timeline Progress */}
        <div className="timeline-progress">
          <h4>Project Timeline</h4>
          <div className="timeline">
            {milestones.map(milestone => (
              <div key={milestone._id} className="timeline-item">
                <div className="timeline-date">{formatDate(milestone.dueDate)}</div>
                <div className="timeline-content">
                  <h5>Phase {milestone.phase}: {milestone.title}</h5>
                  <p>${milestone.amount} • Status: {milestone.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Management */}
      <div className="contract-management-section">
        <h3 className="section-title">
          <FaFileContract /> Contract Management
        </h3>
        
        <div className="contract-actions">
          <button className="btn-primary">
            <FaFileContract /> View Full Contract
          </button>
          <button className="btn-secondary">
            <FaEdit /> Request Contract Changes
          </button>
          <button className="btn-secondary">
            <FaExclamationTriangle /> Report Issue
          </button>
        </div>
        
        <div className="contract-summary">
          <h4>Contract Summary</h4>
          <div className="summary-details">
            <div className="detail-row">
              <span>Contract ID:</span>
              <span>{workspace.contractId || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span>Start Date:</span>
              <span>{formatDate(workspace.startDate)}</span>
            </div>
            <div className="detail-row">
              <span>End Date:</span>
              <span>{formatDate(workspace.endDate)}</span>
            </div>
            <div className="detail-row">
              <span>Payment Terms:</span>
              <span>Milestone-based</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Modal */}
      <div className="payment-method-modal" style={{ display: 'none' }}>
        <div className="modal-content">
          <h3>Select Payment Method</h3>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Credit/Debit Card</option>
          </select>
          <button onClick={() => {/* Handle payment */}}>
            Proceed with Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientFeatures;