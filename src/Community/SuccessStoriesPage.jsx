// SuccessStoriesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessStoriesPage.css';

export default function SuccessStoriesPage() {
  const navigate = useNavigate();

  // 12 dummy stories
  const stories = Array.from({length:12}).map((_,i) => ({
    id: i+1,
    name: `Freelancer ${i+1}`,
    role: ['UI/UX Designer','Developer','Marketer','Content Writer'][i%4],
    img: `https://picsum.photos/seed/story${i+1}/600/400`,
    text: `This is a success story for freelancer ${i+1}. They scaled their freelancing business, won repeat clients, and delivered premium-quality work consistently using structured workflows.`
  }));

  return (
    <section className="success-wrapper">
      <div className="success-hero">
        <h1>Success Stories</h1>
        <p>Read inspiring stories from freelancers and clients who built long-term success using our platform.</p>
      </div>

      <div className="success-grid">
        {stories.map(s => (
          <div className="success-card" key={s.id}>
            <img src={s.img} alt={s.name} />
            <div className="success-body">
              <h3>{s.name}</h3>
              <p className="success-role">{s.role}</p>
              <p className="success-text">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{textAlign:'center', marginTop:20}}>
        <button className="success-cta" onClick={() => navigate('/community/join')}>Join the Community</button>
      </div>
    </section>
  );
}
