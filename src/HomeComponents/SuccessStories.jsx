import React, { useState, useEffect, useRef } from 'react';
import './SuccessStories.css';

const SuccessStories = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const caseStudies = [
    {
      title: "From Side Hustle to Full-Time Business",
      freelancer: {
        name: "Maria Rodriguez",
        role: "Web Developer",
        joinDate: "Joined 2023",
        avatar: "👩‍💻"
      },
      before: {
        revenue: "$2.5k",
        clients: "3",
        successRate: "65%"
      },
      after: {
        revenue: "$12.8k",
        clients: "14",
        successRate: "94%"
      },
      description: "The platform's AI matching helped me find quality clients that fit my skills perfectly. My income grew 5x in just 6 months!",
      earnings: [
        { month: "Jan", amount: "$2,500" },
        { month: "Feb", amount: "$4,200" },
        { month: "Mar", amount: "$6,100" },
        { month: "Apr", amount: "$8,300" },
        { month: "May", amount: "$10,500" },
        { month: "Jun", amount: "$12,800" }
      ]
    }
  ];

  const videoTestimonials = [
    {
      title: "Enterprise Client Success",
      description: "Tech startup scales development team",
      metrics: ["🚀 3x faster delivery", "💰 40% cost savings"]
    },
    {
      title: "Freelancer Journey",
      description: "From $0 to $100k in 12 months",
      metrics: ["⭐ 4.9/5 rating", "🔄 92% repeat clients"]
    }
  ];

  const stats = [
    { value: 95, label: "Client Satisfaction Rate" },
    { value: 3.2, label: "Avg. Income Multiplier" },
    { value: 89, label: "Project Success Rate" },
    { value: 42, label: "Days to First Payment" }
  ];

  const [animatedStats, setAnimatedStats] = useState(stats.map(stat => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateStats();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sliderRef.current) {
      observer.observe(sliderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    stats.forEach((stat, index) => {
      const duration = 2000;
      const step = stat.value / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }

        setAnimatedStats(prev => {
          const newStats = [...prev];
          newStats[index] = stat.value === 3.2 ? Number(current.toFixed(1)) : Math.floor(current);
          return newStats;
        });
      }, 16);
    });
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const playVideo = (title) => {
    alert(`Playing: ${title}`);
  };

  return (
    <section className="success-stories-section" ref={sliderRef}>
      <div className="container">
        <div className="section-header">
          <h2>Success Stories in Motion</h2>
          <p>Real results from our community of freelancers and clients</p>
        </div>

        {/* Case Studies Slider */}
        <div className="case-studies-slider">
          <div className="slider-container">
            <div className="slider-track">
              {caseStudies.map((study, index) => (
                <div key={index} className="case-study active">
                  <div className="case-content">
                    <div 
                      className="case-before-after"
                      style={{ '--slider-position': `${sliderPosition}%` }}
                    >
                      <div className="before-section">
                        <h4>Before</h4>
                        <div className="before-metrics">
                          <div className="metric">
                            <span className="metric-value">{study.before.revenue}</span>
                            <span className="metric-label">Monthly Revenue</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{study.before.clients}</span>
                            <span className="metric-label">Active Clients</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{study.before.successRate}</span>
                            <span className="metric-label">Success Rate</span>
                          </div>
                        </div>
                      </div>

                      <div className="slider-control">
                        <div 
                          className="slider-handle"
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleMouseDown}
                          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                          <span>⬅️ ➡️</span>
                        </div>
                      </div>

                      <div className="after-section">
                        <h4>After 6 Months</h4>
                        <div className="after-metrics">
                          <div className="metric">
                            <span className="metric-value">{study.after.revenue}</span>
                            <span className="metric-label">Monthly Revenue</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{study.after.clients}</span>
                            <span className="metric-label">Active Clients</span>
                          </div>
                          <div className="metric">
                            <span className="metric-value">{study.after.successRate}</span>
                            <span className="metric-label">Success Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="case-details">
                      <h3>{study.title}</h3>
                      <div className="freelancer-info">
                        <div className="avatar">{study.freelancer.avatar}</div>
                        <div className="info">
                          <strong>{study.freelancer.name}</strong>
                          <span>{study.freelancer.role} • {study.freelancer.joinDate}</span>
                        </div>
                      </div>
                      <p>{study.description}</p>
                      
                      <div className="earnings-chart">
                        <h4>Earnings Growth</h4>
                        <div className="chart-bars">
                          {study.earnings.map((earning, idx) => (
                            <div 
                              key={idx}
                              className="chart-bar"
                              style={{ 
                                height: `${(idx + 1) * (100 / study.earnings.length)}%` 
                              }}
                              data-month={earning.month}
                              data-amount={earning.amount}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="slider-nav">
              <button className="slider-prev" onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}>
                ‹
              </button>
              <button className="slider-next" onClick={() => setCurrentSlide(prev => prev + 1)}>
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Video Testimonials */}
        <div className="video-testimonials">
          <h3>Hear From Our Community</h3>
          <div className="video-grid">
            {videoTestimonials.map((video, index) => (
              <div key={index} className="video-card">
                <div 
                  className="video-placeholder"
                  onClick={() => playVideo(video.title)}
                >
                  <div className="play-button">▶</div>
                  <div className="video-thumbnail"></div>
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  <div className="testimonial-metrics">
                    {video.metrics.map((metric, idx) => (
                      <span key={idx}>{metric}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Showcase */}
        <div className="stats-showcase">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{animatedStats[index]}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;