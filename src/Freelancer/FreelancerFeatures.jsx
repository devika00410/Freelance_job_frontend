import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaUpload,
  FaClock,
  FaMoneyBillWave,
  FaEdit,
  FaCalendarAlt,
  FaDollarSign,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaFileAlt,
  FaImage,
  FaPlayCircle,
  FaPalette
} from 'react-icons/fa';

const FreelancerFeatures = ({
  workspace,
  milestones,
  files,
  onSubmitMilestone,
  onUploadDeliverable,
  onRequestExtension,
  loading = false
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    notes: '',
    attachedFiles: []
  });

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || 'document';
    if (type.includes('image')) return <FaImage />;
    if (type.includes('pdf')) return <FaFileAlt />;
    if (type.includes('video')) return <FaPlayCircle />;
    if (type.includes('fig') || type.includes('ai') || type.includes('psd')) return <FaPalette />;
    return <FaFileAlt />;
  };

  const getCurrentMilestone = () => {
    return milestones.find(m => 
      m.status === 'in_progress' || 
      m.status === 'in-progress' ||
      m.status === 'active'
    );
  };

  const getPendingEarnings = () => {
    return milestones
      .filter(m => m.status === 'awaiting_approval' || m.status === 'awaiting-approval')
      .reduce((total, m) => total + (m.amount || 0), 0);
  };

  const getCompletedEarnings = () => {
    return milestones
      .filter(m => m.status === 'completed')
      .reduce((total, m) => total + (m.amount || 0), 0);
  };

  const handleSubmitMilestone = (milestoneId) => {
    if (!submissionData.notes.trim()) {
      alert('Please add submission notes');
      return;
    }
    onSubmitMilestone(milestoneId, submissionData);
    setSubmissionData({ notes: '', attachedFiles: [] });
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setSubmissionData(prev => ({
      ...prev,
      attachedFiles: [...prev.attachedFiles, ...selectedFiles]
    }));
  };

  const removeFile = (index) => {
    setSubmissionData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, i) => i !== index)
    }));
  };

  const currentMilestone = getCurrentMilestone();
  const pendingEarnings = getPendingEarnings();
  const completedEarnings = getCompletedEarnings();

  return (
    <div className="freelancer-features-container">
      {/* Current Work Section */}
      <div className="current-work-section">
        <h3 className="section-title">
          <FaCheckCircle /> Current Work
        </h3>
        
        {currentMilestone ? (
          <div className="current-milestone-card">
            <div className="milestone-header">
              <h4>Phase {currentMilestone.phase}: {currentMilestone.title}</h4>
              <span className="status-badge active">In Progress</span>
            </div>
            
            <p className="milestone-description">{currentMilestone.description}</p>
            
            <div className="milestone-details">
              <div className="detail-item">
                <FaDollarSign />
                <span>${currentMilestone.amount || 0}</span>
              </div>
              <div className="detail-item">
                <FaCalendarAlt />
                <span>Due: {formatDate(currentMilestone.dueDate)}</span>
              </div>
            </div>

            {/* Submission Form */}
            <div className="submission-form">
              <h5>Submit Your Work</h5>
              
              <div className="form-group">
                <label>Submission Notes</label>
                <textarea
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData({...submissionData, notes: e.target.value})}
                  placeholder="Describe your work, any challenges faced, or notes for the client..."
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Attach Files</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    disabled={loading}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.fig,.ai,.psd,.mp4,.mov,.avi"
                  />
                  <div className="upload-hint">
                    <FaUpload /> Click to upload deliverables
                  </div>
                </div>
                
                {submissionData.attachedFiles.length > 0 && (
                  <div className="attached-files">
                    <h6>Attached Files:</h6>
                    {submissionData.attachedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span>{file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="remove-file-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleSubmitMilestone(currentMilestone._id)}
                  disabled={loading || !submissionData.notes.trim()}
                >
                  {loading ? <FaSpinner className="spinning" /> : 'Submit for Approval'}
                </button>
                
                <button
                  className="btn-secondary"
                  onClick={() => onRequestExtension(currentMilestone._id)}
                  disabled={loading}
                >
                  <FaEdit /> Request Extension
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-current-work">
            <p>No active milestone. All work has been submitted!</p>
          </div>
        )}
      </div>

      {/* Earnings Dashboard */}
      <div className="earnings-dashboard">
        <h3 className="section-title">
          <FaMoneyBillWave /> Earnings Dashboard
        </h3>
        
        <div className="earnings-stats">
          <div className="earnings-card total-earned">
            <div className="earnings-icon">
              <FaDollarSign />
            </div>
            <div className="earnings-info">
              <span className="earnings-label">Total Earned</span>
              <span className="earnings-amount">${completedEarnings}</span>
            </div>
          </div>
          
          <div className="earnings-card pending-earnings">
            <div className="earnings-icon">
              <FaClock />
            </div>
            <div className="earnings-info">
              <span className="earnings-label">Pending Approval</span>
              <span className="earnings-amount">${pendingEarnings}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="payment-history">
          <h4>Payment History</h4>
          {milestones
            .filter(m => m.status === 'completed')
            .map(milestone => (
              <div key={milestone._id} className="payment-item">
                <div className="payment-info">
                  <span className="payment-title">{milestone.title}</span>
                  <span className="payment-date">{formatDate(milestone.completedDate)}</span>
                </div>
                <div className="payment-amount">
                  <FaDollarSign /> ${milestone.amount}
                </div>
              </div>
            ))}
          
          {milestones.filter(m => m.status === 'completed').length === 0 && (
            <p className="no-payments">No payments received yet</p>
          )}
        </div>
      </div>

      {/* Work Progress */}
      <div className="work-progress-section">
        <h3 className="section-title">
          <FaCheckCircle /> Work Progress
        </h3>
        
        <div className="progress-tracker">
          {milestones.map((milestone, index) => (
            <div key={milestone._id} className="progress-item">
              <div className="progress-phase">
                <div className={`phase-indicator ${milestone.status}`}>
                  {milestone.status === 'completed' && <FaCheck />}
                  {milestone.status === 'in-progress' && <FaSpinner className="spinning" />}
                  {milestone.status === 'pending' && <span>{index + 1}</span>}
                </div>
                <div className="phase-info">
                  <h5>Phase {milestone.phase}: {milestone.title}</h5>
                  <p className="phase-status">{milestone.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="phase-actions">
                {milestone.status === 'in-progress' && (
                  <button
                    className="btn-small"
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    Submit Work
                  </button>
                )}
                
                {milestone.status === 'awaiting_approval' && (
                  <span className="status-awaiting">
                    <FaClock /> Awaiting Approval
                  </span>
                )}
                
                {milestone.status === 'completed' && (
                  <span className="status-completed">
                    <FaCheck /> Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverables Summary */}
      <div className="deliverables-summary">
        <h3 className="section-title">
          <FaUpload /> Your Deliverables
        </h3>
        
        <div className="deliverables-list">
          {files
            .filter(file => file.uploadedBy === 'freelancer' || file.uploaderRole === 'freelancer')
            .map(file => (
              <div key={file._id} className="deliverable-item">
                <div className="deliverable-icon">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="deliverable-info">
                  <h5>{file.originalName || file.name}</h5>
                  <p>Uploaded: {formatDate(file.uploadedAt)}</p>
                  <p className="file-size">{file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : ''}</p>
                </div>
                <div className="deliverable-actions">
                  <button
                    className="btn-small"
                    onClick={() => window.open(file.fileUrl, '_blank')}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          
          {files.filter(f => f.uploadedBy === 'freelancer').length === 0 && (
            <p className="no-deliverables">No deliverables uploaded yet</p>
          )}
        </div>
      </div>

      {/* Milestone Submission Modal */}
      {selectedMilestone && (
        <div className="submission-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit: {selectedMilestone.title}</h3>
              <button onClick={() => setSelectedMilestone(null)}>×</button>
            </div>
            {/* Modal content would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerFeatures;