import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentPages.css';
import axios from 'axios';
import { 
  FaCreditCard, 
  FaPaypal, 
  FaGoogle, 
  FaApple, 
  FaLock,
  FaCheckCircle,
  FaSpinner,
  FaRegClock
} from 'react-icons/fa';
import { MdAccountBalance, MdQrCode } from 'react-icons/md';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ plan, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const token = localStorage.getItem('token');
      
      if (paymentMethod === 'card') {
        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) throw new Error(error.message);

        const response = await axios.post('http://localhost:3000/api/payments/create-payment-intent', {
          plan,
          amount,
          paymentMethodId: stripePaymentMethod.id,
          paymentType: 'subscription'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { clientSecret } = response.data;
        const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

        if (confirmError) throw new Error(confirmError.message);

        // Payment succeeded
        await axios.post('http://localhost:3000/api/subscriptions/activate-pending', {
          plan,
          amount,
          status: 'pending_admin_approval'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStatus('success');
        
      } else if (paymentMethod === 'upi') {
        // Handle UPI payment
        const response = await axios.post('http://localhost:3000/api/payments/upi', {
          plan,
          amount,
          upiId,
          paymentType: 'subscription'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setStatus('pending');
          // Redirect to UPI app or show QR
          window.location.href = response.data.upiUrl;
        }
      }
    } catch (error) {
      setStatus('error');
      alert(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="payment-success">
            <FaCheckCircle />
            <h3>Payment Successful!</h3>
            <p>Your payment is being processed. Admin will approve your subscription within 24 hours.</p>
            <button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
          </div>
        );
      case 'pending':
        return (
          <div className="payment-pending">
            <FaRegClock />
            <h3>Payment Pending</h3>
            <p>Please complete the payment in your UPI app. Admin approval required after payment.</p>
          </div>
        );
      case 'error':
        return (
          <div className="payment-error">
            <h3>Payment Failed</h3>
            <p>Please try again or contact support.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (status === 'success' || status === 'pending') {
    return renderPaymentStatus();
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-methods">
        <div className="method-grid">
          <button 
            type="button"
            className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <FaCreditCard /> Credit/Debit Card
          </button>
          <button 
            type="button"
            className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('upi')}
          >
            <MdQrCode /> UPI
          </button>
          <button 
            type="button"
            className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <FaPaypal /> PayPal
          </button>
          <button 
            type="button"
            className={`method-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('netbanking')}
          >
            <MdAccountBalance /> Net Banking
          </button>
        </div>
      </div>

      {paymentMethod === 'card' && (
        <div className="card-payment">
          <div className="card-element-container">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#0a1a44',
                    '::placeholder': { color: '#a0aec0' }
                  }
                }
              }}
            />
          </div>
          
          <div className="card-icons">
            <FaCreditCard title="Visa/Mastercard" />
            <FaGoogle title="Google Pay" />
            <FaApple title="Apple Pay" />
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="upi-payment">
          <input
            type="text"
            placeholder="Enter UPI ID (e.g., name@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required
          />
          <div className="upi-options">
            <button type="button" className="upi-app-btn">
              <img src="/google-pay.png" alt="Google Pay" />
            </button>
            <button type="button" className="upi-app-btn">
              <img src="/phonepe.png" alt="PhonePe" />
            </button>
            <button type="button" className="upi-app-btn">
              <img src="/paytm.png" alt="Paytm" />
            </button>
          </div>
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="paypal-payment">
          <p>You will be redirected to PayPal to complete your payment</p>
        </div>
      )}

      <div className="payment-security">
        <FaLock /> Secure payment • 256-bit SSL • PCI DSS compliant
      </div>

      <button 
        type="submit" 
        className="pay-btn" 
        disabled={loading || !stripe}
      >
        {loading ? <FaSpinner className="spinner" /> : null}
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>

      <div className="payment-terms">
        <p>By proceeding, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
        <p>Subscription requires admin approval before activation.</p>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');
  const amount = params.get('amount');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plan || !amount) {
      window.location.href = '/pricing';
      return;
    }
    setLoading(false);
  }, [plan, amount]);

  if (loading) {
    return (
      <section className="payment-wrapper">
        <div className="loading-spinner"></div>
      </section>
    );
  }

  return (
    <section className="payment-wrapper">
      <div className="payment-container">
        <div className="payment-header">
          <h1 className="payment-title">Complete Your Purchase</h1>
          <div className="payment-plan-info">
            <span>Plan: <strong>{plan}</strong></span>
            <span>Amount: <strong>${amount}</strong></span>
          </div>
        </div>

        <div className="payment-steps">
          <div className="step active">
            <span>1</span> Payment
          </div>
          <div className="step">
            <span>2</span> Admin Review
          </div>
          <div className="step">
            <span>3</span> Activation
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm plan={plan} amount={amount} />
        </Elements>

        <div className="payment-support">
          <p>Need help? <a href="mailto:support@platform.com">Contact Support</a> or call +1 (555) 123-4567</p>
          <p>Average admin approval time: 2-24 hours</p>
        </div>
      </div>
    </section>
  );
}