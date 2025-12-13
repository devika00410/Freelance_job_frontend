import React, { useState } from 'react';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaDownload, 
  FaCalendarAlt,
  FaFilter,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaPrint,
  FaEye,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaTasks
} from 'react-icons/fa';
import './ClientFeatures.css';

const ClientReportsDashboard = ({ workspace, milestones = [], files = [], messages = [] }) => {
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [generating, setGenerating] = useState(false);

  // Add formatDate function
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

  // Calculate report statistics
  const calculateStats = () => {
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    const pendingMilestones = milestones.filter(m => 
      m.status === 'awaiting_approval' || m.status === 'awaiting-approval'
    );
    
    return {
      totalBudget: workspace?.totalBudget || 0,
      spent: completedMilestones.reduce((sum, m) => sum + (m.amount || 0), 0),
      pending: pendingMilestones.reduce((sum, m) => sum + (m.amount || 0), 0),
      completionRate: milestones.length > 0 
        ? Math.round((completedMilestones.length / milestones.length) * 100)
        : 0,
      avgMilestoneCost: completedMilestones.length > 0
        ? completedMilestones.reduce((sum, m) => sum + (m.amount || 0), 0) / completedMilestones.length
        : 0,
      communicationFrequency: messages.length,
      fileCount: files.length
    };
  };

  const stats = calculateStats();

  const handleGenerateReport = async (format) => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      switch (format) {
        case 'pdf':
          alert('PDF report generated successfully!');
          break;
        case 'excel':
          alert('Excel report generated successfully!');
          break;
        case 'csv':
          alert('CSV report generated successfully!');
          break;
      }
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="client-reports-dashboard">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h2>
            <FaChartBar /> Project Reports & Analytics
          </h2>
          <p>Track project performance and generate detailed reports</p>
        </div>
        <div className="header-right">
          <div className="report-actions">
            <div className="date-filter">
              <FaCalendarAlt />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
            </div>
            <button className="btn-secondary">
              <FaFilter /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button
          className={`tab-btn ${reportType === 'overview' ? 'active' : ''}`}
          onClick={() => setReportType('overview')}
        >
          <FaChartBar /> Overview
        </button>
        <button
          className={`tab-btn ${reportType === 'financial' ? 'active' : ''}`}
          onClick={() => setReportType('financial')}
        >
          <FaDollarSign /> Financial
        </button>
        <button
          className={`tab-btn ${reportType === 'progress' ? 'active' : ''}`}
          onClick={() => setReportType('progress')}
        >
          <FaChartLine /> Progress
        </button>
        <button
          className={`tab-btn ${reportType === 'communication' ? 'active' : ''}`}
          onClick={() => setReportType('communication')}
        >
          <FaUsers /> Communication
        </button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-grid">
        <div className="stat-card">
          <div className="stat-icon financial">
            <FaDollarSign />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.spent)}</h3>
            <p>Total Spent</p>
            <small>{((stats.spent / stats.totalBudget) * 100).toFixed(1)}% of budget</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats.completionRate}%</h3>
            <p>Completion Rate</p>
            <small>{milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon communication">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.communicationFrequency}</h3>
            <p>Messages</p>
            <small>Communication frequency</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon files">
            <FaTasks />
          </div>
          <div className="stat-content">
            <h3>{stats.fileCount}</h3>
            <p>Files Shared</p>
            <small>Documentation & deliverables</small>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {reportType === 'overview' && (
          <div className="overview-report">
            <div className="report-section">
              <h3>Project Overview Report</h3>
              <div className="overview-grid">
                <div className="chart-container">
                  <h4>Budget Utilization</h4>
                  <div className="budget-chart">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill spent"
                        style={{ width: `${(stats.spent / stats.totalBudget) * 100}%` }}
                      >
                        <span>Spent: {formatCurrency(stats.spent)}</span>
                      </div>
                      <div 
                        className="bar-fill pending"
                        style={{ width: `${(stats.pending / stats.totalBudget) * 100}%` }}
                      >
                        <span>Pending: {formatCurrency(stats.pending)}</span>
                      </div>
                      <div 
                        className="bar-fill remaining"
                        style={{ width: `${((stats.totalBudget - stats.spent - stats.pending) / stats.totalBudget) * 100}%` }}
                      >
                        <span>Remaining: {formatCurrency(stats.totalBudget - stats.spent - stats.pending)}</span>
                      </div>
                    </div>
                    <div className="chart-labels">
                      <div className="label">
                        <span className="dot spent"></span>
                        <span>Spent ({((stats.spent / stats.totalBudget) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="label">
                        <span className="dot pending"></span>
                        <span>Pending ({((stats.pending / stats.totalBudget) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="label">
                        <span className="dot remaining"></span>
                        <span>Remaining ({(((stats.totalBudget - stats.spent - stats.pending) / stats.totalBudget) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="milestone-progress">
                  <h4>Milestone Completion</h4>
                  <div className="progress-stats">
                    {milestones.map(milestone => (
                      <div key={milestone._id} className="milestone-progress-item">
                        <div className="milestone-header">
                          <span>{milestone.title}</span>
                          <span className="milestone-amount">${milestone.amount}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: milestone.status === 'completed' ? '100%' : 
                                     milestone.status === 'awaiting_approval' ? '80%' : '40%',
                              backgroundColor: milestone.status === 'completed' ? '#10b981' :
                                             milestone.status === 'awaiting_approval' ? '#f59e0b' : '#3b82f6'
                            }}
                          />
                        </div>
                        <div className="milestone-status">
                          <span className={`status ${milestone.status}`}>
                            {milestone.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span>{formatDate(milestone.dueDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'financial' && (
          <div className="financial-report">
            <h3>Financial Report</h3>
            <div className="financial-table">
              <table>
                <thead>
                  <tr>
                    <th>Milestone</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone, index) => (
                    <tr key={milestone._id}>
                      <td>{milestone.title}</td>
                      <td className="amount">{formatCurrency(milestone.amount)}</td>
                      <td>
                        <span className={`payment-status ${milestone.status}`}>
                          {milestone.status === 'completed' ? 'PAID' : milestone.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {milestone.status === 'completed' 
                          ? formatDate(milestone.approvalDate)
                          : 'Pending'
                        }
                      </td>
                      <td>UPI Transfer</td>
                      <td>
                        {milestone.status === 'completed' 
                          ? `TXN-${index + 1}00${workspace?._id?.slice(-4)}`
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="1"><strong>Total</strong></td>
                    <td className="total-amount">{formatCurrency(stats.spent)}</td>
                    <td colSpan="4">
                      <small>Paid: {milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones</small>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {reportType === 'progress' && (
          <div className="progress-report">
            <h3>Progress Tracking Report</h3>
            <div className="progress-metrics">
              <div className="metric-card">
                <h4>Timeline Adherence</h4>
                <div className="metric-value">85%</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '85%' }}></div>
                </div>
                <p>Projects completed on or before deadline</p>
              </div>
              <div className="metric-card">
                <h4>Quality Score</h4>
                <div className="metric-value">4.5/5</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '90%' }}></div>
                </div>
                <p>Based on client satisfaction</p>
              </div>
              <div className="metric-card">
                <h4>Communication Score</h4>
                <div className="metric-value">4.8/5</div>
                <div className="metric-bar">
                  <div className="bar-fill" style={{ width: '96%' }}></div>
                </div>
                <p>Responsiveness and clarity</p>
              </div>
            </div>
          </div>
        )}

        {reportType === 'communication' && (
          <div className="communication-report">
            <h3>Communication Report</h3>
            <div className="communication-stats">
              <div className="stat-item">
                <h4>Total Messages</h4>
                <div className="stat-value">{messages.length}</div>
              </div>
              <div className="stat-item">
                <h4>Average Response Time</h4>
                <div className="stat-value">2.4 hrs</div>
              </div>
              <div className="stat-item">
                <h4>Active Days</h4>
                <div className="stat-value">24</div>
              </div>
              <div className="stat-item">
                <h4>Files Shared</h4>
                <div className="stat-value">{files.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Report</h3>
        <div className="export-options">
          <button 
            className="export-btn pdf"
            onClick={() => handleGenerateReport('pdf')}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="spinner-small"></div>
                Generating...
              </>
            ) : (
              <>
                <FaFilePdf /> Export as PDF
              </>
            )}
          </button>
          <button 
            className="export-btn excel"
            onClick={() => handleGenerateReport('excel')}
            disabled={generating}
          >
            <FaFileExcel /> Export as Excel
          </button>
          <button 
            className="export-btn csv"
            onClick={() => handleGenerateReport('csv')}
            disabled={generating}
          >
            <FaFileCsv /> Export as CSV
          </button>
          <button 
            className="export-btn print"
            onClick={() => window.print()}
          >
            <FaPrint /> Print Report
          </button>
          <button 
            className="export-btn preview"
            onClick={() => alert('Report preview will open in new window')}
          >
            <FaEye /> Preview Report
          </button>
        </div>

        <div className="export-settings">
          <h4>Report Settings</h4>
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked /> Include Financial Data
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked /> Include Milestone Details
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked /> Include Communication Log
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" /> Include File Attachments
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Report History */}
      <div className="report-history">
        <h3>Report History</h3>
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Generated</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly_Progress_Report_Jan.pdf</td>
                <td>2024-01-15</td>
                <td>PDF</td>
                <td>1.2 MB</td>
                <td>
                  <button className="btn-small">
                    <FaDownload /> Download
                  </button>
                </td>
              </tr>
              <tr>
                <td>Financial_Summary_Q4.xlsx</td>
                <td>2023-12-31</td>
                <td>Excel</td>
                <td>0.8 MB</td>
                <td>
                  <button className="btn-small">
                    <FaDownload /> Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientReportsDashboard;
