import { useState, useEffect, useRef } from 'react';
import { Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useUsers } from '../hooks/useUsers';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    priority: 'MEDIUM', 
    deadline: '', 
    projectId: '', 
    assigneeId: '' 
  });
  
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('');
  
  const menuRef = useRef(null);
  const { user } = useAuth();
  
  const { tasks, loading: tasksLoading, error: tasksError, fetchTasksByProject, fetchMyTasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects, loading: projectsLoading, error: projectsError, fetchProjects } = useProjects();
  const { users, fetchUsers } = useUsers();

  useEffect(() => {
    const initData = async () => {
      const fetchedProjects = await fetchProjects();
      await fetchUsers();
      if (fetchedProjects && fetchedProjects.length > 0) {
        setCurrentProjectId(fetchedProjects[0].id);
      }
    };
    initData();
  }, [fetchProjects, fetchUsers]);

  useEffect(() => {
    if (showMyTasks) {
      fetchMyTasks();
    } else if (currentProjectId) {
      fetchTasksByProject(currentProjectId);
    }
  }, [showMyTasks, currentProjectId, fetchMyTasks, fetchTasksByProject]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '', projectId: '', assigneeId: '' });
      if (showMyTasks) {
        fetchMyTasks();
      } else {
        fetchTasksByProject(formData.projectId);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      if (showMyTasks) {
        fetchMyTasks();
      } else {
        fetchTasksByProject(currentProjectId);
      }
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
      projectId: task.projectId,
      assigneeId: task.assigneeId || ''
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      if (showMyTasks) {
        fetchMyTasks();
      } else {
        fetchTasksByProject(currentProjectId);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const isLoading = tasksLoading || projectsLoading;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold dark:text-gray-100">Task Manager</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage individual tasks across projects</p>
        </div>
        
        {['ADMIN', 'MANAGER'].includes(user.role) && (
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '', projectId: currentProjectId || '', assigneeId: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Task</span>
          </button>
        )}
      </div>

      {(tasksError || projectsError) && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl">
          {tasksError || projectsError}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={currentProjectId}
            onChange={(e) => {
              setShowMyTasks(false);
              setCurrentProjectId(e.target.value);
            }}
            disabled={showMyTasks || projects.length === 0}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-900 dark:text-gray-100 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100 disabled:opacity-50"
          >
            {projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setShowMyTasks(false)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showMyTasks ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            By Project
          </button>
          <button
            onClick={() => setShowMyTasks(true)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${showMyTasks ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            Assigned to Me
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading tasks...</div>
      ) : (
        <TaskList 
          tasks={tasks}
          updateTaskStatus={handleStatusUpdate}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          menuRef={menuRef}
        />
      )}

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        editingTask={editingTask}
        formData={formData}
        setFormData={setFormData}
        projects={projects}
        users={users}
      />
    </div>
  );
};

export default Tasks;
