const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Booking = require('../models/Booking');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  res.status(501).json({ message: 'Payment intent is disabled in test mode.' });
};

// @desc    Handle webhook events
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  res.status(501).json({ message: 'Webhooks are disabled in test mode.' });
};

// @desc    Create Stripe Checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  // Just return a dummy URL for now
  res.json({ url: '/payment-success' });
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  createCheckoutSession
}; 