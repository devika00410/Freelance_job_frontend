import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
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

// Adding response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // token expired or invalid
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
    // Get freelancer earnings overview (
    getFreelancerEarnings: (workspaceId) => 
        api.get(`/earnings/freelancer${workspaceId ? `?workspaceId=${workspaceId}` : ''}`).then(res => res.data),
    
    // Get earnings overview
    getOverview: () => 
        api.get('/earnings/overview').then(res => res.data),
    
    // Get transactions with filters
    getTransactions: (params = {}) => 
        api.get('/earnings/transactions', { params }).then(res => res.data),
    
    // Get monthly earnings breakdown
    getMonthlyEarnings: (months = 6) => 
        api.get(`/earnings/monthly?months=${months}`).then(res => res.data),
    
    // Get earnings by project
    getProjectEarnings: () => 
        api.get('/earnings/by-project').then(res => res.data),
    
    // Get pending payments
    getPendingPayments: () => 
        api.get('/earnings/pending').then(res => res.data),
    
    // Get detailed stats
    getStats: () => 
        api.get('/earnings/stats').then(res => res.data),
    
    // Request withdrawal
    requestWithdrawal: (withdrawalData) => 
        api.post('/earnings/withdraw', withdrawalData).then(res => res.data),
    
    // Get withdrawal history
    getWithdrawalHistory: () => 
        api.get('/earnings/withdrawals').then(res => res.data)
};

// ============= WORKSPACE API (ALIASES FOR COMPONENTS) =============
// These are the exports your components expect
export const workspaceAPI = {
    // Generic methods
    get: (endpoint) => api.get(endpoint).then(res => res.data),
    post: (endpoint, data) => api.post(endpoint, data).then(res => res.data),
    put: (endpoint, data) => api.put(endpoint, data).then(res => res.data),
    delete: (endpoint) => api.delete(endpoint).then(res => res.data),
    
    // Specific workspace endpoints
    getFreelancerWorkspace: (workspaceId) => 
        api.get(`/workspaces/freelancer/${workspaceId}`).then(res => res.data),
    
    getRecentActivity: (workspaceId) => 
        api.get(`/workspaces/${workspaceId}/activity`).then(res => res.data),
      getFreelancerWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/freelancer/${workspaceId}`).then(res => res.data),
    
    // Or add client version too:
    getClientWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/client/${workspaceId}`).then(res => res.data)
};

export const milestoneAPI = {
    // Get milestones for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/milestones/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get available milestones for submission
    getAvailableMilestones: (workspaceId) => 
        api.get(`/milestones/available/${workspaceId}`).then(res => res.data)
};

export const messageAPI = {
    // Get messages for a workspace
    getByWorkspace: (workspaceId, params = {}) => 
        api.get(`/messages/workspaces/${workspaceId}`, { params }).then(res => res.data)
};

export const fileAPI = {
    // Get files for a workspace
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

// ============= EXISTING SERVICES (KEEP THESE FOR BACKWARD COMPATIBILITY) =============

// Workspace Service
export const workspaceService = {
    // Get workspace by ID
    getWorkspaceById: (workspaceId) => 
        api.get(`/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get all workspaces for current user
    getUserWorkspaces: () => 
        api.get('/workspaces/user').then(res => res.data),
    
    // Create a new workspace
    createWorkspace: (workspaceData) => 
        api.post('/workspaces', workspaceData).then(res => res.data),
    
    // Update workspace
    updateWorkspace: (workspaceId, updateData) => 
        api.put(`/workspaces/${workspaceId}`, updateData).then(res => res.data),
    
    // Delete workspace
    deleteWorkspace: (workspaceId) => 
        api.delete(`/workspaces/${workspaceId}`).then(res => res.data)
};

// Message Service
export const messageService = {
    // Get messages for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/messages/workspaces/${workspaceId}`).then(res => res.data),
    
    // Send a new message
    sendMessage: (messageData) => 
        api.post('/messages', messageData).then(res => res.data),
    
    // Mark message as read
    markAsRead: (messageId) => 
        api.put(`/messages/${messageId}/read`).then(res => res.data),
    
    // Delete a message
    deleteMessage: (messageId) => 
        api.delete(`/messages/${messageId}`).then(res => res.data)
};

// File Service
export const fileService = {
    // Get files for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/files/workspaces/${workspaceId}`).then(res => res.data),
    
    // Upload a file
    uploadFile: (formData) => {
        // Create a separate instance for file upload to avoid content-type header conflict
        const fileApi = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return fileApi.post('/files/upload', formData).then(res => res.data);
    },
    
    // Download a file
    downloadFile: (fileId) => 
        api.get(`/files/download/${fileId}`, { responseType: 'blob' }).then(res => res.data),
    
    // Delete a file
    deleteFile: (fileId) => 
        api.delete(`/files/${fileId}`).then(res => res.data),
    
    // Get file info
    getFileInfo: (fileId) => 
        api.get(`/files/${fileId}`).then(res => res.data)
};

// Milestone Service
export const milestoneService = {
    // Get milestones for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/milestones/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get milestone by ID
    getById: (milestoneId) => 
        api.get(`/milestones/${milestoneId}`).then(res => res.data),
    
    // Create a milestone
    createMilestone: (milestoneData) => 
        api.post('/milestones', milestoneData).then(res => res.data),
    
    // Update milestone
    updateMilestone: (milestoneId, updateData) => 
        api.put(`/milestones/${milestoneId}`, updateData).then(res => res.data),
    
    // Approve milestone
    approveMilestone: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/approve`).then(res => res.data),
    
    // Request feedback for milestone
    requestFeedback: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/request-feedback`).then(res => res.data),
    
    // Mark milestone as completed
    completeMilestone: (milestoneId) => 
        api.put(`/milestones/${milestoneId}/complete`).then(res => res.data),
    
    // Delete milestone
    deleteMilestone: (milestoneId) => 
        api.delete(`/milestones/${milestoneId}`).then(res => res.data)
};

