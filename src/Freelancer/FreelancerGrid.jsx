import React from 'react';
import FreelancerCard from './FreelancerCard';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';
import './FreelancerGrid.css';

const FreelancerGrid = ({ freelancers, loading, error, emptyMessage = "No freelancers found", columns = 3 }) => {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (freelancers.length === 0) {
        return (
            <div className="freelancer-grid-empty">
                <div className="empty-icon">👤</div>
                <h3 className="empty-title">{emptyMessage}</h3>
                <p className="empty-subtitle">Try adjusting your filters or search for different services</p>
            </div>
        );
    }

    return (
        <div className={`freelancer-grid-container freelancer-grid-${columns}-columns`}>
            {freelancers.map(freelancer => (
                <FreelancerCard key={freelancer._id || freelancer.id} freelancer={freelancer} />
            ))}
        </div>
    );
};

export default FreelancerGrid;