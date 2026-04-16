import { format } from 'date-fns';
import { Calendar, MoreVertical, Edit, Trash2, User } from 'lucide-react';

const TaskList = ({
  tasks,
  updateTaskStatus,
  openEditModal,
  handleDelete,
  activeMenuId,
  setActiveMenuId,
  menuRef
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
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
                      {task.assignee?.name.charAt(0) || <User size={14} />}
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
  );
};

export default TaskList;
