import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { AuthContext } from '../../context/AuthContext';
import { login } from '../../services/api';
import { useToast } from '../../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        setUser(response.user);
        showToast('Login successful!', 'success');
        // Redirect based on role
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (response.user.role === 'staff') {
          navigate('/staff/schedule');
        } else {
          navigate('/customer/menu');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <img src={logo} alt="ServeDash" className="w-32 mx-auto mb-4 object-contain" />
          <p className="text-text-light">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-[1.02]"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Demo Accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Admin: admin@foodtruck.com / admin123</p>
            <p>Staff: staff1@foodtruck.com / staff123</p>
            <p>Customer: customer@foodtruck.com / customer123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

