import React, { useState } from 'react';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import './PricingPage.css';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');

  const pricing = {
    monthly: { client: 29, freelancer: 19 },
    yearly: { client: 290, freelancer: 190 },
  };

  const redirectToPayment = (plan, amt) => {
    navigate(`/payment?plan=${plan}&amount=${amt}`);
  };

  const redirectToCall = () => {
    navigate('/schedule-call');
  };

  return (
    <section className="pricing-wrapper">
      <h1 className="pricing-title">Choose the Perfect Plan</h1>
      <p className="pricing-desc">Flexible pricing made for Clients, Freelancers & Enterprises.</p>

      {/* Billing Toggle */}
      <div className="billing-toggle">
        <span className={billing === 'monthly' ? 'active' : ''}>Monthly</span>
        <label className="switch">
          <input type="checkbox" onChange={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')} />
          <span className="slider"></span>
        </label>
        <span className={billing === 'yearly' ? 'active' : ''}>Yearly</span>
      </div>

      <div className="pricing-grid">
        {/* Client Plan */}
        <div className="pricing-card">
          <h2>Client</h2>
          <h3 className="price">${pricing[billing].client}</h3>
          <ul>
            <li><FaCheck /> Unlimited Projects</li>
            <li><FaCheck /> Milestone Management</li>
            <li><FaCheck /> Secure Workspace</li>
          </ul>
          <button className="choose-btn" onClick={() => redirectToPayment('client', pricing[billing].client)}>Get Started <FaArrowRight /></button>
        </div>

        {/* Freelancer Plan */}
        <div className="pricing-card">
          <h2>Freelancer</h2>
          <h3 className="price">${pricing[billing].freelancer}</h3>
          <ul>
            <li><FaCheck /> Unlimited Proposals</li>
            <li><FaCheck /> Workspace Access</li>
            <li><FaCheck /> File Sharing & Calls</li>
          </ul>
          <button className="choose-btn" onClick={() => redirectToPayment('freelancer', pricing[billing].freelancer)}>Subscribe <FaArrowRight /></button>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card enterprise">
          <h2>Enterprise</h2>
          <h3 className="price">Custom</h3>
          <ul>
            <li><FaCheck /> Team Management</li>
            <li><FaCheck /> Bulk Payments</li>
            <li><FaCheck /> Dedicated Support</li>
          </ul>
          <button className="choose-btn enterprise-btn" onClick={redirectToCall}>Schedule a Call <FaArrowRight /></button>
        </div>
      </div>
    </section>
  );
}
