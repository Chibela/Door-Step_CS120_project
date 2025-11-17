import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Package, DollarSign } from 'lucide-react';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import { getOrders } from '../../services/api';
import { useToast } from '../../components/Toast';

const CustomerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orders = await getOrders();
      const foundOrder = orders.find(o => o.order_id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        showToast('Order not found', 'error');
        navigate('/customer/orders');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient p-6">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const items = JSON.parse(order.items || '[]');

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/customer/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            </div>

            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-bold text-gray-900">{order.order_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                      order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">${order.total}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${order.subtotal || order.total}</span>
                  </div>
                  {order.tax && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (10%)</span>
                      <span className="font-semibold">${order.tax}</span>
                    </div>
                  )}
                  {order.tip && parseFloat(order.tip) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tip</span>
                      <span className="font-semibold">${order.tip}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-primary">${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetails;