// Video Call Service
export const videoCallService = {
    // Get calls for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/video-calls/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get call by ID
    getById: (callId) => 
        api.get(`/video-calls/${callId}`).then(res => res.data),
    
    // Schedule a new call
    scheduleCall: (callData) => 
        api.post('/video-calls/schedule', callData).then(res => res.data),
    
    // Create instant call
    createInstantCall: (callData) => 
        api.post('/video-calls/instant', callData).then(res => res.data),
    
    // Join a call
    joinCall: (callId) => 
        api.put(`/video-calls/${callId}/join`).then(res => res.data),
    
    // End a call
    endCall: (callId) => 
        api.put(`/video-calls/${callId}/end`).then(res => res.data),
    
    // Cancel a scheduled call
    cancelCall: (callId) => 
        api.delete(`/video-calls/${callId}`).then(res => res.data),
    
    // Get call recording (if available)
    getRecording: (callId) => 
        api.get(`/video-calls/${callId}/recording`).then(res => res.data)
};

// Payment Service
export const paymentService = {
    // Get payments for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/payments/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get payment by ID
    getById: (paymentId) => 
        api.get(`/payments/${paymentId}`).then(res => res.data),
    
    // Create payment intent (for Stripe/Razorpay)
    createPaymentIntent: (paymentData) => 
        api.post('/payments/create-intent', paymentData).then(res => res.data),
    
    // Submit manual payment (with screenshot)
    submitManualPayment: (formData) => {
        const paymentApi = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return paymentApi.post('/payments/manual', formData).then(res => res.data);
    },
    
    // Verify payment
    verifyPayment: (paymentId, verificationData) => 
        api.post(`/payments/${paymentId}/verify`, verificationData).then(res => res.data),
    
    // Get payment history for user
    getUserPayments: () => 
        api.get('/payments/user').then(res => res.data),
    
    // Request refund
    requestRefund: (paymentId, reason) => 
        api.post(`/payments/${paymentId}/refund`, { reason }).then(res => res.data),
    
    // Update payment status (admin only)
    updatePaymentStatus: (paymentId, status) => 
        api.put(`/payments/${paymentId}/status`, { status }).then(res => res.data)
};

// Report Service
export const reportService = {
    // Submit a report
    submitReport: (reportData) => 
        api.post('/reports', reportData).then(res => res.data),
    
    // Get reports for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/reports/workspaces/${workspaceId}`).then(res => res.data),
    
    // Get reports submitted by user
    getUserReports: () => 
        api.get('/reports/user').then(res => res.data),
    
    // Get report by ID
    getById: (reportId) => 
        api.get(`/reports/${reportId}`).then(res => res.data),
    
    // Update report status (admin only)
    updateReportStatus: (reportId, status, adminNotes) => 
        api.put(`/reports/${reportId}/status`, { status, adminNotes }).then(res => res.data),
    
    // Get all reports (admin only)
    getAllReports: () => 
        api.get('/reports/all').then(res => res.data)
};

// Contract Service
export const contractService = {
    // Get contract for a workspace
    getByWorkspace: (workspaceId) => 
        api.get(`/contracts/workspaces/${workspaceId}`).then(res => res.data),
    
    // Create contract
    createContract: (contractData) => 
        api.post('/contracts', contractData).then(res => res.data),
    
    // Sign contract
    signContract: (contractId, signatureData) => 
        api.put(`/contracts/${contractId}/sign`, signatureData).then(res => res.data),
    
    // Terminate contract
    terminateContract: (contractId, reason) => 
        api.delete(`/contracts/${contractId}`, { data: { reason } }).then(res => res.data),
    
    // Get contract terms
    getTerms: (contractId) => 
        api.get(`/contracts/${contractId}/terms`).then(res => res.data)
};

