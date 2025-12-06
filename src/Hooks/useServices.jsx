import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await api.getAllServices();
            if (data.success) {
                setServices(data.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getServiceById = async (id) => {
        try {
            const data = await api.getServiceById(id);
            return data.success ? data.data : null;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const trackServiceView = async (serviceId) => {
        try {
            await api.incrementServiceView(serviceId);
        } catch (err) {
            console.error('Failed to track view:', err);
        }
    };

    return { services, loading, error, getServiceById, trackServiceView };
};