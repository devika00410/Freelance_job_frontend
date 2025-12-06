import { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';
import { 
    FaFilter, 
    FaSortAmountDown, 
    FaSearch, 
    FaTimes,
    FaFire,
    FaStar,
    FaClock,
    FaArrowRight
} from 'react-icons/fa';
// import { motion, AnimatePresence } from 'framer-motion';

const ServiceGrid = ({ 
    services = [], 
    loading = false, 
    error = null,
    title = "All Services",
    subtitle = "Browse our professional services",
    showFilters = true,
    showSearch = true,
    onServiceClick,
    emptyMessage = "No services found",
    columns = 3,
    variant = 'default'
}) => {
    const [filteredServices, setFilteredServices] = useState(services);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('popularity');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeService, setActiveService] = useState(null);

    // Extract unique categories from services
    const categories = ['all', ...new Set(services.map(service => service.category))];

    // Filter and sort services
    useEffect(() => {
        let result = [...services];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(service => 
                service.name.toLowerCase().includes(query) ||
                service.description.toLowerCase().includes(query) ||
                service.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            result = result.filter(service => service.category === selectedCategory);
        }

        // Apply sorting
        switch(sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-low':
                result.sort((a, b) => a.pricing.hourlyRange.min - b.pricing.hourlyRange.min);
                break;
            case 'price-high':
                result.sort((a, b) => b.pricing.hourlyRange.max - a.pricing.hourlyRange.max);
                break;
            case 'rating':
                result.sort((a, b) => b.metrics.clientSatisfaction - a.metrics.clientSatisfaction);
                break;
            case 'popularity':
            default:
                result.sort((a, b) => b.popularity - a.popularity);
                break;
        }

        setFilteredServices(result);
    }, [services, searchQuery, selectedCategory, sortBy]);

    const handleServiceClick = (service) => {
        if (onServiceClick) {
            onServiceClick(service._id);
        }
        setActiveService(service._id);
        setTimeout(() => setActiveService(null), 1000);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSortBy('popularity');
    };

    if (loading) {
        return (
            <div className="py-12">
                <LoadingSpinner text="Loading services..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <ErrorMessage 
                    message={error} 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{emptyMessage}</h3>
                <p className="text-gray-500">Check back later or explore other categories</p>
            </div>
        );
    }

    // Render different variants
    if (variant === 'compact') {
        return (
            <CompactServiceGrid 
                services={filteredServices}
                onServiceClick={handleServiceClick}
            />
        );
    }

    if (variant === 'featured') {
        return (
            <FeaturedServiceGrid 
                services={filteredServices}
                onServiceClick={handleServiceClick}
            />
        );
    }

    if (variant === 'carousel') {
        return (
            <ServiceCarousel 
                services={filteredServices}
                onServiceClick={handleServiceClick}
            />
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
                {subtitle && (
                    <p className="text-gray-600 text-lg">{subtitle}</p>
                )}
                <div className="flex items-center justify-between mt-6">
                    <div className="text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{filteredServices.length}</span> of{' '}
                        <span className="font-semibold text-gray-700">{services.length}</span> services
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="lg:hidden flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <FaFilter className="mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Filters & Search - Desktop */}
            {showFilters && (
                <>
                    <div className="hidden lg:block mb-8">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Search */}
                                {showSearch && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Services
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by name, description, or tags..."
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'All Categories' : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <div className="flex items-center">
                                        <FaSortAmountDown className="mr-2 text-gray-400" />
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="popularity">Most Popular</option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="name-asc">Name: A to Z</option>
                                            <option value="name-desc">Name: Z to A</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters */}
                            {(searchQuery || selectedCategory !== 'all') && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className="text-sm text-gray-600">Active filters:</span>
                                            {searchQuery && (
                                                <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                    Search: "{searchQuery}"
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </span>
                                            )}
                                            {selectedCategory !== 'all' && (
                                                <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    Category: {selectedCategory}
                                                    <button
                                                        onClick={() => setSelectedCategory('all')}
                                                        className="ml-2 text-green-600 hover:text-green-800"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <AnimatePresence>
                        {showMobileFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden mb-6 overflow-hidden"
                            >
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-800">Filters</h3>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Search */}
                                        {showSearch && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Search
                                                </label>
                                                <div className="relative">
                                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Search services..."
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {categories.map(category => (
                                                    <option key={category} value={category}>
                                                        {category === 'all' ? 'All Categories' : category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sort By
                                            </label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="popularity">Most Popular</option>
                                                <option value="rating">Highest Rated</option>
                                                <option value="price-low">Price: Low to High</option>
                                                <option value="price-high">Price: High to Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Services Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${searchQuery}-${selectedCategory}-${sortBy}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services match your filters</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                            <button
                                onClick={clearFilters}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 ${columns >= 2 ? 'md:grid-cols-2' : ''} ${columns >= 3 ? 'lg:grid-cols-3' : ''} ${columns >= 4 ? 'xl:grid-cols-4' : ''} gap-6`}>
                            {filteredServices.map((service, index) => (
                                <motion.div
                                    key={service._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    className={`${activeService === service._id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                >
                                    <ServiceCard 
                                        service={service} 
                                        onClick={() => handleServiceClick(service)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* View More Button (if applicable) */}
            {services.length > filteredServices.length && (
                <div className="mt-12 text-center">
                    <div className="text-gray-500 mb-4">
                        Showing {filteredServices.length} of {services.length} services
                    </div>
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                        View All Services
                        <FaArrowRight className="ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Compact Variant
const CompactServiceGrid = ({ services, onServiceClick }) => {
    return (
        <div className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {services.map(service => (
                    <div
                        key={service._id}
                        onClick={() => onServiceClick(service)}
                        className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
                                <span className="text-xl text-blue-600">
                                    {service.icon || '✨'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                                {service.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {service.description}
                            </p>
                            <div className="text-sm font-bold text-blue-700">
                                ${service.pricing.hourlyRange.min}/hr
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Featured Variant
const FeaturedServiceGrid = ({ services, onServiceClick }) => {
    const featuredServices = services.slice(0, 3); // Show only 3 featured

    return (
        <div className="py-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <FaFire className="mr-2" />
                    Most Popular Services
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Featured Services</h2>
                <p className="text-gray-600 mt-2">Handpicked top-rated services</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredServices.map((service, index) => (
                    <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ y: -10 }}
                        onClick={() => onServiceClick(service)}
                        className="relative group cursor-pointer"
                    >
                        {/* Badge for most popular */}
                        {index === 0 && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    #1 Most Popular
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-8 h-full group-hover:border-blue-300 group-hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl text-white">
                                        {service.icon || '✨'}
                                    </span>
                                </div>
                                {service.popularity > 80 && (
                                    <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        <FaStar className="mr-1" />
                                        Trending
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.name}</h3>
                            <p className="text-gray-600 mb-6 line-clamp-3">
                                {service.description}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-gray-500">Starting from</div>
                                    <div className="text-2xl font-bold text-blue-700">
                                        ${service.pricing.hourlyRange.min}
                                        <span className="text-sm text-gray-500">/hr</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FaStar className="text-yellow-400 mr-1" />
                                        <span className="font-semibold">
                                            {service.metrics.clientSatisfaction.toFixed(1)}
                                        </span>
                                        <span className="text-gray-500 ml-1">
                                            ({service.metrics.successRate}% success)
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <FaClock className="mr-1" />
                                        {service.metrics.avgDeliveryTime}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition group-hover:scale-105">
                                    Browse Freelancers
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Carousel Variant
const ServiceCarousel = ({ services, onServiceClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerView = 3;

    const nextSlide = () => {
        setCurrentIndex(prev => 
            prev + itemsPerView >= services.length ? 0 : prev + itemsPerView
        );
    };

    const prevSlide = () => {
        setCurrentIndex(prev => 
            prev === 0 ? Math.max(0, services.length - itemsPerView) : prev - itemsPerView
        );
    };

    const visibleServices = services.slice(currentIndex, currentIndex + itemsPerView);

    return (
        <div className="py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Browse Services</h2>
                    <p className="text-gray-600">Scroll through our top services</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    >
                        ←
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleServices.map(service => (
                        <div
                            key={service._id}
                            onClick={() => onServiceClick(service)}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                    <span className="text-xl text-blue-600">
                                        {service.icon || '✨'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{service.name}</h3>
                                    <p className="text-sm text-gray-500">{service.category}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {service.description}
                            </p>
                            <div className="flex justify-between items-center">
                                <div className="text-blue-700 font-bold">
                                    ${service.pricing.hourlyRange.min}/hr
                                </div>
                                <div className="flex items-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span>{service.metrics.clientSatisfaction.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: Math.ceil(services.length / itemsPerView) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index * itemsPerView)}
                        className={`w-3 h-3 rounded-full transition ${
                            currentIndex === index * itemsPerView 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ServiceGrid;