// Notification Service
export const notificationService = {
    // Get user notifications
    getUserNotifications: () => 
        api.get('/notifications').then(res => res.data),
    
    // Mark notification as read
    markAsRead: (notificationId) => 
        api.put(`/notifications/${notificationId}/read`).then(res => res.data),
    
    // Mark all notifications as read
    markAllAsRead: () => 
        api.put('/notifications/read-all').then(res => res.data),
    
    // Delete notification
    deleteNotification: (notificationId) => 
        api.delete(`/notifications/${notificationId}`).then(res => res.data),
    
    // Get notification settings
    getSettings: () => 
        api.get('/notifications/settings').then(res => res.data),
    
    // Update notification settings
    updateSettings: (settings) => 
        api.put('/notifications/settings', settings).then(res => res.data)
};

// User Service
export const userService = {
    // Get current user profile
    getProfile: () => 
        api.get('/users/profile').then(res => res.data),
    
    // Update user profile
    updateProfile: (profileData) => 
        api.put('/users/profile', profileData).then(res => res.data),
    
    // Change password
    changePassword: (passwordData) => 
        api.put('/users/change-password', passwordData).then(res => res.data),
    
    // Upload profile picture
    uploadProfilePicture: (formData) => {
        const userApi = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return userApi.post('/users/upload-picture', formData).then(res => res.data);
    },
    
    // Get user by ID
    getUserById: (userId) => 
        api.get(`/users/${userId}`).then(res => res.data)
};

// Job/Project Service
export const projectService = {
    // Get all projects
    getAllProjects: () => 
        api.get('/projects').then(res => res.data),
    
    // Get project by ID
    getById: (projectId) => 
        api.get(`/projects/${projectId}`).then(res => res.data),
    
    // Create project
    createProject: (projectData) => 
        api.post('/projects', projectData).then(res => res.data),
    
    // Update project
    updateProject: (projectId, updateData) => 
        api.put(`/projects/${projectId}`, updateData).then(res => res.data),
    
    // Delete project
    deleteProject: (projectId) => 
        api.delete(`/projects/${projectId}`).then(res => res.data),
    
    // Apply for project (freelancer)
    applyForProject: (projectId, proposalData) => 
        api.post(`/projects/${projectId}/apply`, proposalData).then(res => res.data),
    
    // Get project applications
    getApplications: (projectId) => 
        api.get(`/projects/${projectId}/applications`).then(res => res.data),
    
    // Hire freelancer for project
    hireFreelancer: (projectId, freelancerId) => 
        api.post(`/projects/${projectId}/hire`, { freelancerId }).then(res => res.data)
};

// Review/Rating Service
export const reviewService = {
    // Submit review
    submitReview: (reviewData) => 
        api.post('/reviews', reviewData).then(res => res.data),
    
    // Get reviews for user
    getUserReviews: (userId) => 
        api.get(`/reviews/user/${userId}`).then(res => res.data),
    
    // Get reviews for workspace
    getWorkspaceReviews: (workspaceId) => 
        api.get(`/reviews/workspaces/${workspaceId}`).then(res => res.data),
    
    // Update review
    updateReview: (reviewId, updateData) => 
        api.put(`/reviews/${reviewId}`, updateData).then(res => res.data),
    
    // Delete review
    deleteReview: (reviewId) => 
        api.delete(`/reviews/${reviewId}`).then(res => res.data),
    
    // Get average rating
    getAverageRating: (userId) => 
        api.get(`/reviews/user/${userId}/average`).then(res => res.data)
};

// Analytics/Stats Service
export const analyticsService = {
    // Get user stats
    getUserStats: () => 
        api.get('/analytics/user-stats').then(res => res.data),
    
    // Get workspace stats
    getWorkspaceStats: (workspaceId) => 
        api.get(`/analytics/workspace-stats/${workspaceId}`).then(res => res.data),
    
    // Get platform stats (admin only)
    getPlatformStats: () => 
        api.get('/analytics/platform-stats').then(res => res.data),
    
    // Get revenue stats (admin only)
    getRevenueStats: () => 
        api.get('/analytics/revenue-stats').then(res => res.data)
};

// Support/Ticket Service
export const supportService = {
    // Create support ticket
    createTicket: (ticketData) => 
        api.post('/support/tickets', ticketData).then(res => res.data),
    
    // Get user tickets
    getUserTickets: () => 
        api.get('/support/tickets').then(res => res.data),
    
    // Get ticket by ID
    getTicketById: (ticketId) => 
        api.get(`/support/tickets/${ticketId}`).then(res => res.data),
    
    // Add message to ticket
    addTicketMessage: (ticketId, messageData) => 
        api.post(`/support/tickets/${ticketId}/messages`, messageData).then(res => res.data),
    
    // Close ticket
    closeTicket: (ticketId) => 
        api.put(`/support/tickets/${ticketId}/close`).then(res => res.data),
    
    // Get all tickets (admin only)
    getAllTickets: () => 
        api.get('/support/tickets/all').then(res => res.data)
};

// Default export
export default api;