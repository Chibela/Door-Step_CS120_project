import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../services/api';
import { useToast } from '../Toast';

const StaffHeader = ({ subtitle = 'Staff Workspace' }) => {
  const { user, logout: setLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      setLogout();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="ServeDash logo" className="h-12 w-auto object-contain" />
          <div>
            <p className="text-sm text-text-light">ServeDash</p>
            <h1 className="text-xl font-semibold text-primary-dark">{subtitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <button className="w-10 h-10 bg-dust-grey rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all">
            <Bell className="w-5 h-5 text-text-dark" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg border border-dust-grey flex items-center justify-center">
              {user ? (
                <span className="text-sm font-semibold text-text-dark">
                  {user.first_name?.[0] || user.email?.[0]}
                </span>
              ) : (
                <User className="w-5 h-5 text-text-dark" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">
                {user ? `${user.first_name} ${user.last_name}`.trim() : 'Staff Name'}
              </p>
              <p className="text-xs text-text-light">Staff</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-dust-grey rounded-lg flex items-center justify-center hover:bg-accent hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 text-text-dark" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;

