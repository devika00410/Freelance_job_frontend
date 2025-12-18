import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FreelancerCard.css';

export default function FreelancerCard({ freelancer }) {
    const navigate = useNavigate();
    
    // Ensure freelancer object has all required properties with defaults
    const safeFreelancer = {
        id: freelancer?.id || freelancer?._id || `freelancer-${Math.random().toString(36).substr(2, 9)}`,
        name: freelancer?.name || 'Unknown Freelancer',
        title: freelancer?.title || freelancer?.jobTitle || 'Professional',
        rate: freelancer?.rate || freelancer?.hourlyRate || '$30/hr',
        rating: freelancer?.rating || 4.5,
        location: freelancer?.location || 'Remote',
        skills: Array.isArray(freelancer?.skills) ? freelancer.skills : 
                freelancer?.expertise ? [freelancer.expertise] : 
                ['General'],
        verified: freelancer?.verified || false,
        experience: freelancer?.experience || '2+ years',
        projects: freelancer?.projects || freelancer?.completedProjects || 0,
        avatar: freelancer?.avatar || freelancer?.profilePicture || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer?.name || 'User')}&size=150&background=1a237e&color=fff`,
        availability: freelancer?.availability || 'Available',
        description: freelancer?.description || freelancer?.bio || 'Skilled professional',
        memberSince: freelancer?.memberSince || '2023',
        completionRate: freelancer?.completionRate || 95,
        category: freelancer?.category || 'general'
    };

    // Handle view profile click
    const handleViewProfile = () => {
        navigate(`/profile/${safeFreelancer.id}`, {
            state: { freelancerId: safeFreelancer.id }
        });
    };

    // Handle hire now click
    const handleHireNow = () => {
        navigate(`/hire/${safeFreelancer.id}`, {
            state: { freelancer: safeFreelancer }
        });
    };

    return (
        <div className="freelancer-card-compact">
            {/* Profile Header */}
            <div className="card-header-compact">
                <div className="avatar-wrapper-compact">
                    <img 
                        src={safeFreelancer.avatar} 
                        alt={safeFreelancer.name}
                        className="avatar-compact"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeFreelancer.name)}&size=150&background=1a237e&color=fff`;
                        }}
                    />
                    {safeFreelancer.verified && (
                        <span className="verified-badge-compact">✓ Verified</span>
                    )}
                </div>
                
                <div className="header-info-compact">
                    <h3 className="name-compact">{safeFreelancer.name}</h3>
                    <p className="title-compact">{safeFreelancer.title}</p>
                    <div className="location-compact">{safeFreelancer.location}</div>
                </div>
            </div>

            {/* Skills Section */}
            <div className="skills-section-compact">
                <div className="skills-tags-compact">
                    {safeFreelancer.skills.slice(0, 3).map((skill, index) => (
                        <span key={`${safeFreelancer.id}-skill-${index}`} className="skill-tag-compact">
                            {skill}
                        </span>
                    ))}
                    {safeFreelancer.skills.length > 3 && (
                        <span className="skill-tag-compact more">+{safeFreelancer.skills.length - 3}</span>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row-compact">
                <div className="stat-item-compact">
                    <span className="stat-value-compact">{safeFreelancer.rating}</span>
                    <span className="stat-label-compact">Rating</span>
                </div>
                <div className="stat-item-compact">
                    <span className="stat-value-compact">{safeFreelancer.projects}</span>
                    <span className="stat-label-compact">Projects</span>
                </div>
                <div className="stat-item-compact">
                    <span className="stat-value-compact">{safeFreelancer.experience}</span>
                    <span className="stat-label-compact">Exp</span>
                </div>
                <div className="stat-item-compact">
                    <span className="stat-value-compact">{safeFreelancer.completionRate}%</span>
                    <span className="stat-label-compact">Success</span>
                </div>
            </div>

            {/* Rate and Availability */}
            <div className="rate-section-compact">
                <div className="rate-info-compact">
                    <span className="rate-label-compact">Rate:</span>
                    <span className="rate-value-compact">{safeFreelancer.rate}</span>
                </div>
                <div className={`availability-badge-compact ${safeFreelancer.availability.toLowerCase().includes('available') ? 'available' : 'busy'}`}>
                    {safeFreelancer.availability}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="actions-compact">
                <button 
                    className="view-btn-compact"
                    onClick={handleViewProfile}
                >
                    View Profile
                </button>
                <button 
                    className="hire-btn-compact"
                    onClick={handleHireNow}
                >
                    Hire
                </button>
            </div>
        </div>
    );
}