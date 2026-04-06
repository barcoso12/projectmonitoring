import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Filter,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [users, setUsers] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showMyTasks) {
      fetchMyTasks();
    } else if (projects.length > 0) {
      handleProjectChange(projects[0].id);
    }
  }, [showMyTasks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
      
      if (projectsRes.data.length > 0) {
        const firstProjectId = projectsRes.data[0].id;
        const tasksRes = await api.get(`/tasks/project/${firstProjectId}`);
        setTasks(tasksRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks/my-tasks');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching my tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/project/${projectId}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '', projectId: '', assigneeId: '' });
      handleProjectChange(formData.projectId);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      const currentProjectId = tasks[0]?.projectId;
      if (currentProjectId) handleProjectChange(currentProjectId);
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

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      const currentProjectId = tasks[0]?.projectId;
      if (currentProjectId) handleProjectChange(currentProjectId);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

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
              setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '', projectId: '', assigneeId: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Task</span>
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="text-gray-400" size={20} />
          <select
            onChange={(e) => {
              setShowMyTasks(false);
              handleProjectChange(e.target.value);
            }}
            disabled={showMyTasks}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-900 dark:text-gray-100 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100 disabled:opacity-50"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
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

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task Details</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                <th className="p-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group relative">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold dark:text-gray-100 text-lg">{task.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all cursor-pointer ${getStatusBadge(task.status)}`}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      task.priority === 'HIGH' ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400' :
                      task.priority === 'MEDIUM' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' :
                      'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                        {task.assignee?.name.charAt(0) || <UserIcon size={14} />}
                      </div>
                      <span className="text-sm font-medium dark:text-gray-200">{task.assignee?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : 'No deadline'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === task.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <div className="py-1" role="menu">
                            <button
                              onClick={() => openEditModal(task)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit size={16} className="mr-3" />
                              Edit Task
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            >
                              <Trash2 size={16} className="mr-3" />
                              Delete Task
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 dark:text-gray-100">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                  <select
                    required
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    disabled={editingTask !== null}
                  >
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                  <select
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  >
                    <option value="">Select team member</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
