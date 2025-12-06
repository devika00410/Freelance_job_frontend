import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useFreelancers = (serviceId, initialFilters = {}) => {
    const [freelancers, setFreelancers] = useState([]);
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        ...initialFilters
    });

    useEffect(() => {
        if (serviceId) {
            fetchFreelancers();
        }
    }, [serviceId, filters]);

    const fetchFreelancers = async () => {
        try {
            setLoading(true);
            const data = await api.getFreelancersByService(serviceId, filters);
            
            if (data.success) {
                setFreelancers(data.data);
                setService(data.service);
                setPagination(data.pagination || {});
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const changePage = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const resetFilters = () => {
        setFilters({ page: 1, limit: 12 });
    };

    return {
        freelancers,
        service,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        changePage,
        resetFilters,
        refetch: fetchFreelancers
    };
};