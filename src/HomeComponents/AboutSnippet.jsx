import React from "react";
import { FaArrowRight } from "react-icons/fa";
import "./AboutSnippet.css";
// import aboutImg from "../assets/about-preview.png"; 

const AboutSnippet = () => {
  return (
    <section className="about-snippet">
      <div className="snippet-content">
        <h2>Built for Modern Freelance Teams</h2>
        <p>
          Our platform simplifies the entire freelance workflow — from hiring to
          payments — making collaboration effortless for clients and
          freelancers.
        </p>

        <a href="/about" className="know-more-btn">
          Know More <FaArrowRight />
        </a>
      </div>

      <div className="snippet-image">
        <img src='https://media.istockphoto.com/id/1139425869/photo/men-working-at-home-freelancer-businessman-using-laptop.jpg?s=612x612&w=0&k=20&c=l-5d6I2YKbg0D_g6ufdW5vR0crAlDlEVEIvi6T1E7lE=' alt="About Preview" />
      </div>
    </section>
  );
};

export default AboutSnippet;

// import {
//   FaUsers,
//   FaTasks,
//   FaShieldAlt,
//   FaHandshake,
//   FaGlobe,
// } from "react-icons/fa";
// import "./About.css";
// import aboutBanner from "../assets/about-banner.png";
// import aboutWork from "../assets/about-work.png";

// export default function About() {
//   return (
//     <div className="about-page">
//       {/* HERO SECTION */}
//       <section className="about-hero">
//         <div className="hero-text">
//           <h1>Empowering the Future of Freelance Work</h1>
//           <p>
//             A modern freelancing ecosystem designed to make project
//             collaboration smoother, transparent, and more human.
//           </p>
//         </div>
//         <img src={aboutBanner} alt="About Banner" className="hero-image" />
//       </section>

//       {/* OUR MISSION */}
//       <section className="about-mission">
//         <div className="mission-text">
//           <h2>Our Mission</h2>
//           <p>
//             We aim to bridge the gap between talented freelancers and global
//             businesses by providing a secure, transparent, and smart project
//             management system.
//           </p>
//           <p>
//             Whether you're a client managing multiple projects or a freelancer
//             working with international clients — our platform ensures clarity,
//             speed, and trust.
//           </p>
//         </div>
//         <img src={aboutWork} alt="Working" className="mission-image" />
//       </section>

//       {/* WHY CHOOSE US */}
//       <section className="why-choose">
//         <h2>Why Choose Us</h2>
//         <div className="why-grid">
//           <div className="why-card">
//             <FaUsers className="icon" />
//             <h3>Smart Collaboration</h3>
//             <p>Tasks, chats, files, meetings — all in one modern workspace.</p>
//           </div>

//           <div className="why-card">
//             <FaTasks className="icon" />
//             <h3>Organized Project Flow</h3>
//             <p>Milestones, deadlines, and updates managed effortlessly.</p>
//           </div>

//           <div className="why-card">
//             <FaShieldAlt className="icon" />
//             <h3>Secure Payments</h3>
//             <p>Clients pay safely, freelancers withdraw easily.</p>
//           </div>

//           <div className="why-card">
//             <FaHandshake className="icon" />
//             <h3>Trusted Partnerships</h3>
//             <p>Verified users & transparent contracts build long‑term trust.</p>
//           </div>

//           <div className="why-card">
//             <FaGlobe className="icon" />
//             <h3>Global Access</h3>
//             <p>Work with talent and businesses across the world.</p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

