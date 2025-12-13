import React from "react";
import {
  FaUsers,
  FaTasks,
  FaShieldAlt,
  FaHandshake,
  FaGlobe,
  FaCheckCircle,
} from "react-icons/fa";
import './AboutPage.css'

export default function About() {
  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-title">Empowering Freelancers & Clients to Work Smarter</h1>
          <p className="about-subtext">
            Our platform transforms the freelance experience with structured project
            management, transparent workflows, and secure collaboration — built for the
            modern digital workforce.
          </p>
        </div>
        <div className="about-hero-image"></div>
      </section>

      {/* WHO WE ARE */}
      <section className="who-we-are">
        <div className="who-image"></div>
        <div className="who-content">
          <h2>Who We Are</h2>
          <p>
            We are a next-generation freelance job management platform built to simplify
            how clients and freelancers collaborate. Whether you're working on a small
            project or managing an entire team — everything you need is organized in a
            single workspace.
          </p>
          <p>
            By integrating tasks, milestones, messaging, payments, and real-time
            updates, we reduce chaos and increase productivity for everyone.
          </p>
        </div>
      </section>

      {/* OUR MISSION */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            To make freelancing structured, secure, and stress‑free by providing tools
            that support meaningful work partnerships.
          </p>
          <ul className="mission-list">
            <li><FaCheckCircle /> Transparent project tracking</li>
            <li><FaCheckCircle /> Secure payments & verified profiles</li>
            <li><FaCheckCircle /> Smooth communication & quick updates</li>
            <li><FaCheckCircle /> A global community of trusted talent</li>
          </ul>
        </div>
        <div className="mission-image"></div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-choose-us">
        <h2 className="why-title">Why Choose Us</h2>

        <div className="why-grid">
          <div className="why-card">
            <FaUsers className="why-icon" />
            <h3>Smart Collaboration</h3>
            <p>Chat, files, tasks, and calls — all in one shared workspace.</p>
          </div>

          <div className="why-card">
            <FaTasks className="why-icon" />
            <h3>Organized Workflow</h3>
            <p>Structured milestones and timelines keep projects on track.</p>
          </div>

          <div className="why-card">
            <FaShieldAlt className="why-icon" />
            <h3>Secure Environment</h3>
            <p>Verified users, protected data, and safe payment release.</p>
          </div>

          <div className="why-card">
            <FaHandshake className="why-icon" />
            <h3>Built on Trust</h3>
            <p>Clear contracts and transparent workflows reduce disputes.</p>
          </div>

          <div className="why-card">
            <FaGlobe className="why-icon" />
            <h3>Global Opportunities</h3>
            <p>Connect with talent and clients from anywhere in the world.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
