# Stripe Payment Integration Setup Guide

## Overview
This guide walks you through setting up Stripe payments for your Door-Step food truck ordering app. You'll need your **Secret Key (S key)** and **Publishable Key (P key)** from Stripe.

## Prerequisites
- Stripe account with API keys ready
- Your Secret Key (starts with `sk_`)
- Your Publishable Key (starts with `pk_`)

## Backend Setup

### 1. Update Environment Variables
Add these to your `.env.local` file in the backend folder:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_your_secret_key_here
```

**Example:**
```bash
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnop
```

> **Important:** Never commit your Secret Key to version control. Keep it private!

### 2. Install Dependencies
The backend now includes the `stripe` package. Install it:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Backend Endpoints
Two new endpoints have been added:

#### `POST /api/create-payment-intent`
Creates a Stripe PaymentIntent for processing the order payment.

**Request:**
```json
{
  "items": [{ "id": 1, "name": "Burger", "price": 10.99, "quantity": 2 }],
  "subtotal": 21.98,
  "tax": 2.20,
  "tip": 5.00,
  "total": 29.18
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_abcdefgh",
  "paymentIntentId": "pi_1234567890"
}
```

#### `POST /api/confirm-payment`
Confirms the payment was successful and creates the order in the database.

**Request:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "items": [...],
  "subtotal": 21.98,
  "tax": 2.20,
  "tip": 5.00,
  "total": 29.18
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "ORD1234567890",
  "message": "Order placed successfully!"
}
```

## Frontend Setup

### 1. Update Environment Variables
Add this to your `.env.local` file in the frontend folder:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_your_publishable_key_here
```

**Example:**
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_51234567890abcdefghijklmno
```

> **Safe to share:** Your Publishable Key is not sensitive and can be public.

### 2. Install Dependencies
The frontend now includes Stripe packages. Install them:

```bash
cd frontend
npm install
```

### 3. How It Works

#### Customer Experience:
1. Customer adds items to cart
2. Clicks "Proceed to Payment" button
3. Secure checkout modal opens with Stripe Elements
4. Customer enters card details
5. Stripe processes the payment
6. Order is confirmed in the database
7. Customer is redirected to their orders

#### Components Involved:
- **`Cart.jsx`** - Main shopping cart page that triggers payment flow
- **`CheckoutModal.jsx`** - New modal component with Stripe Elements form
- **`api.js`** - Two new functions: `createPaymentIntent()` and `confirmPayment()`

## Testing with Stripe Test Keys

When developing/testing, Stripe provides test keys. Use these test card numbers:

### Successful Payment
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3-digit number (e.g., 123)
- **ZIP:** Any 5-digit number (e.g., 12345)

### Payment Declined
- **Card Number:** `4000 0000 0000 0002`

### Requires Authentication
- **Card Number:** `4000 0025 0000 3155`

## Production Deployment

### 1. Get Production Keys
- Log into your Stripe Dashboard
- Switch from **Test Mode** to **Live Mode**
- Copy your live **Secret Key** and **Publishable Key**

### 2. Update Environment Variables

**Backend (.env.local):**
```bash
STRIPE_SECRET_KEY=sk_live_yourproductionkey
```

**Frontend (.env.local):**
```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_yourproductionkey
```

### 3. Security Checklist
- ✅ Secret Key is stored in `.env.local` (NOT committed to git)
- ✅ Publishable Key is in `.env.local` (can be public but good practice to hide)
- ✅ Environment variables are loaded before app starts
- ✅ All sensitive keys are in backend environment variables
- ✅ Frontend only has public Publishable Key
- ✅ Card data never touches your server (handled by Stripe)

## Troubleshooting

### Error: "Stripe is not configured"
- Check that `STRIPE_SECRET_KEY` is set in backend `.env.local`
- Restart the backend server after adding the key
- Make sure the key format is correct (starts with `sk_test_` or `sk_live_`)

### Error: "Payment system is not configured"
- Check that `VITE_STRIPE_PUBLIC_KEY` is set in frontend `.env.local`
- Restart the frontend dev server (`npm run dev`)
- Make sure the key format is correct (starts with `pk_test_` or `pk_live_`)

### Modal doesn't appear
- Verify Stripe Publishable Key is correct
- Check browser console for errors
- Ensure `@stripe/react-stripe-js` package is installed

### Payment declined
- For test mode, use the correct test card numbers listed above
- Check card expiry and CVC
- Try a different test card

### "Order created but payment wasn't confirmed"
- This is a backend issue - check server logs
- Verify `confirmPayment` endpoint is responding
- Check database connection for order creation

## Features

✅ **Security**
- PCI compliance through Stripe Elements
- Card data never stored on your servers
- Encrypted transmission of payment data

✅ **User Experience**
- Clean, modern checkout modal
- Real-time card validation
- Clear error messages

✅ **Reliability**
- Idempotent payment processing
- Automatic conflict detection (allergies checked before payment)
- Order confirmation on successful payment

✅ **Transparency**
- Order summary shown before payment
- Clear pricing breakdown (subtotal, tax, tip)
- Receipt available in orders page

## Next Steps

1. Set up your Stripe account if you haven't already: https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env.local` files (both frontend and backend)
4. Reinstall dependencies: `npm install` (frontend) and `pip install -r requirements.txt` (backend)
5. Restart your development servers
6. Test with test card numbers
7. Deploy to production with live keys when ready

## Support

For Stripe documentation: https://stripe.com/docs
For issues with this implementation, check the browser console and server logs.
