import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaFolderOpen, FaTimes } from 'react-icons/fa';
import './NotificationBanner.css'

const NotificationBanner = () => {
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for workspace notification
        const workspaceId = localStorage.getItem('currentWorkspaceId');
        const lastRedirect = localStorage.getItem('lastWorkspaceRedirect');
        
        if (workspaceId) {
            setNotification({
                type: 'workspace',
                message: 'New workspace available!',
                workspaceId,
                timestamp: lastRedirect
            });
        }
    }, []);

    const handleOpenWorkspace = () => {
        if (notification?.workspaceId) {
            navigate(`/workspace/${notification.workspaceId}`);
            setNotification(null);
            localStorage.removeItem('currentWorkspaceId');
        }
    };

    const handleDismiss = () => {
        setNotification(null);
        localStorage.removeItem('currentWorkspaceId');
        localStorage.removeItem('lastWorkspaceRedirect');
    };

    if (!notification) return null;

    return (
        <div className="notification-banner">
            <div className="notification-content">
                <FaBell className="notification-icon" />
                <div className="notification-message">
                    <strong>{notification.message}</strong>
                    <p>Workspace ID: {notification.workspaceId}</p>
                </div>
            </div>
            <div className="notification-actions">
                <button 
                    className="btn-primary"
                    onClick={handleOpenWorkspace}
                >
                    <FaFolderOpen /> Open Workspace
                </button>
                <button 
                    className="btn-secondary"
                    onClick={handleDismiss}
                >
                    <FaTimes /> Dismiss
                </button>
            </div>
        </div>
    );
};

export default NotificationBanner;