import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import FreelancerGrid from '../Freelancer/FreelancerGrid';
import ServiceFilters from '../Services/ServiceFilters';
import { useFreelancers } from '../Hooks/useFreelancers';
import { getServiceIcon } from '../utils/icons';
import { SERVICE_NAMES } from '../utils/constants';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';

const ServiceDetailPage = () => {
    const { serviceId } = useParams();
    const [searchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const {
        freelancers,
        service,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        changePage,
        resetFilters
    } = useFreelancers(serviceId, {
        page: parseInt(searchParams.get('page')) || 1,
        experienceLevel: searchParams.get('experience')?.split(',') || [],
        minRate: searchParams.get('minRate'),
        maxRate: searchParams.get('maxRate'),
        availability: searchParams.get('availability'),
        verified: searchParams.get('verified'),
        sortBy: searchParams.get('sortBy') || 'popularity'
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [filters.page]);

    if (!service && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Service Not Found</h2>
                    <p className="text-gray-500">The service you're looking for doesn't exist.</p>
                    <a href="/services" className="text-blue-600 hover:underline mt-4 inline-block">
                        Browse All Services
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Service Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center mb-6">
                        <div className="text-4xl mr-4">
                            {getServiceIcon(serviceId)}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {SERVICE_NAMES[serviceId] || service?.name}
                            </h1>
                            <p className="text-xl opacity-90">
                                {service?.description}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                            <div className="text-2xl font-bold">
                                ${service?.pricing?.hourlyRange?.min || 0}
                            </div>
                            <div className="text-sm opacity-80">Starting Rate</div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                            <div className="text-2xl font-bold">
                                {service?.metrics?.successRate || 0}%
                            </div>
                            <div className="text-sm opacity-80">Success Rate</div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                            <div className="text-2xl font-bold">
                                {pagination?.total || 0}
                            </div>
                            <div className="text-sm opacity-80">Available Freelancers</div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                            <div className="text-2xl font-bold">
                                ⭐ {service?.metrics?.clientSatisfaction?.toFixed(1) || '5.0'}
                            </div>
                            <div className="text-sm opacity-80">Client Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Mobile Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between"
                        >
                            <span className="font-medium">Filters</span>
                            <span>{showFilters ? '▲' : '▼'}</span>
                        </button>
                    </div>

                    {/* Filters Sidebar */}
                    <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <ServiceFilters
                            filters={filters}
                            onFilterChange={updateFilters}
                            onReset={resetFilters}
                        />
                    </div>

                    {/* Freelancers Grid */}
                    <div className="lg:w-3/4">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Available Freelancers
                                </h2>
                                <p className="text-gray-600">
                                    {pagination.total} freelancers found
                                </p>
                            </div>
                            <div className="text-gray-500">
                                Page {pagination.currentPage || 1} of {pagination.pages || 1}
                            </div>
                        </div>

                        <FreelancerGrid
                            freelancers={freelancers}
                            loading={loading}
                            error={error}
                            emptyMessage={`No freelancers found for ${SERVICE_NAMES[serviceId]}`}
                        />

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    <button
                                        onClick={() => changePage(filters.page - 1)}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (filters.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (filters.page >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = filters.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => changePage(pageNum)}
                                                className={`px-4 py-2 rounded-lg ${filters.page === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => changePage(filters.page + 1)}
                                        disabled={filters.page === pagination.pages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;