import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Header from '../../components/Customer/Header';
import Sidebar from '../../components/Customer/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { createOrder, getStripeConfig, createPaymentIntent, getCustomerProfile } from '../../services/api';
import { useToast } from '../../components/Toast';

const CheckoutForm = ({ amount, currency, onSuccess, onCancel, email, showToast }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: email || undefined,
      },
      redirect: 'if_required',
    });
    if (result.error) {
      showToast(result.error.message || 'Payment failed. Please try again.', 'error');
    } else if (result.paymentIntent) {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      } else {
        showToast(`Payment ${result.paymentIntent.status}. Please wait or contact support.`, 'warning');
      }
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={submitting || !stripe || !elements}
        className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        {submitting ? 'Processing...' : `Pay ${currency.toUpperCase()} ${parseFloat(amount || 0).toFixed(2)}`}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="w-full text-text-light hover:text-text-dark text-sm"
      >
        Cancel payment
      </button>
    </form>
  );
};

const CustomerCart = () => {
  const [cart, setCart] = useState([]);
  const [userAllergies, setUserAllergies] = useState([]);
  const [profileEmail, setProfileEmail] = useState('');
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState({ amount: '0.00', currency: 'usd' });
  const [configChecked, setConfigChecked] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadCart();
    hydrateStripeConfig();
    loadUserProfile();
  }, []);

  const hydrateStripeConfig = async () => {
    try {
      const config = await getStripeConfig();
      if (config.enabled && config.publishableKey) {
        setStripePromise(loadStripe(config.publishableKey));
        setStripeEnabled(true);
      } else {
        setStripeEnabled(false);
      }
    } catch (error) {
      setStripeEnabled(false);
    } finally {
      setConfigChecked(true);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await getCustomerProfile();
      if (userData?.email) {
        setProfileEmail(userData.email);
      }
      if (userData?.allergies) {
        const allergies = String(userData.allergies)
          .split(',')
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean);
        setUserAllergies(allergies);
      }
    } catch (error) {
      // not fatal—user might be anonymous
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
    const newCart = cart.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    updateCart(newCart);
    showToast('Item removed from cart', 'success');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax + tip;

  const isAdmin = user?.role === 'admin';
  const paymentRequired = stripeEnabled && !isAdmin;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    if (!paymentRequired) {
      await placeOrderDirect();
      return;
    }

    if (!stripePromise) {
      showToast('Payment service is not yet available. Please try again in a moment.', 'warning');
      return;
    }

    await startPaymentIntent();
  };

  const placeOrderDirect = async () => {
    setLoading(true);
    try {
      await createOrder({
        items: cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
        total: total.toFixed(2),
      });
      localStorage.removeItem('cart');
      setCart([]);
      showToast('Order placed successfully!', 'success');
      navigate('/customer/orders');
    } catch (error) {
      const conflicts = error.response?.data?.conflicts;
      if (conflicts?.length) {
        const details = conflicts
          .map((conflict) => `${conflict.item}: ${conflict.allergies.join(', ')}`)
          .join('; ');
        showToast(`Allergy alert – remove or replace these items: ${details}`, 'warning');
      } else {
        showToast(error.response?.data?.error || 'Failed to place order', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const startPaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await createPaymentIntent({
        items: cart,
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
      });
      setClientSecret(response.clientSecret);
      setPaymentSummary({
        amount: response.amount || total.toFixed(2),
        currency: response.currency || 'usd',
      });
      setShowPaymentSheet(true);
    } catch (error) {
      showToast(error.response?.data?.error || 'Unable to start payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      await createOrder({
        items: cart,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
        total: total.toFixed(2),
        payment_intent_id: paymentIntent.id,
        currency: paymentIntent.currency,
        payment_status: paymentIntent.status,
      });
      localStorage.removeItem('cart');
      setCart([]);
      setShowPaymentSheet(false);
      setClientSecret('');
      showToast('Payment successful! Order placed.', 'success');
      navigate('/customer/orders');
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          'Payment succeeded but we could not create the order. Please contact support with your receipt.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const closePaymentSheet = () => {
    setShowPaymentSheet(false);
    setClientSecret('');
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
                            style={{ display: item.image && item.image.trim() ? 'none' : 'flex' }}
                          >
                            <span className="text-3xl">🍔</span>
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
                    <div className="flex gap-2 flex-wrap">
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
                    disabled={loading || (paymentRequired && !configChecked)}
                    className="w-full bg-primary-gradient text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {loading ? 'Processing...' : paymentRequired ? 'Checkout' : 'Place Order'}
                  </button>
                  {paymentRequired && (
                    <p className="text-xs text-text-light text-center">
                      Secure payments powered by Stripe. Your card will be charged when you confirm payment.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showPaymentSheet && clientSecret && stripePromise && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={closePaymentSheet}
              className="absolute top-4 right-4 text-text-light hover:text-text-dark"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-text-dark mb-2">Secure Payment</h3>
            <p className="text-sm text-text-light mb-4">
              You will be charged {paymentSummary.currency.toUpperCase()} {parseFloat(paymentSummary.amount).toFixed(2)}
            </p>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <CheckoutForm
                amount={paymentSummary.amount}
                currency={paymentSummary.currency}
                email={user?.email || profileEmail}
                onSuccess={handlePaymentSuccess}
                onCancel={closePaymentSheet}
                showToast={showToast}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;

