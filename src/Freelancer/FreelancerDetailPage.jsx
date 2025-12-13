import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getServiceIcon } from '../utils/icons';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';
import { FaStar, FaCheckCircle, FaMapMarkerAlt, FaBriefcase, FaGlobe, FaPhone, FaEnvelope, FaCalendarAlt, FaCheck } from 'react-icons/fa';

const FreelancerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        fetchFreelancer();
    }, [id]);

    const fetchFreelancer = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // In a real app, you'd have a specific endpoint for freelancer details
            // For now, we'll use the general user endpoint
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setFreelancer(data.data);
            } else {
                setError(data.message || 'Freelancer not found');
            }
        } catch (err) {
            setError('Failed to load freelancer profile');
            console.error('Error fetching freelancer:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleContactClick = () => {
        // In a real app, this would open a contact modal or redirect to messaging
        alert(`Contact ${freelancer?.profile?.name} feature coming soon!`);
    };

    const handleHireClick = (serviceId = null) => {
        if (serviceId) {
            navigate(`/hire?freelancer=${id}&service=${serviceId}`);
        } else {
            navigate(`/hire?freelancer=${id}`);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !freelancer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4 text-gray-300">👤</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                        {error || 'Freelancer Not Found'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        The freelancer profile you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        to="/services"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Browse All Freelancers
                    </Link>
                </div>
            </div>
        );
    }

    const {
        profile,
        skills,
        services,
        experienceLevel,
        freelancerStats,
        portfolio,
        verification,
        badges,
        category
    } = freelancer;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Image & Basic Info */}
                        <div className="md:w-1/3">
                            <div className="sticky top-8">
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <img
                                                src={profile.avatar || '/default-avatar.png'}
                                                alt={profile.name}
                                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                                            />
                                            {verification?.status === 'verified' && (
                                                <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                                    <FaCheckCircle size={20} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <h1 className="text-2xl font-bold text-gray-800 mt-4">
                                            {profile.name}
                                        </h1>
                                        <p className="text-gray-600">{profile.title}</p>
                                        
                                        <div className="flex items-center justify-center mt-2">
                                            <div className="flex items-center text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar
                                                        key={i}
                                                        className={i < Math.floor(freelancerStats?.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                                                        size={16}
                                                    />
                                                ))}
                                            </div>
                                            <span className="ml-2 font-semibold text-gray-700">
                                                {freelancerStats?.avgRating?.toFixed(1) || 'New'}
                                            </span>
                                            <span className="ml-2 text-gray-500">
                                                ({freelancerStats?.completedProjects || 0} jobs)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {freelancerStats?.successRate || 0}%
                                            </div>
                                            <div className="text-xs text-gray-500">Success</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {freelancerStats?.onTimeDelivery || 0}%
                                            </div>
                                            <div className="text-xs text-gray-500">On Time</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {freelancerStats?.repeatClientRate || 0}%
                                            </div>
                                            <div className="text-xs text-gray-500">Repeat</div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="mt-6 space-y-3">
                                        {profile.location && (
                                            <div className="flex items-center text-gray-600">
                                                <FaMapMarkerAlt className="mr-3 text-gray-400" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                        {profile.availability && (
                                            <div className="flex items-center text-gray-600">
                                                <FaBriefcase className="mr-3 text-gray-400" />
                                                <span className="capitalize">{profile.availability.replace('-', ' ')}</span>
                                            </div>
                                        )}
                                        {category && (
                                            <div className="flex items-center text-gray-600">
                                                <FaGlobe className="mr-3 text-gray-400" />
                                                <span>{category}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hourly Rate */}
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-700">
                                                ${profile.hourlyRate || 'N/A'}
                                            </div>
                                            <div className="text-gray-600">per hour</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={() => handleHireClick()}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center"
                                        >
                                            Hire {profile.name.split(' ')[0]}
                                        </button>
                                        <button
                                            onClick={handleContactClick}
                                            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
                                        >
                                            Send Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:w-2/3">
                            {/* Navigation Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-8">
                                    {['overview', 'portfolio', 'services', 'reviews'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                                                activeTab === tab
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* Bio */}
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800 mb-4">About Me</h2>
                                            <p className="text-gray-600 whitespace-pre-line">
                                                {profile.bio || 'No bio provided yet.'}
                                            </p>
                                        </div>

                                        {/* Experience & Skills */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Experience */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center">
                                                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                                                            <FaBriefcase />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-700">
                                                                {experienceLevel ? 
                                                                    experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1) 
                                                                    : 'Beginner'
                                                                } Level
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {freelancerStats?.completedProjects || 0} projects completed
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-3">
                                                            <FaCalendarAlt />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-700">Availability</div>
                                                            <div className="text-sm text-gray-500 capitalize">
                                                                {profile.availability?.replace('-', ' ') || 'Full-time'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills & Expertise</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills && skills.length > 0 ? (
                                                        skills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500">No skills listed</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Services Offered */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Offered</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {services && services.length > 0 ? (
                                                    services.map((serviceId, index) => {
                                                        const ServiceIcon = SERVICE_ICONS[serviceId];
                                                        return (
                                                            <div
                                                                key={index}
                                                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
                                                                onClick={() => setSelectedService(serviceId)}
                                                            >
                                                                <div className="flex items-center">
                                                                    {ServiceIcon && (
                                                                        <div className="text-blue-600 mr-3">
                                                                            <ServiceIcon size={20} />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-gray-800">
                                                                            {serviceId.split('-').map(word => 
                                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                                            ).join(' ')}
                                                                        </h4>
                                                                    </div>
                                                                    <div className="text-blue-600">
                                                                        <FaCheck />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-gray-500">No services listed</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        {badges && badges.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Badges & Achievements</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {badges.map((badge, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2"
                                                        >
                                                            <span className="text-yellow-600 mr-2">🏆</span>
                                                            <span className="text-yellow-800 font-medium">{badge}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Portfolio Tab */}
                                {activeTab === 'portfolio' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Portfolio</h2>
                                        {portfolio && portfolio.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {portfolio.map((item, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-full h-48 object-cover"
                                                            />
                                                        )}
                                                        <div className="p-4">
                                                            <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                                                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                                                            {item.url && (
                                                                <a
                                                                    href={item.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 text-sm font-medium hover:underline"
                                                                >
                                                                    View Project →
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-gray-300 text-6xl mb-4">🎨</div>
                                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Portfolio Items</h3>
                                                <p className="text-gray-500">
                                                    This freelancer hasn't added any portfolio items yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Services Tab */}
                                {activeTab === 'services' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Services & Pricing</h2>
                                        {services && services.length > 0 ? (
                                            <div className="space-y-6">
                                                {services.map((serviceId, index) => {
                                                    const ServiceIcon = SERVICE_ICONS[serviceId];
                                                    return (
                                                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center">
                                                                    {ServiceIcon && (
                                                                        <div className="text-blue-600 mr-3">
                                                                            <ServiceIcon size={24} />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-gray-800">
                                                                            {serviceId.split('-').map(word => 
                                                                                word.charAt(0).toUpperCase() + word.slice(1)
                                                                            ).join(' ')}
                                                                        </h3>
                                                                        <p className="text-gray-600 text-sm">
                                                                            Category: {category || 'General'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-blue-700">
                                                                        ${profile.hourlyRate || 'N/A'}
                                                                    </div>
                                                                    <div className="text-gray-500 text-sm">per hour</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleHireClick(serviceId)}
                                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                                                                >
                                                                    Hire for this Service
                                                                </button>
                                                                <button
                                                                    onClick={handleContactClick}
                                                                    className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                                                                >
                                                                    Ask a Question
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-gray-300 text-6xl mb-4">⚙️</div>
                                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Services Listed</h3>
                                                <p className="text-gray-500">
                                                    This freelancer hasn't listed any specific services yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === 'reviews' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-6">Client Reviews</h2>
                                        {/* Reviews would come from a separate endpoint */}
                                        <div className="text-center py-12">
                                            <div className="text-gray-300 text-6xl mb-4">💬</div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                                            <p className="text-gray-500">
                                                This freelancer hasn't received any reviews yet.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats Section */}
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {freelancerStats?.completedProjects || 0}
                                    </div>
                                    <div className="text-gray-500 text-sm">Projects Completed</div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {freelancerStats?.totalEarnings ? `$${freelancerStats.totalEarnings}` : '$0'}
                                    </div>
                                    <div className="text-gray-500 text-sm">Total Earnings</div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {freelancerStats?.successRate || 0}%
                                    </div>
                                    <div className="text-gray-500 text-sm">Success Rate</div>
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {freelancerStats?.onTimeDelivery || 0}%
                                    </div>
                                    <div className="text-gray-500 text-sm">On-Time Delivery</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Work With {profile.name}?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Get your project started with this talented professional
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => handleHireClick()}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
                        >
                            Hire Now
                        </button>
                        <button
                            onClick={handleContactClick}
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition"
                        >
                            Contact First
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDetailPage;