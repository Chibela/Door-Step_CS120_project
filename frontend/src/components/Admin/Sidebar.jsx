import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Calendar, Settings, Users } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/book-appointment', icon: Calendar, label: 'Book Appointment' },
    { path: '/admin/schedules', icon: Users, label: 'Schedules' },
  ];

  return (
    <div className="w-64 bg-white rounded-2xl shadow-xl p-6 h-[calc(100vh-120px)] border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">SD</span>
        </div>
        <h2 className="text-xl font-bold text-text-dark">ServeDash</h2>
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

export default Sidebar;

