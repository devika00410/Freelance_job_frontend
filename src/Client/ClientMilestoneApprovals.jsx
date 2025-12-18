import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaEdit, 
  FaExclamationTriangle, 
  FaClock, 
  FaCheck, 
  FaTimes,
  FaDollarSign,
  FaCalendarAlt,
  FaSpinner,
  FaFile,
  FaPaperPlane,
  FaDownload,
  FaEye,
  FaLock,
  FaUnlock,
  FaUpload
} from 'react-icons/fa';
import './ClientMilestoneApprovals.css';

const ClientMilestoneApprovals = ({ workspace, milestones = [], loading, onApproveMilestone, onRequestChanges }) => {
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Sort milestones by phase number
  const sortedMilestones = [...milestones].sort((a, b) => (a.phase || 0) - (b.phase || 0));

  // Find the first milestone that's not completed
  const getCurrentActivePhase = () => {
    for (const milestone of sortedMilestones) {
      if (milestone.status !== 'completed' && milestone.status !== 'approved' && milestone.status !== 'paid') {
        return milestone.phase || 1;
      }
    }
    return sortedMilestones.length; // All completed
  };

  const currentActivePhase = getCurrentActivePhase();

  // Categorize milestones
  const pendingApprovalMilestones = sortedMilestones.filter(m => 
    ['awaiting_approval', 'awaiting-approval', 'submitted', 'for_review'].includes(m.status)
  );

  const completedMilestones = sortedMilestones.filter(m => 
    ['completed', 'approved', 'paid'].includes(m.status)
  );

  const inProgressMilestones = sortedMilestones.filter(m => 
    ['in-progress', 'in_progress', 'working'].includes(m.status)
  );

  const pendingMilestones = sortedMilestones.filter(m => 
    ['pending', 'not_started', 'upcoming'].includes(m.status)
  );

  // Check if a phase is locked (previous phase not completed)
  const isPhaseLocked = (phaseNumber) => {
    if (phaseNumber === 1) return false; // First phase is always unlocked
    const previousPhase = sortedMilestones.find(m => m.phase === phaseNumber - 1);
    return !previousPhase || !['completed', 'approved', 'paid'].includes(previousPhase.status);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadedAt: new Date().toISOString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    try {
      // Here you would integrate with your payment API
      console.log(`Processing payment of $${paymentAmount} for milestone ${selectedMilestone._id}`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Payment of $${paymentAmount} processed successfully!`);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedMilestone(null);
      
      // In real implementation, you would update the milestone status to 'paid'
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle milestone approval with payment
  const handleApproveWithPayment = async (milestoneId) => {
    setSelectedMilestone(sortedMilestones.find(m => m._id === milestoneId));
    setShowPaymentModal(true);
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (milestoneId) => {
    if (!feedback.trim()) {
      alert('Please provide feedback before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await onRequestChanges(milestoneId, feedback);
      setFeedback('');
      setActiveMilestone(null);
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle quick approval
  const handleQuickApprove = async (milestoneId) => {
    setSubmitting(true);
    try {
      await onApproveMilestone(milestoneId, 'Approved without payment');
      alert('Milestone approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="client-features-loading">
        <FaSpinner className="spinning-icon" />
        <p>Loading milestone approvals...</p>
      </div>
    );
  }

  return (
    <div className="client-milestone-approvals">
      {/* Header */}
      <div className="approvals-header">
        <h2>
          <FaCheckCircle /> Milestone Management System
        </h2>
        <div className="approval-stats">
          <span className="stat-badge pending">
            {pendingApprovalMilestones.length} Awaiting Review
          </span>
          <span className="stat-badge in-progress">
            {inProgressMilestones.length} In Progress
          </span>
          <span className="stat-badge completed">
            {completedMilestones.length} Completed
          </span>
        </div>
      </div>

      {/* Current Phase Status */}
      <div className="current-phase-info">
        <h3>Current Active Phase: Phase {currentActivePhase}</h3>
        <p>Previous phases must be approved before next phase becomes active.</p>
      </div>

      {/* All Milestones Progress */}
      <div className="milestones-progress-section">
        <h3>Project Milestones Progress</h3>
        <div className="milestones-timeline">
          {sortedMilestones.map((milestone, index) => {
            const isLocked = isPhaseLocked(milestone.phase || index + 1);
            const isCompleted = ['completed', 'approved', 'paid'].includes(milestone.status);
            const isPendingApproval = ['awaiting_approval', 'awaiting-approval', 'submitted'].includes(milestone.status);
            const isActive = milestone.phase === currentActivePhase && !isCompleted;
            
            return (
              <div 
                key={milestone._id} 
                className={`milestone-phase-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isPendingApproval ? 'pending-review' : ''} ${isActive ? 'active' : ''}`}
              >
                <div className="phase-header">
                  <div className="phase-title">
                    <h4>
                      {isLocked && <FaLock className="lock-icon" />}
                      {isCompleted && <FaCheckCircle className="check-icon" />}
                      Phase {milestone.phase || index + 1}: {milestone.title}
                    </h4>
                    <span className="phase-amount">
                      <FaDollarSign /> ${milestone.amount || 0}
                    </span>
                  </div>
                  <div className="phase-status">
                    <span className={`status-badge ${milestone.status}`}>
                      {isLocked ? 'Locked' : milestone.status || 'Pending'}
                    </span>
                    {milestone.dueDate && (
                      <span className="due-date">
                        <FaCalendarAlt /> Due: {formatDate(milestone.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="phase-content">
                  <div className="phase-description">
                    <p>{milestone.description || 'No description provided'}</p>
                  </div>

                  {/* Files Received Section */}
                  {(isPendingApproval || isCompleted) && milestone.submittedFiles && milestone.submittedFiles.length > 0 && (
                    <div className="files-received-section">
                      <h5>
                        <FaFile /> Files Received from Freelancer
                      </h5>
                      <div className="files-list">
                        {milestone.submittedFiles.map((file, idx) => (
                          <div key={idx} className="file-item">
                            <div className="file-info">
                              <FaFile className="file-icon" />
                              <div>
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{formatFileSize(file.size)}</span>
                              </div>
                            </div>
                            <div className="file-actions">
                              <button 
                                className="icon-button"
                                onClick={() => window.open(file.url, '_blank')}
                                title="View File"
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="icon-button"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = file.url;
                                  link.download = file.name;
                                  link.click();
                                }}
                                title="Download File"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestone Deliverables */}
                  {milestone.deliverables && milestone.deliverables.length > 0 && (
                    <div className="deliverables-section">
                      <h5>Expected Deliverables:</h5>
                      <ul className="deliverables-list">
                        {milestone.deliverables.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons - Only show for active or pending approval milestones */}
                  {!isLocked && (isPendingApproval || isActive) && (
                    <div className="phase-actions">
                      {/* Feedback Section */}
                      <div className="feedback-section">
                        <textarea
                          placeholder="Provide feedback or request changes..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="3"
                          disabled={submitting}
                        />
                        <button
                          className="btn-feedback"
                          onClick={() => handleSubmitFeedback(milestone._id)}
                          disabled={submitting || !feedback.trim()}
                        >
                          <FaPaperPlane /> Submit Feedback
                        </button>
                      </div>

                      {/* File Upload Section */}
                      <div className="file-upload-section">
                        <h6>Upload Additional Files (Optional):</h6>
                        <div className="upload-area">
                          <input
                            type="file"
                            id={`file-upload-${milestone._id}`}
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor={`file-upload-${milestone._id}`} className="upload-button">
                            <FaUpload /> Choose Files
                          </label>
                          {uploadedFiles.length > 0 && (
                            <div className="uploaded-files">
                              {uploadedFiles.map(file => (
                                <div key={file.id} className="uploaded-file">
                                  <span>{file.name}</span>
                                  <button 
                                    className="remove-file"
                                    onClick={() => handleRemoveFile(file.id)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval & Payment Buttons */}
                      <div className="action-buttons">
                        {isPendingApproval ? (
                          <>
                            <button
                              className="btn-approve"
                              onClick={() => handleQuickApprove(milestone._id)}
                              disabled={submitting}
                            >
                              <FaCheck /> Approve Without Payment
                            </button>
                            <button
                              className="btn-payment"
                              onClick={() => handleApproveWithPayment(milestone._id)}
                              disabled={submitting}
                            >
                              <FaDollarSign /> Approve & Make Payment
                            </button>
                            <button
                              className="btn-request-changes"
                              onClick={() => handleSubmitFeedback(milestone._id)}
                              disabled={submitting || !feedback.trim()}
                            >
                              <FaEdit /> Request Changes
                            </button>
                          </>
                        ) : (
                          <div className="waiting-status">
                            <FaClock /> Waiting for freelancer to submit work
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Locked Message */}
                  {isLocked && (
                    <div className="locked-message">
                      <FaLock className="lock-icon-large" />
                      <p>This phase is locked. Please complete and approve Phase {milestone.phase - 1} first.</p>
                    </div>
                  )}

                  {/* Completed Status */}
                  {isCompleted && (
                    <div className="completed-status">
                      <FaCheckCircle className="completed-icon" />
                      <div>
                        <p><strong>Approved on:</strong> {formatDate(milestone.approvalDate || milestone.completedDate)}</p>
                        {milestone.paymentAmount && (
                          <p><strong>Amount Paid:</strong> ${milestone.paymentAmount}</p>
                        )}
                        {milestone.feedback && (
                          <p><strong>Feedback Provided:</strong> {milestone.feedback}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedMilestone && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>Make Payment for Phase {selectedMilestone.phase}</h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedMilestone(null);
                  setPaymentAmount('');
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="payment-details">
                <h4>{selectedMilestone.title}</h4>
                <p>Milestone Amount: <strong>${selectedMilestone.amount || 0}</strong></p>
                <p>Description: {selectedMilestone.description}</p>
              </div>
              
              <div className="payment-amount">
                <label htmlFor="paymentAmount">
                  <FaDollarSign /> Payment Amount
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  min="1"
                  max={selectedMilestone.amount || 10000}
                />
                <small>Maximum: ${selectedMilestone.amount || 0}</small>
              </div>

              <div className="payment-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedMilestone(null);
                    setPaymentAmount('');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="btn-process-payment"
                  onClick={handlePaymentSubmit}
                  disabled={submitting || !paymentAmount}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinning" /> Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Process Payment & Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed Milestones Summary */}
      {completedMilestones.length > 0 && (
        <div className="completed-summary">
          <h3>
            <FaCheckCircle /> Completed Milestones
          </h3>
          <div className="summary-cards">
            {completedMilestones.map(milestone => (
              <div key={milestone._id} className="summary-card">
                <div className="card-header">
                  <h5>Phase {milestone.phase}: {milestone.title}</h5>
                  <span className="amount-paid">${milestone.paymentAmount || milestone.amount}</span>
                </div>
                <div className="card-details">
                  <p><strong>Approved:</strong> {formatDate(milestone.approvalDate)}</p>
                  <p><strong>Status:</strong> <span className="status-completed">Paid & Completed</span></p>
                  {milestone.submittedFiles && milestone.submittedFiles.length > 0 && (
                    <p><strong>Files Received:</strong> {milestone.submittedFiles.length} files</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Instructions */}
      <div className="workflow-instructions">
        <h4>
          <FaExclamationTriangle /> Milestone Approval Workflow
        </h4>
        <div className="workflow-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>Freelancer Submits Work</h5>
              <p>Freelancer uploads files and submits the completed phase for review</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>Review & Provide Feedback</h5>
              <p>Review submitted files, provide feedback or request changes if needed</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>Approve & Make Payment</h5>
              <p>Approve the milestone and make payment to release funds to freelancer</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h5>Next Phase Unlocks</h5>
              <p>Once approved, the next phase becomes available for the freelancer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMilestoneApprovals;