import React, { useState } from 'react';
import './PaymentPages.css';

export default function PaymentPage() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');
  const amount = params.get('amount');
  const [method, setMethod] = useState('card');

  return (
    <section className="payment-wrapper">
      <h1 className="payment-title">Checkout</h1>
      <p className="selected-plan">Plan Selected: <strong>{plan}</strong></p>
      <h2 className="amount-display">${amount}</h2>

      {/* Toggle */}
      <div className="payment-toggle">
        <button className={method === 'card' ? 'active' : ''} onClick={() => setMethod('card')}>Card</button>
        <button className={method === 'upi' ? 'active' : ''} onClick={() => setMethod('upi')}>UPI</button>
      </div>

      {method === 'card' && (
        <div className="card-box">
          <label>Card Number</label>
          <input type="text" placeholder="4242 4242 4242 4242" />

          <label>Expiry</label>
          <input type="text" placeholder="MM/YY" />

          <label>CVC</label>
          <input type="text" placeholder="123" />

          <button className="pay-btn">Pay Now</button>
        </div>
      )}

      {method === 'upi' && (
        <div className="upi-box">
          <label>Enter UPI ID</label>
          <input type="text" placeholder="name@upi" />

          <button className="pay-btn">Pay with UPI</button>
        </div>
      )}
    </section>
  );
}
