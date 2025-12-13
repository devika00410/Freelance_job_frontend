import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import './SearchResultsPage.css';

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
                // Search freelancers - Fixed API endpoint
                try {
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
                        setError(response.message || 'Failed to fetch freelancers');
                    }
                } catch (apiError) {
                    console.error('API Error:', apiError);
                    // Fallback to mock data for development
                    const mockFreelancers = [
                        {
                            id: 1,
                            name: 'John Doe',
                            title: 'UI/UX Designer',
                            rate: '$45/hr',
                            rating: 4.9,
                            location: 'New York, USA',
                            skills: ['UI Design', 'Figma', 'Prototyping'],
                            verified: true
                        },
                        {
                            id: 2,
                            name: 'Sarah Chen',
                            title: 'Web Developer',
                            rate: '$60/hr',
                            rating: 4.8,
                            location: 'San Francisco, USA',
                            skills: ['React', 'Node.js', 'TypeScript'],
                            verified: true
                        }
                    ];
                    setFreelancersResults(mockFreelancers);
                    setResults(mockFreelancers);
                    setPagination({
                        page: 1,
                        limit: 12,
                        total: mockFreelancers.length,
                        totalPages: 1
                    });
                }
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch search results. Please try again.');
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
        <div className="search-results-container">
            {/* Search Header */}
            <div className="search-results-header">
                <div className="search-header-content">
                    <div className="search-title-section">
                        <h1 className="search-main-title">
                            {query ? `Search Results for "${query}"` : 
                             service ? `Browse ${SERVICE_NAMES[service] || 'Service'}` :
                             'Search Results'}
                        </h1>
                        <p className="search-subtitle">
                            {results.length > 0 
                                ? `Found ${pagination.total} ${searchType} matching your criteria`
                                : 'No results found. Try adjusting your search.'}
                        </p>
                    </div>
                    
                    {/* Main Search Bar */}
                    <div className="main-search-wrapper">
                        <SearchBar />
                    </div>
                    
                    {/* Search Type Toggle */}
                    <div className="search-type-toggle">
                        <div className="toggle-container">
                            <button
                                onClick={() => setSearchType('freelancers')}
                                className={`toggle-btn ${searchType === 'freelancers' ? 'active' : ''}`}
                            >
                                Freelancers
                            </button>
                            <button
                                onClick={() => setSearchType('services')}
                                className={`toggle-btn ${searchType === 'services' ? 'active' : ''}`}
                            >
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
                                <h3 className="filters-title">Filters</h3>
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
                                                {level}
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
                                                {filters.availability}
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
                                                {level}
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
                                    <option value="not-available">Not Available</option>
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
                                                <label className="price-label">Location</label>
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
                                                    className="price-input"
                                                />
                                            </div>
                                            <div className="advanced-filter-group">
                                                <label className="price-label">Skills (comma separated)</label>
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
                                                    className="price-input"
                                                />
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
                                            {searchType === 'freelancers' ? 'Freelancers' : 'Services'}
                                        </h2>
                                        <p className="results-count">
                                            {loading ? 'Loading...' : 
                                             results.length > 0 
                                                ? `${pagination.total} results found`
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
                                                            navigate(`/services/${suggestion.value}/freelancers`);
                                                        } else {
                                                            const params = new URLSearchParams(searchParams);
                                                            params.set('skills', suggestion.value);
                                                            setSearchParams(params);
                                                        }
                                                    }}
                                                    className="suggestion-btn"
                                                >
                                                    <span className="suggestion-icon">{suggestion.icon}</span>
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
                                <p className="loading-text">Searching...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="error-state">
                                <div className="error-icon">⚠️</div>
                                <h3 className="error-title">Something went wrong</h3>
                                <p className="error-message">{error}</p>
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
                                <div className="no-results-icon">🔍</div>
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
                            {SERVICES.filter(s => s !== service)
                                .slice(0, 4)
                                .map(serviceId => (
                                    <button
                                        key={serviceId}
                                        onClick={() => navigate(`/services/${serviceId}/freelancers`)}
                                        className="related-service-card"
                                    >
                                        <div className="related-service-icon">🔧</div>
                                        <h4 className="related-service-name">{SERVICE_NAMES[serviceId]}</h4>
                                        <p className="related-service-subtitle">Browse freelancers</p>
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