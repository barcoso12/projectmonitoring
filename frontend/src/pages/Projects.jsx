import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  Flag, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', priority: 'MEDIUM', deadline: '' });
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      priority: project.priority,
      deadline: project.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : ''
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'DELAYED': return <AlertCircle className="text-rose-500" size={18} />;
      default: return <Clock className="text-blue-500" size={18} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400';
      case 'MEDIUM': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold dark:text-gray-100">Project Directory</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and monitor all active projects</p>
        </div>
        
        {['ADMIN', 'MANAGER'].includes(user.role) && (
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({ name: '', description: '', priority: 'MEDIUM', deadline: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all p-6 group relative">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
              
              {['ADMIN', 'MANAGER'].includes(user.role) && (
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {activeMenuId === project.id && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="py-1" role="menu">
                        <button
                          onClick={() => openEditModal(project)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit size={16} className="mr-3" />
                          Edit Project
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <Trash2 size={16} className="mr-3" />
                          Delete Project
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6">
              {project.description || 'No description provided'}
            </p>

            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} className="mr-2" />
                  <span>{project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'No deadline'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(project.status)}
                  <span className="text-sm font-medium dark:text-gray-200 capitalize">{project.status.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  <CheckCircle2 size={16} className="mr-1 text-emerald-500" />
                  <span>{project.tasks.filter(t => t.status === 'COMPLETED').length}/{project.tasks.length} Tasks</span>
                </div>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${project.tasks.length > 0 ? (project.tasks.filter(t => t.status === 'COMPLETED').length / project.tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 dark:text-gray-100">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows="4"
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
