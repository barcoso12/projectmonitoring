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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3B82F6', '#10B981', '#EF4444'];
const PRIORITY_COLORS = ['#3B82F6', '#F59E0B', '#EF4444'];

const Reports = () => {
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, projectsRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/projects')
      ]);
      setMetrics(metricsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!projects.length) return;

    const headers = ['Project Name', 'Status', 'Priority', 'Deadline', 'Tasks Count', 'Manager'];
    const rows = projects.map(p => [
      p.name,
      p.status,
      p.priority,
      p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
      p.tasks.length,
      p.manager.name
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Project_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    if (!projects.length) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Project Monitoring Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Add summary stats
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary Metrics', 14, 45);
    
    const summaryData = [
      ['Total Projects', metrics.totalProjects],
      ['Ongoing', metrics.ongoing],
      ['Completed', metrics.completed],
      ['Delayed', metrics.delayed]
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillStyle: '#3B82F6' }
    });

    // Add detailed projects table
    doc.text('Project Details', 14, doc.lastAutoTable.finalY + 15);
    
    const tableData = projects.map(p => [
      p.name,
      p.status,
      p.priority,
      p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A',
      `${p.tasks.filter(t => t.status === 'COMPLETED').length}/${p.tasks.length}`,
      p.manager.name
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Name', 'Status', 'Priority', 'Deadline', 'Tasks', 'Manager']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: '#3B82F6' }
    });

    doc.save(`Project_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExport = (format) => {
    if (format === 'CSV') exportCSV();
    if (format === 'PDF') generatePDF();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold dark:text-gray-100">Reports & Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View detailed project performance and team productivity</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleExport('CSV')}
            className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            <BarChart3 size={20} />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
          <h3 className="text-xl font-bold mb-8 dark:text-gray-100 flex items-center">
            <TrendingUp size={24} className="mr-3 text-blue-600" />
            Project Performance Trend
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Jan', completed: 2, ongoing: 5 },
                { name: 'Feb', completed: 4, ongoing: 7 },
                { name: 'Mar', completed: 7, ongoing: 6 },
                { name: 'Apr', completed: 10, ongoing: 8 },
              ]}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
          <h3 className="text-xl font-bold mb-8 dark:text-gray-100 flex items-center">
            <CheckCircle2 size={24} className="mr-3 text-emerald-600" />
            Task Status Overview
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all">
          <h3 className="text-xl font-bold mb-8 dark:text-gray-100 flex items-center">
            <Filter size={24} className="mr-3 text-amber-600" />
            Priority Breakdown by Project
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byPriority}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6', opacity: 0.05 }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#F3F4F6' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
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

export default Reports;
