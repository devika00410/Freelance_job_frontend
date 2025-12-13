// ServiceHero.jsx
import React, { useEffect, useState } from "react";
import "./ServiceHero.css";

export default function ServiceHero() {
  const cycle = ["websites", "designs", "marketing", "apps"];
  const [i, setI] = useState(0);
  const [t, setT] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timer;
    const word = cycle[i];
    if (typing) {
      if (t.length < word.length) timer = setTimeout(() => setT(word.slice(0, t.length + 1)), 70);
      else timer = setTimeout(() => setTyping(false), 1100);
    } else {
      if (t.length > 0) timer = setTimeout(() => setT(word.slice(0, t.length - 1)), 40);
      else { setI((p) => (p + 1) % cycle.length); setTyping(true); }
    }
    return () => clearTimeout(timer);
  }, [t, typing, i]);

  return (
    <header className="hero">
      <div className="hero-inner sp-container">
        <div className="hero-left">
          <div className="hero-badge">Trusted by <strong>5,000+</strong> teams</div>
          <h1 className="hero-title">
            Manage projects with <span className="accent">clarity</span>
          </h1>
          <p className="hero-lead">Find top freelancers for <span className="type-rot">{t}<span className="cursor">|</span></span></p>

          <form className="hero-search" onSubmit={(e)=>e.preventDefault()}>
            <input aria-label="search" placeholder="Search services — e.g. UI/UX, React" />
            <button className="btn primary">Search</button>
          </form>

          <ul className="hero-stats">
            <li><strong>500+</strong><span>Freelancers</span></li>
            <li><strong>100+</strong><span>Countries</span></li>
            <li><strong>98%</strong><span>Success</span></li>
            <li><strong>4.9</strong><span>Avg Rating</span></li>
          </ul>
        </div>

        <div className="hero-right">
          <div className="collage">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=60" alt="freelancer 1"/>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=60" alt="freelancer 2"/>
            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60" alt="freelancer 3"/>
            <div className="collage-count">+250 freelancers</div>
          </div>

          <div className="hero-card">
            <h4>Featured: UI/UX Design</h4>
            <p>Top designers ready to ship beautiful product screens.</p>
            <button className="btn ghost">Browse Designers</button>
          </div>
        </div>
      </div>
    </header>
  );
}
