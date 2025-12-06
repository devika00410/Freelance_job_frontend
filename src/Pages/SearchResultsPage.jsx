import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, 
    FaFilter, 
    FaTimes, 
    FaSortAmountDown, 
    FaMapMarkerAlt,
    FaStar,
    FaDollarSign,
    FaClock,
    FaCheckCircle,
    FaUserCheck,
    FaFire,
    FaAngleDown,
    FaAngleUp
} from 'react-icons/fa';
import FreelancerGrid from '../Freelancer/FreelancerGrid';
import ServiceGrid from '../Services/ServiceGrid';
import SearchBar from '../Components/Common/SearchBar';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';
import { api } from '../utils/api';
import { SERVICES, SERVICE_NAMES } from '../utils/constants';

const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Search states
    const [searchType, setSearchType] = useState('freelancers'); 
    const [results, setResults] = useState([]);
    const [servicesResults, setServicesResults] = useState([]);
    const [freelancersResults, setFreelancersResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Search parameters
    const query = searchParams.get('q') || '';
    const service = searchParams.get('service') || '';
    const skills = searchParams.get('skills') || '';
    const location = searchParams.get('location') || '';
    
    // Filter states
    const [filters, setFilters] = useState({
        minRate: searchParams.get('minRate') || '',
        maxRate: searchParams.get('maxRate') || '',
        experienceLevel: searchParams.get('experience')?.split(',') || [],
        availability: searchParams.get('availability') || '',
        verifiedOnly: searchParams.get('verified') === 'true',
        sortBy: searchParams.get('sort') || 'relevance'
    });
    
    // Pagination
    const [pagination, setPagination] = useState({
        page: parseInt(searchParams.get('page')) || 1,
        limit: 12,
        total: 0,
        totalPages: 1
    });
    
    // Advanced filters visibility
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Fetch search results
    const fetchResults = useCallback(async () => {
        if (!query && !service && !skills && !location) {
            setResults([]);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };
            
            if (query) params.q = query;
            if (service) params.service = service;
            if (skills) params.skills = skills;
            if (location) params.location = location;
            
            let response;
            if (searchType === 'services') {
                // Search services
                const allServices = await api.getAllServices();
                if (allServices.success) {
                    let filtered = allServices.data;
                    
                    // Apply search query
                    if (query) {
                        const q = query.toLowerCase();
                        filtered = filtered.filter(s => 
                            s.name.toLowerCase().includes(q) ||
                            s.description.toLowerCase().includes(q) ||
                            s.tags?.some(tag => tag.toLowerCase().includes(q))
                        );
                    }
                    
                    // Apply service filter
                    if (service) {
                        filtered = filtered.filter(s => s._id === service);
                    }
                    
                    // Apply category filter from skills
                    if (skills) {
                        const skillsArray = skills.toLowerCase().split(',');
                        filtered = filtered.filter(s => 
                            skillsArray.some(skill => 
                                s.category?.toLowerCase().includes(skill) ||
                                s.tags?.some(tag => tag.toLowerCase().includes(skill))
                            )
                        );
                    }
                    
                    setServicesResults(filtered);
                    setResults(filtered);
                    setPagination(prev => ({
                        ...prev,
                        total: filtered.length,
                        totalPages: Math.ceil(filtered.length / pagination.limit)
                    }));
                }
            } else {
                // Search freelancers
                response = await api.searchFreelancers(params);
                
                if (response.success) {
                    setFreelancersResults(response.data);
                    setResults(response.data);
                    setPagination({
                        ...pagination,
                        total: response.pagination?.total || 0,
                        totalPages: response.pagination?.pages || 1
                    });
                } else {
                    setError(response.message);
                }
            }
        } catch (err) {
            setError('Failed to fetch search results');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [query, service, skills, location, filters, pagination.page, searchType]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    // Update URL with search parameters
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (query) params.set('q', query);
        if (service) params.set('service', service);
        if (skills) params.set('skills', skills);
        if (location) params.set('location', location);
        
        if (filters.minRate) params.set('minRate', filters.minRate);
        if (filters.maxRate) params.set('maxRate', filters.maxRate);
        if (filters.experienceLevel.length > 0) params.set('experience', filters.experienceLevel.join(','));
        if (filters.availability) params.set('availability', filters.availability);
        if (filters.verifiedOnly) params.set('verified', 'true');
        if (filters.sortBy) params.set('sort', filters.sortBy);
        
        params.set('page', pagination.page.toString());
        
        setSearchParams(params);
    }, [filters, pagination.page, query, service, skills, location, setSearchParams]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            minRate: '',
            maxRate: '',
            experienceLevel: [],
            availability: '',
            verifiedOnly: false,
            sortBy: 'relevance'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get active filter count
    const activeFilterCount = Object.values(filters).filter(v => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'boolean') return v;
        return v !== '' && v !== 'relevance';
    }).length;

    // Quick filter chips
    const quickFilters = [
        { label: 'Under $25/hr', value: { minRate: '0', maxRate: '25' } },
        { label: '$25-50/hr', value: { minRate: '25', maxRate: '50' } },
        { label: 'Expert Level', value: { experienceLevel: ['expert'] } },
        { label: 'Verified Only', value: { verifiedOnly: true } },
        { label: 'Available Now', value: { availability: 'full-time' } },
        { label: 'Top Rated', value: { sortBy: 'rating' } }
    ];

    // Search suggestions based on query
    const getSearchSuggestions = () => {
        if (!query) return [];
        
        const suggestions = [];
        
        // Service name matches
        Object.entries(SERVICE_NAMES).forEach(([id, name]) => {
            if (name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'service',
                    label: name,
                    value: id,
                    icon: '🔧'
                });
            }
        });
        
        // Skill suggestions
        const commonSkills = ['JavaScript', 'React', 'Node.js', 'UI/UX', 'SEO', 'Marketing', 'Content', 'Design'];
        commonSkills.forEach(skill => {
            if (skill.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'skill',
                    label: skill,
                    value: skill,
                    icon: '💡'
                });
            }
        });
        
        return suggestions.slice(0, 5);
    };

    const searchSuggestions = getSearchSuggestions();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {query ? `Search Results for "${query}"` : 
                             service ? `Browse ${SERVICE_NAMES[service] || 'Service'}` :
                             'Search Results'}
                        </h1>
                        <p className="text-blue-100">
                            {results.length > 0 
                                ? `Found ${pagination.total} ${searchType} matching your criteria`
                                : 'No results found. Try adjusting your search.'}
                        </p>
                    </div>
                    
                    {/* Main Search Bar */}
                    <div className="max-w-3xl mx-auto">
                        <SearchBar />
                    </div>
                    
                    {/* Search Type Toggle */}
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-1">
                            <button
                                onClick={() => setSearchType('freelancers')}
                                className={`px-6 py-2 rounded-md transition ${searchType === 'freelancers' ? 'bg-white text-blue-600' : 'text-blue-100 hover:bg-white hover:bg-opacity-10'}`}
                            >
                                Freelancers
                            </button>
                            <button
                                onClick={() => setSearchType('services')}
                                className={`px-6 py-2 rounded-md transition ${searchType === 'services' ? 'bg-white text-blue-600' : 'text-blue-100 hover:bg-white hover:bg-opacity-10'}`}
                            >
                                Services
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:w-1/4">
                        {/* Mobile Filters Toggle */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3"
                            >
                                <div className="flex items-center">
                                    <FaFilter className="mr-2" />
                                    <span className="font-medium">Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </div>
                                {showFilters ? <FaAngleUp /> : <FaAngleDown />}
                            </button>
                        </div>

                        {/* Filters Content */}
                        <AnimatePresence>
                            {(showFilters || window.innerWidth >= 1024) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-xl shadow-sm border p-6"
                                >
                                    {/* Filters Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    {/* Active Filters */}
                                    {activeFilterCount > 0 && (
                                        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex flex-wrap gap-2">
                                                {filters.minRate && filters.maxRate && (
                                                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                                        ${filters.minRate}-${filters.maxRate}/hr
                                                        <button
                                                            onClick={() => handleFilterChange({ minRate: '', maxRate: '' })}
                                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.experienceLevel.map(level => (
                                                    <span key={level} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                                        {level}
                                                        <button
                                                            onClick={() => handleFilterChange({
                                                                experienceLevel: filters.experienceLevel.filter(l => l !== level)
                                                            })}
                                                            className="ml-1 text-green-600 hover:text-green-800"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {filters.availability && (
                                                    <span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                        {filters.availability}
                                                        <button
                                                            onClick={() => handleFilterChange({ availability: '' })}
                                                            className="ml-1 text-purple-600 hover:text-purple-800"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                )}
                                                {filters.verifiedOnly && (
                                                    <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                        Verified Only
                                                        <button
                                                            onClick={() => handleFilterChange({ verifiedOnly: false })}
                                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Filters */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {quickFilters.map((filter, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleFilterChange(filter.value)}
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition"
                                                >
                                                    {filter.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Hourly Rate</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                                                <input
                                                    type="number"
                                                    value={filters.minRate}
                                                    onChange={(e) => handleFilterChange({ minRate: e.target.value })}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                                <input
                                                    type="number"
                                                    value={filters.maxRate}
                                                    onChange={(e) => handleFilterChange({ maxRate: e.target.value })}
                                                    placeholder="200"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Experience Level */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Experience Level</h4>
                                        <div className="space-y-2">
                                            {['beginner', 'intermediate', 'expert'].map(level => (
                                                <label key={level} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.experienceLevel.includes(level)}
                                                        onChange={(e) => {
                                                            const newLevels = e.target.checked
                                                                ? [...filters.experienceLevel, level]
                                                                : filters.experienceLevel.filter(l => l !== level);
                                                            handleFilterChange({ experienceLevel: newLevels });
                                                        }}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600 capitalize">
                                                        {level}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Availability</h4>
                                        <select
                                            value={filters.availability}
                                            onChange={(e) => handleFilterChange({ availability: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="">Any Availability</option>
                                            <option value="full-time">Full Time</option>
                                            <option value="part-time">Part Time</option>
                                            <option value="not-available">Not Available</option>
                                        </select>
                                    </div>

                                    {/* Verification */}
                                    <div className="mb-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.verifiedOnly}
                                                onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked })}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                Verified Freelancers Only
                                            </span>
                                        </label>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h4>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="rating">Highest Rated</option>
                                            <option value="rate-low">Price: Low to High</option>
                                            <option value="rate-high">Price: High to Low</option>
                                            <option value="experience">Most Experienced</option>
                                            <option value="projects">Most Projects</option>
                                        </select>
                                    </div>

                                    {/* Advanced Filters Toggle */}
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            <span>Advanced Filters</span>
                                            {showAdvancedFilters ? <FaAngleUp /> : <FaAngleDown />}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {showAdvancedFilters && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 space-y-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Location</label>
                                                            <input
                                                                type="text"
                                                                value={location}
                                                                onChange={(e) => {
                                                                    const params = new URLSearchParams(searchParams);
                                                                    if (e.target.value) {
                                                                        params.set('location', e.target.value);
                                                                    } else {
                                                                        params.delete('location');
                                                                    }
                                                                    setSearchParams(params);
                                                                }}
                                                                placeholder="City, Country"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Skills (comma separated)</label>
                                                            <input
                                                                type="text"
                                                                value={skills}
                                                                onChange={(e) => {
                                                                    const params = new URLSearchParams(searchParams);
                                                                    if (e.target.value) {
                                                                        params.set('skills', e.target.value);
                                                                    } else {
                                                                        params.delete('skills');
                                                                    }
                                                                    setSearchParams(params);
                                                                }}
                                                                placeholder="e.g., React, Node.js, UI/UX"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Section */}
                    <div className="lg:w-3/4">
                        {/* Results Header */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                        {searchType === 'freelancers' ? 'Freelancers' : 'Services'}
                                    </h2>
                                    <p className="text-gray-600">
                                        {loading ? 'Loading...' : 
                                         results.length > 0 
                                            ? `${pagination.total} results found`
                                            : 'No results found. Try adjusting your filters.'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <div className="text-gray-500 text-sm">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </div>
                                    <div className="hidden md:block">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="relevance">Sort by: Relevance</option>
                                            <option value="rating">Sort by: Rating</option>
                                            <option value="rate-low">Sort by: Price Low to High</option>
                                            <option value="rate-high">Sort by: Price High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Search Suggestions */}
                            {searchSuggestions.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Related Searches</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {searchSuggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    if (suggestion.type === 'service') {
                                                        navigate(`/services/${suggestion.value}/freelancers`);
                                                    } else {
                                                        const params = new URLSearchParams(searchParams);
                                                        params.set('skills', suggestion.value);
                                                        setSearchParams(params);
                                                    }
                                                }}
                                                className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
                                            >
                                                <span className="mr-2">{suggestion.icon}</span>
                                                {suggestion.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="py-12">
                                <LoadingSpinner text="Searching..." />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="py-12">
                                <ErrorMessage 
                                    message={error}
                                    onRetry={fetchResults}
                                />
                            </div>
                        )}

                        {/* Results Grid */}
                        {!loading && !error && (
                            <>
                                {searchType === 'freelancers' ? (
                                    <FreelancerGrid
                                        freelancers={results}
                                        loading={false}
                                        error={null}
                                        emptyMessage="No freelancers found. Try adjusting your search criteria."
                                    />
                                ) : (
                                    <ServiceGrid
                                        services={results}
                                        loading={false}
                                        error={null}
                                        variant="compact"
                                        columns={2}
                                        emptyMessage="No services found. Try adjusting your search criteria."
                                    />
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-12">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="text-gray-500 text-sm">
                                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                                {pagination.total} results
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handlePageChange(pagination.page - 1)}
                                                    disabled={pagination.page === 1}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                >
                                                    Previous
                                                </button>
                                                
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                                        pageNum = pagination.totalPages - 4 + i;
                                                    } else {
                                                        pageNum = pagination.page - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`px-4 py-2 rounded-lg ${
                                                                pagination.page === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                                
                                                <button
                                                    onClick={() => handlePageChange(pagination.page + 1)}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* No Results State */}
                        {!loading && !error && results.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-xl border">
                                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Results Found</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    We couldn't find any {searchType} matching your search criteria.
                                    Try adjusting your filters or search terms.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Clear All Filters
                                    </button>
                                    <button
                                        onClick={() => navigate('/services')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Browse All Services
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Searches */}
                {!loading && !error && results.length > 0 && (
                    <div className="mt-12 pt-12 border-t border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">You might also be interested in</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SERVICES.filter(s => s !== service)
                                .slice(0, 4)
                                .map(serviceId => (
                                    <button
                                        key={serviceId}
                                        onClick={() => navigate(`/services/${serviceId}/freelancers`)}
                                        className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-md transition"
                                    >
                                        <div className="text-3xl mb-3">🔧</div>
                                        <h4 className="font-semibold text-gray-800">{SERVICE_NAMES[serviceId]}</h4>
                                        <p className="text-sm text-gray-500 mt-2">Browse freelancers</p>
                                    </button>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;