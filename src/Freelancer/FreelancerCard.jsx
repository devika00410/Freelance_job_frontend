import { Link } from 'react-router-dom';

const FreelancerCard = ({ freelancer }) => {
    const { _id, profile, skills, services, experienceLevel, freelancerStats } = freelancer;
    
    const displaySkills = skills?.slice(0, 3) || [];
    const displayServices = services?.slice(0, 2) || [];

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden h-full">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start mb-4">
                    <img
                        src={profile.avatar || '/default-avatar.png'}
                        alt={profile.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                    />
                    <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">
                                    {profile.name}
                                </h3>
                                <p className="text-gray-600">{profile.title}</p>
                            </div>
                            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                <span className="text-yellow-400 mr-1">★</span>
                                {freelancerStats?.avgRating?.toFixed(1) || 'New'}
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            {profile.location && `📍 ${profile.location}`}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-800">{freelancerStats?.completedProjects || 0}</div>
                        <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-bold text-gray-800">{experienceLevel || 'Beginner'}</div>
                        <div className="text-xs text-gray-500">Experience</div>
                    </div>
                </div>

                {/* Hourly Rate */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-center">
                        <span className="text-2xl font-bold text-blue-700">
                            ${profile.hourlyRate || 'N/A'}
                        </span>
                        <span className="text-gray-600 ml-1">/ hour</span>
                    </div>
                </div>

                {/* Skills */}
                {displaySkills.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {displaySkills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services */}
                {displayServices.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                            {displayServices.map((service, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                                >
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link
                        to={`/freelancers/${_id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        View Profile
                    </Link>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                        Hire
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreelancerCard;