import axios from 'axios';
import { API_URL } from '../config'; 

const api = axios.create({
    baseURL: API_URL || 'http://localhost:3000/api', // CHANGED: Use environment variable
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request Interceptor - Token:', token ? 'Yes' : 'No');
        console.log('Endpoint:', config.url);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token added to headers');
        } else {
            console.log('No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============= AUTH API =============
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData).then(res => res.data),
    login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
    adminRegister: (adminData) => api.post('/admin/register', adminData).then(res => res.data),
    adminLogin: (adminCredentials) => api.post('/admin/login', adminCredentials).then(res => res.data)
};

// ============= CLIENT API =============
export const clientAPI = {
    getDashboard: () => api.get('/client/dashboard').then(res => res.data),
    getJobs: () => api.get('/client/jobs').then(res => res.data),
    createJob: (jobData) => api.post('/client/jobs', jobData).then(res => res.data)
};

// ============= FREELANCER API =============
export const freelancerAPI = {
    getDashboard: () => api.get('/freelancer/dashboard').then(res => res.data),
    getJobs: () => api.get('/freelancer/jobs').then(res => res.data)
};

// ============= ADMIN API =============
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard').then(res => res.data),
    getUsers: () => api.get('/admin/users').then(res => res.data)
};

// ============= EARNINGS API =============
export const earningsAPI = {
    getFreelancerEarnings: (workspaceId) => 
        api.get(`/earnings/freelancer${workspaceId ? `?workspaceId=${workspaceId}` : ''}`).then(res => res.data),
    getOverview: () => 
        api.get('/earnings/overview').then(res => res.data),
    getTransactions: (params = {}) => 
        api.get('/earnings/transactions', { params }).then(res => res.data),
    getMonthlyEarnings: (months = 6) => 
        api.get(`/earnings/monthly?months=${months}`).then(res => res.data),
    getProjectEarnings: () => 
        api.get('/earnings/by-project').then(res => res.data),
    getPendingPayments: () => 
        api.get('/earnings/pending').then(res => res.data),
    getStats: () => 
        api.get('/earnings/stats').then(res => res.data),
    requestWithdrawal: (withdrawalData) => 
        api.post('/earnings/withdraw', withdrawalData).then(res => res.data),
    getWithdrawalHistory: () => 
        api.get('/earnings/withdrawals').then(res => res.data)
};

// ============= WORKSPACE API (ALIASES FOR COMPONENTS) =============
export const workspaceAPI = {
    get: (endpoint) => api.get(endpoint).then(res => res.data),
    post: (endpoint, data) => api.post(endpoint, data).then(res => res.data),
    put: (endpoint, data) => api.put(endpoint, data).then(res => res.data),
    delete: (endpoint) => api.delete(endpoint).then(res => res.data),
    getFreelancerWorkspace: (workspaceId) => 
        api.get(`/workspaces/freelancer/${workspaceId}`).then(res => res.data),
    getRecentActivity: (workspaceId) => 
        api.get(`/workspaces/${workspaceId}/activity`).then(res => res.data),
    getFreelancerWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/freelancer/${workspaceId}`).then(res => res.data),
    getClientWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/client/${workspaceId}`).then(res => res.data)
};

export const milestoneAPI = {
    getByWorkspace: (workspaceId) => 
        api.get(`/milestones/workspaces/${workspaceId}`).then(res => res.data),
    getAvailableMilestones: (workspaceId) => 
        api.get(`/milestones/available/${workspaceId}`).then(res => res.data)
};

export const messageAPI = {
    getByWorkspace: (workspaceId, params = {}) => 
        api.get(`/messages/workspaces/${workspaceId}`, { params }).then(res => res.data)
};

export const fileAPI = {
    getByWorkspace: (workspaceId, params = {}) => 
        api.get(`/files/workspaces/${workspaceId}`, { params }).then(res => res.data)
};

// ============= SUBMISSIONS API =============
export const submissionsAPI = {
    submitMilestone: (data) => 
        api.post('/submissions/milestone', data).then(res => res.data),
    getByWorkspace: (workspaceId) => 
        api.get(`/submissions/workspaces/${workspaceId}`).then(res => res.data),
    getAvailableMilestones: (workspaceId) => 
        api.get(`/submissions/available-milestones/${workspaceId}`).then(res => res.data)
};

// ============= EXISTING SERVICES =============

export const workspaceService = {
    getWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/${workspaceId}`).then(res => res.data),
    getUserWorkspaces: () => 
        api.get('/workspaces/user').then(res => res.data),
    createWorkspace: (workspaceData) => 
        api.post('/workspaces', workspaceData).then(res => res.data),
    updateWorkspace: (workspaceId, updateData) => 
        api.put(`/workspaces/${workspaceId}`, updateData).then(res => res.data),
    deleteWorkspace: (workspaceId) => 
        api.delete(`/workspaces/${workspaceId}`).then(res => res.data)
};

export const messageService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/messages/workspaces/${workspaceId}`).then(res => res.data),
    sendMessage: (messageData) => 
        api.post('/messages', messageData).then(res => res.data),
    markAsRead: (messageId) => 
        api.put(`/messages/${messageId}/read`).then(res => res.data),
    deleteMessage: (messageId) => 
        api.delete(`/messages/${messageId}`).then(res => res.data)
};

export const fileService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/files/workspaces/${workspaceId}`).then(res => res.data),
    uploadFile: (formData) => {
        // CHANGED: Use API_URL instead of hardcoded localhost
        const fileApi = axios.create({
            baseURL: API_URL || 'http://localhost:3000/api', // CHANGED
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return fileApi.post('/files/upload', formData).then(res => res.data);
    },
    downloadFile: (fileId) => 
        api.get(`/files/download/${fileId}`, { responseType: 'blob' }).then(res => res.data),
    deleteFile: (fileId) => 
        api.delete(`/files/${fileId}`).then(res => res.data),
    getFileInfo: (fileId) => 
        api.get(`/files/${fileId}`).then(res => res.data)
};

export const milestoneService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/milestones/workspaces/${workspaceId}`).then(res => res.data),
    getById: (milestoneId) => 
        api.get(`/milestones/${milestoneId}`).then(res => res.data),
    createMilestone: (milestoneData) => 
        api.post('/milestones', milestoneData).then(res => res.data),
    updateMilestone: (milestoneId, updateData) => 
        api.put(`/milestones/${milestoneId}`, updateData).then(res => res.data),
    approveMilestone: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/approve`).then(res => res.data),
    requestFeedback: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/request-feedback`).then(res => res.data),
    completeMilestone: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/complete`).then(res => res.data),
    deleteMilestone: (milestoneId) => 
        api.delete(`/milestones/${milestoneId}`).then(res => res.data)
};

export const videoCallService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/video-calls/workspaces/${workspaceId}`).then(res => res.data),
    getById: (callId) => 
        api.get(`/video-calls/${callId}`).then(res => res.data),
    scheduleCall: (callData) => 
        api.post('/video-calls/schedule', callData).then(res => res.data),
    createInstantCall: (callData) => 
        api.post('/video-calls/instant', callData).then(res => res.data),
    joinCall: (callId) => 
        api.put(`/video-calls/${callId}/join`).then(res => res.data),
    endCall: (callId) => 
        api.put(`/video-calls/${callId}/end`).then(res => res.data),
    cancelCall: (callId) => 
        api.delete(`/video-calls/${callId}`).then(res => res.data),
    getRecording: (callId) => 
        api.get(`/video-calls/${callId}/recording`).then(res => res.data)
};

