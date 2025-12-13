import React, { useState, useEffect } from 'react';
import { submissionsAPI } from '../Service/api';
import {
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Edit,
  X,
  Download,
  Paperclip,
  Send,
  Calendar,
  Tag,
  DollarSign,
  FolderOpen,
  MessageSquare,
  ChevronRight,
  Check,
  AlertTriangle,
  FileUp,
  Loader2
} from 'lucide-react';
import './FreelancerSubmissions.css';

const FreelancerSubmissions = ({ workspaceId, workspace, milestones, onSubmissionSuccess }) => {
  // ============ STATE MANAGEMENT ============
  const [submissions, setSubmissions] = useState([]);
  const [availableMilestones, setAvailableMilestones] = useState(milestones || []);
  const [newSubmission, setNewSubmission] = useState({
    milestoneId: '',
    description: '',
    files: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ============ DATA FETCHING ============
  useEffect(() => {
    fetchData();
  }, [workspaceId, milestones]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use provided milestones or fetch from workspace
      if (milestones && milestones.length > 0) {
        setAvailableMilestones(milestones);
      } else if (workspace?.sharedMilestones) {
        setAvailableMilestones(workspace.sharedMilestones);
      } else {
        try {
          const workspaceRes = await submissionsAPI.getWorkspace(workspaceId);
          if (workspaceRes.data.success) {
            const wsMilestones = workspaceRes.data.workspace?.sharedMilestones || [];
            setAvailableMilestones(wsMilestones);
          }
        } catch (error) {
          setAvailableMilestones(getDefaultMilestones());
        }
      }

      // Fetch submissions
      try {
        const submissionsRes = await submissionsAPI.getByWorkspace(workspaceId);
        if (submissionsRes.data.success) {
          setSubmissions(submissionsRes.data.submissions || []);
        }
      } catch (error) {
        loadLocalSubmissions();
      }
    } catch (error) {
      console.error('Error fetching submissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS ============
  const getDefaultMilestones = () => {
    return [
      {
        _id: 'milestone-1',
        milestoneId: 'milestone-1',
        title: 'Design Phase',
        phaseNumber: 1,
        amount: 1500,
        description: 'Create initial design mockups and wireframes',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '7 days'
      },
      {
        _id: 'milestone-2',
        milestoneId: 'milestone-2',
        title: 'Development Phase',
        phaseNumber: 2,
        amount: 2500,
        description: 'Develop core functionality and features',
        status: 'pending',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '14 days'
      }
    ];
  };

  const loadLocalSubmissions = () => {
    const localKey = `workspace_${workspaceId}_submissions`;
    const saved = localStorage.getItem(localKey);
    if (saved) {
      setSubmissions(JSON.parse(saved));
    }
  };

  const saveLocalSubmissions = (newSubmissions) => {
    const localKey = `workspace_${workspaceId}_submissions`;
    localStorage.setItem(localKey, JSON.stringify(newSubmissions));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed': return '#10b981';
      case 'submitted':
      case 'awaiting_approval': return '#0ea5e9';
      case 'revision_requested': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed': return <CheckCircle size={16} />;
      case 'submitted':
      case 'awaiting_approval': return <Clock size={16} />;
      case 'revision_requested': return <AlertTriangle size={16} />;
      case 'rejected': return <X size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getMilestoneTitle = (milestoneId) => {
    const milestone = availableMilestones.find(m => 
      m._id === milestoneId || m.milestoneId === milestoneId
    );
    return milestone ? milestone.title : 'Unknown Milestone';
  };

  // ============ FILE HANDLING ============
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownloadFiles = (submission) => {
    if (submission.files && submission.files.length > 0) {
      submission.files.forEach(file => {
        if (file.url) {
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }
  };

  const handleViewFile = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // ============ SUBMISSION FUNCTIONS ============
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    
    if (!newSubmission.milestoneId || !newSubmission.description.trim()) {
      alert('Please select a milestone and provide a description');
      return;
    }

    try {
      setUploading(true);

      const selectedMilestone = availableMilestones.find(
        m => m._id === newSubmission.milestoneId || m.milestoneId === newSubmission.milestoneId
      );

      // Create submission object
      const submissionData = {
        _id: Date.now().toString(),
        milestoneId: newSubmission.milestoneId,
        milestoneTitle: selectedMilestone?.title || 'Unknown Milestone',
        description: newSubmission.description,
        files: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        feedback: null,
        revisionNotes: null
      };

      // Try API submission
      try {
        const formData = new FormData();
        formData.append('milestoneId', newSubmission.milestoneId);
        formData.append('description', newSubmission.description);
        formData.append('workspaceId', workspaceId);
        
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        const response = await submissionsAPI.submitMilestone(formData);
        
        if (response.data.success) {
          submissionData._id = response.data.submission?._id || submissionData._id;
        }
      } catch (apiError) {
        console.log('Submitting locally');
      }

      // Update local state
      const updatedSubmissions = [submissionData, ...submissions];
      setSubmissions(updatedSubmissions);
      saveLocalSubmissions(updatedSubmissions);

      // Update milestone status locally
      const updatedMilestones = availableMilestones.map(milestone => {
        if (milestone._id === newSubmission.milestoneId || milestone.milestoneId === newSubmission.milestoneId) {
          return { ...milestone, status: 'awaiting_approval' };
        }
        return milestone;
      });
      setAvailableMilestones(updatedMilestones);

      // Reset form
      setNewSubmission({
        milestoneId: '',
        description: '',
        files: []
      });
      setSelectedFiles([]);
      setShowSubmissionModal(false);

      // Call success callback
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }

      alert('Work submitted successfully! Waiting for client approval.');
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRequestRevision = (submissionId) => {
    const updatedSubmissions = submissions.map(submission => {
      if (submission._id === submissionId) {
        return { ...submission, status: 'revision_requested' };
      }
      return submission;
    });
    setSubmissions(updatedSubmissions);
    saveLocalSubmissions(updatedSubmissions);
    alert('Revision requested. Please update and resubmit your work.');
  };

  const openNewSubmissionModal = () => {
    const submitableMilestones = availableMilestones.filter(m => 
      m.status === 'in_progress' || m.status === 'pending' || m.status === 'in-progress'
    );
    
    if (submitableMilestones.length === 0) {
      alert('No milestones available for submission. All milestones are either completed or awaiting approval.');
      return;
    }
    
    setShowSubmissionModal(true);
  };

  // ============ MODAL COMPONENTS ============
  const SubmissionFormModal = () => (
    <div className={`submission-modal-overlay ${showSubmissionModal ? 'show' : ''}`}>
      <div className="submission-modal">
        <div className="modal-header">
          <h3>Submit New Work</h3>
          <button
            onClick={() => setShowSubmissionModal(false)}
            className="close-btn"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmitWork} className="submission-form-modal">
          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              Select Milestone
            </label>
            <select
              value={newSubmission.milestoneId}
              onChange={(e) => setNewSubmission({...newSubmission, milestoneId: e.target.value})}
              className="form-select"
              required
            >
              <option value="">-- Select Milestone --</option>
              {availableMilestones
                .filter(m => m.status === 'in_progress' || m.status === 'pending' || m.status === 'in-progress')
                .map(milestone => (
                  <option key={milestone._id || milestone.milestoneId} value={milestone._id || milestone.milestoneId}>
                    {milestone.title} - ${milestone.amount || 0} (Due: {formatDate(milestone.dueDate)})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FileText size={16} />
              Description
            </label>
            <textarea
              value={newSubmission.description}
              onChange={(e) => setNewSubmission({...newSubmission, description: e.target.value})}
              placeholder="Describe your work, include any important notes for the client..."
              rows="5"
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Paperclip size={16} />
              Upload Files
            </label>
            <div className="file-upload-area">
              <input
                type="file"
                id="file-upload-modal"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="file-upload-modal" className="upload-label">
                <Upload size={20} />
                <span>Click to select files or drag and drop</span>
                <small>Support: PDF, DOC, IMG, VIDEO, ZIP (Max 50MB each)</small>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({selectedFiles.length})</h4>
                <div className="files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <FileText size={16} />
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="remove-file-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowSubmissionModal(false)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !newSubmission.milestoneId}
              className="btn-submit"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const SubmissionDetailsModal = () => (
    <div className={`submission-details-modal-overlay ${showDetailsModal && selectedSubmission ? 'show' : ''}`}>
      <div className="submission-details-modal">
        <div className="modal-header">
          <h3>Submission Details</h3>
          <button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedSubmission(null);
            }}
            className="close-btn"
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          {selectedSubmission && (
            <>
              <div className="detail-section">
                <h4>
                  <FolderOpen size={16} />
                  Milestone
                </h4>
                <p>{getMilestoneTitle(selectedSubmission.milestoneId)}</p>
              </div>
              
              <div className="detail-section">
                <h4>
                  <Calendar size={16} />
                  Submitted On
                </h4>
                <p>{formatDate(selectedSubmission.submittedAt)}</p>
              </div>
              
              <div className="detail-section">
                <h4>Status</h4>
                <div className="status-display" style={{ color: getStatusColor(selectedSubmission.status) }}>
                  {getStatusIcon(selectedSubmission.status)}
                  <span>{selectedSubmission.status?.replace('_', ' ') || 'Submitted'}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>
                  <FileText size={16} />
                  Description
                </h4>
                <p className="description-text">{selectedSubmission.description}</p>
              </div>
              
              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div className="detail-section">
                  <h4>
                    <Paperclip size={16} />
                    Files ({selectedSubmission.files.length})
                  </h4>
                  <div className="files-list-detailed">
                    {selectedSubmission.files.map((file, index) => (
                      <div key={index} className="file-item-detailed">
                        <FileText size={16} />
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="file-actions">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="btn-icon"
                            title="View file"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = file.url;
                              a.download = file.name;
                              a.click();
                            }}
                            className="btn-icon"
                            title="Download file"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSubmission.feedback && (
                <div className="detail-section">
                  <h4>
                    <MessageSquare size={16} />
                    Client Feedback
                  </h4>
                  <div className="feedback-box">
                    <AlertCircle size={16} />
                    <p>{selectedSubmission.feedback}</p>
                  </div>
                </div>
              )}
              
              {selectedSubmission.revisionNotes && (
                <div className="detail-section">
                  <h4>
                    <Edit size={16} />
                    Revision Notes
                  </h4>
                  <div className="revision-box">
                    <AlertTriangle size={16} />
                    <p>{selectedSubmission.revisionNotes}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={() => {
              setShowDetailsModal(false);
              setSelectedSubmission(null);
            }}
            className="btn-close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // ============ RENDER LOGIC ============
  if (loading && submissions.length === 0) {
    return (
      <div className="freelancer-submissions-container">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-submissions-container">
      {/* Header Section */}
      <div className="submissions-header">
        <div className="header-content">
          <h2>
            <FolderOpen size={24} />
            Work Submissions
          </h2>
          <p className="submissions-description">
            Submit your completed work, track submission status, and manage revisions
          </p>
        </div>
        <button
          onClick={openNewSubmissionModal}
          className="btn-new-submission"
        >
          <FileUp size={16} />
          New Submission
        </button>
      </div>

      {/* Stats Section */}
      <div className="submissions-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FolderOpen size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{submissions.length}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {submissions.filter(s => s.status === 'submitted' || s.status === 'awaiting_approval').length}
            </span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {submissions.filter(s => s.status === 'approved' || s.status === 'completed').length}
            </span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revisions">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {submissions.filter(s => s.status === 'revision_requested').length}
            </span>
            <span className="stat-label">Revisions</span>
          </div>
        </div>
      </div>

      {/* Available Milestones Section */}
      <div className="available-milestones-section">
        <div className="section-header">
          <h3>Available for Submission</h3>
          <span className="count-badge">
            {availableMilestones.filter(m => m.status === 'in_progress' || m.status === 'pending').length} milestone(s)
          </span>
        </div>
        
        {availableMilestones.filter(m => m.status === 'in_progress' || m.status === 'pending').length === 0 ? (
          <div className="empty-milestones">
            <CheckCircle size={32} />
            <p>All milestones have been submitted or completed</p>
          </div>
        ) : (
          <div className="milestones-grid">
            {availableMilestones
              .filter(m => m.status === 'in_progress' || m.status === 'pending')
              .map(milestone => (
                <div key={milestone._id || milestone.milestoneId} className="milestone-card">
                  <div className="milestone-header">
                    <h4>{milestone.title}</h4>
                    <span className="milestone-phase">Phase {milestone.phaseNumber || 1}</span>
                  </div>
                  <div className="milestone-content">
                    <p className="milestone-description">{milestone.description}</p>
                    <div className="milestone-details">
                      <div className="detail">
                        <DollarSign size={14} />
                        <span>${milestone.amount || 0}</span>
                      </div>
                      <div className="detail">
                        <Calendar size={14} />
                        <span>Due: {formatDate(milestone.dueDate)}</span>
                      </div>
                      <div className="detail">
                        <Clock size={14} />
                        <span>{milestone.duration || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="milestone-actions">
                    <button
                      onClick={() => {
                        setNewSubmission({...newSubmission, milestoneId: milestone._id || milestone.milestoneId});
                        setShowSubmissionModal(true);
                      }}
                      className="btn-submit-milestone"
                    >
                      <Upload size={14} />
                      Submit Work
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Submissions History Section */}
      <div className="submissions-history-section">
        <div className="section-header">
          <h3>Submission History</h3>
          <span className="count-badge">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-submissions">
            <Upload size={48} />
            <h4>No submissions yet</h4>
            <p>Submit your first milestone work to get started</p>
            <button
              onClick={openNewSubmissionModal}
              className="btn-primary"
            >
              <FileUp size={16} />
              Create First Submission
            </button>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div key={submission._id} className="submission-card">
                <div className="submission-header">
                  <div className="submission-info">
                    <h4>{getMilestoneTitle(submission.milestoneId)}</h4>
                    <span className="submission-date">
                      <Calendar size={14} />
                      {formatDate(submission.submittedAt)}
                    </span>
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(submission.status) }}
                  >
                    {getStatusIcon(submission.status)}
                    <span>{submission.status?.replace('_', ' ') || 'Submitted'}</span>
                  </div>
                </div>

                <div className="submission-content">
                  <p className="description">{submission.description}</p>
                  
                  {submission.files && submission.files.length > 0 && (
                    <div className="submission-files">
                      <h5>
                        <Paperclip size={14} />
                        Attached Files
                      </h5>
                      <div className="files-grid">
                        {submission.files.slice(0, 3).map((file, index) => (
                          <div key={index} className="file-chip">
                            <FileText size={12} />
                            <span>{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</span>
                            <span className="file-size-chip">{formatFileSize(file.size)}</span>
                          </div>
                        ))}
                        {submission.files.length > 3 && (
                          <div className="file-chip more">
                            +{submission.files.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="client-feedback">
                      <h5>
                        <MessageSquare size={14} />
                        Client Feedback
                      </h5>
                      <div className="feedback-content">
                        <AlertCircle size={14} />
                        <p>{submission.feedback}</p>
                      </div>
                    </div>
                  )}

                  {submission.revisionNotes && (
                    <div className="revision-notes">
                      <h5>
                        <Edit size={14} />
                        Revision Notes
                      </h5>
                      <div className="revision-content">
                        <AlertTriangle size={14} />
                        <p>{submission.revisionNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="submission-actions">
                  <button
                    onClick={() => handleDownloadFiles(submission)}
                    className="btn-outline"
                    disabled={!submission.files || submission.files.length === 0}
                  >
                    <Download size={16} />
                    Download Files
                  </button>
                  
                  {submission.status === 'revision_requested' && (
                    <button
                      onClick={() => handleRequestRevision(submission._id)}
                      className="btn-primary"
                    >
                      <Edit size={16} />
                      Submit Revision
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setShowDetailsModal(true);
                    }}
                    className="btn-icon"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <ChevronRight size={16} className="action-arrow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SubmissionFormModal />
      <SubmissionDetailsModal />
    </div>
  );
};

export default FreelancerSubmissions;