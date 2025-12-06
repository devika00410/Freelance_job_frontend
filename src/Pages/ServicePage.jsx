import { useState, useEffect } from 'react';
import ServiceGrid from '../Services/ServiceGrid';
import ServiceHero from '../Services/ServiceHero';
import { useServices } from '../Hooks/useServices';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';

const ServicesPage = () => {
    const { services, loading, error, trackServiceView } = useServices();
    const [popularServices, setPopularServices] = useState([]);

    useEffect(() => {
        if (services.length > 0) {
            const popular = [...services]
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 6);
            setPopularServices(popular);
        }
    }, [services]);

    const handleServiceClick = async (serviceId) => {
        await trackServiceView(serviceId);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <ServiceHero />
            
            {/* Popular Services */}
            {popularServices.length > 0 && (
                <section className="py-12 px-4 max-w-7xl mx-auto">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Most Popular Services
                        </h2>
                        <p className="text-gray-600">
                            Browse our most in-demand services
                        </p>
                    </div>
                    <ServiceGrid 
                        services={popularServices} 
                        onServiceClick={handleServiceClick}
                    />
                </section>
            )}

            {/* All Services */}
            <section className="py-12 px-4 max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        All Services
                    </h2>
                    <p className="text-gray-600">
                        Explore all services we offer
                    </p>
                </div>
                <ServiceGrid 
                    services={services} 
                    onServiceClick={handleServiceClick}
                />
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Find Your Perfect Freelancer?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Browse thousands of talented professionals ready to work on your project
                    </p>
                    <a
                        href="/services/web-development/freelancers"
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
                    >
                        Start Hiring Now
                    </a>
                </div>
            </section>
        </div>
    );
};

export default ServicesPage;