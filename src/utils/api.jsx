import { API_URL, SOCKET_URL, STRIPE_PUBLISHABLE_KEY } from '../config';


export const api = {
    // Services
    getAllServices: () => fetch(`${API_URL}/services`).then(res => res.json()),
    getServiceById: (id) => fetch(`${API_URL}/services/${id}`).then(res => res.json()),
    getPopularServices: () => fetch(`${API_URL}/services/popular`).then(res => res.json()),
    incrementServiceView: (id) => fetch(`${API_URL}/services/${id}/view`, { method: 'PATCH' }),
    
    // Freelancers by service
    getFreelancersByService: (serviceId, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/services/${serviceId}/freelancers?${queryParams}`).then(res => res.json());
    },
    
    // Search
    searchFreelancers: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/services/search/freelancers?${queryParams}`).then(res => res.json());
    },
    
    // User/Freelancer
    getFreelancerById: (id) => fetch(`${API_URL}/users/${id}`).then(res => res.json()),
};
