import React, { useState, useRef, useEffect } from 'react';
import { FaRocket, FaUsers, FaGlobe, FaAward, FaChartLine, FaStar } from 'react-icons/fa';
import './Stats.css';

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 1,
      icon: <FaRocket />,
      number: 500,
      suffix: '+',
      label: 'Projects Completed',
      color: '#FF6B6B',
      description: 'Delivered with excellence'
    },
    {
      id: 2,
      icon: <FaUsers />,
      number: 250,
      suffix: '+',
      label: 'Happy Clients',
      color: '#4ECDC4',
      description: 'Worldwide satisfaction'
    },
    {
      id: 3,
      icon: <FaStar />,
      number: 4.9,
      suffix: '/5',
      label: 'Average Rating',
      color: '#FFD166',
      description: 'Based on client reviews'
    },
    {
      id: 4,
      icon: <FaGlobe />,
      number: 50,
      suffix: '+',
      label: 'Countries Served',
      color: '#6A67CE',
      description: 'Global reach'
    },
    {
      id: 5,
      icon: <FaAward />,
      number: 25,
      suffix: '+',
      label: 'Awards Won',
      color: '#FF9E64',
      description: 'Industry recognition'
    },
    {
      id: 6,
      icon: <FaChartLine />,
      number: 99,
      suffix: '%',
      label: 'Client Satisfaction',
      color: '#A78BFA',
      description: 'Success rate'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="metrics-section" ref={sectionRef}>
      <div className="metrics-background">
        <div className="floating-element elem-1"></div>
        <div className="floating-element elem-2"></div>
        <div className="floating-element elem-3"></div>
        <div className="floating-element elem-4"></div>
      </div>
      
      <div className="metrics-wrapper">
        <div className="metrics-heading">
          <h2 className="main-headline">Our Impact in Numbers</h2>
          <p className="headline-subtext">Driving success through measurable results that speak louder than words</p>
        </div>

        <div className="metrics-grid">
          {stats.map((stat, index) => (
            <div 
              key={stat.id} 
              className="metric-item"
              style={{ 
                '--animation-delay': index * 0.1 + 's', 
                '--accent-color': stat.color,
                '--accent-gradient': `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`
              }}
            >
              <div className="item-glow"></div>
              
              <div className="metric-icon-container">
                {stat.icon}
                <div className="icon-ripple"></div>
              </div>

              <div className="metric-content">
                <div className="metric-value">
                  <CountUp end={stat.number} suffix={stat.suffix} isVisible={isVisible} />
                </div>
                <h3 className="metric-title">{stat.label}</h3>
                <p className="metric-desc">{stat.description}</p>
              </div>

              <div className="metric-underline"></div>
            </div>
          ))}
        </div>

        <div className="metrics-banner">
          <div className="banner-content">
            <span className="banner-tag">Growing Fast</span>
            <p>Trusted by industry leaders worldwide to deliver exceptional results</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CountUp = ({ end, suffix, isVisible }) => {
  const [count, setCount] = useState(0);
  const duration = 2000;

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [end, isVisible]);

  return (
    <span>
      {count}{suffix}
    </span>
  );
};

export default Stats;