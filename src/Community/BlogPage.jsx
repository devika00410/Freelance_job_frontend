import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogPage.css';

export default function BlogPage(){
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy content - in production fetch by id
  const title = `Blog Post ${id} — Practical Tips & Guides`;
  const image = `https://picsum.photos/seed/blog${id}/1200/600`;
  const paragraphs = [
    `This is the introduction for blog post ${id}. It sets the stage and highlights key takeaways the reader will get from the article.`,
    `Detailed section: step-by-step guidance with practical examples, templates, and actionable tips that can be applied immediately.`,
    `Case study: a short story showing how a freelancer or client successfully applied these ideas and saw measurable improvement.`,
    `Conclusion: short recap of main points and a few recommended next steps for the reader to put into practice.`
  ];

  return (
    <section className="blogpage-wrapper">
      <div className="blogpage-hero">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <h1>{title}</h1>
        <img src={image} alt={title} />
      </div>

      <article className="blog-content">
        {paragraphs.map((p,i) => <p key={i}>{p}</p>)}
      </article>
    </section>
  );
}
