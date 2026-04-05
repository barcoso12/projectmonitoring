import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Bell, 
  BarChart3, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
    { name: 'Projects', icon: Briefcase, path: '/projects', roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks', roles: ['ADMIN', 'MANAGER', 'TEAM_MEMBER'] },
    { name: 'Team', icon: Users, path: '/team', roles: ['ADMIN', 'MANAGER'] },
    { name: 'Reports', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'MANAGER'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">ProMonitor</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="flex items-center space-x-3 w-full p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
