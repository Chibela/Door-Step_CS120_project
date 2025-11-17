import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, User } from 'lucide-react';

const CustomerSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/customer/menu', icon: ShoppingBag, label: 'Menu' },
    { path: '/customer/cart', icon: ShoppingCart, label: 'Cart' },
    { path: '/customer/orders', icon: Package, label: 'Orders' },
    { path: '/customer/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-white rounded-2xl shadow-xl p-6 h-[calc(100vh-120px)] border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">FT</span>
        </div>
        <h2 className="text-xl font-bold text-text-dark">Foodstare</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white font-semibold shadow-md transform scale-[1.02]'
                  : 'text-text-light hover:bg-dust-grey hover:text-primary-dark'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default CustomerSidebar;

