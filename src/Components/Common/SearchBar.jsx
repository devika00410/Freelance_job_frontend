import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_NAMES } from '../../utils/constants';

const SearchBar = ({ className = '' }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
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
                navigate(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    const handleSuggestionClick = (serviceId) => {
        navigate(`/services/${serviceId}/freelancers`);
        setQuery('');
        setSuggestions([]);
    };

    useEffect(() => {
        if (query.trim()) {
            const filtered = Object.entries(SERVICE_NAMES)
                .filter(([id, name]) => 
                    name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSearch}>
                <div className="flex">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search services (e.g., Web Development, UI/UX)"
                        className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition"
                    >
                        Search
                    </button>
                </div>
            </form>
            
            {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border">
                    {suggestions.map(([id, name]) => (
                        <button
                            key={id}
                            onClick={() => handleSuggestionClick(id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center"
                        >
                            <span className="text-gray-700">{name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;