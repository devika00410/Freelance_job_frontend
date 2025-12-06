import { Link } from 'react-router-dom';
import { getServiceIcon } from '../utils/icons';

const ServiceCard = ({ service }) => {
    const { _id, name, description, pricing, metrics } = service;

    return (
        <Link to={`/services/${_id}/freelancers`} className="block">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden h-full">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className="text-blue-600 text-2xl mr-3">
                            {getServiceIcon(_id)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                        {description}
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Hourly Rate:</span>
                            <span className="font-bold text-blue-700">
                                ${pricing.hourlyRange.min} - ${pricing.hourlyRange.max}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Rating:</span>
                            <div className="flex items-center">
                                <span className="text-yellow-400 mr-1">★</span>
                                <span className="font-semibold">
                                    {metrics.clientSatisfaction.toFixed(1)}
                                </span>
                                <span className="text-gray-400 ml-1">
                                    ({metrics.successRate}% success)
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                            Browse Freelancers
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ServiceCard;