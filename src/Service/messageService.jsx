import api from './api';

export const messageService = {
  // Get all messages for a workspace
  getMessagesByWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/messages/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send new message
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single message by ID
  getMessageById: async (messageId) => {
    try {
      const response = await api.get(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update message (edit)
  updateMessage: async (messageId, updateData) => {
    try {
      const response = await api.put(`/messages/${messageId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark message as read
  markAsRead: async (messageId, userId) => {
    try {
      const response = await api.patch(`/messages/${messageId}/read`, { userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all messages as read for user in workspace
  markAllAsRead: async (workspaceId, userId) => {
    try {
      const response = await api.patch(`/messages/workspace/${workspaceId}/read-all`, { userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread message count
  getUnreadCount: async (workspaceId, userId) => {
    try {
      const response = await api.get(`/messages/workspace/${workspaceId}/unread-count/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload file with message
  uploadMessageFile: async (messageId, fileData) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      
      const response = await api.post(`/messages/${messageId}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reply to message
  replyToMessage: async (messageId, replyData) => {
    try {
      const response = await api.post(`/messages/${messageId}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get message threads
  getMessageThreads: async (workspaceId) => {
    try {
      const response = await api.get(`/messages/workspace/${workspaceId}/threads`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search messages
  searchMessages: async (workspaceId, searchQuery) => {
    try {
      const response = await api.get(`/messages/workspace/${workspaceId}/search`, {
        params: { q: searchQuery }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default messageService;