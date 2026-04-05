import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, 
  Search, 
  Mail, 
  Shield, 
  User as UserIcon,
  Briefcase,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await api.get('/users');
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'MANAGER': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold dark:text-gray-100">Our Team</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all team members and their roles</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all p-8 group text-center">
            <div className="relative mb-6 mx-auto w-24 h-24">
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserIcon size={48} />
              </div>
              <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-4 border-white dark:border-gray-900 ${getRoleBadge(member.role)} shadow-lg`}>
                <Shield size={16} />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-1 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {member.name}
            </h3>
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Mail size={14} className="mr-2" />
              <span>{member.email}</span>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${getRoleBadge(member.role)}`}>
              {member.role.replace('_', ' ')}
            </span>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} className="mr-1" />
                  <span className="text-sm font-bold">Active</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Last Login</p>
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Clock size={16} className="mr-1" />
                  <span className="text-sm font-bold">Today</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
