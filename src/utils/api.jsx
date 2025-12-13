const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    // Services
    getAllServices: () => fetch(`${API_BASE_URL}/services`).then(res => res.json()),
    getServiceById: (id) => fetch(`${API_BASE_URL}/services/${id}`).then(res => res.json()),
    getPopularServices: () => fetch(`${API_BASE_URL}/services/popular`).then(res => res.json()),
    incrementServiceView: (id) => fetch(`${API_BASE_URL}/services/${id}/view`, { method: 'PATCH' }),
    
    // Freelancers by service
    getFreelancersByService: (serviceId, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_BASE_URL}/services/${serviceId}/freelancers?${queryParams}`)
            .then(res => res.json());
    },
    
    // Search
    searchFreelancers: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_BASE_URL}/services/search/freelancers?${queryParams}`)
            .then(res => res.json());
    },
    
    // User/Freelancer
    getFreelancerById: (id) => fetch(`${API_BASE_URL}/users/${id}`).then(res => res.json()),
};