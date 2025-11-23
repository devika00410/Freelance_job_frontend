import React, { useState } from 'react';
import { 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaCalendarAlt,
  FaChevronDown,
  FaFilter,
  FaCheckCircle
} from 'react-icons/fa';
import './DownloadReports.css';

const DownloadReports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - replace with real data later
  const reportTypes = [
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Budget, payments, and expense reports',
      icon: FaFilePdf,
      fields: ['budget', 'payments', 'expenses']
    },
    {
      id: 'performance',
      name: 'Project Performance',
      description: 'Timeline adherence and milestone completion',
      icon: FaFileExcel,
      fields: ['timeline', 'milestones', 'deliverables']
    },
    {
      id: 'freelancer',
      name: 'Freelancer Activity',
      description: 'Time tracking and work metrics',
      icon: FaFilePdf,
      fields: ['hours', 'productivity', 'quality']
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'All project data and analytics',
      icon: FaFileExcel,
      fields: ['all']
    }
  ];

  const projectOptions = [
    { id: '1', name: 'E-commerce Website Development' },
    { id: '2', name: 'Mobile App UI/UX Design' },
    { id: '3', name: 'SEO Optimization Package' },
    { id: '4', name: 'Data Analytics Dashboard' }
  ];

  const formatOptions = [
    { id: 'pdf', name: 'PDF Document', icon: FaFilePdf },
    { id: 'excel', name: 'Excel Spreadsheet', icon: FaFileExcel },
    { id: 'csv', name: 'CSV Data', icon: FaFileExcel }
  ];

  const handleProjectToggle = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === projectOptions.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projectOptions.map(p => p.id));
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call your backend API
      console.log('Generating report:', {
        type: selectedReport,
        dateRange,
        projects: selectedProjects,
        format
      });
      
      alert(`Report generated successfully! This would download a ${format.toUpperCase()} file.`);
      
    } catch (error) {
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReportData = reportTypes.find(r => r.id === selectedReport);

  return (
    <div className="dr-modal-container">
      <div className="dr-modal-header">
        <h2 className="dr-modal-title">Download Reports</h2>
        <p className="dr-modal-subtitle">Generate detailed reports for your projects and finances</p>
      </div>

      <div className="dr-content-grid">
        {/* Report Type Selection */}
        <div className="dr-section-card">
          <div className="dr-section-header">
            <h3 className="dr-section-title">
              <FaFilter className="dr-section-icon" />
              Report Type
            </h3>
            <p className="dr-section-description">Choose the type of report you need</p>
          </div>
          
          <div className="dr-report-types-grid">
            {reportTypes.map(report => (
              <div
                key={report.id}
                className={`dr-report-type-card ${selectedReport === report.id ? 'dr-report-selected' : ''}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="dr-report-icon">
                  <report.icon />
                </div>
                <div className="dr-report-info">
                  <h4 className="dr-report-name">{report.name}</h4>
                  <p className="dr-report-desc">{report.description}</p>
                </div>
                {selectedReport === report.id && (
                  <FaCheckCircle className="dr-selected-check" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Report Configuration */}
        <div className="dr-section-card">
          <div className="dr-section-header">
            <h3 className="dr-section-title">
              <FaCalendarAlt className="dr-section-icon" />
              Report Configuration
            </h3>
            <p className="dr-section-description">Customize your report parameters</p>
          </div>

          {/* Date Range */}
          <div className="dr-config-group">
            <label className="dr-config-label">Date Range</label>
            <div className="dr-date-range">
              <div className="dr-date-input-group">
                <label>From</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="dr-date-input"
                />
              </div>
              <div className="dr-date-input-group">
                <label>To</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="dr-date-input"
                />
              </div>
            </div>
          </div>

          {/* Project Selection */}
          <div className="dr-config-group">
            <div className="dr-projects-header">
              <label className="dr-config-label">Projects Included</label>
              <button
                type="button"
                className="dr-select-all-btn"
                onClick={handleSelectAllProjects}
              >
                {selectedProjects.length === projectOptions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="dr-projects-list">
              {projectOptions.map(project => (
                <label key={project.id} className="dr-project-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                  />
                  <span className="dr-checkbox-custom"></span>
                  <span className="dr-project-name">{project.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="dr-config-group">
            <label className="dr-config-label">Export Format</label>
            <div className="dr-format-options">
              {formatOptions.map(option => (
                <label key={option.id} className="dr-format-option">
                  <input
                    type="radio"
                    name="format"
                    value={option.id}
                    checked={format === option.id}
                    onChange={(e) => setFormat(e.target.value)}
                  />
                  <span className="dr-format-radio-custom"></span>
                  <option.icon className="dr-format-icon" />
                  <span className="dr-format-name">{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview & Actions */}
      {selectedReport && (
        <div className="dr-preview-section">
          <div className="dr-preview-header">
            <h3 className="dr-preview-title">Ready to Generate</h3>
            <div className="dr-report-summary">
              <span className="dr-summary-item">
                <strong>Type:</strong> {selectedReportData?.name}
              </span>
              <span className="dr-summary-item">
                <strong>Projects:</strong> {selectedProjects.length} selected
              </span>
              <span className="dr-summary-item">
                <strong>Format:</strong> {format.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="dr-actions">
            <button
              className="dr-download-btn"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              <FaDownload className="dr-download-icon" />
              {isGenerating ? 'Generating Report...' : 'Generate & Download Report'}
            </button>
            
            <button
              className="dr-cancel-btn"
              onClick={() => {
                setSelectedReport('');
                setSelectedProjects([]);
                setDateRange({ startDate: '', endDate: '' });
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadReports;