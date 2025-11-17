import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      {/* Background Image Overlay */}
      <div className="background-overlay"></div>
      
      <div className="hero-container">
        {/* Main Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Where 
            <span className="accent-texts"> Visionary Projects </span>
            Meet
            <span className="accent-texts"> Exceptional Talent</span>
          </h1>
          
          <p className="hero-subtitle">
            The premier platform connecting forward-thinking businesses with top-tier freelance professionals. 
            Transform your ideas into reality with our curated network of experts.
          </p>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search services, skills, or projects..." 
                className="search-input"
              />
              <button className="search-btn">
                Explore Opportunities
              </button>
            </div>
          </div>

          {/* Quick Access Categories */}
          <div className="categories">
            <span className="category-tag">Web Development</span>
            <span className="category-tag">UI/UX Design</span>
            <span className="category-tag">Digital Marketing</span>
            <span className="category-tag">Content Writing</span>
            <span className="category-tag">Data Analytics</span>
          </div>

          {/* Primary Action Section */}
          <div className="action-section">
            <div className="action-card">
              <div className="action-content">
                <h3>Hire Professional Talent</h3>
                <p>Access pre-vetted experts for your projects</p>
                <button className="action-btn primary">
                  Post a Project
                </button>
              </div>
            </div>

            <div className="action-card">
              <div className="action-content">
                <h3>Start Freelancing</h3>
                <p>Join our community of top professionals</p>
                <button className="action-btn secondary">
                  Find Work
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar - Clean and Minimal */}
        <div className="trust-bar">
          <p className="trust-label">Trusted by innovative teams worldwide</p>
          <div className="company-grid">
            <span className="company-item">Microsoft</span>
            <span className="company-item">Google</span>
            <span className="company-item">Netflix</span>
            <span className="company-item">Spotify</span>
            <span className="company-item">Airbnb</span>
            <span className="company-item">Shopify</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;