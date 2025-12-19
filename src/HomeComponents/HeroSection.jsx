import React, { useState } from 'react';
import './HeroSection.css';
import { FiSearch, FiArrowRight, FiCheckSquare } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { IoMdColorPalette } from 'react-icons/io';
import { MdOutlinePayments } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import girl from '../assets/photos/girlss.png'
import SearchBar from '../Components/Common/SearchBar';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const serviceMappings = {
    'full stack development': 'fsd-001',
    'mobile app development': 'mad-002',
    'ui/ux design': 'uxd-003',
    'seo services': 'seo-004',
    'digital marketing': 'dma-005',
    'video editing': 'ved-006',
    'graphic design': 'grd-007',
    'content writing': 'cwr-008',
    'wordpress development': 'wpd-009',
    'data analytics': 'dat-010',
    'web development': 'fsd-001',
    'app development': 'mad-002',
    'design': 'uxd-003',
    'marketing': 'dma-005',
    'video': 'ved-006',
    'graphic': 'grd-007',
    'writing': 'cwr-008',
    'wordpress': 'wpd-009',
    'analytics': 'dat-010'
  };

  // Predefined services for quick access
  const quickServices = [
    { name: 'Web Design', id: 'fsd-001' },
    { name: 'UI/UX Design', id: 'uxd-003' },
    { name: 'Logo Design', id: 'grd-007' },
    // { name: 'Business Cards', id: 'grd-007' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchTerm = searchQuery.toLowerCase().trim();

    // Check if search term matches any service
    for (const [key, serviceId] of Object.entries(serviceMappings)) {
      if (searchTerm.includes(key)) {
        navigate(`/service/${serviceId}`);
        return;
      }
    }

    // If no direct match, navigate to search page with the query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleQuickServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <section className="hero-outer-wrapper">
      <div className="hero-main-card">

        {/* Navigation Bar */}
        <nav className="hero-nav">
          <div className="logo">⠿ CONNECT</div>
          {/* <div className="nav-links">
            <a href="#find">Find freelancers</a>
            <a href="#jobs">Find jobs</a>
            <a href="#about">About</a>
            <a href="#solutions">Solutions</a>
          </div>
          <div className="nav-btns">
            <button className="login-btn">Log in</button>
            <button className="join-btn">Join Us</button>
          </div> */}
        </nav>

        <div className="hero-content-grid">
          {/* Left Side: Text */}
          <div className="content-left">
            <h1 className="main-logo-text">FR<span className="special-e">E</span>ELANCE</h1>

            {/* Search Form */}
            {/* <form className="search-bar-wrap" onSubmit={handleSearch}>
              <FiSearch className="s-icon" />
              <input 
                type="text" 
                placeholder="Search for any service..." 
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
              <div className="search-actions">
                <span className="keyboard-icon">⌨</span>
                <button type="submit" className="go-btn">
                  <FiArrowRight />
                </button>
              </div>
            </form> */}
            <SearchBar
              className="hero-search-bar"
              placeholder="Search for any service..."
            />

            <div className="tags-row">
              <span className="tag-label">Popular skills:</span>
              {quickServices.map((service, index) => (
                <button
                  key={index}
                  className="skill-tag"
                  onClick={() => handleQuickServiceClick(service.id)}
                >
                  {service.name}
                </button>
              ))}
            </div>

            <p className="hero-subtext">
              A freelance service web portal connects businesses with freelancers,
              facilitating project collaboration and hiring.
            </p>

            {/* Trusted Freelancer Card */}
            <div className="trusted-freelancer-box">
              <div className="trusted-info">
                <h3>Trusted Freelancers</h3>
                <div className="avatar-stack">
                  <img src="https://i.pravatar.cc/100?img=1" alt="u1" />
                  <img src="https://i.pravatar.cc/100?img=12" alt="u2" />
                  <img src="https://i.pravatar.cc/100?img=7" alt="u3" />
                  <img src="https://i.pravatar.cc/100?img=8" alt="u4" />
                </div>
              </div>
              <div className="trusted-stats">
                <div className="star-rating">
                  <AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar /><AiFillStar />
                </div>
                <p><strong>200+</strong> <br /> <span>Satisfied Customers</span></p>
              </div>
            </div>
          </div>

          {/* Right Side: Image and Overlays */}
          <div className="content-right">
            {/* The Badge/Stamp */}
            <div className="spinning-badge">
              <IoMdColorPalette className="badge-icon" />
            </div>

            {/* Flipped Image Container */}
            <div className="girl-img-wrapper">
              <img
                src={girl}
                alt="sitting girl"
                className="girl-img-flipped"
              />
            </div>

            {/* Floating Profile Card */}
            <div className="profile-overlay-card">
              <div className="p-header">
                <img src="https://i.pravatar.cc/100?img=5" alt="pro" />
                <div className="p-header-info">
                  <h4>DJenny</h4>
                  <p>UI/UX Designer</p>
                </div>
              </div>
              <div className="p-row">
                <FiCheckSquare className="p-icon" />
                <span>80+ projects completed</span>
              </div>
              <div className="p-row">
                <MdOutlinePayments className="p-icon" />
                <span>$30 per hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;