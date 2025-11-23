import api from './api';

export const paymentService = {
  // Get all payments for a workspace
  getPaymentsByWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/payments/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new payment
  createPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process UPI payment
  processUPIPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/upi', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process Razorpay payment
  processRazorpayPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/razorpay', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process card payment
  processCardPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/card', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment
  verifyPayment: async (paymentId, verificationData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status) => {
    try {
      const response = await api.patch(`/payments/${paymentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload payment proof/screenshot
  uploadPaymentProof: async (paymentId, fileData) => {
    try {
      const formData = new FormData();
      formData.append('screenshot', fileData);
      
      const response = await api.post(`/payments/${paymentId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history for user
  getUserPaymentHistory: async (userId) => {
    try {
      const response = await api.get(`/payments/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refund payment
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment statistics
  getPaymentStats: async (workspaceId) => {
    try {
      const response = await api.get(`/payments/workspace/${workspaceId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentService;