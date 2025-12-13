import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch, FaHeadset } from 'react-icons/fa';
import './FaqUpdated.css';

export default function FaqUpdated() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'What is this platform and how does it help freelancers and clients?',
      a: 'Our platform is a complete workflow management system built for freelancers and clients to collaborate efficiently. It combines project creation, proposals, workspaces, messaging, milestones, and payments into one seamless experience. Instead of using multiple separate tools, everything is unified in one dashboard. This ensures clarity, faster communication, and smoother project execution.'
    },
    {
      q: 'How do I start a project as a client?',
      a: 'Clients can begin by posting a project with details like title, description, budget, and deadline. Freelancers can then submit proposals for the project. Clients may review profiles, portfolios, and ratings before hiring. Once selected, both parties enter a shared workspace to begin the project.'
    },
    {
      q: 'How does the hiring process work for freelancers?',
      a: 'Freelancers can browse available jobs and submit proposals including pricing and timelines. Clients review these proposals and shortlist candidates based on skills and experience. Once hired, freelancers gain immediate access to the project workspace. From there, they can share files, communicate, and deliver work.'
    },
    {
      q: 'What is a workspace and how does it benefit my project?',
      a: 'A workspace is a private, secure collaboration space for each project. It contains tasks, milestones, file uploads, messaging, and video calls. All project details remain organized and easily accessible. This structure eliminates confusion and helps maintain professional communication.'
    },
    {
      q: 'Are payments safe and how does escrow work?',
      a: 'All payments are securely processed through PCI-compliant gateways like Stripe. When funds are added, they remain in escrow until the client approves the work. This ensures freelancers are protected from unpaid tasks. Clients also benefit by releasing payment only once they are satisfied.'
    },
    {
      q: 'What happens if there is a disagreement between client and freelancer?',
      a: 'The platform includes a dispute resolution system to handle conflicts. Both parties may submit workspace messages, files, and milestone activity as evidence. Our team reviews the information neutrally and provides a fair resolution. This ensures transparency and protection for both sides.'
    },
    {
      q: 'How do subscriptions work for freelancers and clients?',
      a: 'We offer flexible monthly and yearly subscription plans designed for different user needs. Freelancers can unlock unlimited proposals and advanced visibility. Clients gain access to project tracking, priority support, and workflow tools. Switching plans is simple and can be done anytime.'
    },
    {
      q: 'Can I cancel or change my subscription anytime?',
      a: 'Yes, users may cancel, upgrade, or downgrade plans with no hassle. Cancellations prevent future billing while keeping the current plan active until expiry. Upgrades apply instantly with prorated adjustments. This ensures users only pay for what they truly need.'
    },
    {
      q: 'What payment methods are supported for subscriptions and projects?',
      a: 'We accept credit/debit cards, UPI, and region-supported digital wallets for payments. All transactions are encrypted for user safety. Billing information is securely stored for faster future payments. These options make managing subscriptions and funding projects simple and secure.'
    },
    {
      q: 'How does the rating and review system work?',
      a: 'Clients and freelancers can leave ratings and reviews after each project. This helps maintain accountability on both sides. A strong review history builds trust and credibility for future opportunities. The system encourages high-quality work and professional communication.'
    },
    {
      q: 'Can freelancers work on multiple projects at the same time?',
      a: 'Yes, freelancers can manage several active workspaces simultaneously. The platform keeps tasks and communication organized in each workspace. Notifications prevent freelancers from missing important updates. This helps them scale their workload efficiently and professionally.'
    },
    {
      q: 'What features are included in the Enterprise Plan?',
      a: 'Enterprise users receive team management, bulk job creation, and centralized tracking tools. They also gain access to priority support and dedicated account managers. The plan includes analytics for monitoring spending and productivity. A custom onboarding process ensures the plan fits the company workflow.'
    },
    {
      q: 'How secure is my data and communication on this platform?',
      a: 'All user data is encrypted and stored using strict security protocols. Only authorized members of a project can view its workspace. Regular security updates protect against vulnerabilities. Your privacy and information safety remain top priorities.'
    },
    {
      q: 'What should I do if I need help or technical assistance?',
      a: 'Users can contact support via chat, email, or dedicated enterprise channels. Our team responds quickly to resolve questions or issues. Support is available 24/7 for uninterrupted workflow. Whether it is technical help or billing queries, assistance is always available.'
    }
  ];

  const filteredFAQs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="faq-wrapper">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <p className="faq-sub">Search or explore answers to the most common questions.</p>

      {/* Search Bar */}
      <div className="faq-search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FAQ List */}
      <div className="faq-container">
        {filteredFAQs.map((item, index) => (
          <div className="faq-item" key={index}>
            <div className="faq-header" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
              <h3>{item.q}</h3>
              {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {openIndex === index && <p className="faq-answer">{item.a}</p>}
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div className="faq-support-box">
        <FaHeadset className="support-icon" />
        <h2>Still Need Help?</h2>
        <p>Our support team is available 24/7 to assist you with any questions or issues.</p>
        <button className="faq-support-btn">Contact Support</button>
      </div>
    </section>
  );
}
