import React from 'react';
import { FaDownload, FaEye, FaFileContract, FaUser, FaCalendarAlt, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
// import './ClientContractViewer.css';

const ContractViewer = ({ workspace, contractDetails, milestones, onDownloadContract }) => {
  if (!contractDetails && !workspace) {
    return (
      <div className="contract-viewer">
        <div className="empty-state">
          <FaFileContract />
          <h3>No Contract Found</h3>
          <p>Contract details are not available for this workspace.</p>
        </div>
      </div>
    );
  }

  const contract = contractDetails || {
    title: workspace.title || 'Project Contract',
    totalAmount: workspace.totalBudget || 0,
    startDate: workspace.startDate,
    endDate: workspace.estimatedEndDate,
    serviceType: workspace.serviceType,
    description: workspace.description,
    clientName: workspace.client?.name || 'Client',
    freelancerName: workspace.freelancer?.name || 'Freelancer',
    contractId: workspace.contractId || workspace._id,
    signed: false,
    clientSigned: false,
    freelancerSigned: false
  };

  return (
    <div className="contract-viewer">
      <div className="contract-header">
        <h2>{contract.title}</h2>
        <div className="contract-actions">
          <button className="btn-primary" onClick={onDownloadContract}>
            <FaDownload /> Download Contract
          </button>
          <button className="btn-outline">
            <FaEye /> View Full Contract
          </button>
        </div>
      </div>

      <div className="contract-details">
        <div className="contract-section">
          <h3>Contract Information</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Contract ID:</span>
              <span className="value">{contract.contractId}</span>
            </div>
            <div className="info-row">
              <span className="label">Service Type:</span>
              <span className="value">{contract.serviceType}</span>
            </div>
            <div className="info-row">
              <span className="label">Total Amount:</span>
              <span className="value">${contract.totalAmount?.toLocaleString() || '0'}</span>
            </div>
            <div className="info-row">
              <span className="label">Start Date:</span>
              <span className="value">{new Date(contract.startDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">End Date:</span>
              <span className="value">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}</span>
            </div>
          </div>
        </div>

        <div className="contract-section">
          <h3>Parties Involved</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Client:</span>
              <span className="value">{contract.clientName}</span>
            </div>
            <div className="info-row">
              <span className="label">Freelancer:</span>
              <span className="value">{contract.freelancerName}</span>
            </div>
          </div>
        </div>

        <div className="contract-section">
          <h3>Contract Status</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Overall Status:</span>
              <span className="value">
                <span className={`status-badge ${contract.signed ? 'completed' : 'pending'}`}>
                  {contract.signed ? 'Signed' : 'Pending Signature'}
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="label">Client Signature:</span>
              <span className="value">
                <span className={`status-badge ${contract.clientSigned ? 'completed' : 'pending'}`}>
                  {contract.clientSigned ? 'Signed' : 'Pending'}
                </span>
              </span>
            </div>
            <div className="info-row">
              <span className="label">Freelancer Signature:</span>
              <span className="value">
                <span className={`status-badge ${contract.freelancerSigned ? 'completed' : 'pending'}`}>
                  {contract.freelancerSigned ? 'Signed' : 'Pending'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {contract.description && (
        <div className="contract-terms">
          <h3>Project Description</h3>
          <div className="terms-content">
            {contract.description}
          </div>
        </div>
      )}

      {contract.terms && (
        <div className="contract-terms">
          <h3>Terms & Conditions</h3>
          <div className="terms-content">
            {contract.terms}
          </div>
        </div>
      )}

      {milestones && milestones.length > 0 && (
        <div className="milestones-section">
          <h3>Project Milestones</h3>
          <div className="contract-milestones">
            {milestones.map((milestone, index) => (
              <div key={milestone._id || index} className="contract-milestone">
                <span className="milestone-phase">Phase {milestone.phase || index + 1}</span>
                <h4 className="milestone-title">{milestone.title}</h4>
                <p className="milestone-description">{milestone.description}</p>
                <div className="milestone-details">
                  <span>Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'Not set'}</span>
                  <span className="milestone-amount">${milestone.amount?.toLocaleString() || '0'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="signatures-section">
        <h3>Signatures</h3>
        <div className="signatures-grid">
          <div className="signature-card">
            <h4>Client</h4>
            <span className={`signature-status ${contract.clientSigned ? 'status-signed' : 'status-pending'}`}>
              {contract.clientSigned ? 'Signed' : 'Pending'}
            </span>
            <p>{contract.clientName}</p>
            {contract.clientSignedDate && (
              <p className="signature-date">Signed on: {new Date(contract.clientSignedDate).toLocaleDateString()}</p>
            )}
          </div>

          <div className="signature-card">
            <h4>Freelancer</h4>
            <span className={`signature-status ${contract.freelancerSigned ? 'status-signed' : 'status-pending'}`}>
              {contract.freelancerSigned ? 'Signed' : 'Pending'}
            </span>
            <p>{contract.freelancerName}</p>
            {contract.freelancerSignedDate && (
              <p className="signature-date">Signed on: {new Date(contract.freelancerSignedDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractViewer;