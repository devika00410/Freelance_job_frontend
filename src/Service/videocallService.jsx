import api from './api';

export const videoCallService = {
  // Get all video calls for a workspace
  getCallsByWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/videocalls/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Schedule new video call
  scheduleCall: async (callData) => {
    try {
      const response = await api.post('/videocalls', callData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single call by ID
  getCallById: async (callId) => {
    try {
      const response = await api.get(`/videocalls/${callId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update video call
  updateCall: async (callId, updateData) => {
    try {
      const response = await api.put(`/videocalls/${callId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel video call
  cancelCall: async (callId, cancelData) => {
    try {
      const response = await api.patch(`/videocalls/${callId}/cancel`, cancelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reschedule video call
  rescheduleCall: async (callId, rescheduleData) => {
    try {
      const response = await api.patch(`/videocalls/${callId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Start video call (using PATCH endpoint)
  startCall: async (callId) => {
    try {
      const response = await api.patch(`/videocalls/${callId}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // End video call (using PATCH endpoint)
  endCall: async (callId, endData) => {
    try {
      const response = await api.patch(`/videocalls/${callId}/end`, endData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Join video call
  joinCall: async (callId, participantData) => {
    try {
      const response = await api.post(`/videocalls/${callId}/join`, participantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Leave video call
  leaveCall: async (callId, participantId) => {
    try {
      const response = await api.patch(`/videocalls/${callId}/leave`, { participantId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get call participants
  getCallParticipants: async (callId) => {
    try {
      const response = await api.get(`/videocalls/${callId}/participants`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get upcoming calls
  getUpcomingCalls: async (workspaceId) => {
    try {
      const response = await api.get(`/videocalls/workspace/${workspaceId}/upcoming`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get call history
  getCallHistory: async (workspaceId, limit = 10) => {
    try {
      const response = await api.get(`/videocalls/workspace/${workspaceId}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active calls
  getActiveCalls: async (workspaceId) => {
    try {
      const response = await api.get(`/videocalls/workspace/${workspaceId}/active`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate meeting token/URL
  generateMeetingToken: async (callId, userData) => {
    try {
      const response = await api.post(`/videocalls/${callId}/token`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Save call recording
  saveRecording: async (callId, recordingData) => {
    try {
      const response = await api.post(`/videocalls/${callId}/recording`, recordingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get call recording
  getRecording: async (callId) => {
    try {
      const response = await api.get(`/videocalls/${callId}/recording`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete video call
  deleteCall: async (callId) => {
    try {
      const response = await api.delete(`/videocalls/${callId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get call details with meeting token
  getCallWithToken: async (callId) => {
    try {
      const response = await api.get(`/videocalls/calls/${callId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create instant call
  createInstantCall: async (workspaceId) => {
    try {
      const response = await api.post(`/videocalls/${workspaceId}/instant-call`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get call statistics
  getCallStats: async (workspaceId) => {
    try {
      const response = await api.get(`/videocalls/${workspaceId}/call-stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default videoCallService;