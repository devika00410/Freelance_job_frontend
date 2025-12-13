import React, { useState, useEffect } from 'react';
import { timeAPI } from '../Service/api';
import {
  Play,
  Pause,
  StopCircle,
  Clock,
  Calendar,
  Timer,
  TrendingUp,
  BarChart3,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Plus,
  Save,
  X
} from 'lucide-react';

const TimeTracker = ({ workspaceId }) => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTimer, setCurrentTimer] = useState({
    startedAt: null,
    elapsedSeconds: 0,
    description: '',
    task: ''
  });
  const [loading, setLoading] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 30,
    description: '',
    task: ''
  });
  const [editingLogId, setEditingLogId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({
    totalHours: 0,
    todayHours: 0,
    weekHours: 0,
    avgDaily: 0
  });

  useEffect(() => {
    fetchTimeLogs();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [workspaceId, selectedDate]);

  useEffect(() => {
    if (isTracking && !timerInterval) {
      startTimer();
    } else if (!isTracking && timerInterval) {
      stopTimer();
    }
  }, [isTracking]);

  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const response = await timeAPI.getLogs(workspaceId, { date: selectedDate });
      
      if (response.data.success) {
        setTimeLogs(response.data.logs || []);
        setStats(response.data.stats || {
          totalHours: 0,
          todayHours: 0,
          weekHours: 0,
          avgDaily: 0
        });
      }
    } catch (error) {
      console.error('Error fetching time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setCurrentTimer(prev => ({
      ...prev,
      startedAt: new Date(),
      elapsedSeconds: 0
    }));

    const interval = setInterval(() => {
      setCurrentTimer(prev => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1
      }));
    }, 1000);

    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleStartTracking = () => {
    if (!currentTimer.description.trim()) {
      alert('Please enter a description before starting the timer');
      return;
    }

    setIsTracking(true);
  };

  const handlePauseTracking = () => {
    setIsTracking(false);
  };

  const handleStopTracking = async () => {
    if (!isTracking) return;

    setIsTracking(false);
    
    const hours = currentTimer.elapsedSeconds / 3600;
    
    try {
      const response = await timeAPI.createLog(workspaceId, {
        hours: parseFloat(hours.toFixed(2)),
        description: currentTimer.description,
        task: currentTimer.task,
        date: new Date().toISOString().split('T')[0]
      });

      if (response.data.success) {
        setCurrentTimer({
          startedAt: null,
          elapsedSeconds: 0,
          description: '',
          task: ''
        });
        fetchTimeLogs(); // Refresh logs
      }
    } catch (error) {
      console.error('Error saving time log:', error);
      alert('Failed to save time entry. Please try again.');
    }
  };

  const handleManualEntry = async (e) => {
    e.preventDefault();
    
    const totalHours = newLog.hours + (newLog.minutes / 60);
    
    if (totalHours <= 0) {
      alert('Please enter a valid time duration');
      return;
    }

    try {
      setLoading(true);
      const response = await timeAPI.createLog(workspaceId, {
        hours: totalHours,
        description: newLog.description,
        task: newLog.task,
        date: newLog.date
      });

      if (response.data.success) {
        // Reset form
        setNewLog({
          date: new Date().toISOString().split('T')[0],
          hours: 0,
          minutes: 30,
          description: '',
          task: ''
        });
        fetchTimeLogs(); // Refresh logs
      }
    } catch (error) {
      console.error('Error creating manual time log:', error);
      alert('Failed to create time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLog = async (logId) => {
    if (!editForm.description?.trim()) return;

    try {
      setLoading(true);
      const response = await timeAPI.updateLog(logId, editForm);

      if (response.data.success) {
        setEditingLogId(null);
        setEditForm({});
        fetchTimeLogs(); // Refresh logs
      }
    } catch (error) {
      console.error('Error updating time log:', error);
      alert('Failed to update time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) return;

    try {
      setLoading(true);
      const response = await timeAPI.deleteLog(logId);

      if (response.data.success) {
        fetchTimeLogs(); // Refresh logs
      }
    } catch (error) {
      console.error('Error deleting time log:', error);
      alert('Failed to delete time entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateEarnings = (hours) => {
    // In production, this would use actual rates from contract
    const hourlyRate = 50; // Default rate
    return (hours * hourlyRate).toFixed(2);
  };

  const handleExportTimesheet = () => {
    // In production, this would generate and download a timesheet
    alert('Export feature coming soon!');
  };

  return (
    <div className="time-tracker-container">
      <div className="time-tracker-header">
        <div className="header-left">
          <h2>Time Tracking</h2>
          <p className="tracker-description">
            Track your work hours, manage timesheets, and monitor your productivity
          </p>
        </div>
        <div className="header-right">
          <div className="date-filter">
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button
            onClick={fetchTimeLogs}
            disabled={loading}
            className="btn-outline refresh-btn"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExportTimesheet}
            className="btn-primary"
          >
            <Download size={16} />
            Export Timesheet
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="time-stats-cards">
        <div className="stat-card total-time">
          <div className="card-icon">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>Total Hours</h3>
            <span className="stat-value">{stats.totalHours.toFixed(1)}h</span>
            <span className="stat-extra">
              Est. Earnings: ${calculateEarnings(stats.totalHours)}
            </span>
          </div>
        </div>

        <div className="stat-card today-time">
          <div className="card-icon">
            <Timer size={24} />
          </div>
          <div className="card-content">
            <h3>Today</h3>
            <span className="stat-value">{stats.todayHours.toFixed(1)}h</span>
            <span className="stat-extra">Tracked today</span>
          </div>
        </div>

        <div className="stat-card week-time">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <h3>This Week</h3>
            <span className="stat-value">{stats.weekHours.toFixed(1)}h</span>
            <span className="stat-extra">Weekly total</span>
          </div>
        </div>

        <div className="stat-card avg-time">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <h3>Daily Average</h3>
            <span className="stat-value">{stats.avgDaily.toFixed(1)}h</span>
            <span className="stat-extra">Per working day</span>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="timer-section">
        <div className="timer-card">
          <div className="timer-header">
            <h3>
              <Timer size={20} />
              Live Timer
            </h3>
            <div className="timer-status">
              <span className={`status-indicator ${isTracking ? 'tracking' : 'paused'}`}>
                {isTracking ? '● Tracking' : '○ Paused'}
              </span>
            </div>
          </div>

          <div className="timer-display">
            <div className="timer-time">
              {formatDuration(currentTimer.elapsedSeconds)}
            </div>
            <div className="timer-actions">
              {!isTracking ? (
                <button
                  onClick={handleStartTracking}
                  disabled={!currentTimer.description.trim()}
                  className="btn-primary timer-btn start-btn"
                >
                  <Play size={16} />
                  Start Timer
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseTracking}
                    className="btn-outline timer-btn pause-btn"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                  <button
                    onClick={handleStopTracking}
                    className="btn-primary timer-btn stop-btn"
                  >
                    <StopCircle size={16} />
                    Stop & Save
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="timer-details">
            <div className="form-group">
              <label>What are you working on?</label>
              <input
                type="text"
                value={currentTimer.description}
                onChange={(e) => setCurrentTimer({...currentTimer, description: e.target.value})}
                placeholder="Describe your current task..."
                className="timer-input"
              />
            </div>
            <div className="form-group">
              <label>Task / Category (Optional)</label>
              <input
                type="text"
                value={currentTimer.task}
                onChange={(e) => setCurrentTimer({...currentTimer, task: e.target.value})}
                placeholder="e.g., Development, Design, Testing"
                className="timer-input"
              />
            </div>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div className="manual-entry-card">
          <div className="entry-header">
            <h3>
              <Plus size={20} />
              Manual Time Entry
            </h3>
            <span className="entry-guide">Add time manually</span>
          </div>

          <form onSubmit={handleManualEntry} className="manual-entry-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <div className="duration-inputs">
                  <div className="duration-group">
                    <input
                      type="number"
                      value={newLog.hours}
                      onChange={(e) => setNewLog({...newLog, hours: parseInt(e.target.value) || 0})}
                      min="0"
                      max="24"
                      className="duration-input"
                    />
                    <span className="duration-label">hours</span>
                  </div>
                  <div className="duration-group">
                    <input
                      type="number"
                      value={newLog.minutes}
                      onChange={(e) => setNewLog({...newLog, minutes: parseInt(e.target.value) || 0})}
                      min="0"
                      max="59"
                      step="5"
                      className="duration-input"
                    />
                    <span className="duration-label">minutes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={newLog.description}
                onChange={(e) => setNewLog({...newLog, description: e.target.value})}
                placeholder="What did you work on?"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Task / Category</label>
              <input
                type="text"
                value={newLog.task}
                onChange={(e) => setNewLog({...newLog, task: e.target.value})}
                placeholder="e.g., Frontend Development"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (newLog.hours === 0 && newLog.minutes === 0)}
              className="btn-primary submit-entry-btn"
            >
              {loading ? (
                <>
                  <Clock size={16} className="spinning" />
                  Adding...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Add Time Entry
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Time Logs History */}
      <div className="time-logs-section">
        <div className="section-header">
          <h3>Time Logs for {formatDate(selectedDate)}</h3>
          <span className="logs-count">
            {timeLogs.length} entr{timeLogs.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {loading ? (
          <div className="loading-logs">
            <RefreshCw size={24} className="spinning" />
            <p>Loading time logs...</p>
          </div>
        ) : timeLogs.length === 0 ? (
          <div className="empty-logs">
            <Clock size={48} />
            <h4>No time entries yet</h4>
            <p>Start tracking your time using the timer or add manual entries</p>
          </div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Description</th>
                  <th>Task</th>
                  <th>Earnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="datetime-cell">
                        <span className="date">{formatDate(log.date)}</span>
                        <span className="time">{formatTime(log.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="duration-cell">
                        <Clock size={14} />
                        <span className="duration">{log.hours.toFixed(2)}h</span>
                      </div>
                    </td>
                    <td className="description-cell">
                      {editingLogId === log._id ? (
                        <input
                          type="text"
                          value={editForm.description || log.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        <span>{log.description}</span>
                      )}
                    </td>
                    <td className="task-cell">
                      {editingLogId === log._id ? (
                        <input
                          type="text"
                          value={editForm.task || log.task || ''}
                          onChange={(e) => setEditForm({...editForm, task: e.target.value})}
                          className="edit-input"
                        />
                      ) : (
                        <span className="task-tag">{log.task || 'General'}</span>
                      )}
                    </td>
                    <td className="earnings-cell">
                      ${calculateEarnings(log.hours)}
                    </td>
                    <td>
                      <div className="log-actions">
                        {editingLogId === log._id ? (
                          <>
                            <button
                              onClick={() => handleEditLog(log._id)}
                              disabled={loading || !editForm.description?.trim()}
                              className="btn-icon save-btn"
                              title="Save"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingLogId(null);
                                setEditForm({});
                              }}
                              className="btn-icon cancel-btn"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingLogId(log._id);
                                setEditForm({
                                  description: log.description,
                                  task: log.task || ''
                                });
                              }}
                              className="btn-icon edit-btn"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log._id)}
                              className="btn-icon delete-btn"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productivity Tips */}
      <div className="productivity-tips">
        <div className="tips-header">
          <h3>
            <TrendingUp size={20} />
            Productivity Tips
          </h3>
        </div>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h4>Set Clear Tasks</h4>
            <p>Break work into specific tasks before starting the timer</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h4>Use Pomodoro</h4>
            <p>Work in focused 25-minute intervals with 5-minute breaks</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📊</div>
            <h4>Review Weekly</h4>
            <p>Analyze your time logs weekly to improve productivity</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🎮</div>
            <h4>Minimize Distractions</h4>
            <p>Use website blockers during focused work sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;