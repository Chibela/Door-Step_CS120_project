import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../services/api';
import { useToast } from '../Toast';

const CustomerHeader = () => {
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

  const cartCount = JSON.parse(localStorage.getItem('cart') || '[]').length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-dark">ServeDash</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <Link
            to="/customer/cart"
            className="relative w-10 h-10 bg-dust-grey rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <ShoppingCart className="w-5 h-5 text-text-dark" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-semibold">{user?.first_name?.[0]}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark">{user?.first_name}</p>
              <p className="text-xs text-text-light capitalize">{user?.role}</p>
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

export default CustomerHeader;

