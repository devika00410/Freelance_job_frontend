import React, { useState, useEffect, useRef } from 'react';
import { 
  FaVideo, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPhone,
  FaLink,
  FaCopy,
  FaDownload,
  FaBell,
  FaCalendarCheck,
  FaCalendarDay,
  FaSpinner,
  FaEye,
  FaFileAlt,
  FaUser,
  FaComments
} from 'react-icons/fa';
import './SharedFeatures.css';
import io from 'socket.io-client';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';


const SharedMeetingScheduler = ({ workspace, userRole, onScheduleMeeting, loading }) => {
  const [meetings, setMeetings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInstantCallModal, setShowInstantCallModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60,
    agenda: ''
  });
  const [socket, setSocket] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallData, setActiveCallData] = useState(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);

  const userId = localStorage.getItem('userId') || JSON.parse(localStorage.getItem('userData') || '{}')._id;

 
useEffect(() => {
  if (!workspace?._id) return;

  const token = localStorage.getItem('token');
  const newSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  });
    setSocket(newSocket);

    // Join workspace room for meetings
    newSocket.emit('join_workspace_meetings', workspace._id);

    // Listen for call invitations
    newSocket.on('call_invitation', (data) => {
      if (data.workspaceId === workspace._id && data.toUserId === userId) {
        if (window.confirm(`${data.fromUserName} is inviting you to a video call. Join now?`)) {
          handleJoinCall(data.meetingLink, data.meetingId);
        }
      }
    });

    // Listen for real-time meeting updates
    newSocket.on('meeting_created', (meeting) => {
      if (meeting.workspaceId === workspace._id) {
        setMeetings(prev => [meeting, ...prev]);
      }
    });

    newSocket.on('meeting_updated', (updatedMeeting) => {
      if (updatedMeeting.workspaceId === workspace._id) {
        setMeetings(prev => prev.map(m => 
          m._id === updatedMeeting._id ? updatedMeeting : m
        ));
      }
    });

    newSocket.on('meeting_cancelled', (meetingId) => {
      setMeetings(prev => prev.filter(m => m._id !== meetingId));
    });

    // Listen for user online status
    newSocket.on('user_online', (onlineUserId) => {
      const otherId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
      if (onlineUserId === otherId) {
        setOtherPartyOnline(true);
      }
    });

    newSocket.on('user_offline', (offlineUserId) => {
      const otherId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
      if (offlineUserId === otherId) {
        setOtherPartyOnline(false);
      }
    });

    // Listen for call ended
    newSocket.on('call_ended', (data) => {
      if (data.workspaceId === workspace._id) {
        setIsCallActive(false);
        setActiveCallData(null);
        alert('The video call has ended.');
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_workspace_meetings', workspace._id);
        newSocket.disconnect();
      }
    };
  }, [workspace, userId, userRole]);

  // Fetch meetings from backend
  useEffect(() => {
    if (workspace?._id) {
      fetchMeetings();
    }
  }, [workspace]);

  const fetchMeetings = async () => {
    try {
      setMeetingLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspace._id}/meetings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMeetings(data.meetings || data.data || []);
        }
      } else {
        console.error('Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.scheduledTime) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const meetingData = {
        ...newMeeting,
        workspaceId: workspace._id,
        scheduledBy: userId,
        scheduledByName: userData.name || userData.username,
        participants: [
          { userId: workspace.clientId, role: 'client' },
          { userId: workspace.freelancerId, role: 'freelancer' }
        ]
      };

      const response = await fetch(`${API_URL}/api/workspaces/${workspace._id}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const createdMeeting = data.meeting || data.data;
          
          // Emit socket event for real-time update
          if (socket) {
            socket.emit('meeting_created', createdMeeting);
          }

          // Send notification to other party
          const otherPartyId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
          if (socket) {
            socket.emit('send_notification', {
              toUserId: otherPartyId,
              workspaceId: workspace._id,
              type: 'meeting_scheduled',
              message: `${userData.name || 'Someone'} scheduled a meeting: ${newMeeting.title}`,
              meetingId: createdMeeting._id
            });
          }

          setShowScheduleModal(false);
          setNewMeeting({
            title: '',
            description: '',
            scheduledTime: '',
            duration: 60,
            agenda: ''
          });
          alert('Meeting scheduled successfully!');
        }
      } else {
        throw new Error('Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting');
    }
  };

  const handleStartInstantCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Generate unique meeting ID
      const meetingId = `instant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const meetingLink = `${window.location.origin}/video-call/${meetingId}`;
      
      const instantMeeting = {
        _id: meetingId,
        title: `Instant Call with ${userRole === 'client' ? workspace.freelancerName : workspace.clientName}`,
        description: 'Instant video call session',
        scheduledTime: new Date().toISOString(),
        duration: 0,
        status: 'live',
        meetingLink,
        workspaceId: workspace._id,
        isInstant: true,
        participants: [
          { userId, role: userRole, name: userData.name || userData.username, joinedAt: new Date().toISOString() }
        ],
        createdBy: userId,
        createdAt: new Date().toISOString()
      };

      // Send socket invitation to other party
      const otherPartyId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
      const otherPartyName = userRole === 'client' ? workspace.freelancerName : workspace.clientName;
      
      if (socket) {
        socket.emit('call_invitation', {
          meetingId,
          meetingLink,
          workspaceId: workspace._id,
          fromUserId: userId,
          fromUserName: userData.name || userData.username,
          toUserId: otherPartyId,
          toUserName: otherPartyName,
          timestamp: new Date().toISOString()
        });
      }

      // Add to local meetings list
      setMeetings(prev => [instantMeeting, ...prev]);
      setActiveCallData(instantMeeting);
      setIsCallActive(true);
      setShowInstantCallModal(false);
      
      // Open meeting in new tab
      window.open(meetingLink, '_blank');
      
      alert('Instant call started! Invitation sent to the other party.');
    } catch (error) {
      console.error('Error starting instant call:', error);
      alert('Failed to start instant call');
    }
  };

  const handleJoinCall = async (meetingLink, meetingId = null) => {
    if (!meetingLink) return;
    
    // Update participant status if meeting exists
    if (meetingId) {
      const meeting = meetings.find(m => m._id === meetingId);
      if (meeting && socket) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        socket.emit('participant_joined', {
          meetingId,
          userId,
          userName: userData.name || userData.username,
          role: userRole,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Open call in new tab
    window.open(meetingLink, '_blank');
  };

  const handleCopyMeetingLink = (meetingLink) => {
    navigator.clipboard.writeText(meetingLink);
    alert('Meeting link copied to clipboard!');
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/workspaces/${workspace._id}/meetings/${meetingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Emit socket event
          if (socket) {
            socket.emit('meeting_cancelled', {
              meetingId,
              workspaceId: workspace._id,
              cancelledBy: userId
            });
          }

          // Send notification to other party
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const otherPartyId = userRole === 'client' ? workspace.freelancerId : workspace.clientId;
          
          if (socket) {
            socket.emit('send_notification', {
              toUserId: otherPartyId,
              workspaceId: workspace._id,
              type: 'meeting_cancelled',
              message: `${userData.name || 'Someone'} cancelled a meeting`,
              meetingId
            });
          }

          // Update local state
          setMeetings(prev => prev.map(m => 
            m._id === meetingId ? { ...m, status: 'cancelled' } : m
          ));
          
          alert('Meeting cancelled successfully!');
        }
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      alert('Failed to cancel meeting');
    }
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setNewMeeting({
      title: meeting.title,
      description: meeting.description,
      scheduledTime: new Date(meeting.scheduledTime).toISOString().slice(0, 16),
      duration: meeting.duration,
      agenda: meeting.agenda || ''
    });
    setShowScheduleModal(true);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not scheduled';
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMeetingStatus = (meeting) => {
    if (meeting.status === 'cancelled') return 'cancelled';
    if (meeting.isInstant && meeting.status === 'live') return 'live';
    
    const now = new Date();
    const meetingTime = new Date(meeting.scheduledTime);
    const endTime = new Date(meetingTime.getTime() + meeting.duration * 60000);

    if (now < meetingTime) return 'upcoming';
    if (now >= meetingTime && now <= endTime) return 'live';
    return 'completed';
  };

  const getUpcomingMeetings = () => {
    return meetings.filter(meeting => {
      const status = getMeetingStatus(meeting);
      return status === 'upcoming' || status === 'live';
    });
  };

  const getPastMeetings = () => {
    return meetings.filter(meeting => {
      const status = getMeetingStatus(meeting);
      return status === 'completed' || status === 'cancelled';
    });
  };

  const handleDownloadRecording = async (recordingUrl, meetingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/meetings/${meetingId}/recording`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${meetingId}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      alert('Failed to download recording');
    }
  };

  const upcomingMeetings = getUpcomingMeetings();
  const pastMeetings = getPastMeetings();

  const getOtherParty = () => {
    if (!workspace) return null;
    return userRole === 'client' 
      ? { id: workspace.freelancerId, name: workspace.freelancerName || 'Freelancer' }
      : { id: workspace.clientId, name: workspace.clientName || 'Client' };
  };

  const otherParty = getOtherParty();

  return (
    <div className="shared-meeting-scheduler">
      {/* Header */}
      <div className="meetings-header">
        <div className="header-left">
          <h2>
            <FaVideo /> Video Calls & Meetings
          </h2>
          <p>
            Schedule and join video calls with {otherParty?.name}
            {otherPartyOnline ? (
              <span className="online-status online"> ● Online</span>
            ) : (
              <span className="online-status offline"> ● Offline</span>
            )}
          </p>
        </div>
        <div className="header-right">
          <div className="meeting-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowInstantCallModal(true)}
              disabled={!otherPartyOnline || meetingLoading}
            >
              {meetingLoading ? <FaSpinner className="spinning" /> : <FaPhone />}
              {otherPartyOnline ? 'Start Instant Call' : 'Other Party Offline'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowScheduleModal(true)}
              disabled={meetingLoading}
            >
              {meetingLoading ? <FaSpinner className="spinning" /> : <FaPlus />}
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="meeting-stats">
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <FaCalendarDay />
          </div>
          <div className="stat-content">
            <h3>{upcomingMeetings.length}</h3>
            <p>Upcoming Meetings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>{pastMeetings.length}</h3>
            <p>Past Meetings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon duration">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{meetings.reduce((sum, m) => sum + (m.duration || 0), 0)}</h3>
            <p>Total Minutes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon participants">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{workspace ? 2 : 0}</h3>
            <p>Participants</p>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="upcoming-meetings-section">
        <h3>
          <FaCalendarAlt /> Upcoming Meetings
        </h3>
        
        {meetingLoading ? (
          <div className="loading-meetings">
            <FaSpinner className="spinning" />
            <p>Loading meetings...</p>
          </div>
        ) : upcomingMeetings.length > 0 ? (
          <div className="meetings-grid">
            {upcomingMeetings.map(meeting => {
              const status = getMeetingStatus(meeting);
              const meetingTime = new Date(meeting.scheduledTime);
              const now = new Date();
              const minutesUntil = Math.round((meetingTime - now) / 60000);
              const isCreator = meeting.createdBy === userId;
              
              return (
                <div key={meeting._id} className={`meeting-card status-${status}`}>
                  <div className="meeting-header">
                    <div className="meeting-title-section">
                      <h4>{meeting.title}</h4>
                      <span className="meeting-status">
                        {status === 'live' ? (
                          <span className="live-indicator">● LIVE</span>
                        ) : (
                          <span className="upcoming-indicator">
                            In {minutesUntil > 60 
                              ? `${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60}m`
                              : `${minutesUntil}m`
                            }
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="meeting-actions">
                      {status === 'live' || meeting.isInstant ? (
                        <button 
                          className="btn-join"
                          onClick={() => handleJoinCall(meeting.meetingLink, meeting._id)}
                        >
                          <FaVideo /> Join Now
                        </button>
                      ) : (
                        <button 
                          className="btn-join"
                          onClick={() => handleCopyMeetingLink(meeting.meetingLink)}
                        >
                          <FaLink /> Copy Link
                        </button>
                      )}
                      {isCreator && (
                        <>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditMeeting(meeting)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={() => handleCancelMeeting(meeting._id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="meeting-details">
                    <p className="meeting-description">{meeting.description}</p>
                    
                    <div className="detail-grid">
                      <div className="detail-item">
                        <FaClock />
                        <div>
                          <span className="detail-label">Time:</span>
                          <span className="detail-value">
                            {formatDateTime(meeting.scheduledTime)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaUsers />
                        <div>
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">{meeting.duration} minutes</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaBell />
                        <div>
                          <span className="detail-label">Agenda:</span>
                          <span className="detail-value">{meeting.agenda || 'No agenda set'}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaUser />
                        <div>
                          <span className="detail-label">Created by:</span>
                          <span className="detail-value">{meeting.createdByName || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    {meeting.meetingLink && (
                      <div className="meeting-link-section">
                        <span className="link-label">Meeting Link:</span>
                        <div className="link-container">
                          <input 
                            type="text" 
                            value={meeting.meetingLink}
                            readOnly
                          />
                          <button 
                            className="btn-copy"
                            onClick={() => handleCopyMeetingLink(meeting.meetingLink)}
                          >
                            <FaCopy /> Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-meetings">
            <FaCalendarAlt />
            <h4>No upcoming meetings</h4>
            <p>Schedule your first meeting to start collaborating</p>
            <button 
              className="btn-primary"
              onClick={() => setShowScheduleModal(true)}
              disabled={meetingLoading}
            >
              {meetingLoading ? <FaSpinner className="spinning" /> : <FaPlus />}
              Schedule Meeting
            </button>
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="past-meetings-section">
          <h3>Past Meetings</h3>
          <div className="past-meetings-table">
            <table>
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastMeetings.map(meeting => (
                  <tr key={meeting._id}>
                    <td>
                      <div className="meeting-info">
                        <h5>{meeting.title}</h5>
                        <p className="meeting-desc">{meeting.description}</p>
                        {meeting.createdByName && (
                          <small className="created-by">Created by: {meeting.createdByName}</small>
                        )}
                      </div>
                    </td>
                    <td>{formatDateTime(meeting.scheduledTime)}</td>
                    <td>{meeting.duration} min</td>
                    <td>
                      <span className={`status-badge ${getMeetingStatus(meeting)}`}>
                        {getMeetingStatus(meeting).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-small"
                          onClick={() => alert('Meeting details would open here')}
                        >
                          <FaEye /> Details
                        </button>
                        {meeting.recordingUrl && (
                          <button 
                            className="btn-small"
                            onClick={() => handleDownloadRecording(meeting.recordingUrl, meeting._id)}
                          >
                            <FaDownload /> Recording
                          </button>
                        )}
                        {meeting.meetingLink && (
                          <button 
                            className="btn-small"
                            onClick={() => handleCopyMeetingLink(meeting.meetingLink)}
                          >
                            <FaCopy /> Copy Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Call Banner */}
      {isCallActive && activeCallData && (
        <div className="active-call-banner">
          <div className="call-info">
            <FaVideo className="call-icon" />
            <div>
              <h4>Active Call: {activeCallData.title}</h4>
              <p>Started at {formatDateTime(activeCallData.scheduledTime)}</p>
            </div>
          </div>
          <button 
            className="btn-join"
            onClick={() => handleJoinCall(activeCallData.meetingLink, activeCallData._id)}
          >
            <FaVideo /> Rejoin Call
          </button>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaCalendarAlt /> {selectedMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
              </h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedMeeting(null);
                  setNewMeeting({
                    title: '',
                    description: '',
                    scheduledTime: '',
                    duration: 60,
                    agenda: ''
                  });
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleScheduleMeeting}>
                <div className="form-group">
                  <label>Meeting Title *</label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="e.g., Design Review, Progress Update"
                    required
                    disabled={meetingLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    placeholder="Brief description of the meeting purpose..."
                    rows="3"
                    disabled={meetingLoading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.scheduledTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, scheduledTime: e.target.value })}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={meetingLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <select
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                      disabled={meetingLoading}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Agenda</label>
                  <textarea
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    placeholder="Meeting agenda points (one per line)..."
                    rows="4"
                    disabled={meetingLoading}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSelectedMeeting(null);
                      setNewMeeting({
                        title: '',
                        description: '',
                        scheduledTime: '',
                        duration: 60,
                        agenda: ''
                      });
                    }}
                    disabled={meetingLoading}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!newMeeting.title || !newMeeting.scheduledTime || meetingLoading}
                  >
                    {meetingLoading ? (
                      <FaSpinner className="spinning" />
                    ) : (
                      <FaCheck />
                    )}
                    {selectedMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Instant Call Modal */}
      {showInstantCallModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FaPhone /> Start Instant Call with {otherParty?.name}
              </h3>
              <button 
                className="close-modal"
                onClick={() => setShowInstantCallModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="instant-call-info">
                <div className="info-icon">
                  <FaVideo />
                </div>
                <h4>Start an instant video call</h4>
                <p>
                  This will generate a unique meeting link and invite {otherParty?.name} to join immediately.
                  {!otherPartyOnline && (
                    <span className="offline-warning">
                      Note: {otherParty?.name} is currently offline. They will receive the invitation when they come online.
                    </span>
                  )}
                </p>
              </div>

              <div className="call-settings">
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable video
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable audio
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Enable screen sharing
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" /> Record meeting (if available)
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowInstantCallModal(false)}
                  disabled={meetingLoading}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartInstantCall}
                  disabled={meetingLoading}
                >
                  {meetingLoading ? (
                    <FaSpinner className="spinning" />
                  ) : (
                    <FaPhone />
                  )}
                  Start Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="calendar-view">
        <h3>Calendar View</h3>
        <div className="calendar-placeholder">
          <FaCalendarAlt />
          <p>Calendar integration coming soon...</p>
          <small>View meetings on a calendar interface</small>
        </div>
      </div>
    </div>
  );
};

export default SharedMeetingScheduler;