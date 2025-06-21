import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ bookingId, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setError('Stripe has not been initialized.');
      setProcessing(false);
      return;
    }

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (submitError) {
        setError(submitError.message);
        setProcessing(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
      <div className="mb-6">
        <p className="text-gray-600">Total Amount:</p>
        <p className="text-2xl font-bold text-sky-blue">₹{totalPrice}</p>
      </div>
      
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium
          ${processing ? 'bg-gray-400' : 'bg-sky-blue hover:bg-blue-600'}
          transition duration-200`}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Payment = ({ bookingId, totalPrice, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        setError('Failed to initialize payment. Please try again.');
      });
  }, [bookingId]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4DA8DA',
    },
    rules: {
      '.Input': {
        border: '1px solid #E5E7EB',
        borderRadius: '0.375rem',
      },
    },
    locale: 'auto'
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
            loader: 'auto'
          }}
        >
          <PaymentForm
            bookingId={bookingId}
            totalPrice={totalPrice}
            onSuccess={onSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default Payment; 