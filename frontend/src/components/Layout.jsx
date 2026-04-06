import { Outlet, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, X, Check, Briefcase, CheckSquare, Users as UsersIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [], users: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search effect
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const { data } = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(data || { projects: [], tasks: [], users: [] });
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults({ projects: [], tasks: [], users: [] });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ projects: [], tasks: [], users: [] });
        setShowSearchResults(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleResultClick = (type, id) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (type === 'project') navigate('/projects');
    if (type === 'task') navigate('/tasks');
    if (type === 'user') navigate('/team');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0 || searchResults.users.length > 0;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-96" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search projects, tasks, members..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setShowSearchResults(true);
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="max-h-[400px] overflow-y-auto">
                  {!hasResults && !isSearching && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                  {searchResults.projects.length > 0 && (
                    <div className="p-2">
                      <h5 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projects</h5>
                      {searchResults.projects.map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleResultClick('project', project.id)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-gray-100">{project.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className="p-2 border-t border-gray-50 dark:border-gray-800">
                      <h5 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tasks</h5>
                      {searchResults.tasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleResultClick('task', task.id)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <CheckSquare size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-gray-100">{task.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">In: {task.project?.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-t border-gray-50 dark:border-gray-800">
                      <h5 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Members</h5>
                      {searchResults.users.map(member => (
                        <button
                          key={member.id}
                          onClick={() => handleResultClick('user', member.id)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <UsersIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-gray-100">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.role.replace('_', ' ')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h4 className="font-bold dark:text-gray-100">Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative group ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                        >
                          <p className={`text-sm mb-1 ${!notification.read ? 'font-semibold dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="absolute top-4 right-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right">
                <p className="text-sm font-semibold dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role.toLowerCase()}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
