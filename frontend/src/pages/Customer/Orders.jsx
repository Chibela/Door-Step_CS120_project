import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, Calendar } from 'lucide-react';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import { getOrders } from '../../services/api';
import { useToast } from '../../components/Toast';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No orders yet</p>
                <button
                  onClick={() => navigate('/customer/menu')}
                  className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const items = JSON.parse(order.items || '[]');
                  return (
                    <div key={order.order_id} className="bg-gray-50 rounded-xl p-6 border-l-4 border-primary hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Order #{order.order_id}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Items</p>
                          <p className="font-semibold text-gray-900">{items.length} item(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Total</p>
                          <p className="text-xl font-bold text-primary">${order.total}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
