import React, { useState, useRef, useEffect } from "react";
import {
  FaLaptopCode,
  FaPalette,
  FaVideo,
  FaSearch,
  FaPenAlt,
  FaChartLine,
  FaMobile,
  FaHashtag,
  FaUserTie,
  FaArrowRight,
  FaArrowLeft,
  FaClock,
  FaChevronDown,
  FaCheck,
  FaBolt,
  FaCheckCircle
} from "react-icons/fa";
import "./ProjectMatchMaker.css";

const ProjectMatchMaker = () => {
  const heroImg =
    "https://img.pikbest.com/photo/20240918/cute-freelance-girl-using-laptop-sitting-on-floor-and-smiling_10858688.jpg!sw800";

  // Freelancer images (spread style)
  const freelancers = [
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/52.jpg",
    "https://randomuser.me/api/portraits/women/68.jpg",
    "https://randomuser.me/api/portraits/men/14.jpg",
    "https://randomuser.me/api/portraits/men/28.jpg",
    "https://randomuser.me/api/portraits/women/19.jpg",
    "https://randomuser.me/api/portraits/men/55.jpg",
    "https://randomuser.me/api/portraits/women/37.jpg",
  ];

  const steps = [
    {
      id: 1,
      question: "What service do you need?",
      options: [
        { value: "web-dev", label: "Web Development", icon: <FaLaptopCode /> },
        { value: "graphic-design", label: "Graphic Design", icon: <FaPalette /> },
        { value: "video-editing", label: "Video Editing", icon: <FaVideo /> },
        { value: "seo", label: "SEO Optimization", icon: <FaSearch /> },
        { value: "content-writing", label: "Content Writing", icon: <FaPenAlt /> },
        { value: "digital-marketing", label: "Digital Marketing", icon: <FaChartLine /> },
        { value: "ui-ux", label: "UI/UX Design", icon: <FaMobile /> },
        { value: "social-media", label: "Social Media Mgmt", icon: <FaHashtag /> },
        { value: "virtual-assistant", label: "Virtual Assistant", icon: <FaUserTie /> }
      ]
    },
    {
      id: 2,
      question: "What's your timeline?",
      options: [
        { value: "urgent", label: "Urgent (1–3 days)", icon: <FaBolt /> },
        { value: "standard", label: "Standard (1–2 weeks)", icon: <FaClock /> },
        { value: "flexible", label: "Flexible (1+ month)", icon: <FaCheckCircle /> }
      ]
    },
    {
      id: 3,
      question: "What’s your budget?",
      options: [
        { value: "budget", label: "$500 – $2,000", icon: <FaCheckCircle /> },
        { value: "medium", label: "$2,000 – $5,000", icon: <FaCheckCircle /> },
        { value: "enterprise", label: "$5,000+", icon: <FaCheckCircle /> }
      ]
    },
    {
      id: 4,
      question: "Experience level?",
      options: [
        { value: "entry", label: "Entry (1–2 yrs)", icon: <FaUserTie /> },
        { value: "mid", label: "Mid (3–5 yrs)", icon: <FaUserTie /> },
        { value: "expert", label: "Expert (5+ yrs)", icon: <FaUserTie /> }
      ]
    }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [openDrop, setOpenDrop] = useState(null);
  const [dropPos, setDropPos] = useState(null);
  const triggerRefs = useRef({});
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Dropdown logic (absolute inside frame)
  const openDropdown = (id) => {
    const trigger = triggerRefs.current[id];
    const frame = document.querySelector(".pm-frame");

    const tRect = trigger.getBoundingClientRect();
    const fRect = frame.getBoundingClientRect();

    setDropPos({
      top: tRect.bottom - fRect.top + 6,
      left: tRect.left - fRect.left,
      width: tRect.width
    });

    setOpenDrop(id);
  };

  const toggleDrop = (id) => {
    if (openDrop === id) return setOpenDrop(null);
    openDropdown(id);
  };

  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !Object.values(triggerRefs.current).some((el) => el.contains(e.target))
      ) {
        setOpenDrop(null);
      }
    };

    window.addEventListener("click", closeOnClickOutside);
    return () => window.removeEventListener("click", closeOnClickOutside);
  }, []);

  // Next action
  const next = async () => {
    if (!answers[`s${currentStep}`]) return;

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1000));

      setResults([
        { initials: "RA", name: "Riya A.", role: "Frontend Developer", rating: 4.9, success: 92, rate: 45 },
        { initials: "MK", name: "Manav K.", role: "UI Designer", rating: 4.7, success: 89, rate: 38 },
        { initials: "SS", name: "Sana S.", role: "SEO Expert", rating: 4.8, success: 90, rate: 30 }
      ]);

      setShowResults(true);
      setLoading(false);

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 300);
    }
  };

  const back = () => setCurrentStep((s) => Math.max(1, s - 1));

  const selectedLabel = (id) => {
    const step = steps.find((s) => s.id === id);
    const val = answers[`s${id}`];
    const option = step.options.find((o) => o.value === val);
    return option ? option.label : "";
  };

  const progress = (currentStep / 4) * 100;

  return (
    <section className="pm-root">

      {/* SPREAD BACKGROUND FREELANCERS */}
      <div className="pm-spread-bg">
        {freelancers.map((src, i) => (
          <img key={i} src={src} className={`pm-spread-img i${i}`} />
        ))}
      </div>

      {/* Float circles */}
      <div className="pm-float-circle circle-1"></div>
      <div className="pm-float-circle circle-2"></div>
      <div className="pm-float-circle circle-3"></div>

      {/* HERO FRAME */}
      <div className="pm-frame">
        <div className="pm-hero">

          {/* LEFT SIDE */}
          <div className="pm-left">
            <h1 className="pm-title">Find Your Perfect Freelancer Match</h1>
            <p className="pm-sub">
              Get personalized project matches in less than 60 seconds — powered by smart recommendations.
            </p>

            <div className="pm-progress">
              <div className="pm-progress-track">
                <div className="pm-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p className="pm-step-text">Step {currentStep}/4</p>
            </div>

            <div className="pm-q-card">
              <h3 className="pm-q">{steps[currentStep - 1].question}</h3>

              {/* SELECT TRIGGER */}
              <button
                className="pm-select"
                ref={(el) => (triggerRefs.current[currentStep] = el)}
                onClick={() => toggleDrop(currentStep)}
              >
                {selectedLabel(currentStep) || <span className="pm-placeholder">Select an option</span>}
                <FaChevronDown className={openDrop === currentStep ? "rot" : ""} />
              </button>

              {/* DROPDOWN FIXED INSIDE FRAME */}
              {openDrop === currentStep && dropPos && (
                <div
                  className="pm-dropdown"
                  ref={dropdownRef}
                  style={{
                    top: dropPos.top,
                    left: dropPos.left,
                    width: dropPos.width
                  }}
                >
                  {steps[currentStep - 1].options.map((opt) => (
                    <div
                      key={opt.value}
                      className={
                        answers[`s${currentStep}`] === opt.value
                          ? "pm-opt selected"
                          : "pm-opt"
                      }
                      onClick={() =>
                        setAnswers((p) => ({ ...p, [`s${currentStep}`]: opt.value }))
                      }
                    >
                      <span className="pm-icon">{opt.icon}</span>
                      {opt.label}
                      {answers[`s${currentStep}`] === opt.value && (
                        <FaCheck className="pm-check" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pm-actions">
                <button onClick={back} disabled={currentStep === 1} className="btn-outline">
                  <FaArrowLeft /> Back
                </button>

                <button onClick={next} className="btn-solid">
                  {currentStep === 4 ? "Find Matches" : "Next"} <FaArrowRight />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="pm-right">
            <div className="pm-img-frame">
              <img src={heroImg} className="pm-img" />
            </div>
          </div>

        </div>
      </div>

      {/* RESULTS */}
      {loading && <div className="pm-loading">Matching freelancers…</div>}

      {showResults && !loading && (
        <div className="pm-results">
          <h2 className="pm-res-title">Top Freelancer Matches</h2>
          <div className="pm-res-grid">
            {results.map((r, i) => (
              <div key={i} className="pm-res-card">
                <div className="pm-res-user">
                  <div className="pm-avatar">{r.initials}</div>
                  <div>
                    <h4 className="pm-name">{r.name}</h4>
                    <p className="pm-role">{r.role}</p>
                  </div>
                </div>

                <div className="pm-res-meta">
                  <p>{r.rating}★</p>
                  <p>{r.success}% Success</p>
                  <p>${r.rate}/hr</p>
                  <button className="small-btn">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
};

export default ProjectMatchMaker;
