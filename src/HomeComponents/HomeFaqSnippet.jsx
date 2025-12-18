import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // assuming react-router-dom is used
import './HomeFaqSnippet.css'; // create a small CSS for styling

export default function HomeFaqSnippet() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'What is this platform and how does it help freelancers and clients?',
      a: 'Our platform is a complete workflow management system built for freelancers and clients to collaborate efficiently.'
    },
    {
      q: 'How do I start a project as a client?',
      a: 'Clients can begin by posting a project with details like title, description, budget, and deadline.'
    },
    {
      q: 'How does the hiring process work for freelancers?',
      a: 'Freelancers can browse available jobs and submit proposals including pricing and timelines.'
    },
  ];

  return (
    <section className="home-faq-wrapper">
      <h2>Frequently Asked Questions</h2>
      <div className="home-faq-list">
        {faqs.map((item, index) => (
          <div className="home-faq-item" key={index}>
            <div
              className="faq-header"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <h4>{item.q}</h4>
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {openIndex === index && <p className="faq-answer">{item.a}</p>}
          </div>
        ))}
      </div>

      <button
        className="view-all-faq-btn"
        onClick={() => navigate('/faq')} 
      >
        View All FAQs
      </button>
    </section>
  );
}
