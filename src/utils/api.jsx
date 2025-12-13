// api.js
import { API_URL } from './config.js';

export const api = {
  // Services
  getAllServices: () => fetch(`${API_URL}/services`).then(res => res.json()),
  getServiceById: (id) => fetch(`${API_URL}/services/${id}`).then(res => res.json()),
  getPopularServices: () => fetch(`${API_URL}/services/popular`).then(res => res.json()),
  incrementServiceView: (id) => fetch(`${API_URL}/services/${id}/view`, { method: 'PATCH' }),
  
  // Freelancers by service
  getFreelancersByService: (serviceId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/services/${serviceId}/freelancers?${queryParams}`)
      .then(res => res.json());
  },
  
  // Search
  searchFreelancers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/services/search/freelancers?${queryParams}`)
      .then(res => res.json());
  },
  
  // Users / Freelancers
  getFreelancerById: (id) => fetch(`${API_URL}/users/${id}`).then(res => res.json()),

  // Example for creating workspace
  createWorkspace: (data) => fetch(`${API_URL}/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json()),

  // Example for getting user workspaces
  getUserWorkspaces: () => fetch(`${API_URL}/workspaces/user`).then(res => res.json()),
};
