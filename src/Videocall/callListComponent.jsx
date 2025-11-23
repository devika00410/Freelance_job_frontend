import React, { useState, useEffect } from 'react';
import { videoCallService } from './videocallService';
import VideoCallComponent from './videocallComponent';

const CallListComponent = ({ workspaceId }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [activeCalls, setActiveCalls] = useState([]);

  useEffect(() => {
    loadCalls();
  }, [workspaceId]);

  const loadCalls = async () => {
    try {
      const response = await videoCallService.getCallsByWorkspace(workspaceId);
      setCalls(response.calls || []);
      
      // Find active/in-progress calls
      const active = response.calls.filter(call => 
        call.status === 'in_progress' || call.status === 'scheduled'
      );
      setActiveCalls(active);
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinScheduledCall = async (call) => {
    setSelectedCall(call);
  };

  const createInstantCall = async () => {
    try {
      const response = await videoCallService.createInstantCall(workspaceId);
      setSelectedCall(response.call);
    } catch (error) {
      console.error('Failed to create instant call:', error);
      alert('Failed to start instant call');
    }
  };

  const handleCallEnd = () => {
    setSelectedCall(null);
    loadCalls(); // Refresh the list
  };

  if (selectedCall) {
    return (
      <div className="video-call-interface">
        <button 
          onClick={() => setSelectedCall(null)} 
          className="back-btn"
        >
          ← Back to Calls
        </button>
        <VideoCallComponent
          callId={selectedCall._id}
          userName={localStorage.getItem('userName') || 'User'}
          userId={localStorage.getItem('userId')}
          isOwner={selectedCall.scheduledBy === localStorage.getItem('userId')}
          onCallEnd={handleCallEnd}
        />
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading calls...</div>;
  }

  return (
    <div className="call-list-container">
      <div className="call-list-header">
        <h2>Video Calls</h2>
        <button onClick={createInstantCall} className="instant-call-btn">
          📞 Start Instant Call
        </button>
      </div>

      <div className="active-calls-section">
        <h3>Active Calls</h3>
        {activeCalls.length === 0 ? (
          <p>No active calls</p>
        ) : (
          activeCalls.map(call => (
            <div key={call._id} className="call-card active">
              <div className="call-info">
                <h4>{call.title}</h4>
                <p>Status: <span className={`status-${call.status}`}>{call.status}</span></p>
                <p>Scheduled: {new Date(call.scheduledTime).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => joinScheduledCall(call)}
                className="join-call-btn"
              >
                Join Call
              </button>
            </div>
          ))
        )}
      </div>

      <div className="scheduled-calls-section">
        <h3>Scheduled Calls</h3>
        {calls.filter(call => call.status === 'scheduled').length === 0 ? (
          <p>No scheduled calls</p>
        ) : (
          calls.filter(call => call.status === 'scheduled').map(call => (
            <div key={call._id} className="call-card scheduled">
              <div className="call-info">
                <h4>{call.title}</h4>
                <p>{new Date(call.scheduledTime).toLocaleString()}</p>
                <p>Duration: {call.duration} minutes</p>
              </div>
              <button 
                onClick={() => joinScheduledCall(call)}
                className="join-call-btn"
                disabled={new Date(call.scheduledTime) > new Date()}
              >
                {new Date(call.scheduledTime) > new Date() ? 'Not Started' : 'Join Call'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="call-history-section">
        <h3>Call History</h3>
        {calls.filter(call => call.status === 'completed').length === 0 ? (
          <p>No call history</p>
        ) : (
          calls.filter(call => call.status === 'completed').map(call => (
            <div key={call._id} className="call-card completed">
              <div className="call-info">
                <h4>{call.title}</h4>
                <p>Completed: {new Date(call.endedAt).toLocaleString()}</p>
                <p>Duration: {call.duration} minutes</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CallListComponent;