import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasksByProject = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/project/${projectId}`);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks/my-tasks');
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch my tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    return data;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data;
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
  };

  return { 
    tasks, 
    loading, 
    error, 
    fetchTasksByProject, 
    fetchMyTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
