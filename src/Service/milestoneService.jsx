import api from './api';

export const milestoneService = {
  // Get all milestones for a workspace
  getMilestonesByWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/milestones/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single milestone by ID
  getMilestoneById: async (milestoneId) => {
    try {
      const response = await api.get(`/milestones/${milestoneId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new milestone
  createMilestone: async (milestoneData) => {
    try {
      const response = await api.post('/milestones', milestoneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update milestone
  updateMilestone: async (milestoneId, updateData) => {
    try {
      const response = await api.put(`/milestones/${milestoneId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve milestone
  approveMilestone: async (milestoneId) => {
    try {
      const response = await api.patch(`/milestones/${milestoneId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request feedback/changes for milestone
  requestFeedback: async (milestoneId, feedbackData) => {
    try {
      const response = await api.post(`/milestones/${milestoneId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit work for milestone
  submitWork: async (milestoneId, workData) => {
    try {
      const response = await api.post(`/milestones/${milestoneId}/submit`, workData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update milestone progress
  updateProgress: async (milestoneId, progressData) => {
    try {
      const response = await api.patch(`/milestones/${milestoneId}/progress`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete milestone
  deleteMilestone: async (milestoneId) => {
    try {
      const response = await api.delete(`/milestones/${milestoneId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get milestone statistics
  getMilestoneStats: async (workspaceId) => {
    try {
      const response = await api.get(`/milestones/workspace/${workspaceId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default milestoneService;