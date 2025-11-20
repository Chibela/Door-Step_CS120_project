import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getStripeConfig, createPaymentIntent } from '../services/api';
import { useToast } from './Toast';

const PaymentFormInner = ({ amount, items, subtotal, tax, tip, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const intentData = await createPaymentIntent({
          items,
          tip: parseFloat(tip),
          tax: parseFloat(tax),
        });
        setClientSecret(intentData.clientSecret);
      } catch (error) {
        showToast(error.response?.data?.error || 'Failed to initialize payment', 'error');
        onCancel();
      } finally {
        setLoadingIntent(false);
      }
    };

    if (stripe && elements) {
      initializePayment();
    }
  }, [stripe, elements, items, tip, tax]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        showToast(submitError.message, 'error');
        setProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/customer/orders',
        },
        redirect: 'if_required',
      });

      if (error) {
        showToast(error.message, 'error');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          payment_intent_id: paymentIntent.id,
          payment_status: 'paid',
          currency: paymentIntent.currency,
        });
      }
    } catch (err) {
      showToast('Payment failed. Please try again.', 'error');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  if (loadingIntent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-light">Initializing secure payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-dark">Secure Payment</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-light mb-2">
              Card Information
            </label>
            <div className="bg-white rounded-xl p-4 border-2 border-dust-grey focus-within:border-primary transition-colors">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dust-grey/30 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-light">Subtotal</span>
          <span className="font-semibold text-text-dark">${parseFloat(subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-light">Tax</span>
          <span className="font-semibold text-text-dark">${parseFloat(tax).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-light">Tip</span>
          <span className="font-semibold text-text-dark">${parseFloat(tip).toFixed(2)}</span>
        </div>
        <div className="border-t border-dust-grey pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-bold text-text-dark">Total</span>
            <span className="font-bold text-xl text-primary">${parseFloat(amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-6 py-3 border-2 border-dust-grey rounded-xl font-semibold text-text-dark hover:bg-dust-grey transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ${parseFloat(amount).toFixed(2)}
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-light justify-center">
        <Lock className="w-3 h-3" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
};

const PaymentForm = ({ amount, items, subtotal, tax, tip, onSuccess, onCancel }) => {
  const [stripeKey, setStripeKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStripeKey = async () => {
      try {
        const config = await getStripeConfig();
        setStripeKey(config.publishableKey);
      } catch (error) {
        console.error('Failed to load Stripe config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStripeKey();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!stripeKey) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-semibold mb-2">Payment service unavailable</p>
        <p className="text-red-600 text-sm">Please contact support or try again later.</p>
      </div>
    );
  }

  const stripePromise = loadStripe(stripeKey);

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner
        amount={amount}
        items={items}
        subtotal={subtotal}
        tax={tax}
        tip={tip}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default PaymentForm;

