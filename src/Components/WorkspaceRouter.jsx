import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UnifiedWorkspace from './UnifiedWorkspace'; 
import { FaSpinner } from 'react-icons/fa';

const WorkspaceRouter = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserRole(parsedUser.role || 'client');
        }
        
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('Access check failed:', err);
        setError('Cannot access workspace');
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [workspaceId, navigate]);

  if (loading) {
    return (
      <div className="workspace-loading">
        <FaSpinner className="spinning" />
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-error">
        <h3>Access Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return <UnifiedWorkspace userRole={userRole} />;
};

export default WorkspaceRouter;


