import React, { useEffect, useRef, useState } from 'react';
import { videoCallService } from '../Service/videocallService';

const VideoCallComponent = ({ callId, userName, userId, onCallEnd, isOwner = false }) => {
  const videoRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [callStatus, setCallStatus] = useState('loading');
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Load Daily.co script dynamically
    const loadDailyScript = () => {
      return new Promise((resolve, reject) => {
        if (window.DailyIframe) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@daily-co/daily-js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Daily.co script'));
        document.head.appendChild(script);
      });
    };

    const joinVideoCall = async () => {
      try {
        setIsJoining(true);
        
        // Load Daily.co script
        await loadDailyScript();
        
        // Get call details with meeting token
        const callData = await videoCallService.getCallWithToken(callId);
        const { call, meetingToken } = callData;
        
        if (!call.roomUrl) {
          throw new Error('No room URL available for this call');
        }

        // Create call frame
        const frame = window.DailyIframe.createFrame(videoRef.current, {
          url: call.roomUrl,
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px'
          }
        });

        setCallFrame(frame);

        // Set up event listeners
        frame
          .on('joined-meeting', async (event) => {
            console.log('Joined meeting:', event);
            setCallStatus('joined');
            
            // Mark call as started if it's scheduled
            if (call.status === 'scheduled') {
              await videoCallService.startCall(callId);
            }
          })
          .on('participant-joined', (event) => {
            console.log('Participant joined:', event.participant);
            setParticipants(prev => [...prev, event.participant]);
          })
          .on('participant-left', (event) => {
            console.log('Participant left:', event.participant);
            setParticipants(prev => prev.filter(p => p.session_id !== event.participant.session_id));
          })
          .on('left-meeting', async (event) => {
            console.log('Left meeting:', event);
            setCallStatus('left');
            
            // End call in backend if owner
            if (isOwner) {
              await videoCallService.endCall(callId, 'Call completed');
            }
            
            if (onCallEnd) {
              onCallEnd();
            }
          })
          .on('error', (error) => {
            console.error('Daily.co error:', error);
            setCallStatus('error');
          });

        // Join the call with token
        await frame.join({ token: meetingToken });
        
      } catch (error) {
        console.error('Failed to join video call:', error);
        setCallStatus('error');
      } finally {
        setIsJoining(false);
      }
    };

    joinVideoCall();

    // Cleanup function
    return () => {
      if (callFrame) {
        callFrame.leave();
      }
    };
  }, [callId, userName, userId, isOwner, onCallEnd]);

  const leaveCall = () => {
    if (callFrame) {
      callFrame.leave();
    }
  };

  const toggleCamera = async () => {
    if (callFrame) {
      const video = await callFrame.getLocalVideo();
      await callFrame.setLocalVideo(!video);
    }
  };

  const toggleMicrophone = async () => {
    if (callFrame) {
      const audio = await callFrame.getLocalAudio();
      await callFrame.setLocalAudio(!audio);
    }
  };

  if (isJoining) {
    return (
      <div className="video-call-loading">
        <div className="loading-spinner"></div>
        <p>Joining video call...</p>
      </div>
    );
  }

  if (callStatus === 'error') {
    return (
      <div className="video-call-error">
        <h3>Failed to join video call</h3>
        <p>Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <h3>Video Call</h3>
        <div className="participant-count">
          Participants: {participants.length}
        </div>
      </div>
      
      <div ref={videoRef} className="video-frame" />
      
      <div className="video-controls">
        <button onClick={toggleMicrophone} className="control-btn mic-btn">
          🎤
        </button>
        <button onClick={toggleCamera} className="control-btn camera-btn">
          📹
        </button>
        <button onClick={leaveCall} className="control-btn leave-btn">
          📞 Leave
        </button>
      </div>
    </div>
  );
};

export default VideoCallComponent;