import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import CheckoutModal from '../../components/CheckoutModal';
import { getCustomerProfile } from '../../services/api';
import { useToast } from '../../components/Toast';

const CustomerCart = () => {
  const [cart, setCart] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadCart();
    loadUserAllergies();
    // Load Stripe publishable key
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (stripeKey) {
      setStripePromise(loadStripe(stripeKey));
    }
  }, []);

  const loadUserAllergies = async () => {
    try {
      const userData = await getCustomerProfile();
      if (userData && userData.allergies) {
        const allergies = String(userData.allergies)
          .split(',')
          .map(a => a.trim().toLowerCase())
          .filter(a => a);
        setUserAllergies(allergies);
      }
      if (userData && userData.email) {
        setUserEmail(userData.email);
      }
    } catch (err) {
      // ignore if not logged in or error
      console.error('Unable to load user allergies', err?.message || err);
    }
  };

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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    if (!stripePromise) {
      showToast('Payment system is not configured', 'error');
      return;
    }

    // Show checkout modal with Stripe
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId) => {
    localStorage.removeItem('cart');
    setCart([]);
    navigate('/customer/orders');
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
                  {cart.map((item) => {
                    const itemAllergies = (item.allergies || []).map(a => String(a).toLowerCase());
                    const conflicts = userAllergies.length > 0 && itemAllergies.length > 0
                      ? itemAllergies.filter(a => userAllergies.includes(a))
                      : [];
                    return (
                    <div key={item.id} className={`flex items-center justify-between p-4 ${conflicts.length ? 'bg-red-50 border border-red-200' : 'bg-gray-50'} rounded-xl`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="image-fallback w-full h-full flex items-center justify-center absolute inset-0"
                            style={{ display: (item.image && item.image.trim()) ? 'none' : 'flex' }}
                          >
                            <span className="text-6xl">🍔</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                          {conflicts.length > 0 && (
                            <div className="mt-1 inline-flex items-center gap-2 px-2 py-1 rounded bg-red-100 text-red-700 text-xs">
                              <AlertCircle className="w-3 h-3" />
                              <span>Contains: {conflicts.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}</span>
                            </div>
                          )}
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
                  )
                })}
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
                    disabled={loading}
                    className="w-full bg-primary-gradient text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && stripePromise && (
        <Elements stripe={stripePromise}>
          <CheckoutModal
            cartData={{
              items: cart,
              subtotal,
              tax,
              tip,
              total,
              email: userEmail,
            }}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleCheckoutSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default CustomerCart;
