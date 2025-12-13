// JoinCommunityForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinCommunityForm.css';

export default function JoinCommunityForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally: call API to add lead. For now simulate success:
    alert(`Thanks ${name || 'Friend'}! You will receive community updates at ${email || 'your email'}.`);
    navigate('/community'); 
  };

  return (
    <section className="join-wrapper">
      <div className="join-card">
        <h1>Join Our Community</h1>
        <p>Sign up to receive curated guides, product updates, success stories, and invites to events.</p>

        <form onSubmit={handleSubmit} className="join-form">
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required />

          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" required />

          <button type="submit" className="join-btn">Join Now</button>
        </form>
      </div>
    </section>
  );
}
