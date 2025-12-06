import FreelancerCard from './FreelancerCard';
import LoadingSpinner from '../Components/Common/LoadingSpinner';
import ErrorMessage from '../Components/Common/ErrorMessage';

const FreelancerGrid = ({ freelancers, loading, error, emptyMessage = "No freelancers found" }) => {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (freelancers.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👤</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{emptyMessage}</h3>
                <p className="text-gray-500">Try adjusting your filters or search for different services</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map(freelancer => (
                <FreelancerCard key={freelancer._id} freelancer={freelancer} />
            ))}
        </div>
    );
};

export default FreelancerGrid;