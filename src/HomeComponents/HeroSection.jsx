import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Animated Background Particles */}
      <div className="particles-bg">
        {[...Array(50)].map((_, i) => (
          <span key={i} style={{ '--i': i }}></span>
        ))}
      </div>

      {/* Glowing Orb Center */}
      <div className="glowing-orb">
        <div className="orb-inner"></div>
      </div>

      {/* Main Content */}
      <div className="hero-content">
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">
            <span className="logo-gradient">FREELANCE</span>HUB
          </div>
          <button className="cta-preview">Preview the Kit</button>
          <button className="cta-get">Get the Kit</button>
        </nav>

        {/* Hero Text */}
        <div className="hero-text">
          <h1 className="main-title">
            The Ultimate Freelance
            <br />
            <span className="title-highlight">Job Platform Kit</span>
          </h1>
          <p className="description">
            Launch your professional freelance marketplace in minutes — no coding required.
            Built with modern React, Framer Motion, and glassmorphic design.
          </p>

          <div className="cta-buttons">
            <button className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              </svg>
              Get for React
            </button>
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                <path d="M13.5 7h-3l1 8h2z"/>
              </svg>
              Get for Framer
            </button>
          </div>

          {/* Feature Pills */}
          <div className="features-grid">
            <div className="feature-pill">
              <span>100+ Components</span>
            </div>
            <div className="feature-pill">
              <span>Fully Responsive</span>
            </div>
            <div className="feature-pill">
              <span>AI-Powered Matching</span>
            </div>
            <div className="feature-pill">
              <span>Secure Payments</span>
            </div>
            <div className="feature-pill">
              <span>100% Free to Start</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;