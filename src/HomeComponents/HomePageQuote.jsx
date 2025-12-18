import React from 'react';
import './HomepageQuote.css';

export default function HomepageQuote() {
  return (
    <section className="quote-section">
      <div className="quote-container">
        <span className="quote-symbol">“</span>
        <p className="quote-text">
          Success is not just about what you accomplish in life, but what you inspire others to do.
        </p>
        <span className="quote-author">— Anonymous</span>
      </div>
    </section>
  );
}
