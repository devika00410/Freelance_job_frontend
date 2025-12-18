import React, { useState, useEffect } from 'react';
import { 
  FaDollarSign, FaCreditCard, FaUniversity, FaPaypal, 
  FaCheck, FaClock, FaReceipt, FaDownload, FaSpinner 
} from 'react-icons/fa';
import './ClientPaymentManager.css';

const ClientPaymentManager = ({ workspace, milestones, contractDetails }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Calculate payment summary
  const calculatePaymentSummary = () => {
    const totalAmount = contractDetails?.totalAmount || workspace?.totalBudget || 5000;
    
    const paidMilestones = milestones.filter(m => 
      m.paymentStatus === 'paid' || (m.status === 'completed' && m.amount)
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

  // Mock payment history
  useEffect(() => {
    setPayments([
      {
        _id: 'payment1',
        amount: 1500,
        status: 'completed',
        method: 'card',
        description: 'Milestone 1: Project Kickoff',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'payment2',
        amount: 2000,
        status: 'pending',
        method: 'bank',
        description: 'Milestone 2: Design Phase',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }, []);

  // Handle payment
  const handlePayment = async (milestone) => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update payment status locally
      const newPayment = {
        _id: `payment-${Date.now()}`,
        amount: milestone.amount,
        status: 'completed',
        method: paymentMethod,
        description: `Payment for: ${milestone.title}`,
        date: new Date().toISOString()
      };
      
      setPayments(prev => [newPayment, ...prev]);
      alert(`Payment of $${milestone.amount} processed successfully!`);
      setSelectedMilestone(null);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
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
                      onClick={() => setSelectedMilestone(milestone)}
                      disabled={processingPayment}
                    >
                      {processingPayment ? 'Processing...' : 'Make Payment'}
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
                    onClick={() => handlePayment(selectedMilestone)}
                    disabled={processingPayment}
                  >
                    {processingPayment ? <FaSpinner className="spinner" /> : 'Confirm Payment'}
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setSelectedMilestone(null)}
                    disabled={processingPayment}
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
                <span>{contractDetails?.contractId || workspace?._id?.substring(0, 8) || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Client:</span>
                <span>{workspace?.client?.name || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Freelancer:</span>
                <span>{workspace?.freelancer?.name || 'N/A'}</span>
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