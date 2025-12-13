import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCreditCard, FaUniversity, FaPaypal, FaCheck, FaClock, FaReceipt, FaDownload } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import './ClientPaymentManager.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

const ClientPaymentManager = ({ workspace, milestones, contractDetails }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [stripeLoading, setStripeLoading] = useState(false);


const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);
  
  // Calculate payment summary from milestones
  const calculatePaymentSummary = () => {
    const totalAmount = contractDetails?.totalAmount || workspace?.totalBudget || 0;
    
    const paidMilestones = milestones.filter(m => 
      m.paymentStatus === 'paid' || m.status === 'completed'
    );
    const pendingMilestones = milestones.filter(m => 
      m.status === 'completed' && m.paymentStatus !== 'paid'
    );
    const upcomingMilestones = milestones.filter(m => 
      m.status !== 'completed'
    );

    const totalPaid = paidMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalPending = pendingMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const totalUpcoming = upcomingMilestones.reduce((sum, m) => sum + (m.amount || 0), 0);

    return {
      totalAmount,
      totalPaid,
      totalPending,
      totalUpcoming,
      paidMilestones: paidMilestones.length,
      pendingMilestones: pendingMilestones.length,
      upcomingMilestones: upcomingMilestones.length
    };
  };

  const paymentSummary = calculatePaymentSummary();

  // Fetch payment history
  useEffect(() => {

const fetchPayments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/payments/workspace/${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setPayments(response.data.payments || []);
  } catch (error) {
    console.log('⚠️ Payment API not available, using mock payments');
    
    // Use mock payments for development
    const mockPayments = [
      {
        _id: 'payment1',
        amount: 1000,
        status: 'completed',
        paymentDate: new Date(),
        description: 'Milestone 1 Payment',
        milestone: { title: 'Initial Research' }
      }
    ];
    
    setPayments(mockPayments);
  }
};
  }, [workspace?._id]);

  // Handle Stripe payment
  const handleStripePayment = async (milestone) => {
    setStripeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const stripe = await stripePromise;

      // Create payment intent
      const response = await axios.post(`${API_URL}/api/payments/create-payment-intent`, {
        amount: milestone.amount * 100, // Convert to cents
        currency: 'usd',
        workspaceId: workspace._id,
        milestoneId: milestone._id,
        description: `Payment for milestone: ${milestone.title}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.clientSecret) {
        const result = await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: workspace.client?.name || 'Client'
            }
          }
        });

        if (result.error) {
          alert(`Payment failed: ${result.error.message}`);
        } else if (result.paymentIntent.status === 'succeeded') {
          alert('Payment successful!');
          // Update milestone payment status
          const updateResponse = await axios.put(
            `${API_URL}/api/workspaces/${workspace._id}/milestones/${milestone._id}/mark-paid`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (updateResponse.data.success) {
            setPayments(prev => [{
              _id: result.paymentIntent.id,
              amount: milestone.amount,
              status: 'completed',
              date: new Date().toISOString(),
              method: 'card',
              description: `Payment for milestone: ${milestone.title}`
            }, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };

  // Handle manual payment (for testing)
  const handleManualPayment = async (milestone) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/payments/manual-payment`, {
        amount: milestone.amount,
        workspaceId: workspace._id,
        milestoneId: milestone._id,
        method: paymentMethod,
        description: `Manual payment for milestone: ${milestone.title}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Payment recorded successfully!');
        setPayments(prev => [response.data.payment, ...prev]);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to record payment.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  return (
    <div className="payment-manager">
      <div className="payment-header">
        <h2>Budget & Payments</h2>
        <div className="payment-summary">
          <div className="summary-card">
            <div className="summary-icon total">
              <FaDollarSign />
            </div>
            <div className="summary-content">
              <h3>{formatCurrency(paymentSummary.totalAmount)}</h3>
              <p>Total Contract Value</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon paid">
              <FaCheck />
            </div>
            <div className="summary-content">
              <h3>{formatCurrency(paymentSummary.totalPaid)}</h3>
              <p>Paid ({paymentSummary.paidMilestones} milestones)</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon pending">
              <FaClock />
            </div>
            <div className="summary-content">
              <h3>{formatCurrency(paymentSummary.totalPending)}</h3>
              <p>Pending Payment ({paymentSummary.pendingMilestones} milestones)</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon upcoming">
              <FaReceipt />
            </div>
            <div className="summary-content">
              <h3>{formatCurrency(paymentSummary.totalUpcoming)}</h3>
              <p>Upcoming ({paymentSummary.upcomingMilestones} milestones)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-content">
        <div className="payment-left">
          <div className="milestones-section">
            <h3>Milestones Pending Payment</h3>
            {milestones
              .filter(m => m.status === 'completed' && m.paymentStatus !== 'paid')
              .map(milestone => (
                <div key={milestone._id} className="milestone-payment-card">
                  <div className="milestone-info">
                    <h4>{milestone.title}</h4>
                    <p>Phase {milestone.phase} • Due: {formatDate(milestone.dueDate)}</p>
                    <span className="amount">{formatCurrency(milestone.amount)}</span>
                  </div>
                  <div className="payment-actions">
                    <button
                      className="btn-primary"
                      onClick={() => handleStripePayment(milestone)}
                      disabled={stripeLoading}
                    >
                      {stripeLoading ? 'Processing...' : 'Pay with Stripe'}
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => setSelectedMilestone(milestone)}
                    >
                      Other Payment Method
                    </button>
                  </div>
                </div>
              ))}
            
            {milestones.filter(m => m.status === 'completed' && m.paymentStatus !== 'paid').length === 0 && (
              <div className="empty-state">
                <FaCheck />
                <h4>No pending payments</h4>
                <p>All completed milestones have been paid</p>
              </div>
            )}
          </div>

          {selectedMilestone && (
            <div className="payment-method-modal">
              <h4>Pay for: {selectedMilestone.title}</h4>
              <div className="payment-methods">
                <div className="method-options">
                  <button
                    className={`method-option ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard /> Credit/Debit Card
                  </button>
                  <button
                    className={`method-option ${paymentMethod === 'bank' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <FaUniversity /> Bank Transfer
                  </button>
                  <button
                    className={`method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <FaPaypal /> PayPal
                  </button>
                </div>

                <div className="payment-details">
                  <p><strong>Amount:</strong> {formatCurrency(selectedMilestone.amount)}</p>
                  <p><strong>Milestone:</strong> {selectedMilestone.title}</p>
                  <p><strong>Description:</strong> {selectedMilestone.description}</p>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleManualPayment(selectedMilestone)}
                  >
                    Confirm Payment
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setSelectedMilestone(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="payment-right">
          <div className="payment-history">
            <h3>Payment History</h3>
            {payments.length > 0 ? (
              <div className="payments-list">
                {payments.map(payment => (
                  <div key={payment._id} className="payment-item">
                    <div className="payment-icon">
                      {payment.method === 'card' ? <FaCreditCard /> :
                       payment.method === 'bank' ? <FaUniversity /> :
                       payment.method === 'paypal' ? <FaPaypal /> : <FaDollarSign />}
                    </div>
                    <div className="payment-details">
                      <h5>{payment.description}</h5>
                      <p>{formatDate(payment.date)}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">{formatCurrency(payment.amount)}</span>
                      <span className={`status ${payment.status}`}>
                        {payment.status === 'completed' ? 'Paid' : payment.status}
                      </span>
                    </div>
                    {payment.receiptUrl && (
                      <button
                        className="btn-icon"
                        onClick={() => window.open(payment.receiptUrl, '_blank')}
                        title="Download Receipt"
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaReceipt />
                <h4>No payment history</h4>
                <p>Payments will appear here once made</p>
              </div>
            )}
          </div>

          <div className="contract-summary">
            <h3>Contract Summary</h3>
            <div className="summary-details">
              <div className="detail-row">
                <span>Contract ID:</span>
                <span>{contractDetails?.contractId || workspace?._id}</span>
              </div>
              <div className="detail-row">
                <span>Total Value:</span>
                <span>{formatCurrency(paymentSummary.totalAmount)}</span>
              </div>
              <div className="detail-row">
                <span>Milestones:</span>
                <span>{milestones.length}</span>
              </div>
              <div className="detail-row">
                <span>Paid:</span>
                <span>{formatCurrency(paymentSummary.totalPaid)}</span>
              </div>
              <div className="detail-row">
                <span>Remaining:</span>
                <span>{formatCurrency(paymentSummary.totalPending + paymentSummary.totalUpcoming)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentManager;