import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Calendar, CalendarDays, Users, Utensils } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/menu', icon: Utensils, label: 'Menu' },
    { path: '/admin/staff', icon: Users, label: 'Staff' },
    { path: '/admin/book-appointment', icon: Calendar, label: 'Book Appointment' },
    { path: '/admin/schedules', icon: CalendarDays, label: 'Schedules' },
  ];

  return (
    <div className="w-64 bg-white rounded-2xl shadow-xl p-6 h-[calc(100vh-120px)] border border-gray-100">
      <div className="mb-8" />

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
                  ? 'bg-primary-gradient text-white font-semibold shadow-md transform scale-[1.02]'
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

