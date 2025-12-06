import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
// import './CheckoutForm.css';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // For testing, always show success
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 2000);

    // Real Stripe integration (commented out for testing)
    /*
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
    */
  };

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h3>Payment Successful!</h3>
        <p>Your payment of $100.00 has been processed successfully.</p>
        <button 
          onClick={() => window.location.reload()}
          className="success-button"
        >
          Make Another Payment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <PaymentElement />
      
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? 'Processing...' : 'Pay $100.00'}
      </button>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;