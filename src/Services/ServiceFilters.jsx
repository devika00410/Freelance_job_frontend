import { FILTER_OPTIONS, PRICE_RANGES } from '../utils/constants';

const ServiceFilters = ({ filters, onFilterChange, onReset }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                <button
                    onClick={onReset}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Reset All
                </button>
            </div>

            <div className="space-y-6">
                {/* Experience Level */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Experience Level</h4>
                    <div className="space-y-2">
                        {FILTER_OPTIONS.experienceLevel.map(level => (
                            <label key={level.value} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.experienceLevel?.includes(level.value)}
                                    onChange={(e) => {
                                        const newLevels = e.target.checked
                                            ? [...(filters.experienceLevel || []), level.value]
                                            : (filters.experienceLevel || []).filter(l => l !== level.value);
                                        onFilterChange({ experienceLevel: newLevels });
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-600">{level.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Hourly Rate */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Hourly Rate</h4>
                    <div className="space-y-2">
                        {PRICE_RANGES.map(range => (
                            <label key={range.label} className="flex items-center">
                                <input
                                    type="radio"
                                    name="rateRange"
                                    checked={filters.minRate === range.min && filters.maxRate === range.max}
                                    onChange={() => onFilterChange({
                                        minRate: range.min,
                                        maxRate: range.max
                                    })}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-600">{range.label}</span>
                            </label>
                        ))}
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="rateRange"
                                checked={!filters.minRate && !filters.maxRate}
                                onChange={() => onFilterChange({
                                    minRate: undefined,
                                    maxRate: undefined
                                })}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-600">All Rates</span>
                        </label>
                    </div>
                </div>

                {/* Availability */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Availability</h4>
                    <select
                        value={filters.availability || ''}
                        onChange={(e) => onFilterChange({
                            availability: e.target.value || undefined
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Availability</option>
                        {FILTER_OPTIONS.availability.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Verification */}
                <div>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filters.verified === 'true'}
                            onChange={(e) => onFilterChange({
                                verified: e.target.checked ? 'true' : undefined
                            })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-600">Verified Freelancers Only</span>
                    </label>
                </div>

                {/* Sort By */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Sort By</h4>
                    <select
                        value={filters.sortBy || 'popularity'}
                        onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {FILTER_OPTIONS.sortBy.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ServiceFilters;