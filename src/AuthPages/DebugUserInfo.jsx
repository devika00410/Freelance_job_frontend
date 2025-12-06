import React from 'react';
import { useAuth } from '../Context/AuthContext';

const DebugUserInfo = () => {
    const { user } = useAuth();
    
    return (
        <div style={{
            background: '#f8f9fa',
            padding: '10px',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            margin: '10px 0',
            fontSize: '14px'
        }}>
            <h4>🔍 User Session Debug:</h4>
            <p><strong>User ID:</strong> {user?._id || 'No user'}</p>
            <p><strong>Role:</strong> {user?.role || 'No role'}</p>
            <p><strong>Name:</strong> {user?.profile?.name || 'No name'}</p>
            <p><strong>Email:</strong> {user?.email || 'No email'}</p>
            <p><strong>LocalStorage Keys:</strong> {Object.keys(localStorage).filter(key => 
                key.includes('token') || key.includes('user')).join(', ')}
            </p>
        </div>
    );
};

export default DebugUserInfo;