
import api from './api';

export const workspaceService = {
  // Get all workspaces for a user
  getUserWorkspaces: async (userId) => {
    try {
      const response = await api.get(`/workspaces/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single workspace by ID
  getWorkspaceById: async (workspaceId) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new workspace
  createWorkspace: async (workspaceData) => {
    try {
      const response = await api.post('/workspaces', workspaceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update workspace
  updateWorkspace: async (workspaceId, updateData) => {
    try {
      const response = await api.put(`/workspaces/${workspaceId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update workspace progress
  updateProgress: async (workspaceId, progressData) => {
    try {
      const response = await api.patch(`/workspaces/${workspaceId}/progress`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add recent activity
  addActivity: async (workspaceId, activityData) => {
    try {
      const response = await api.post(`/workspaces/${workspaceId}/activity`, activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update workspace status
  updateStatus: async (workspaceId, status) => {
    try {
      const response = await api.patch(`/workspaces/${workspaceId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get workspace statistics
  getWorkspaceStats: async (workspaceId) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    try {
      const response = await api.delete(`/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default workspaceService;