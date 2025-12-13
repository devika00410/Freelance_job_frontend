import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CommunityPage.css';
import { FaUsers, FaBookOpen, FaBullhorn, FaStar, FaComments, FaLightbulb } from 'react-icons/fa';

export default function CommunityPage() {
  const navigate = useNavigate();

  const blogPosts = [
    { id: 1, title: 'Top Freelancer Strategies to Win High-Value Projects', img: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg', desc: 'Learn powerful tips that help freelancers stand out, write strong proposals, and grow consistently in the digital marketplace.' },
    { id: 2, title: 'A Complete Client Guide for Managing Freelancers', img: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg', desc: 'Improve hiring decisions, keep communication clear, and ensure timely delivery with proven client-side workflow techniques.' },
    { id: 3, title: 'Latest Platform Updates: Smarter Tools to Boost Productivity', img: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg', desc: 'Explore new features designed to make your workspace faster, more organized, and collaboration-friendly.' }
  ];

  const successStories = [
    { id: 1, name: 'Ananya Sharma', role: 'UI/UX Designer', img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', story: 'Ananya transformed her freelance career by landing consistent global projects and doubling her earnings through our workflow tools.' },
    { id: 2, name: 'Rahul Iyer', role: 'Digital Marketer', img: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', story: 'Rahul built long-term client relationships through milestone-based delivery and earned a 5-star rating across 22 projects.' }
  ];

  return (
    <section className="community-wrapper">
      <div className="community-hero">
        <h1>Welcome to Our Professional Community</h1>
        <p>Your hub for learning, growth, announcements, success stories, and helpful freelancing resources — all in one place.</p>
      </div>

      <div className="community-section">
        <h2 className="section-title"><FaBookOpen /> Latest Articles & Guides</h2>
        <div className="community-grid">
          {blogPosts.map(p => (
            <div className="community-card" key={p.id}>
              <img src={p.img} alt={p.title} />
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div style={{display:'flex', gap:12, padding:'0 15px 15px'}}>
                <button className="read-more-btn" onClick={() => navigate(`/community/blogs/${p.id}`)}>Read More</button>
                <Link to="/community/blogs" className="read-more-btn" style={{background:'#fff', color:'var(--navy)', border:'1px solid rgba(0,0,0,0.06)'}}>All Blogs</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="community-section tips-section">
        <h2 className="section-title"><FaLightbulb /> Freelancer & Client Tips</h2>
        <ul className="tips-list">
          <li>Write proposals that focus on clarity, value, and strong portfolio examples.</li>
          <li>Clients should always set clear deadlines and expectations in the project brief.</li>
          <li>Freelancers should use milestone updates to maintain transparency and trust.</li>
          <li>Always communicate professionally and keep conversations organized in the workspace.</li>
        </ul>
      </div>

      <div className="community-section">
        <h2 className="section-title"><FaStar /> Success Stories</h2>
        <div className="story-grid">
          {successStories.map(s => (
            <div className="story-card" key={s.id}>
              <img src={s.img} alt={s.name} />
              <h3>{s.name}</h3>
              <p className="story-role">{s.role}</p>
              <p className="story-text">{s.story}</p>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center', marginTop:18}}>
          <button className="read-more-btn" onClick={() => navigate('/community/success-stories')}>View All Success Stories</button>
        </div>
      </div>

      <div className="community-section announcement-box">
        <h2 className="section-title"><FaBullhorn /> Announcements</h2>
        <p>Stay updated with new tools, improvements, platform upgrades, and upcoming releases designed to enhance your user experience.</p>
      </div>

      <div className="community-section discussion">
        <h2 className="section-title"><FaComments /> Community Discussions</h2>
        <p>Join interactive discussions, share your freelance journey, ask questions, and help others improve their workflow. Coming soon!</p>
      </div>

      <div className="community-cta">
        <h2>Become a Part of Our Growing Community</h2>
        <p>Connect with thousands of freelancers and clients who learn, build, and succeed together.</p>
        <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:12}}>
          <button onClick={() => navigate('/community/join')}>Join the Community</button>
          <Link to="/community/blogs" className="read-more-btn" style={{background:'#fff', color:'var(--navy)'}}>Explore Blogs</Link>
        </div>
      </div>
    </section>
  );
}
