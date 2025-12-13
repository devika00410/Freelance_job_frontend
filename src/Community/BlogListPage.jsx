import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogList.css';

export default function BlogListPage() {
  const navigate = useNavigate();

  const blogs = Array.from({length:12}).map((_,i) => ({
    id: i+1,
    title: `Blog Post ${i+1} — Practical Tips & Guides`,
    img: `https://picsum.photos/seed/blog${i+1}/800/500`,
    excerpt: `This article gives practical, actionable insights about freelancing, client management and building a reliable workflow.`
  }));

  return (
    <section className="bloglist-wrapper">
      <div className="bloglist-hero">
        <h1>Community Articles</h1>
        <p>Deep-dive how-tos, guides, and product updates to help you succeed professionally.</p>
      </div>

      <div className="bloglist-grid">
        {blogs.map(b => (
          <div className="blog-card" key={b.id}>
            <img src={b.img} alt={b.title} />
            <div className="blog-body">
              <h3>{b.title}</h3>
              <p>{b.excerpt}</p>
              <div style={{marginTop:8}}>
                <button className="read-more" onClick={() => navigate(`/community/blogs/${b.id}`)}>Read More</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
