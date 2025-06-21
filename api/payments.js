const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook, createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Handle Stripe webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Create Stripe Checkout session
router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router; 