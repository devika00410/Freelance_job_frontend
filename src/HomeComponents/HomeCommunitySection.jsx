import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBookOpen, FaStar } from "react-icons/fa";
import "./HomeCommunitySection.css";

export default function HomeCommunitySection() {
  const navigate = useNavigate();

  return (
    <section className="home-community">
      <div className="home-community-inner">

        <div className="community-header">
          <h2>Our Professional Community</h2>
          <p>
            Learn, connect, and grow with freelancers and clients through
            expert articles, success stories, and platform updates.
          </p>
        </div>

        <div className="community-cards">

          <div className="community-mini-card">
            <FaBookOpen />
            <h3>Articles & Guides</h3>
            <p>Practical insights to improve productivity and freelancing success.</p>
          </div>

          <div className="community-mini-card">
            <FaStar />
            <h3>Success Stories</h3>
            <p>Real journeys from professionals building long-term careers.</p>
          </div>

          <div className="community-mini-card">
            <FaUsers />
            <h3>Discussions</h3>
            <p>Engage with the community, share experiences, and ask questions.</p>
          </div>

        </div>

        <div className="community-cta">
          <button onClick={() => navigate("/community")}>
            View More
          </button>
        </div>

      </div>
    </section>
  );
}
