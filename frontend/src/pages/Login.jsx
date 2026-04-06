import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'TEAM_MEMBER' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Server error');
      } else if (err.request) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 dark:text-gray-100">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          {isLogin ? 'Enter your details to access your dashboard' : 'Join our team to start tracking your projects'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-3 pl-10 pr-12 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="MANAGER">Project Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {isLogin ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
