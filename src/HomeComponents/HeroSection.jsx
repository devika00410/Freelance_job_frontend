import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      {/* Hero Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Empowering Freelancers <br />
          <span className="highlight">& Clients to Collaborate Seamlessly</span>
        </h1>
        <p className="hero-subtitle">
          Launch projects, manage workspaces, and track payments — all in one professional platform designed to save time and boost productivity.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>

        {/* Features */}
        <div className="hero-features">
          <span>Secure Payments</span>
          <span>AI-Powered Matching</span>
          <span>Real-Time Collaboration</span>
          <span>100% Free to Start</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
