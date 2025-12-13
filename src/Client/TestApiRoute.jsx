import React, { useEffect } from 'react';
import axios from 'axios';

const TestAPIRoutes = () => {
  useEffect(() => {
    const testEndpoints = async () => {
      const token = localStorage.getItem('token');
      const endpoints = [
        '/api/test',
        '/api/workspaces',
        '/api/client/workspaces',
        '/api/projects',
        '/api/client/projects'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`http://localhost:3000${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log(`✅ ${endpoint}:`, response.data);
        } catch (error) {
          console.log(`❌ ${endpoint}:`, error.response?.status || error.message);
        }
      }
    };

    testEndpoints();
  }, []);

  return <div>Testing API endpoints... Check console</div>;
};

export default TestAPIRoutes;