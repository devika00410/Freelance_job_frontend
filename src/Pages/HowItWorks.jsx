import React, { useState, useEffect } from "react";
import {
  FaFileAlt,
  FaUsers,
  FaCheckCircle,
  FaCreditCard,
  FaUserTie,
  FaSearch,
  FaPaperPlane,
  FaMoneyBillWave,
  FaRocket,
  FaTasks,
  FaVideo,
  FaComments,
  FaClipboardList,
} from "react-icons/fa";
import "./HowItWorks.css";

export default function HowItWorks() {
  const [activeView, setActiveView] = useState("client");

  // Detailed Steps for CLIENTS
  const clientSteps = [
    {
      title: "Create Your Account",
      description:
        "Sign up as a client and instantly access a clean, powerful dashboard tailored for project management.",
      icon: <FaUserTie className="step-icon" />,
    },
    {
      title: "Post Your Project",
      description:
        "Describe your requirements, upload references, and set deadlines + budget. Freelancers will find you.",
      icon: <FaFileAlt className="step-icon" />,
    },
    {
      title: "Review Proposals",
      description:
        "Check freelancer portfolios, ratings, timelines, and proposal quality before hiring.",
      icon: <FaUsers className="step-icon" />,
    },
    {
      title: "Hire & Start Workspace",
      description:
        "Once you hire, a shared workspace automatically opens with tasks, chat, video call, files, and milestones.",
      icon: <FaClipboardList className="step-icon" />,
    },
    {
      title: "Track Work in Real-Time",
      description:
        "Manage tasks, monitor progress, chat, schedule calls, and approve milestones — everything in one place.",
      icon: <FaTasks className="step-icon" />,
    },
    {
      title: "Video Calls & Messaging",
      description:
        "Collaborate better with built‑in video calls and clean messaging right inside the workspace.",
      icon: <FaVideo className="step-icon" />,
    },
    {
      title: "Secure Approval & Payment",
      description:
        "Review submitted work, request revisions, and release payments securely when satisfied.",
      icon: <FaCreditCard className="step-icon" />,
    },
  ];

  // Detailed Steps for FREELANCERS
  const freelancerSteps = [
    {
      title: "Set Up Your Profile",
      description:
        "Highlight your skills, portfolio, experience, and pricing to attract clients.",
      icon: <FaUserTie className="step-icon" />,
    },
    {
      title: "Find the Right Projects",
      description:
        "Browse filtered job listings based on your niche, skills, and earning goals.",
      icon: <FaSearch className="step-icon" />,
    },
    {
      title: "Send Tailored Proposals",
      description:
        "Pitch smartly with your experience, timeline, and past samples.",
      icon: <FaPaperPlane className="step-icon" />,
    },
    {
      title: "Start Your Workspace",
      description:
        "Once hired, get access to a shared workspace with task lists, chat, video calls, files, and milestones.",
      icon: <FaClipboardList className="step-icon" />,
    },
    {
      title: "Deliver High‑Quality Work",
      description:
        "Submit work through structured milestones, share files, and communicate clearly.",
      icon: <FaComments className="step-icon" />,
    },
    {
      title: "Get Paid Securely",
      description:
        "Receive fast payments after client approval through a safe payout system.",
      icon: <FaMoneyBillWave className="step-icon" />,
    },
  ];

  const handleViewChange = (view) => setActiveView(view);

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.3 }
    );

    const section = document.querySelector(".how-it-works");
    if (section) observer.observe(section);

    return () => section && observer.unobserve(section);
  }, []);

  return (
    <section className="how-it-works">
      <div className="how-works-container">
        <h2 className="how-works-title">How Our Platform Works</h2>

        {/* TOGGLE BUTTONS */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === "client" ? "active" : ""}`}
            onClick={() => handleViewChange("client")}
          >
            For Clients
          </button>

          <button
            className={`toggle-btn ${activeView === "freelancer" ? "active" : ""}`}
            onClick={() => handleViewChange("freelancer")}
          >
            For Freelancers
          </button>
        </div>

        {/* STEPS */}
        <div className="steps-container">
          {(activeView === "client" ? clientSteps : freelancerSteps).map(
            (step, index) => (
              <div key={index} className="how-works-step-card">
                <div className="steps-icon-wrapper">{step.icon}</div>
                <h3 className="steps-title">{step.title}</h3>
                <p className="steps-description">{step.description}</p>
              </div>
            )
          )}
        </div>

        {/* PROMO BANNER */}
        <div className="promo-banner">
          <div className="promo-icon">
            <FaRocket />
          </div>
          <h3>Boost Your Productivity</h3>
          <p>
            Manage your entire freelance workflow — projects, payments, tasks,
            communication — all in one place.
          </p>
          <button className="how-works-cta-button">Get Started</button>
        </div>
      </div>
    </section>
  );
}
