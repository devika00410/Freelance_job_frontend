import api from './api';

export const projectService = {
  // Client endpoints
  getClientProjects: async (clientId) => {
    const response = await api.get(`/client/projects/${clientId}`);
    return response.data;
  },

  getProjectStats: async (clientId) => {
    const response = await api.get(`/client/projects/${clientId}/stats`);
    return response.data;
  },

  getPendingActions: async (clientId) => {
    const response = await api.get(`/client/projects/${clientId}/pending-actions`);
    return response.data;
  },

  // Freelancer endpoints
  getFreelancerProjects: async (freelancerId) => {
    const response = await api.get(`/freelancer/projects/${freelancerId}`);
    return response.data;
  },

  getFreelancerStats: async (freelancerId) => {
    const response = await api.get(`/freelancer/projects/${freelancerId}/stats`);
    return response.data;
  },

  getFreelancerPendingActions: async (freelancerId) => {
    const response = await api.get(`/freelancer/projects/${freelancerId}/pending-actions`);
    return response.data;
  }
};

export default projectService;