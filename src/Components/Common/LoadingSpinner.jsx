import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
    fullScreen = false, 
    size = 'medium', 
    text = 'Loading...',
    color = 'blue',
    showText = true 
}) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-12 w-12',
        large: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        white: 'border-white',
        green: 'border-green-600',
        purple: 'border-purple-600'
    };

    const textColors = {
        blue: 'text-blue-600',
        gray: 'text-gray-600',
        white: 'text-white',
        green: 'text-green-600',
        purple: 'text-purple-600'
    };

    const spinner = (
        <div className={`inline-block animate-spin rounded-full border-4 border-solid border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}>
            <span className="sr-only">Loading</span>
        </div>
    );

    // Full screen loading
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex flex-col items-center justify-center z-50">
                <div className="text-center">
                    {spinner}
                    {showText && (
                        <p className={`mt-4 text-lg font-medium ${textColors[color]}`}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Content loading (for in-page)
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
                {spinner}
                {showText && (
                    <p className={`mt-4 ${textColors[color]}`}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

LoadingSpinner.propTypes = {
    fullScreen: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    text: PropTypes.string,
    color: PropTypes.oneOf(['blue', 'gray', 'white', 'green', 'purple']),
    showText: PropTypes.bool
};

export default LoadingSpinner;