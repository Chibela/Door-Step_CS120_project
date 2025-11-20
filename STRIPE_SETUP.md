# Stripe Payment Integration Setup

## Backend Environment Variables

Add these to your `backend/.env.local` file:

```bash
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret (optional, for production)
STRIPE_DEFAULT_CURRENCY=usd  # Default currency (optional, defaults to 'usd')
```

## Frontend Environment Variables

Add to your `frontend/.env.local` or set in Vercel:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Optional - will be fetched from backend if not set
```

## Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Stripe Dashboard Setup

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** and **Secret key**
3. Add them to your environment variables

## Webhook Setup (Optional, for production)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://your-backend-url.com/api/payments/webhook`
3. Select event: `payment_intent.succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work.

## Features

- ✅ Secure card payment with Stripe Elements
- ✅ Payment intent creation and confirmation
- ✅ Payment status tracking in orders
- ✅ Webhook support for payment updates
- ✅ Smooth UI with loading states
- ✅ Error handling and user feedback
