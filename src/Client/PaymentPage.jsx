import React, { useState } from 'react';
import './PaymentPage.css';
import axios from 'axios';

const PaymentPage = () => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: '',
    description: '',
    freelancerId: '69246fa44262486de9f3195e' // Default freelancer ID
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionCreated, setTransactionCreated] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
const createClientPayment = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const paymentDataToSend = {
      amount: paymentData.amount,
      description: paymentData.description || `Payment of $${paymentData.amount} for services`,
      freelancerId: paymentData.freelancerId
    };

    console.log('💰 Creating client payment:', paymentDataToSend);

    const response = await axios.post('http://localhost:3000/api/transactions/client-payment', 
      paymentDataToSend,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Client payment created successfully:', response.data.transaction);
      setTransactionCreated(true);
      return true;
    } else {
      console.log('❌ Client payment creation failed:', response.data);
      setErrorDetails(response.data.message || 'Unknown error');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error creating client payment:', error);
    
    if (error.response) {
      console.log('🔍 Error response data:', error.response.data);
      console.log('🔍 Error status:', error.response.status);
      
      // Show the actual error message from server
      const serverError = error.response.data;
      if (serverError.error) {
        setErrorDetails(`Server Error: ${serverError.error}`);
      } else {
        setErrorDetails(`Server error: ${error.response.status} - ${serverError.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      console.log('🔍 No response received:', error.request);
      setErrorDetails('No response from server. Check if server is running.');
    } else {
      console.log('🔍 Other error:', error.message);
      setErrorDetails(`Error: ${error.message}`);
    }
    return false;
  }
};
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails('');
    setTransactionCreated(false);

    try {
      // Step 1: Create client payment
      console.log('🔄 Step 1: Creating client payment...');
      const paymentSuccess = await createClientPayment();
      
      if (!paymentSuccess) {
        console.log('❌ Payment creation failed with details:', errorDetails);
      }

      // Step 2: Simulate payment processing
      console.log('🔄 Step 2: Processing payment...');
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        console.log('✅ Payment completed successfully!');
        
        if (paymentSuccess) {
          console.log('✅ Payment transaction was created successfully!');
        } else {
          console.log('⚠️ Payment succeeded but transaction creation failed');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      setLoading(false);
      setErrorDetails(`Payment failed: ${error.message}`);
    }
  };

  if (success) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Amount: ${paymentData.amount}</p>
          <p className={transactionCreated ? 'success-message' : 'warning-message'}>
            Transaction: {transactionCreated ? 'Recorded ✅' : 'Not Recorded ⚠️'}
          </p>
          {transactionCreated && (
            <div className="success-details">
              <p>✅ Payment of ${paymentData.amount} sent to freelancer!</p>
              <p>The freelancer can now see this payment in their earnings.</p>
            </div>
          )}
          {!transactionCreated && (
            <div className="error-details">
              <p>Transaction creation failed. Details:</p>
              <code>{errorDetails}</code>
            </div>
          )}
          <div className="success-actions">
            <button 
              onClick={() => {
                setSuccess(false);
                setTransactionCreated(false);
                setErrorDetails('');
                setPaymentData({ 
                  amount: '', 
                  cardNumber: '', 
                  expiry: '', 
                  cvc: '', 
                  name: '',
                  description: '',
                  freelancerId: '69246fa44262486de9f3195e'
                });
              }}
              className="success-button"
            >
              Make Another Payment
            </button>
            <button 
              onClick={() => window.location.href = '/client/dashboard'}
              className="view-dashboard-button"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1 className="payment-title">Make a Payment to Freelancer</h1>
      <p className="payment-subtitle">Send payment directly to a freelancer</p>
      
      {errorDetails && (
        <div className="error-banner">
          <strong>Error:</strong> {errorDetails}
        </div>
      )}
      
      <div className="payment-card">
        <form onSubmit={handlePayment} className="payment-form">
          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={paymentData.amount}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter amount"
              required
            />
          </div>

          {/* Freelancer ID */}
          <div className="form-group">
            <label className="form-label">Freelancer ID</label>
            <input
              type="text"
              name="freelancerId"
              value={paymentData.freelancerId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter freelancer ID"
              required
            />
            <small>Default: 69246fa44262486de9f3195e (your freelancer account)</small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Payment Description</label>
            <input
              type="text"
              name="description"
              value={paymentData.description}
              onChange={handleInputChange}
              className="form-input"
              placeholder="What is this payment for?"
            />
          </div>

          {/* Card Details */}
          <div className="payment-section">
            <h3>Card Details (Demo)</h3>
            
            {/* Card Number */}
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="form-row">
              {/* Expiry Date */}
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  value={paymentData.expiry}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="MM/YY"
                  required
                />
              </div>

              {/* CVC */}
              <div className="form-group">
                <label className="form-label">CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={paymentData.cvc}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                name="name"
                value={paymentData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !paymentData.amount}
            className="pay-button"
          >
            {loading ? 'Processing...' : `Pay $${paymentData.amount || '0'}`}
          </button>

          <div className="test-info">
            <h4>💡 How this works:</h4>
            <p>• Enter any amount you want to pay</p>
            <p>• Specify the freelancer ID (use your freelancer account ID)</p>
            <p>• Payment will be recorded in the freelancer's earnings</p>
            <p>• Switch to freelancer account to see the payment in earnings</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;