import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ className = '', placeholder = "Search services (e.g., Web Development, UI/UX)" }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    // Local service mappings (same as SearchResultsPage)
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

    // Map service names to IDs for easier lookup
    const SERVICE_NAME_TO_ID = Object.entries(LOCAL_SERVICE_NAMES).reduce((acc, [id, name]) => {
        acc[name.toLowerCase()] = id;
        return acc;
    }, {});

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const queryLower = query.toLowerCase();
            
            // Check for exact service name match
            const serviceId = SERVICE_NAME_TO_ID[queryLower];
            if (serviceId) {
                // Exact match found, navigate to search results for that service
                navigate(`/search?service=${serviceId}&q=${encodeURIComponent(LOCAL_SERVICE_NAMES[serviceId])}`);
            } else {
                // Check for partial match
                const matchedService = Object.entries(LOCAL_SERVICE_NAMES).find(
                    ([id, name]) => name.toLowerCase().includes(queryLower)
                );
                
                if (matchedService) {
                    // Partial match found
                    navigate(`/search?service=${matchedService[0]}&q=${encodeURIComponent(matchedService[1])}`);
                } else {
                    // No service match, do general search
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                }
            }
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (serviceId, serviceName) => {
        navigate(`/search?service=${serviceId}&q=${encodeURIComponent(serviceName)}`);
        setQuery('');
        setShowSuggestions(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    useEffect(() => {
        if (query.trim()) {
            const queryLower = query.toLowerCase();
            const filtered = Object.entries(LOCAL_SERVICE_NAMES)
                .filter(([id, name]) => 
                    name.toLowerCase().includes(queryLower) ||
                    id.toLowerCase().includes(queryLower) ||
                    name.toLowerCase().split(' ').some(word => word.includes(queryLower))
                )
                .slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

    const handleFocus = () => {
        if (query.trim()) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <div className={`search-bar-wrapper ${className}`}>
            <form onSubmit={handleSearch} className="search-bar-form">
                <div className="search-bar-input-group">
                    {/* <FaSearch className="search-icon" /> */}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        className="search-bar-input"
                    />
                    <button
                        type="submit"
                        className="search-bar-button"
                    >
                        Search
                    </button>
                </div>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                    {suggestions.map(([id, name]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => handleSuggestionClick(id, name)}
                            className="suggestion-item"
                            onMouseDown={(e) => e.preventDefault()} 
                        >
                            <FaSearch className="suggestion-icon" />
                            <span className="suggestion-text">{name}</span>
                            <span className="suggestion-type">Service</span>
                        </button>
                    ))}
                </div>
            )}
            
            <style jsx>{`
                .search-bar-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .search-bar-form {
                    width: 100%;
                }
                
                .search-bar-input-group {
                    display: flex;
                    align-items: center;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .search-bar-input-group:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
                }
                
                .search-icon {
                    margin-left: 20px;
                    color: #6b7280;
                    font-size: 18px;
                    flex-shrink: 0;
                }
                
                .search-bar-input {
                    flex: 1;
                    padding: 18px 16px;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    color: #374151;
                    min-width: 0;
                }
                
                .search-bar-input::placeholder {
                    color: #9ca3af;
                }
                
                .search-bar-button {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 18px 32px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                    white-space: nowrap;
                }
                
                .search-bar-button:hover {
                    background: #2563eb;
                }
                
                .search-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-radius: 12px;
                    margin-top: 8px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    z-index: 1000;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .suggestion-item {
                    width: 100%;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }
                
                .suggestion-item:last-child {
                    border-bottom: none;
                }
                
                .suggestion-item:hover {
                    background: #f9fafb;
                }
                
                .suggestion-icon {
                    color: #6b7280;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                
                .suggestion-text {
                    flex: 1;
                    color: #374151;
                    font-weight: 500;
                    text-align: left;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .suggestion-type {
                    background: #f3f4f6;
                    color: #6b7280;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
};

export default SearchBar;