import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaRedo, FaHome, FaSearch } from 'react-icons/fa';

const ErrorMessage = ({ 
    type = 'general',
    title,
    message,
    onRetry,
    showIcon = true,
    actionButtons = true,
    className = ''
}) => {
    const errorTypes = {
        general: {
            icon: FaExclamationTriangle,
            defaultTitle: 'Something went wrong',
            defaultMessage: 'An unexpected error occurred. Please try again later.',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-700'
        },
        notFound: {
            icon: FaSearch,
            defaultTitle: 'Not Found',
            defaultMessage: 'The content you are looking for could not be found.',
            iconColor: 'text-gray-500',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-700'
        },
        network: {
            icon: FaExclamationTriangle,
            defaultTitle: 'Network Error',
            defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-700'
        },
        empty: {
            icon: FaSearch,
            defaultTitle: 'No Results Found',
            defaultMessage: 'Try adjusting your search or filter to find what you\'re looking for.',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700'
        },
        accessDenied: {
            icon: FaExclamationTriangle,
            defaultTitle: 'Access Denied',
            defaultMessage: 'You don\'t have permission to access this resource.',
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700'
        }
    };

    const config = errorTypes[type] || errorTypes.general;
    const Icon = config.icon;

    return (
        <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-8 text-center ${className}`}>
            {showIcon && (
                <div className="flex justify-center mb-4">
                    <Icon className={`${config.iconColor} text-5xl`} />
                </div>
            )}
            
            <h3 className={`text-xl font-bold mb-2 ${config.textColor}`}>
                {title || config.defaultTitle}
            </h3>
            
            <p className={`mb-6 ${config.textColor} opacity-90`}>
                {message || config.defaultMessage}
            </p>

            {actionButtons && (
                <div className="flex flex-wrap gap-3 justify-center">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            <FaRedo className="mr-2" />
                            Try Again
                        </button>
                    )}
                    
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                        <FaHome className="mr-2" />
                        Go Home
                    </Link>
                    
                    {type === 'empty' && (
                        <Link
                            to="/services"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            <FaSearch className="mr-2" />
                            Browse Services
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

ErrorMessage.propTypes = {
    type: PropTypes.oneOf(['general', 'notFound', 'network', 'empty', 'accessDenied']),
    title: PropTypes.string,
    message: PropTypes.string,
    onRetry: PropTypes.func,
    showIcon: PropTypes.bool,
    actionButtons: PropTypes.bool,
    className: PropTypes.string
};

export default ErrorMessage;