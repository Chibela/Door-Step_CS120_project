import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ShoppingBag, RefreshCcw } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getOrders, updateOrder } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await updateOrder(orderId, { status });
      showToast('Order updated', 'success');
      loadOrders();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update order', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-dark">All Orders</h2>
                <p className="text-sm text-text-light mt-1">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-text-light" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                  >
                    <option value="all">All Status</option>
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={loadOrders}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-dust-grey rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-text-dark">Loading orders...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-dust-grey mx-auto mb-4" />
                    <p className="text-text-light text-lg">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.order_id}
                        className="bg-dust-grey/30 rounded-xl p-4 hover:bg-dust-grey/50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="font-semibold text-text-dark">Order #{order.order_id}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : order.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-text-light">{order.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-text-dark">${order.total}</p>
                              <p className="text-xs text-text-light">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                              disabled={updatingId === order.order_id}
                              className="px-3 py-2 border-2 border-dust-grey rounded-xl bg-white text-text-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            >
                              {orderStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                              className="p-2 hover:bg-primary hover:text-white rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

