import React from 'react';
import './TeamPage.css';
import { FaLinkedin, FaTwitter, FaUserTie, FaUserAlt } from 'react-icons/fa';

export default function TeamPage() {
  const team = [
    {
      name: 'Aarav Menon',
      role: 'Founder & CEO',
      img: 'https://via.placeholder.com/300x300.png?text=CEO',
      desc: 'Oversees platform vision, product growth, and high‑level decision‑making to ensure smooth user experience and scalability.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Ishika Rao',
      role: 'Chief Technology Officer',
      img: 'https://via.placeholder.com/300x300.png?text=CTO',
      desc: 'Leads engineering, architecture, and system performance, ensuring the platform remains secure and reliable at scale.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Rohan Verma',
      role: 'Lead UX & Product Designer',
      img: 'https://via.placeholder.com/300x300.png?text=Designer',
      desc: 'Designs user‑friendly interfaces and improves product usability to offer a seamless experience for clients and freelancers.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Maya Kapoor',
      role: 'Customer Success Head',
      img: 'https://via.placeholder.com/300x300.png?text=Support',
      desc: 'Builds customer relationships, manages support operations, and ensures users receive timely and effective guidance.',
      linkedin: '#',
      twitter: '#'
    }
  ];

  return (
    <section className="team-wrapper">
      {/* Hero Section */}
      <div className="team-hero">
        <h1>Meet Our Professional Team</h1>
        <p>Behind every successful project is a dedicated team focused on innovation, transparency, and world‑class support.</p>
      </div>

      {/* Mission & Vision */}
      <div className="team-mission">
        <h2>Our Mission & Vision</h2>
        <p>We aim to empower freelancers and clients worldwide with a seamless, secure, and efficient work‑management platform. Our mission is to simplify collaboration through powerful tools, transparent workflows, and uncompromising quality. We believe in building technology that enhances productivity and supports global talent. Every feature we create is designed to make your work-life smoother and more organized.</p>
      </div>

      {/* Team Grid */}
      <div className="team-grid">
        {team.map((member, index) => (
          <div className="team-card" key={index}>
            <img src={member.img} alt={member.name} className="team-img" />
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <p className="team-desc">{member.desc}</p>

            <div className="team-socials">
              <a href={member.linkedin}><FaLinkedin /></a>
              <a href={member.twitter}><FaTwitter /></a>
            </div>
          </div>
        ))}
      </div>

      {/* Company Values */}
      <div className="team-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-box">
            <FaUserTie className="value-icon" />
            <h4>Professionalism</h4>
            <p>We maintain world‑class standards in communication, workflow, transparency, and platform performance.</p>
          </div>
          <div className="value-box">
            <FaUserAlt className="value-icon" />
            <h4>User‑First Approach</h4>
            <p>Your comfort, security, and productivity guide every product decision we make.</p>
          </div>
          <div className="value-box">
            <FaUserTie className="value-icon" />
            <h4>Innovation</h4>
            <p>We continuously improve our features to make freelancing and project management more efficient.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
