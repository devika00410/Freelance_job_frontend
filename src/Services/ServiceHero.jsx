import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../Components/Common/SearchBar';
import { SERVICE_ICONS } from '../utils/icons';
import { SERVICE_NAMES, SERVICES } from '../utils/constants';
import { 
    FaArrowRight, 
    FaRocket, 
    FaStar, 
    FaUsers, 
    FaCheckCircle,
    FaPlayCircle,
    FaSearch
} from 'react-icons/fa';

const ServiceHero = ({ variant = 'default' }) => {
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    // Services for the typing animation
    const serviceNames = Object.values(SERVICE_NAMES);

    // Typing animation effect
    useEffect(() => {
        let timeout;
        
        if (isTyping) {
            if (typedText.length < serviceNames[currentServiceIndex].length) {
                timeout = setTimeout(() => {
                    setTypedText(serviceNames[currentServiceIndex].substring(0, typedText.length + 1));
                }, 100);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 1500);
            }
        } else {
            timeout = setTimeout(() => {
                if (typedText.length > 0) {
                    setTypedText(typedText.substring(0, typedText.length - 1));
                } else {
                    setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
                    setIsTyping(true);
                }
            }, 50);
        }

        return () => clearTimeout(timeout);
    }, [typedText, isTyping, currentServiceIndex]);

    // Render different variants
    if (variant === 'minimal') {
        return <MinimalHero typedText={typedText} />;
    }

    if (variant === 'stats') {
        return <StatsHero typedText={typedText} />;
    }

    if (variant === 'video') {
        return <VideoHero typedText={typedText} />;
    }

    // Default variant
    return <DefaultHero typedText={typedText} />;
};

// Default Hero Variant
const DefaultHero = ({ typedText }) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <FaRocket className="mr-2" />
                            <span className="text-sm font-medium">
                                5,000+ Projects Completed
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Find Top
                            <span className="block text-yellow-300 mt-2">
                                {typedText}
                                <span className="animate-pulse">|</span>
                            </span>
                            Freelancers
                        </h1>

                        <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                            Connect with verified professionals for your web development,
                            design, marketing, and business needs.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold">500+</div>
                                <div className="text-blue-200">Freelancers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">100+</div>
                                <div className="text-blue-200">Countries</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">98%</div>
                                <div className="text-blue-200">Success Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">4.9</div>
                                <div className="text-blue-200">Avg Rating</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/services"
                                className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition transform hover:-translate-y-1 shadow-lg"
                            >
                                Browse Services
                                <FaArrowRight className="ml-2" />
                            </Link>
                            <button className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition">
                                <FaPlayCircle className="mr-2" />
                                How It Works
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Search & Services Grid */}
                    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-4">Find Your Expert</h3>
                            <SearchBar className="w-full" />
                            <p className="text-blue-200 mt-3 text-sm">
                                Search for services like "Web Development", "UI/UX Design", or "SEO"
                            </p>
                        </div>

                        {/* Popular Services Grid */}
                        <div>
                            <h4 className="text-xl font-bold mb-4">Popular Services</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SERVICES.slice(0, 6).map((serviceId) => {
                                    const ServiceIcon = SERVICE_ICONS[serviceId];
                                    return (
                                        <Link
                                            key={serviceId}
                                            to={`/services/${serviceId}/freelancers`}
                                            className="group bg-white bg-opacity-5 hover:bg-opacity-20 border border-white border-opacity-10 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                {ServiceIcon && (
                                                    <ServiceIcon className="text-2xl mb-2 text-yellow-300 group-hover:text-yellow-200" />
                                                )}
                                                <span className="font-medium text-sm">
                                                    {SERVICE_NAMES[serviceId]}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        opacity=".25"
                        className="fill-white"
                    ></path>
                    <path
                        d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                        opacity=".5"
                        className="fill-white"
                    ></path>
                    <path
                        d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                        className="fill-white"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

// Minimal Hero Variant
const MinimalHero = ({ typedText }) => {
    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    Hire Expert
                    <span className="block text-blue-400 mt-2">
                        {typedText}
                        <span className="animate-pulse">|</span>
                    </span>
                    Freelancers
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Find pre-vetted professionals for your projects. Quality work, delivered on time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <SearchBar className="max-w-xl mx-auto" />
                </div>
            </div>
        </div>
    );
};

// Stats Hero Variant
const StatsHero = ({ typedText }) => {
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Get Professional
                        <span className="block text-blue-600 mt-2">
                            {typedText}
                            <span className="animate-pulse">|</span>
                        </span>
                        Services
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                        Join thousands of businesses that trust our platform for their creative and technical needs.
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
                        <div className="text-gray-600">Projects Completed</div>
                        <div className="text-sm text-gray-400 mt-1">and counting</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                        <div className="text-gray-600">Client Satisfaction</div>
                        <div className="text-sm text-gray-400 mt-1">based on reviews</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                        <div className="text-gray-600">Expert Freelancers</div>
                        <div className="text-sm text-gray-400 mt-1">verified & vetted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                        <div className="text-gray-600">Support Available</div>
                        <div className="text-sm text-gray-400 mt-1">anytime, anywhere</div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-blue-50 rounded-2xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                            <FaCheckCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Experts</h3>
                        <p className="text-gray-600">
                            Every freelancer is vetted for skills, experience, and professionalism.
                        </p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-2xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
                            <FaStar size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Top Quality</h3>
                        <p className="text-gray-600">
                            Get premium work from experienced professionals in their field.
                        </p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-2xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-4">
                            <FaUsers size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Collaboration</h3>
                        <p className="text-gray-600">
                            Built-in tools for communication, file sharing, and project management.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Video Hero Variant
const VideoHero = ({ typedText }) => {
    const [showVideo, setShowVideo] = useState(false);

    return (
        <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black">
            {/* Background Video/Image */}
            {showVideo ? (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black opacity-60"></div>
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-developer-typing-on-his-computer-50927-large.mp4" type="video/mp4" />
                    </video>
                </div>
            ) : (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
                <div className="inline-flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                    <FaRocket className="mr-2" />
                    <span className="font-medium">#1 Freelance Platform</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    Find Your
                    <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-4">
                        {typedText}
                        <span className="animate-pulse">|</span>
                    </span>
                    Expert
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
                    Connect with top-tier professionals who deliver exceptional results.
                    From startups to enterprises.
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-10">
                    <SearchBar className="w-full" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">500+</div>
                        <div className="text-gray-300 text-sm">Experts Online</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">4.9</div>
                        <div className="text-gray-300 text-sm">Avg Rating</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">24h</div>
                        <div className="text-gray-300 text-sm">Avg Response Time</div>
                    </div>
                </div>

                {/* Video Play Button */}
                <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="mt-12 inline-flex items-center justify-center w-16 h-16 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    aria-label={showVideo ? "Hide video" : "Play video"}
                >
                    {showVideo ? (
                        <span className="text-2xl">✕</span>
                    ) : (
                        <FaPlayCircle size={32} />
                    )}
                </button>
            </div>

            {/* Floating Service Icons */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
                {SERVICES.slice(0, 8).map((serviceId) => {
                    const ServiceIcon = SERVICE_ICONS[serviceId];
                    return (
                        <div
                            key={serviceId}
                            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-20 transition"
                            title={SERVICE_NAMES[serviceId]}
                        >
                            {ServiceIcon && <ServiceIcon className="text-xl text-white" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ServiceHero;