import api from './api';

export const fileService = {
  // Get all files for a workspace
  getFilesByWorkspace: async (workspaceId) => {
    try {
      const response = await api.get(`/files/workspace/${workspaceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get files by phase
  getFilesByPhase: async (workspaceId, phaseNumber) => {
    try {
      const response = await api.get(`/files/workspace/${workspaceId}/phase/${phaseNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get files by purpose
  getFilesByPurpose: async (workspaceId, purpose) => {
    try {
      const response = await api.get(`/files/workspace/${workspaceId}/purpose/${purpose}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload file
  uploadFile: async (fileData) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('workspaceId', fileData.workspaceId);
      formData.append('uploadedBy', fileData.uploadedBy);
      formData.append('relatedPhase', fileData.relatedPhase);
      formData.append('purpose', fileData.purpose);
      formData.append('description', fileData.description || '');
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single file by ID
  getFileById: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download file
  downloadFile: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update file info
  updateFile: async (fileId, updateData) => {
    try {
      const response = await api.put(`/files/${fileId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete file
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Archive file
  archiveFile: async (fileId) => {
    try {
      const response = await api.patch(`/files/${fileId}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Restore archived file
  restoreFile: async (fileId) => {
    try {
      const response = await api.patch(`/files/${fileId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get file preview/thumbnail
  getFilePreview: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}/preview`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new file version
  createNewVersion: async (fileId, fileData) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('description', fileData.description || '');
      
      const response = await api.post(`/files/${fileId}/version`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get file versions
  getFileVersions: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}/versions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get file statistics
  getFileStats: async (workspaceId) => {
    try {
      const response = await api.get(`/files/workspace/${workspaceId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search files
  searchFiles: async (workspaceId, searchQuery) => {
    try {
      const response = await api.get(`/files/workspace/${workspaceId}/search`, {
        params: { q: searchQuery }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default fileService;