export const paymentService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/payments/workspaces/${workspaceId}`).then(res => res.data),
    getById: (paymentId) => 
        api.get(`/payments/${paymentId}`).then(res => res.data),
    createPaymentIntent: (paymentData) => 
        api.post('/payments/create-intent', paymentData).then(res => res.data),
    submitManualPayment: (formData) => {
        // CHANGED: Use API_URL instead of hardcoded localhost
        const paymentApi = axios.create({
            baseURL: API_URL || 'http://localhost:3000/api', // CHANGED
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return paymentApi.post('/payments/manual', formData).then(res => res.data);
    },
    verifyPayment: (paymentId, verificationData) => 
        api.post(`/payments/${paymentId}/verify`, verificationData).then(res => res.data),
    getUserPayments: () => 
        api.get('/payments/user').then(res => res.data),
    requestRefund: (paymentId, reason) => 
        api.post(`/payments/${paymentId}/refund`, { reason }).then(res => res.data),
    updatePaymentStatus: (paymentId, status) => 
        api.put(`/payments/${paymentId}/status`, { status }).then(res => res.data)
};

export const reportService = {
    submitReport: (reportData) => 
        api.post('/reports', reportData).then(res => res.data),
    getByWorkspace: (workspaceId) => 
        api.get(`/reports/workspaces/${workspaceId}`).then(res => res.data),
    getUserReports: () => 
        api.get('/reports/user').then(res => res.data),
    getById: (reportId) => 
        api.get(`/reports/${reportId}`).then(res => res.data),
    updateReportStatus: (reportId, status, adminNotes) => 
        api.put(`/reports/${reportId}/status`, { status, adminNotes }).then(res => res.data),
    getAllReports: () => 
        api.get('/reports/all').then(res => res.data)
};

export const contractService = {
    getByWorkspace: (workspaceId) => 
        api.get(`/contracts/workspaces/${workspaceId}`).then(res => res.data),
    createContract: (contractData) => 
        api.post('/contracts', contractData).then(res => res.data),
    signContract: (contractId, signatureData) => 
        api.put(`/contracts/${contractId}/sign`, signatureData).then(res => res.data),
    terminateContract: (contractId, reason) => 
        api.delete(`/contracts/${contractId}`, { data: { reason } }).then(res => res.data),
    getTerms: (contractId) => 
        api.get(`/contracts/${contractId}/terms`).then(res => res.data)
};

export const notificationService = {
    getUserNotifications: () => 
        api.get('/notifications').then(res => res.data),
    markAsRead: (notificationId) => 
        api.put(`/notifications/${notificationId}/read`).then(res => res.data),
    markAllAsRead: () => 
        api.put('/notifications/read-all').then(res => res.data),
    deleteNotification: (notificationId) => 
        api.delete(`/notifications/${notificationId}`).then(res => res.data),
    getSettings: () => 
        api.get('/notifications/settings').then(res => res.data),
    updateSettings: (settings) => 
        api.put('/notifications/settings', settings).then(res => res.data)
};

export const userService = {
    getProfile: () => 
        api.get('/users/profile').then(res => res.data),
    updateProfile: (profileData) => 
        api.put('/users/profile', profileData).then(res => res.data),
    changePassword: (passwordData) => 
        api.put('/users/change-password', passwordData).then(res => res.data),
    uploadProfilePicture: (formData) => {
        // CHANGED: Use API_URL instead of hardcoded localhost
        const userApi = axios.create({
            baseURL: API_URL || 'http://localhost:3000/api', // CHANGED
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return userApi.post('/users/upload-picture', formData).then(res => res.data);
    },
    getUserById: (userId) => 
        api.get(`/users/${userId}`).then(res => res.data)
};

export const projectService = {
    getAllProjects: () => 
        api.get('/projects').then(res => res.data),
    getById: (projectId) => 
        api.get(`/projects/${projectId}`).then(res => res.data),
    createProject: (projectData) => 
        api.post('/projects', projectData).then(res => res.data),
    updateProject: (projectId, updateData) => 
        api.put(`/projects/${projectId}`, updateData).then(res => res.data),
    deleteProject: (projectId) => 
        api.delete(`/projects/${projectId}`).then(res => res.data),
    applyForProject: (projectId, proposalData) => 
        api.post(`/projects/${projectId}/apply`, proposalData).then(res => res.data),
    getApplications: (projectId) => 
        api.get(`/projects/${projectId}/applications`).then(res => res.data),
    hireFreelancer: (projectId, freelancerId) => 
        api.post(`/projects/${projectId}/hire`, { freelancerId }).then(res => res.data)
};

export const reviewService = {
    submitReview: (reviewData) => 
        api.post('/reviews', reviewData).then(res => res.data),
    getUserReviews: (userId) => 
        api.get(`/reviews/user/${userId}`).then(res => res.data),
    getWorkspaceReviews: (workspaceId) => 
        api.get(`/reviews/workspaces/${workspaceId}`).then(res => res.data),
    updateReview: (reviewId, updateData) => 
        api.put(`/reviews/${reviewId}`, updateData).then(res => res.data),
    deleteReview: (reviewId) => 
        api.delete(`/reviews/${reviewId}`).then(res => res.data),
    getAverageRating: (userId) => 
        api.get(`/reviews/user/${userId}/average`).then(res => res.data)
};

export const analyticsService = {
    getUserStats: () => 
        api.get('/analytics/user-stats').then(res => res.data),
    getWorkspaceStats: (workspaceId) => 
        api.get(`/analytics/workspace-stats/${workspaceId}`).then(res => res.data),
    getPlatformStats: () => 
        api.get('/analytics/platform-stats').then(res => res.data),
    getRevenueStats: () => 
        api.get('/analytics/revenue-stats').then(res => res.data)
};

export const supportService = {
    createTicket: (ticketData) => 
        api.post('/support/tickets', ticketData).then(res => res.data),
    getUserTickets: () => 
        api.get('/support/tickets').then(res => res.data),
    getTicketById: (ticketId) => 
        api.get(`/support/tickets/${ticketId}`).then(res => res.data),
    addTicketMessage: (ticketId, messageData) => 
        api.post(`/support/tickets/${ticketId}/messages`, messageData).then(res => res.data),
    closeTicket: (ticketId) => 
        api.put(`/support/tickets/${ticketId}/close`).then(res => res.data),
    getAllTickets: () => 
        api.get('/support/tickets/all').then(res => res.data)
};

// Default export
export default api;