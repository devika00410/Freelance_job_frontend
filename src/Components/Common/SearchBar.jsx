import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { SERVICE_NAMES } from '../../utils/constants';

const SearchBar = ({ className = '', placeholder = "Search services (e.g., Web Development, UI/UX)" }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const matchedService = Object.entries(SERVICE_NAMES).find(
                ([id, name]) => name.toLowerCase().includes(query.toLowerCase())
            );
            
            if (matchedService) {
                navigate(`/services/${matchedService[0]}/freelancers`);
            } else {
                navigate(`/search?q=${encodeURIComponent(query)}&type=services`);
            }
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (serviceId) => {
        navigate(`/services/${serviceId}/freelancers`);
        setQuery('');
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (query.trim()) {
            const filtered = Object.entries(SERVICE_NAMES)
                .filter(([id, name]) => 
                    name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [query]);

    return (
        <div className={`search-bar-wrapper ${className}`}>
            <form onSubmit={handleSearch} className="search-bar-form">
                <div className="search-bar-input-group">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
                            onClick={() => handleSuggestionClick(id)}
                            className="suggestion-item"
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
                }
                
                .search-bar-input {
                    flex: 1;
                    padding: 18px 16px;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    color: #374151;
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
                }
                
                .suggestion-item:hover {
                    background: #f9fafb;
                }
                
                .suggestion-icon {
                    color: #6b7280;
                    font-size: 16px;
                }
                
                .suggestion-text {
                    flex: 1;
                    color: #374151;
                    font-weight: 500;
                }
                
                .suggestion-type {
                    background: #f3f4f6;
                    color: #6b7280;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default SearchBar;