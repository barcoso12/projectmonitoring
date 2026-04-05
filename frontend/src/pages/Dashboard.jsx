import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#EF4444'];
const PRIORITY_COLORS = ['#3B82F6', '#F59E0B', '#EF4444'];

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/dashboard/metrics');
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stats = [
    { label: 'Total Projects', value: metrics.totalProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/20' },
    { label: 'Completed', value: metrics.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/50 dark:bg-emerald-900/20' },
    { label: 'Ongoing', value: metrics.ongoing, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100/50 dark:bg-blue-900/20' },
    { label: 'Delayed', value: metrics.delayed, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100/50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold dark:text-gray-100">Project Overview</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time metrics for your projects and tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <TrendingUp size={16} className="mr-1" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-1 dark:text-gray-100">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-8 dark:text-gray-100">Project Status Distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-8 dark:text-gray-100">Projects by Priority</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byPriority}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {metrics.byPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
