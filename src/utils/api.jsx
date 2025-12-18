import { API_URL, SOCKET_URL, STRIPE_PUBLISHABLE_KEY } from '../config';


const getDummyServices = () => [
    {
        _id: '1',
        name: 'Web Development',
        description: 'Custom website and web application development',
        category: 'Development',
        tags: ['React', 'Node.js', 'JavaScript'],
        price: { min: 25, max: 100 },
        delivery: '2-4 weeks',
        availableTalents: 50,
        rating: 4.7
    },
    {
        _id: '2',
        name: 'UI/UX Design',
        description: 'User interface and experience design',
        category: 'Design',
        tags: ['Figma', 'Sketch', 'Prototyping'],
        price: { min: 30, max: 90 },
        delivery: '1-3 weeks',
        availableTalents: 35,
        rating: 4.8
    },
    {
        _id: '3',
        name: 'Mobile App Development',
        description: 'iOS and Android mobile applications',
        category: 'Development',
        tags: ['React Native', 'Flutter', 'Swift'],
        price: { min: 40, max: 120 },
        delivery: '3-6 weeks',
        availableTalents: 28,
        rating: 4.6
    },
    {
        _id: '4',
        name: 'Digital Marketing',
        description: 'SEO, social media, and content marketing',
        category: 'Marketing',
        tags: ['SEO', 'Social Media', 'Content'],
        price: { min: 20, max: 80 },
        delivery: 'Ongoing',
        availableTalents: 42,
        rating: 4.5
    },
    {
        _id: '5',
        name: 'Content Writing',
        description: 'Blog posts, articles, and copywriting',
        category: 'Writing',
        tags: ['Blogging', 'SEO', 'Copywriting'],
        price: { min: 15, max: 60 },
        delivery: '24-48 hours',
        availableTalents: 65,
        rating: 4.4
    }
];

export const api = {
    // Services - Simple fetch methods
    getAllServices: () => fetch(`${API_URL}/services`).then(res => res.json()),
    getServiceById: (id) => fetch(`${API_URL}/services/${id}`).then(res => res.json()),
    getPopularServices: () => fetch(`${API_URL}/services/popular`).then(res => res.json()),
    incrementServiceView: (id) => fetch(`${API_URL}/services/${id}/view`, { method: 'PATCH' }),
    
    // Freelancers by service - Simple fetch
    getFreelancersByService: (serviceId, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/services/${serviceId}/freelancers?${queryParams}`).then(res => res.json());
    },
    
    // Search - Simple fetch
    searchFreelancers: (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return fetch(`${API_URL}/services/search/freelancers?${queryParams}`).then(res => res.json());
    },
    
    // User/Freelancer
    getFreelancerById: (id) => fetch(`${API_URL}/users/${id}`).then(res => res.json()),

    // Enhanced async methods with error handling
    async searchFreelancersEnhanced(params = {}) {
        try {
            // Clean up params
            const cleanParams = {};
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
                    cleanParams[key] = params[key];
                }
            });

            // Build query string
            const queryString = new URLSearchParams(cleanParams).toString();
            const url = `${API_URL}/services/search/freelancers?${queryString}`;
            
            console.log('API Call:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data || data.freelancers || [],
                pagination: data.pagination || { total: 0, pages: 1 }
            };
        } catch (error) {
            console.error('Search freelancers error:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    // Enhanced get freelancers by service
    async getFreelancersByServiceEnhanced(serviceId, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_URL}/services/${serviceId}/freelancers?${queryString}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data || data.freelancers || [],
                service: data.service,
                pagination: data.pagination || { total: 0, pages: 1 }
            };
        } catch (error) {
            console.error('Get freelancers by service error:', error);
            return {
                success: false,
                message: error.message,
                data: [],
                service: null,
                pagination: { total: 0, pages: 1 }
            };
        }
    },

    // Enhanced get all services
    async getAllServicesEnhanced() {
        try {
            const url = `${API_URL}/services`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data || data.services || []
            };
        } catch (error) {
            console.error('Get services error:', error);
            // Return dummy services for development
            return {
                success: false,
                message: error.message,
                data: getDummyServices()
            };
        }
    },

    // Add a general purpose API call function
    async fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
                status: response.status
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: error.message,
                data: null,
                status: error.status || 500
            };
        }
    }
};