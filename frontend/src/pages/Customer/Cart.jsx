import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, X } from 'lucide-react';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import { createOrder } from '../../services/api';
import { useToast } from '../../components/Toast';
import PaymentForm from '../../components/PaymentForm';

const CustomerCart = () => {
  const [cart, setCart] = useState([]);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (id, change) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    updateCart(newCart);
    showToast('Item removed from cart', 'success');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax + tip;

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true);
    try {
      await createOrder({
        items: cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
        total: total.toFixed(2),
        ...paymentData,
      });
      localStorage.removeItem('cart');
      showToast('Order placed successfully!', 'success');
      setShowPayment(false);
      navigate('/customer/orders');
    } catch (error) {
      const conflicts = error.response?.data?.conflicts;
      if (conflicts?.length) {
        const details = conflicts
          .map(conflict => `${conflict.item}: ${conflict.allergies.join(', ')}`)
          .join('; ');
        showToast(`Allergy alert – remove or replace these items: ${details}`, 'warning');
      } else {
        showToast(error.response?.data?.error || 'Failed to place order', 'error');
      }
      setShowPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                <button
                  onClick={() => navigate('/customer/menu')}
                  className="bg-primary-gradient text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tip</span>
                    <div className="flex gap-2">
                      {[0, 10, 15, 20].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setTip(amount)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            tip === amount
                              ? 'bg-primary-gradient text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading || showPayment}
                    className="w-full flex items-center justify-center gap-2 bg-primary-gradient text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    <CreditCard className="w-5 h-5" />
                    {showPayment ? 'Processing Payment...' : 'Proceed to Payment'}
                  </button>
                </div>
              </>
            )}

            {showPayment && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-2xl font-bold text-text-dark">Complete Payment</h3>
                    <button
                      onClick={handlePaymentCancel}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <X className="w-5 h-5 text-text-light" />
                    </button>
                  </div>
                  <div className="p-6">
                    <PaymentForm
                      amount={total.toFixed(2)}
                      items={cart}
                      subtotal={subtotal.toFixed(2)}
                      tax={tax.toFixed(2)}
                      tip={tip.toFixed(2)}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
