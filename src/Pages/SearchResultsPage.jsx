import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    FaFilter,
    FaTimes,
    FaSortAmountDown,
    FaDollarSign,
    FaClock,
    FaCheckCircle,
    FaUserCheck,
    FaAngleDown,
    FaAngleUp,
    FaUsers,
    FaBriefcase,
    FaGlobe,
    FaSearch,
    FaMapMarkerAlt,
    FaStar,
    FaFire,
    FaTools,
    FaLightbulb,
    FaLaptopCode,
    FaPaintBrush,
    FaBullhorn,
    FaPenFancy,
    FaCode,
    FaMobileAlt
} from 'react-icons/fa';
import FreelancerGrid from '../Freelancer/FreelancerGrid';
import ServiceGrid from '../Services/ServiceGrid';
import SearchBar from '../Components/Common/SearchBar';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';
import { api } from '../utils/api';
import { SERVICES, SERVICE_NAMES } from '../utils/constants';
import dummyData from '../Data/dummyData.json';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Local service mappings for your new service IDs
    const LOCAL_SERVICE_NAMES = {
        'fsd-001': 'Full Stack Development',
        'mad-002': 'Mobile App Development',
        'uxd-003': 'UI/UX Design',
        'seo-004': 'SEO Services',
        'dma-005': 'Digital Marketing',
        'ved-006': 'Video Editing',
        'grd-007': 'Graphic Design',
        'cwr-008': 'Content Writing',
        'wpd-009': 'WordPress Development',
        'dat-010': 'Data Analytics'
    };

    const LOCAL_SERVICES = Object.keys(LOCAL_SERVICE_NAMES);

    // Map service IDs to dummyData categories
    const serviceCategoryMap = {
        'fsd-001': 'web-development',
        'mad-002': 'mobile-development',
        'uxd-003': 'ui-ux-design',
        'seo-004': 'seo-services',
        'dma-005': 'digital-marketing',
        'ved-006': 'video-editing',
        'grd-007': 'graphic-design',
        'cwr-008': 'content-writing',
        'wpd-009': 'web-development',
        'dat-010': 'seo-services' // Fallback since analytics doesn't exist
    };

    // Search states
    const [searchType, setSearchType] = useState('freelancers');
    const [results, setResults] = useState([]);
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
        sortBy: searchParams.get('sort') || 'relevance',
        language: searchParams.get('language') || '',
        category: searchParams.get('category') || ''
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

    // Get service icon
    const getServiceIcon = (serviceId) => {
        const serviceName = LOCAL_SERVICE_NAMES[serviceId]?.toLowerCase() || SERVICE_NAMES[serviceId]?.toLowerCase() || '';

        if (serviceName.includes('web') || serviceName.includes('development')) {
            return <FaLaptopCode className="related-service-icon" />;
        } else if (serviceName.includes('design') || serviceName.includes('creative')) {
            return <FaPaintBrush className="related-service-icon" />;
        } else if (serviceName.includes('mobile') || serviceName.includes('app')) {
            return <FaMobileAlt className="related-service-icon" />;
        } else if (serviceName.includes('marketing')) {
            return <FaBullhorn className="related-service-icon" />;
        } else if (serviceName.includes('writing') || serviceName.includes('content')) {
            return <FaPenFancy className="related-service-icon" />;
        } else if (serviceName.includes('seo')) {
            return <FaSearch className="related-service-icon" />;
        } else {
            return <FaTools className="related-service-icon" />;
        }
    };

    // Get suggestion icon
    const getSuggestionIcon = (type) => {
        switch (type) {
            case 'service':
                return <FaTools className="suggestion-icon" />;
            case 'skill':
                return <FaLightbulb className="suggestion-icon" />;
            default:
                return <FaSearch className="suggestion-icon" />;
        }
    };

    // Get dummy freelancers based on service or query
    const getDummyFreelancers = (serviceId, searchQuery = '') => {
        let freelancers = [];
        
        if (serviceId && serviceCategoryMap[serviceId]) {
            const category = serviceCategoryMap[serviceId];
            freelancers = dummyData.freelancers[category] || [];
        } else if (searchQuery) {
            // Search across all categories
            freelancers = Object.values(dummyData.freelancers).flat();
        } else {
            // Return all freelancers when no service or query
            freelancers = Object.values(dummyData.freelancers).flat();
        }

        // Filter by search query if provided
        if (searchQuery && freelancers.length > 0) {
            const queryLower = searchQuery.toLowerCase();
            freelancers = freelancers.filter(freelancer => 
                freelancer.name.toLowerCase().includes(queryLower) ||
                freelancer.title.toLowerCase().includes(queryLower) ||
                freelancer.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
                freelancer.description.toLowerCase().includes(queryLower)
            );
        }

        return freelancers;
    };

    // Get dummy services based on query
    const getDummyServices = (searchQuery = '') => {
        let services = dummyData.services || [];
        
        if (searchQuery && services.length > 0) {
            const queryLower = searchQuery.toLowerCase();
            services = services.filter(service => 
                service.name.toLowerCase().includes(queryLower) ||
                service.description.toLowerCase().includes(queryLower) ||
                (service.tags && service.tags.some(tag => tag.toLowerCase().includes(queryLower)))
            );
        }

        return services;
    };

    // Apply filters to results
    const applyFilters = (items, isFreelancer = true) => {
        let filtered = [...items];

        if (isFreelancer) {
            // Filter by rate
            if (filters.minRate) {
                const minRate = parseInt(filters.minRate);
                filtered = filtered.filter(f => {
                    const rate = parseInt(f.rate.replace('$', '').replace('/hr', ''));
                    return rate >= minRate;
                });
            }
            if (filters.maxRate) {
                const maxRate = parseInt(filters.maxRate);
                filtered = filtered.filter(f => {
                    const rate = parseInt(f.rate.replace('$', '').replace('/hr', ''));
                    return rate <= maxRate;
                });
            }

            // Filter by experience level
            if (filters.experienceLevel.length > 0) {
                filtered = filtered.filter(f => 
                    filters.experienceLevel.includes(f.experienceLevel)
                );
            }

            // Filter by availability
            if (filters.availability) {
                filtered = filtered.filter(f => 
                    f.availability.toLowerCase().replace(' ', '-').includes(filters.availability)
                );
            }

            // Filter by verification
            if (filters.verifiedOnly) {
                filtered = filtered.filter(f => f.verified);
            }

            // Sort results
            switch(filters.sortBy) {
                case 'rating':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rate-low':
                    filtered.sort((a, b) => {
                        const rateA = parseInt(a.rate.replace('$', '').replace('/hr', ''));
                        const rateB = parseInt(b.rate.replace('$', '').replace('/hr', ''));
                        return rateA - rateB;
                    });
                    break;
                case 'rate-high':
                    filtered.sort((a, b) => {
                        const rateA = parseInt(a.rate.replace('$', '').replace('/hr', ''));
                        const rateB = parseInt(b.rate.replace('$', '').replace('/hr', ''));
                        return rateB - rateA;
                    });
                    break;
                case 'experience':
                    const expOrder = { expert: 3, intermediate: 2, beginner: 1 };
                    filtered.sort((a, b) => {
                        const expA = a.experience ? parseInt(a.experience) : expOrder[a.experienceLevel] || 0;
                        const expB = b.experience ? parseInt(b.experience) : expOrder[b.experienceLevel] || 0;
                        return expB - expA;
                    });
                    break;
                case 'projects':
                    filtered.sort((a, b) => b.projects - a.projects);
                    break;
                default: // relevance
                    // Keep original order for relevance
                    break;
            }
        } else {
            // For services
            // Sort services
            switch(filters.sortBy) {
                case 'rating':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rate-low':
                    filtered.sort((a, b) => a.price.min - b.price.min);
                    break;
                case 'rate-high':
                    filtered.sort((a, b) => b.price.max - a.price.max);
                    break;
                default:
                    break;
            }
        }

        return filtered;
    };

    const fetchResults = useCallback(async () => {
        // If no search parameters at all
        if (!query && !service && !skills && !location) {
            // Show some default results based on search type
            if (searchType === 'freelancers') {
                const defaultFreelancers = Object.values(dummyData.freelancers).flat().slice(0, 12);
                setResults(defaultFreelancers);
                setPagination(prev => ({
                    ...prev,
                    total: defaultFreelancers.length,
                    totalPages: Math.ceil(defaultFreelancers.length / pagination.limit)
                }));
            } else {
                const defaultServices = dummyData.services.slice(0, 12);
                setResults(defaultServices);
                setPagination(prev => ({
                    ...prev,
                    total: defaultServices.length,
                    totalPages: Math.ceil(defaultServices.length / pagination.limit)
                }));
            }
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (searchType === 'services') {
                // Search services
                let services = getDummyServices(query);
                
                // If a specific service ID is provided, filter by it
                if (service && LOCAL_SERVICE_NAMES[service]) {
                    const serviceName = LOCAL_SERVICE_NAMES[service];
                    services = services.filter(s => 
                        s.name.toLowerCase().includes(serviceName.toLowerCase())
                    );
                }

                // Apply filters
                const filteredServices = applyFilters(services, false);
                
                // Paginate
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedServices = filteredServices.slice(startIndex, endIndex);
                
                setResults(paginatedServices);
                setPagination(prev => ({
                    ...prev,
                    total: filteredServices.length,
                    totalPages: Math.ceil(filteredServices.length / pagination.limit)
                }));
            } else {
                // Search freelancers
                let freelancers = getDummyFreelancers(service, query);
                
                // Apply additional filters from URL params
                if (skills) {
                    const skillsArray = skills.toLowerCase().split(',');
                    freelancers = freelancers.filter(f => 
                        skillsArray.some(skill => 
                            f.skills.some(s => s.toLowerCase().includes(skill))
                        )
                    );
                }
                
                if (location) {
                    freelancers = freelancers.filter(f => 
                        f.location.toLowerCase().includes(location.toLowerCase())
                    );
                }

                // Apply filters
                const filteredFreelancers = applyFilters(freelancers, true);
                
                // Paginate
                const startIndex = (pagination.page - 1) * pagination.limit;
                const endIndex = startIndex + pagination.limit;
                const paginatedFreelancers = filteredFreelancers.slice(startIndex, endIndex);
                
                setResults(paginatedFreelancers);
                setPagination(prev => ({
                    ...prev,
                    total: filteredFreelancers.length,
                    totalPages: Math.ceil(filteredFreelancers.length / pagination.limit)
                }));
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch search results. Please try again.');
            
            // Fallback to dummy data
            if (searchType === 'freelancers') {
                const fallbackData = getDummyFreelancers(service, query).slice(0, 12);
                setResults(fallbackData);
            } else {
                const fallbackData = getDummyServices(query).slice(0, 12);
                setResults(fallbackData);
            }
        } finally {
            setLoading(false);
        }
    }, [query, service, skills, location, filters, pagination.page, searchType]);

    // Fetch results when dependencies change
    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
        
        // Update URL params
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, value.join(','));
            } else if (value !== '' && value !== false) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        params.set('page', '1');
        setSearchParams(params);
    };

    const clearFilters = () => {
        const newFilters = {
            minRate: '',
            maxRate: '',
            experienceLevel: [],
            availability: '',
            verifiedOnly: false,
            sortBy: 'relevance',
            language: '',
            category: ''
        };
        
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        
        // Clear filter params from URL
        const params = new URLSearchParams(searchParams);
        Object.keys(newFilters).forEach(key => params.delete(key));
        params.set('page', '1');
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
        
        // Update page in URL
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
        
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
        Object.entries(LOCAL_SERVICE_NAMES).forEach(([id, name]) => {
            if (name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'service',
                    label: name,
                    value: id,
                    icon: getSuggestionIcon('service')
                });
            }
        });

        // Also check original SERVICE_NAMES
        Object.entries(SERVICE_NAMES).forEach(([id, name]) => {
            if (name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'service',
                    label: name,
                    value: id,
                    icon: getSuggestionIcon('service')
                });
            }
        });

        // Skill suggestions from dummy data
        const allSkills = new Set();
        Object.values(dummyData.freelancers).flat().forEach(freelancer => {
            freelancer.skills.forEach(skill => allSkills.add(skill));
        });
        
        Array.from(allSkills).forEach(skill => {
            if (skill.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'skill',
                    label: skill,
                    value: skill,
                    icon: getSuggestionIcon('skill')
                });
            }
        });

        return suggestions.slice(0, 5);
    };

    const searchSuggestions = getSearchSuggestions();

    // Handle search from the page's search bar
    const handleSearch = (searchTerm) => {
        const params = new URLSearchParams();
        params.set('q', searchTerm);
        setSearchParams(params);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="search-results-container">
            {/* Search Header */}
            <div className="search-results-header">
                <div className="search-header-content">
                    <div className="search-title-section">
                        <h1 className="search-main-title">
                            {query ? `Search Results for "${query}"` :
                                service ? `${LOCAL_SERVICE_NAMES[service] || SERVICE_NAMES[service] || 'Service'} Professionals` :
                                skills ? `Talents with ${skills}` :
                                location ? `Talents in ${location}` :
                                'Find Top Talent'}
                        </h1>
                        <p className="search-subtitle">
                            {results.length > 0
                                ? `Found ${pagination.total} ${searchType === 'freelancers' ? 'talents' : 'services'} matching your criteria`
                                : 'Discover skilled professionals ready for your project'}
                        </p>
                    </div>

                    {/* Main Search Bar */}
                    <div className="main-search-wrapper">
                        <SearchBar onSearch={handleSearch} initialValue={query} />
                    </div>

                    {/* Search Type Toggle */}
                    <div className="search-type-toggle">
                        <div className="toggle-container">
                            <button
                                onClick={() => setSearchType('freelancers')}
                                className={`toggle-btn ${searchType === 'freelancers' ? 'active' : ''}`}
                            >
                                <FaUsers className="toggle-icon" />
                                Freelancers
                            </button>
                            <button
                                onClick={() => setSearchType('services')}
                                className={`toggle-btn ${searchType === 'services' ? 'active' : ''}`}
                            >
                                <FaBriefcase className="toggle-icon" />
                                Services
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="search-main-content">
                <div className="content-wrapper">
                    {/* Filters Sidebar */}
                    <div className="filters-sidebar">
                        {/* Mobile Filters Toggle */}
                        <div className="mobile-filters-toggle" onClick={() => setShowFilters(!showFilters)}>
                            <div className="filter-toggle-content">
                                <FaFilter className="filter-icon" />
                                <span className="filter-text">Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="filter-count-badge">{activeFilterCount}</span>
                                )}
                            </div>
                            {showFilters ? <FaAngleUp /> : <FaAngleDown />}
                        </div>

                        {/* Filters Content */}
                        <div className={`filters-content ${showFilters ? 'show' : ''}`}>
                            {/* Filters Header */}
                            <div className="filters-header">
                                <h3 className="filters-title">
                                    <FaFilter className="filters-title-icon" />
                                    Filter Results
                                </h3>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="clear-filters-btn"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Active Filters */}
                            {activeFilterCount > 0 && (
                                <div className="active-filters-container">
                                    <div className="active-filters-list">
                                        {filters.minRate && filters.maxRate && (
                                            <span className="filter-chip rate">
                                                ${filters.minRate}-${filters.maxRate}/hr
                                                <button
                                                    onClick={() => handleFilterChange({ minRate: '', maxRate: '' })}
                                                    className="remove-filter-btn"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        )}
                                        {filters.experienceLevel.map(level => (
                                            <span key={level} className="filter-chip experience">
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                                <button
                                                    onClick={() => handleFilterChange({
                                                        experienceLevel: filters.experienceLevel.filter(l => l !== level)
                                                    })}
                                                    className="remove-filter-btn"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        ))}
                                        {filters.availability && (
                                            <span className="filter-chip availability">
                                                {filters.availability.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                <button
                                                    onClick={() => handleFilterChange({ availability: '' })}
                                                    className="remove-filter-btn"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        )}
                                        {filters.verifiedOnly && (
                                            <span className="filter-chip verified">
                                                Verified Only
                                                <button
                                                    onClick={() => handleFilterChange({ verifiedOnly: false })}
                                                    className="remove-filter-btn"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick Filters */}
                            <div className="quick-filters-section">
                                <h4 className="quick-filters-title">Quick Filters</h4>
                                <div className="quick-filters-list">
                                    {quickFilters.map((filter, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleFilterChange(filter.value)}
                                            className="quick-filter-btn"
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">
                                    <FaDollarSign className="filter-group-icon" />
                                    Hourly Rate
                                </h4>
                                <div className="price-range-inputs">
                                    <div className="price-input-group">
                                        <label className="price-label">Min ($)</label>
                                        <input
                                            type="number"
                                            value={filters.minRate}
                                            onChange={(e) => handleFilterChange({ minRate: e.target.value })}
                                            placeholder="0"
                                            className="price-input"
                                            min="0"
                                        />
                                    </div>
                                    <div className="price-input-group">
                                        <label className="price-label">Max ($)</label>
                                        <input
                                            type="number"
                                            value={filters.maxRate}
                                            onChange={(e) => handleFilterChange({ maxRate: e.target.value })}
                                            placeholder="200"
                                            className="price-input"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">
                                    <FaUserCheck className="filter-group-icon" />
                                    Experience Level
                                </h4>
                                <div className="checkbox-group">
                                    {['beginner', 'intermediate', 'expert'].map(level => (
                                        <label key={level} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={filters.experienceLevel.includes(level)}
                                                onChange={(e) => {
                                                    const newLevels = e.target.checked
                                                        ? [...filters.experienceLevel, level]
                                                        : filters.experienceLevel.filter(l => l !== level);
                                                    handleFilterChange({ experienceLevel: newLevels });
                                                }}
                                                className="checkbox-input"
                                            />
                                            <span className="checkbox-label">
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">
                                    <FaClock className="filter-group-icon" />
                                    Availability
                                </h4>
                                <select
                                    value={filters.availability}
                                    onChange={(e) => handleFilterChange({ availability: e.target.value })}
                                    className="select-input"
                                >
                                    <option value="">Any Availability</option>
                                    <option value="full-time">Full Time</option>
                                    <option value="part-time">Part Time</option>
                                    <option value="available">Available</option>
                                </select>
                            </div>

                            {/* Verification */}
                            <div className="filter-group">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={filters.verifiedOnly}
                                        onChange={(e) => handleFilterChange({ verifiedOnly: e.target.checked })}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-label">
                                        <FaCheckCircle className="checkbox-icon" />
                                        Verified Freelancers Only
                                    </span>
                                </label>
                            </div>

                            {/* Sort Options */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">
                                    <FaSortAmountDown className="filter-group-icon" />
                                    Sort By
                                </h4>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                    className="select-input"
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
                            <div className="advanced-filters-section">
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="advanced-toggle-btn"
                                >
                                    <span>Advanced Filters</span>
                                    {showAdvancedFilters ? <FaAngleUp /> : <FaAngleDown />}
                                </button>

                                {showAdvancedFilters && (
                                    <div className="advanced-filters-content">
                                        <div className="advanced-filters-grid">
                                            <div className="advanced-filter-group">
                                                <label className="price-label">
                                                    <FaGlobe /> Language
                                                </label>
                                                <select
                                                    value={filters.language}
                                                    onChange={(e) => handleFilterChange({ language: e.target.value })}
                                                    className="price-input"
                                                >
                                                    <option value="">Any Language</option>
                                                    <option value="english">English</option>
                                                    <option value="spanish">Spanish</option>
                                                    <option value="french">French</option>
                                                    <option value="mandarin">Mandarin</option>
                                                </select>
                                            </div>
                                            <div className="advanced-filter-group">
                                                <label className="price-label">
                                                    <FaBriefcase /> Category
                                                </label>
                                                <select
                                                    value={filters.category}
                                                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                                                    className="price-input"
                                                >
                                                    <option value="">All Categories</option>
                                                    <option value="web-development">Web Development</option>
                                                    <option value="ui-ux-design">UI/UX Design</option>
                                                    <option value="mobile-development">Mobile Development</option>
                                                    <option value="digital-marketing">Digital Marketing</option>
                                                    <option value="content-writing">Content Writing</option>
                                                    <option value="graphic-design">Graphic Design</option>
                                                    <option value="video-editing">Video Editing</option>
                                                    <option value="seo-services">SEO Services</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="results-section">
                        {/* Results Header */}
                        <div className="results-header">
                            <div className="results-header-content">
                                <div className="results-title-section">
                                    <div>
                                        <h2 className="results-title">
                                            {searchType === 'freelancers' ? 'Available Talents' : 'Services'}
                                        </h2>
                                        <p className="results-count">
                                            {loading ? 'Searching for the best talents...' :
                                                results.length > 0
                                                    ? `${pagination.total} ${searchType === 'freelancers' ? 'talents' : 'services'} found`
                                                    : 'No results found. Try adjusting your filters.'}
                                        </p>
                                    </div>

                                    <div className="results-controls">
                                        <div className="page-info">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </div>
                                        <div className="desktop-sort-select">
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                                className="select-input"
                                            >
                                                <option value="relevance">Sort by: Relevance</option>
                                                <option value="rating">Sort by: Rating</option>
                                                <option value="rate-low">Sort by: Price Low to High</option>
                                                <option value="rate-high">Sort by: Price High to Low</option>
                                                <option value="experience">Sort by: Experience</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Suggestions */}
                                {searchSuggestions.length > 0 && (
                                    <div className="search-suggestions-section">
                                        <h4 className="suggestions-title">Related Searches</h4>
                                        <div className="suggestions-list">
                                            {searchSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        if (suggestion.type === 'service') {
                                                            // Navigate to service search
                                                            const params = new URLSearchParams();
                                                            params.set('service', suggestion.value);
                                                            params.set('q', suggestion.label);
                                                            setSearchParams(params);
                                                        } else {
                                                            // Navigate to skill search
                                                            const params = new URLSearchParams();
                                                            params.set('skills', suggestion.value);
                                                            params.set('q', suggestion.label);
                                                            setSearchParams(params);
                                                        }
                                                    }}
                                                    className="suggestion-btn"
                                                >
                                                    {suggestion.icon}
                                                    {suggestion.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p className="loading-text">Finding the best talents for you...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="error-state">
                                <div className="error-icon">
                                    <FaTimes className="error-times-icon" />
                                </div>
                                <h3 className="error-title">Something went wrong</h3>
                                <p className="error-message">{error}</p>
                                <p className="api-info">Displaying demo data for preview</p>
                                <button className="retry-btn" onClick={fetchResults}>
                                    Retry Search
                                </button>
                            </div>
                        )}

                        {/* Results Grid */}
                        {!loading && !error && results.length > 0 && (
                            <>
                                {searchType === 'freelancers' ? (
                                    <FreelancerGrid
                                        freelancers={results}
                                        loading={false}
                                        error={null}
                                        emptyMessage="No freelancers found. Try adjusting your search criteria."
                                        columns={3}
                                    />
                                ) : (
                                    <ServiceGrid
                                        services={results}
                                        loading={false}
                                        error={null}
                                        variant="compact"
                                        columns={2}
                                        emptyMessage="No services found. Try adjusting your search criteria."
                                        onBrowseTalent={(serviceId, serviceName) => {
                                            // Navigate to freelancer search for this service
                                            const params = new URLSearchParams();
                                            params.set('service', serviceId);
                                            params.set('q', serviceName);
                                            setSearchParams(params);
                                            setSearchType('freelancers');
                                        }}
                                    />
                                )}
                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="pagination-section">
                                        <div className="pagination-controls">
                                            <div className="pagination-info">
                                                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                                {pagination.total} results
                                            </div>

                                            <div className="pagination-buttons">
                                                <button
                                                    onClick={() => handlePageChange(pagination.page - 1)}
                                                    disabled={pagination.page === 1}
                                                    className="pagination-btn"
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
                                                            className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => handlePageChange(pagination.page + 1)}
                                                    disabled={pagination.page === pagination.totalPages}
                                                    className="pagination-btn"
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
                            <div className="no-results-state">
                                <div className="no-results-icon">
                                    <FaSearch className="no-results-search-icon" />
                                </div>
                                <h3 className="no-results-title">No Results Found</h3>
                                <p className="no-results-subtitle">
                                    We couldn't find any {searchType} matching your search criteria.
                                    Try adjusting your filters or search terms.
                                </p>
                                <div className="no-results-actions">
                                    <button
                                        onClick={clearFilters}
                                        className="clear-filters-action"
                                    >
                                        Clear All Filters
                                    </button>
                                    <button
                                        onClick={() => navigate('/services')}
                                        className="browse-services-action"
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
                    <div className="related-searches-section">
                        <h3 className="related-title">You might also be interested in</h3>
                        <div className="related-grid">
                            {LOCAL_SERVICES
                                .filter(s => s !== service)
                                .slice(0, 4)
                                .map(serviceId => (
                                    <button
                                        key={serviceId}
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            params.set('service', serviceId);
                                            params.set('q', LOCAL_SERVICE_NAMES[serviceId]);
                                            setSearchParams(params);
                                        }}
                                        className="related-service-card"
                                    >
                                        {getServiceIcon(serviceId)}
                                        <h4 className="related-service-name">{LOCAL_SERVICE_NAMES[serviceId]}</h4>
                                        <p className="related-service-subtitle">Browse skilled professionals</p>
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