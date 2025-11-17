import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getAdminDashboard, getOrders } from '../../services/api';
import { useToast } from '../../components/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getAdminDashboard();
      setStats(dashboardData.stats);
      setRecentOrders(dashboardData.recent_orders || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-text-dark">Loading...</div>
        </div>
      </div>
    );
  }

  // Mock chart data (replace with real data)
  const revenueData = [
    { date: '10 Mar', revenue: 1200 },
    { date: '11 Mar', revenue: 1500 },
    { date: '12 Mar', revenue: 1500 },
    { date: '13 Mar', revenue: 700 },
    { date: '14 Mar', revenue: 1200 },
    { date: '15 Mar', revenue: 1500 },
    { date: '16 Mar', revenue: 1400 },
  ];

  const kpiCards = [
    {
      title: 'Daily Revenue',
      value: `$${stats?.total_revenue?.toFixed(2) || '0.00'}`,
      change: '+2.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      change: '+2.9%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-green-600',
    },
    {
      title: 'Average Order Value',
      value: `$${stats?.total_orders > 0 ? (stats.total_revenue / stats.total_orders).toFixed(2) : '0.00'}`,
      change: '+3.6%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      change: '-0.6%',
      trend: 'down',
      icon: Calendar,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {kpiCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`text-sm font-semibold ${card.color}`}>
                      {card.trend === 'up' ? '↑' : '↓'} {card.change}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-text-dark mb-1">{card.value}</h3>
                  <p className="text-sm text-text-light">{card.title}</p>
                </div>
              );
            })}
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-dark">Total Revenue</h3>
                <span className="text-sm font-semibold text-success">↑ 2.5% Last week</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DADA" />
                  <XAxis dataKey="date" stroke="#666666" />
                  <YAxis stroke="#666666" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#E59500" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Selling Dishes */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-dark">Top Selling Dishes</h3>
                <span className="text-sm font-semibold text-success">↑ 5.3% More order</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Cheese & Corn Momos', price: '$125', change: '+32%' },
                  { name: 'French Fry', price: '$125', change: '+32%' },
                  { name: 'Cheese Burger', price: '$125', change: '+32%' },
                ].map((dish, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dust-grey/50 rounded-xl hover:bg-dust-grey transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-text-dark">{dish.name}</p>
                        <p className="text-sm text-text-light">{dish.price}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-success">↑ {dish.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-text-dark mb-6">Recent Order Requests</h3>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dust-grey/50 rounded-xl hover:bg-dust-grey transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-text-dark">Order #{order.order_id}</p>
                        <p className="text-sm text-text-light">{order.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-dark">${order.total}</p>
                      <span className={`text-sm font-semibold ${
                        order.status === 'pending' ? 'text-accent' : 'text-primary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-light text-center py-8">No recent orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

