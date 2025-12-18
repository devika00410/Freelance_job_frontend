import React, { useState, useEffect } from 'react';
import { FaCheck, FaArrowRight, FaCrown, FaStar, FaUsers } from 'react-icons/fa';
import { MdSecurity, MdSupport, MdCloud, MdAnalytics } from 'react-icons/md';
import { SiAirtable } from 'react-icons/si';
import './PricingPage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/subscriptions/plans');
      setPlans(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/subscriptions/create-checkout', {
        planId: plan._id,
        billingCycle: billing,
        userId: user._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const redirectToCall = () => {
    navigate('/schedule-call');
  };

  if (loading) {
    return (
      <div className="pricing-wrapper">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section className="pricing-wrapper">
      <div className="pricing-header">
        <h1 className="pricing-title">Flexible Plans for Every Need</h1>
        <p className="pricing-desc">Start free, upgrade as you grow. Cancel anytime.</p>
        
        {/* Billing Toggle */}
        <div className="billing-toggle-container">
          <div className="billing-toggle">
            <span className={`toggle-label ${billing === 'monthly' ? 'active' : ''}`}>
              Monthly
            </span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={billing === 'yearly'}
                onChange={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')} 
              />
              <span className="slider"></span>
            </label>
            <span className={`toggle-label ${billing === 'yearly' ? 'active' : ''}`}>
              Yearly <span className="discount-badge">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pricing-grid">
        {/* Free Plan */}
        <div className="pricing-card free">
          <div className="plan-badge free-badge">Free</div>
          <div className="plan-header">
            <h2>Starter</h2>
            <p className="plan-subtitle">For trying out the platform</p>
          </div>
          
          <div className="plan-price">
            <h3>$0</h3>
            <p className="billing-cycle">forever</p>
          </div>
          
          <ul className="plan-features">
            <li><FaCheck /> 1 Active Project</li>
            <li><FaCheck /> Basic Workspace</li>
            <li><FaCheck /> 500MB Storage</li>
            <li><FaCheck /> Community Support</li>
            <li className="disabled"><FaCheck /> Priority Support</li>
            <li className="disabled"><FaCheck /> Advanced Analytics</li>
          </ul>
          
          <button 
            className="choose-btn free-btn"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
          </button>
        </div>

        {/* Client Plan */}
        <div className="pricing-card popular">
          <div className="plan-badge popular-badge">Most Popular</div>
          <div className="plan-header">
            <h2>Client</h2>
            <p className="plan-subtitle">For managing multiple projects</p>
          </div>
          
          <div className="plan-price">
            <h3>${billing === 'monthly' ? '29' : '278'}<span className="month-text">/mo</span></h3>
            <p className="billing-cycle">
              {billing === 'yearly' ? 'Billed annually ($29/mo)' : 'Billed monthly'}
            </p>
          </div>
          
          <ul className="plan-features">
            <li><FaCheck /> <strong>Unlimited Projects</strong></li>
            <li><FaCheck /> Milestone Management</li>
            <li><FaCheck /> Secure Workspace</li>
            <li><FaCheck /> Priority Support</li>
            <li><FaCheck /> 10GB Storage</li>
            <li><FaCheck /> Team Collaboration</li>
          </ul>
          
          <button 
            className="choose-btn primary-btn"
            onClick={() => handleSelectPlan({ _id: 'client_plan', price: billing === 'monthly' ? 2900 : 27800 })}
          >
            Get Started <FaArrowRight />
          </button>
        </div>

        {/* Freelancer Plan */}
        <div className="pricing-card">
          <div className="plan-header">
            <h2>Freelancer</h2>
            <p className="plan-subtitle">For independent professionals</p>
          </div>
          
          <div className="plan-price">
            <h3>${billing === 'monthly' ? '19' : '182'}<span className="month-text">/mo</span></h3>
            <p className="billing-cycle">
              {billing === 'yearly' ? 'Billed annually ($19/mo)' : 'Billed monthly'}
            </p>
          </div>
          
          <ul className="plan-features">
            <li><FaCheck /> <strong>Unlimited Proposals</strong></li>
            <li><FaCheck /> Workspace Access</li>
            <li><FaCheck /> File Sharing & Calls</li>
            <li><FaCheck /> Portfolio Showcase</li>
            <li><FaCheck /> 5GB Storage</li>
            <li><FaCheck /> Client Management</li>
          </ul>
          
          <button 
            className="choose-btn secondary-btn"
            onClick={() => handleSelectPlan({ _id: 'freelancer_plan', price: billing === 'monthly' ? 1900 : 18200 })}
          >
            Start Freelancing <FaArrowRight />
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card enterprise">
          <div className="plan-badge enterprise-badge">Enterprise</div>
          <div className="plan-header">
            <h2>Enterprise</h2>
            <p className="plan-subtitle">For large teams & organizations</p>
          </div>
          
          <div className="plan-price">
            <h3>Custom</h3>
            <p className="billing-cycle">Tailored to your needs</p>
          </div>
          
          <ul className="plan-features">
            <li><FaCheck /> <strong>Unlimited Everything</strong></li>
            <li><FaCheck /> <MdSecurity /> Dedicated Security</li>
            <li><FaCheck /> <MdSupport /> 24/7 Phone Support</li>
            <li><FaCheck /> <MdAnalytics /> Advanced Analytics</li>
            <li><FaCheck /> <FaUsers /> Custom Team Roles</li>
            <li><FaCheck /> <SiAirtable /> API Access</li>
          </ul>
          
          <button 
            className="choose-btn enterprise-btn"
            onClick={redirectToCall}
          >
            Contact Sales <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="feature-comparison">
        <h2>Compare All Features</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Features</th>
              <th>Starter</th>
              <th>Client</th>
              <th>Freelancer</th>
              <th>Enterprise</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Active Projects</td>
              <td>1</td>
              <td>Unlimited</td>
              <td>5</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Storage</td>
              <td>500MB</td>
              <td>10GB</td>
              <td>5GB</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <td>Priority Support</td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
              <td>✅ 24/7</td>
            </tr>
            <tr>
              <td>Team Members</td>
              <td>1</td>
              <td>5</td>
              <td>1</td>
              <td>Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans later?</h4>
            <p>Yes, you can upgrade or downgrade at any time. Prorated credits will be applied.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>The Starter plan is free forever. Paid plans come with a 14-day money-back guarantee.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods do you accept?</h4>
            <p>We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
          </div>
          <div className="faq-item">
            <h4>How does admin approval work?</h4>
            <p>After payment, admin reviews and activates your subscription within 24 hours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}