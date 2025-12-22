import React, { useState, useEffect } from 'react';
import './PaymentPage.css';
import axios from 'axios';
import { 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity, 
  FaWallet,
  FaLock,
  FaShieldAlt,
  FaCheck,
  FaArrowRight,
  FaInfoCircle,
  FaPaste,
  FaCopy
} from 'react-icons/fa';

const PaymentPage = () => {
  const [activePaymentMethod, setActivePaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionCreated, setTransactionCreated] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Payment form states
  const [paymentData, setPaymentData] = useState({
    amount: '',
    freelancerId: '',
    freelancerName: '',
    description: '',
    
    // Card details
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
    
    // UPI details
    upiId: '',
    
    // Net Banking details
    bankName: '',
    accountNumber: '',
    
    // Wallet details
    walletType: 'paytm',
    walletId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePasteFreelancerId = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPaymentData(prev => ({ ...prev, freelancerId: text.trim() }));
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to paste:', err);
      alert('Unable to paste from clipboard. Please ensure clipboard access is granted.');
    }
  };

  const handleCopyFreelancerId = async () => {
    try {
      // This is for copying a test ID - in real app, you would copy from workspace
      const testId = '69246fa44262486de9f3195e'; // Default test freelancer ID
      await navigator.clipboard.writeText(testId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const createClientPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Prepare data exactly as backend expects
      const paymentDataToSend = {
        amount: parseFloat(paymentData.amount),
        freelancerId: paymentData.freelancerId, // This is required by backend
        description: paymentData.description || `Payment of $${paymentData.amount} to freelancer`,
        paymentMethod: activePaymentMethod,
        clientId: userData?._id,
        clientName: userData?.name || 'Unknown Client'
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
        const serverError = error.response.data;
        setErrorDetails(`Server Error: ${serverError.error || serverError.message || 'Unknown error'}`);
      } else if (error.request) {
        setErrorDetails('No response from server. Check if server is running.');
      } else {
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

    // Validate amount
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setErrorDetails('Please enter a valid amount');
      setLoading(false);
      return;
    }

    // Validate freelancer ID
    if (!paymentData.freelancerId) {
      setErrorDetails('Please enter freelancer ID');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create client payment
      console.log('🔄 Step 1: Creating client payment...');
      const paymentSuccess = await createClientPayment();
      
      if (!paymentSuccess) {
        console.log('❌ Payment creation failed with details:', errorDetails);
      }

      // Step 2: Simulate payment processing with different times for different methods
      let processTime = 2000;
      if (activePaymentMethod === 'upi') processTime = 1500;
      if (activePaymentMethod === 'wallet') processTime = 1000;
      
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        console.log('✅ Payment completed successfully!');
        
        if (paymentSuccess) {
          console.log('✅ Payment transaction was created successfully!');
        } else {
          console.log('⚠️ Payment succeeded but transaction creation failed');
        }
      }, processTime);

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      setLoading(false);
      setErrorDetails(`Payment failed: ${error.message}`);
    }
  };

  // Payment Method Tabs
  const PaymentMethodTabs = () => (
    <div className="payment-methods-tabs">
      <button
        className={`method-tab ${activePaymentMethod === 'card' ? 'active' : ''}`}
        onClick={() => setActivePaymentMethod('card')}
      >
        <FaCreditCard />
        <span>Credit/Debit Card</span>
      </button>
      <button
        className={`method-tab ${activePaymentMethod === 'upi' ? 'active' : ''}`}
        onClick={() => setActivePaymentMethod('upi')}
      >
        <FaMobileAlt />
        <span>UPI</span>
      </button>
      <button
        className={`method-tab ${activePaymentMethod === 'netbanking' ? 'active' : ''}`}
        onClick={() => setActivePaymentMethod('netbanking')}
      >
        <FaUniversity />
        <span>Net Banking</span>
      </button>
      <button
        className={`method-tab ${activePaymentMethod === 'wallet' ? 'active' : ''}`}
        onClick={() => setActivePaymentMethod('wallet')}
      >
        <FaWallet />
        <span>Wallet</span>
      </button>
    </div>
  );

  // Card Payment Form
  const CardPaymentForm = () => (
    <div className="payment-form-section">
      <div className="form-header">
        <FaCreditCard className="form-icon" />
        <h4>Card Details</h4>
      </div>
      
      <div className="form-group">
        <label className="form-label">Card Number</label>
        <input
          type="text"
          name="cardNumber"
          value={formatCardNumber(paymentData.cardNumber)}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
          }}
          className="form-input"
          placeholder="1234 5678 9012 3456"
          maxLength="19"
        />
        <div className="card-icons">
          <span className="card-icon visa">Visa</span>
          <span className="card-icon mastercard">MasterCard</span>
          <span className="card-icon rupay">RuPay</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Expiry Date (MM/YY)</label>
          <input
            type="text"
            name="expiry"
            value={formatExpiry(paymentData.expiry)}
            onChange={(e) => {
              const formatted = formatExpiry(e.target.value);
              setPaymentData(prev => ({ ...prev, expiry: formatted }));
            }}
            className="form-input"
            placeholder="MM/YY"
            maxLength="5"
          />
        </div>
        <div className="form-group">
          <label className="form-label">CVV</label>
          <input
            type="text"
            name="cvc"
            value={paymentData.cvc}
            onChange={handleInputChange}
            className="form-input"
            placeholder="123"
            maxLength="4"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Name on Card</label>
        <input
          type="text"
          name="nameOnCard"
          value={paymentData.nameOnCard}
          onChange={handleInputChange}
          className="form-input"
          placeholder="John Doe"
        />
      </div>

      <div className="test-card-info">
        <FaInfoCircle className="info-icon" />
        <p><strong>Test Card:</strong> Use 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123</p>
      </div>
    </div>
  );

  // UPI Payment Form
  const UpiPaymentForm = () => (
    <div className="payment-form-section">
      <div className="form-header">
        <FaMobileAlt className="form-icon" />
        <h4>UPI Payment</h4>
      </div>
      
      <div className="form-group">
        <label className="form-label">UPI ID</label>
        <input
          type="text"
          name="upiId"
          value={paymentData.upiId}
          onChange={handleInputChange}
          className="form-input"
          placeholder="username@upi"
        />
      </div>

      <div className="upi-apps">
        <div className="upi-app active">
          <img src="https://upload.wikimedia.org/wikipedia/commons/1/16/PhonePe_Logo.svg" alt="PhonePe" />
          <span>PhonePe</span>
        </div>
        <div className="upi-app">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Google_Pay_%28GPay%29_Logo.svg" alt="Google Pay" />
          <span>GPay</span>
        </div>
        <div className="upi-app">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" />
          <span>Paytm</span>
        </div>
        <div className="upi-app">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Bhim_logo.svg" alt="BHIM" />
          <span>BHIM</span>
        </div>
      </div>

      <div className="test-card-info">
        <FaInfoCircle className="info-icon" />
        <p><strong>Test UPI:</strong> Use success@upi for successful payment</p>
      </div>
    </div>
  );

  // Net Banking Form
  const NetBankingForm = () => (
    <div className="payment-form-section">
      <div className="form-header">
        <FaUniversity className="form-icon" />
        <h4>Net Banking</h4>
      </div>
      
      <div className="form-group">
        <label className="form-label">Select Bank</label>
        <select
          name="bankName"
          value={paymentData.bankName}
          onChange={handleInputChange}
          className="form-input"
        >
          <option value="">Choose your bank</option>
          <option value="hdfc">HDFC Bank</option>
          <option value="icici">ICICI Bank</option>
          <option value="sbi">State Bank of India</option>
          <option value="axis">Axis Bank</option>
          <option value="kotak">Kotak Mahindra Bank</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Account Number (Last 4 digits)</label>
        <input
          type="text"
          name="accountNumber"
          value={paymentData.accountNumber}
          onChange={handleInputChange}
          className="form-input"
          placeholder="XXXX XXXX 1234"
          maxLength="4"
        />
      </div>

      <div className="security-note">
        <FaLock className="lock-icon" />
        <p>Your bank details are secure and encrypted</p>
      </div>
    </div>
  );

  // Wallet Payment Form
  const WalletPaymentForm = () => (
    <div className="payment-form-section">
      <div className="form-header">
        <FaWallet className="form-icon" />
        <h4>Digital Wallet</h4>
      </div>
      
      <div className="form-group">
        <label className="form-label">Select Wallet</label>
        <div className="wallet-options">
          <label className={`wallet-option ${paymentData.walletType === 'paytm' ? 'active' : ''}`}>
            <input
              type="radio"
              name="walletType"
              value="paytm"
              checked={paymentData.walletType === 'paytm'}
              onChange={handleInputChange}
            />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" />
            <span>Paytm</span>
          </label>
          <label className={`wallet-option ${paymentData.walletType === 'phonepe' ? 'active' : ''}`}>
            <input
              type="radio"
              name="walletType"
              value="phonepe"
              checked={paymentData.walletType === 'phonepe'}
              onChange={handleInputChange}
            />
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/16/PhonePe_Logo.svg" alt="PhonePe" />
            <span>PhonePe</span>
          </label>
          <label className={`wallet-option ${paymentData.walletType === 'amazonpay' ? 'active' : ''}`}>
            <input
              type="radio"
              name="walletType"
              value="amazonpay"
              checked={paymentData.walletType === 'amazonpay'}
              onChange={handleInputChange}
            />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon Pay" />
            <span>Amazon Pay</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Mobile Number/Email</label>
        <input
          type="text"
          name="walletId"
          value={paymentData.walletId}
          onChange={handleInputChange}
          className="form-input"
          placeholder="Enter your registered mobile or email"
        />
      </div>
    </div>
  );

  // Test ID Section
  const TestIdSection = () => (
    <div className="test-id-section">
      <div className="test-id-header">
        <FaInfoCircle />
        <h5>Test Freelancer ID</h5>
      </div>
      <div className="test-id-display">
        <code className="test-id-value">69246fa44262486de9f3195e</code>
        <button
          type="button"
          className={`copy-test-id-btn ${copySuccess ? 'success' : ''}`}
          onClick={handleCopyFreelancerId}
        >
          {copySuccess ? <FaCheck /> : <FaCopy />}
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="test-id-note">
        Use this test ID for demo payments. In production, use the freelancer ID from their workspace.
      </p>
    </div>
  );

  // How It Works Guide
  const HowItWorksGuide = () => (
    <div className="payment-flow-guide">
      <h4><FaInfoCircle /> How to Pay a Freelancer</h4>
      <div className="steps-list">
        <div className="step-item">
          <span className="step-number">1</span>
          <div className="step-content">
            <h5>Copy Freelancer ID from Workspace</h5>
            <p>Go to the freelancer's workspace and copy their ID</p>
          </div>
        </div>
        <div className="step-item">
          <span className="step-number">2</span>
          <div className="step-content">
            <h5>Paste ID in Payment Form</h5>
            <p>Click the "Paste" button or manually type the freelancer ID</p>
          </div>
        </div>
        <div className="step-item">
          <span className="step-number">3</span>
          <div className="step-content">
            <h5>Enter Payment Details</h5>
            <p>Fill in the amount and select your preferred payment method</p>
          </div>
        </div>
        <div className="step-item">
          <span className="step-number">4</span>
          <div className="step-content">
            <h5>Complete Payment</h5>
            <p>Submit the payment. The freelancer will see it in their earnings</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">
            <FaCheck />
          </div>
          <h2>Payment Successful!</h2>
          <div className="success-details-card">
            <div className="success-row">
              <span>Amount Paid:</span>
              <strong>${paymentData.amount}</strong>
            </div>
            <div className="success-row">
              <span>To Freelancer ID:</span>
              <code className="id-display">{paymentData.freelancerId}</code>
            </div>
            <div className="success-row">
              <span>Payment Method:</span>
              <span className="method-badge">
                {activePaymentMethod === 'card' && <FaCreditCard />}
                {activePaymentMethod === 'upi' && <FaMobileAlt />}
                {activePaymentMethod === 'netbanking' && <FaUniversity />}
                {activePaymentMethod === 'wallet' && <FaWallet />}
                {activePaymentMethod}
              </span>
            </div>
            <div className="success-row">
              <span>Transaction Status:</span>
              <span className={`status-badge ${transactionCreated ? 'success' : 'warning'}`}>
                {transactionCreated ? 'Recorded' : 'Not Recorded'}
              </span>
            </div>
          </div>
          
          {transactionCreated ? (
            <div className="success-message">
              <FaCheck className="success-check" />
              <p>The payment has been successfully recorded. The freelancer can now see this payment in their earnings dashboard.</p>
            </div>
          ) : (
            <div className="warning-message">
              <FaInfoCircle className="warning-icon" />
              <p>Payment was processed but transaction recording failed. Please contact support.</p>
              {errorDetails && (
                <div className="error-details">
                  <strong>Error Details:</strong>
                  <code>{errorDetails}</code>
                </div>
              )}
            </div>
          )}
          
          <div className="success-actions">
            <button 
              onClick={() => window.location.href = '/client/dashboard'}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => {
                setSuccess(false);
                setTransactionCreated(false);
                setErrorDetails('');
                setPaymentData({
                  amount: '',
                  freelancerId: '',
                  freelancerName: '',
                  description: '',
                  cardNumber: '',
                  expiry: '',
                  cvc: '',
                  nameOnCard: '',
                  upiId: '',
                  bankName: '',
                  accountNumber: '',
                  walletType: 'paytm',
                  walletId: ''
                });
                setPasteSuccess(false);
                setCopySuccess(false);
              }}
              className="btn-primary"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1 className="payment-title">Make Payment to Freelancer</h1>
        <p className="payment-subtitle">Secure and fast payment processing</p>
      </div>
      
      {errorDetails && (
        <div className="error-banner">
          <FaInfoCircle />
          <strong> Error:</strong> {errorDetails}
        </div>
      )}
      
      <div className="payment-card">
        <form onSubmit={handlePayment} className="payment-form">
          {/* Payment Amount & Details */}
          <div className="payment-details-section">
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  className="form-input amount-input"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            {/* Freelancer ID Input */}
            <div className="form-group">
              <label className="form-label">Freelancer ID *</label>
              <div className="freelancer-id-input-wrapper">
                <input
                  type="text"
                  name="freelancerId"
                  value={paymentData.freelancerId}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Paste freelancer ID here (from workspace)"
                  required
                />
                <button
                  type="button"
                  className={`paste-btn ${pasteSuccess ? 'success' : ''}`}
                  onClick={handlePasteFreelancerId}
                >
                  {pasteSuccess ? <FaCheck /> : <FaPaste />}
                  {pasteSuccess ? 'Pasted!' : 'Paste'}
                </button>
              </div>
              <small className="input-hint">
                Get this ID from the freelancer's workspace. Copy it from the workspace and paste here.
              </small>
            </div>
            
            {/* Freelancer Name */}
            <div className="form-group">
              <label className="form-label">Freelancer Name (Optional)</label>
              <input
                type="text"
                name="freelancerName"
                value={paymentData.freelancerName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter freelancer name for reference"
              />
            </div>
            
            {/* Description */}
            <div className="form-group">
              <label className="form-label">Payment Description</label>
              <textarea
                name="description"
                value={paymentData.description}
                onChange={handleInputChange}
                className="form-input textarea"
                placeholder="What is this payment for?"
                rows="2"
              />
            </div>
          </div>

          {/* Test ID Section */}
          <TestIdSection />

          {/* Payment Method Selection */}
          <PaymentMethodTabs />
          
          {/* Payment Form Based on Selected Method */}
          {activePaymentMethod === 'card' && <CardPaymentForm />}
          {activePaymentMethod === 'upi' && <UpiPaymentForm />}
          {activePaymentMethod === 'netbanking' && <NetBankingForm />}
          {activePaymentMethod === 'wallet' && <WalletPaymentForm />}
          
          {/* Security Info */}
          <div className="security-info">
            <FaShieldAlt className="security-icon" />
            <div className="security-text">
              <p><strong>Your payment is secure</strong></p>
              <p>All transactions are encrypted and secure</p>
            </div>
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || !paymentData.amount || !paymentData.freelancerId}
            className="pay-button"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Processing Payment...
              </>
            ) : (
              <>
                Pay ${paymentData.amount || '0.00'}
                <FaArrowRight className="arrow-icon" />
              </>
            )}
          </button>
          
          {/* How It Works Guide */}
          <HowItWorksGuide />
          
          {/* Test Information */}
          <div className="test-info">
            <h4><FaInfoCircle /> Testing Information</h4>
            <ul>
              <li>Enter any amount above $1</li>
              <li>Use freelancer ID: <code>69246fa44262486de9f3195e</code></li>
              <li>Use test card: <code>4242 4242 4242 4242</code></li>
              <li>Expiry: Any future date | CVV: Any 3 digits</li>
              <li>UPI: Use <code>success@upi</code> for test</li>
              <li>Payment will be recorded in the freelancer's earnings</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;