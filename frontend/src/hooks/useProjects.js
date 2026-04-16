import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, loading, error, fetchProjects };
};
