import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Loader } from 'lucide-react';
import { createPaymentIntent, confirmPayment } from '../services/api';
import { useToast } from './Toast';

const CheckoutModal = ({ cartData, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleCreatePaymentIntent = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await createPaymentIntent({
        items: cartData.items,
        subtotal: cartData.subtotal,
        tax: cartData.tax,
        tip: cartData.tip,
        total: cartData.total,
      });

      if (response.success) {
        setClientSecret(response.clientSecret);
        setPaymentIntentId(response.paymentIntentId);
      } else {
        setError(response.conflicts ? 
          `Allergy alert – remove or replace these items: ${response.conflicts
            .map(c => `${c.item}: ${c.allergies.join(', ')}`)
            .join('; ')}` 
          : response.error || 'Failed to create payment');
        showToast(error, 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create payment intent';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      showToast('Payment system not ready', 'error');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with card
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: cartData.email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        showToast(stripeError.message, 'error');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await confirmPayment({
          paymentIntentId: paymentIntent.id,
          items: cartData.items,
          subtotal: cartData.subtotal,
          tax: cartData.tax,
          tip: cartData.tip,
          total: cartData.total,
        });

        if (confirmResponse.success) {
          showToast('Order placed successfully!', 'success');
          if (onSuccess) {
            onSuccess(confirmResponse.order_id);
          }
          onClose();
        } else {
          setError(confirmResponse.error || 'Failed to confirm payment');
          showToast(error, 'error');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Payment failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${cartData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="text-gray-900">${cartData.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tip</span>
            <span className="text-gray-900">${cartData.tip.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${cartData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          {!clientSecret ? (
            <button
              onClick={handleCreatePaymentIntent}
              disabled={loading}
              className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Initializing Payment...' : 'Proceed to Payment'}
            </button>
          ) : (
            <>
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <CardElement options={cardElementOptions} />
              </div>
              <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? 'Processing...' : `Pay $${cartData.total.toFixed(2)}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientSecret(null);
                  setPaymentIntentId(null);
                  setError(null);
                }}
                disabled={loading}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Back
              </button>
            </>
          )}
        </form>

        {/* Security Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
