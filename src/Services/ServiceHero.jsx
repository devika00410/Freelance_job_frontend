import React, { useEffect, useState } from "react";
import "./ServiceHero.css";
import { FaSearch } from "react-icons/fa";
import Girl from '.././assets/photos/freelancergirl.png'

export default function ServiceHero({ onSearch }) { 

  const services = ["websites", "designs", "marketing", "apps", "content", "videos"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 


  useEffect(() => {
    let timer;
    const word = services[currentIndex];
    
    if (isTyping) {
      if (currentText.length < word.length) {
        timer = setTimeout(() => {
          setCurrentText(word.slice(0, currentText.length + 1));
        }, 70);
      } else {
        timer = setTimeout(() => setIsTyping(false), 1100);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(word.slice(0, currentText.length - 1));
        }, 40);
      } else {
        setCurrentIndex((prev) => (prev + 1) % services.length);
        setIsTyping(true);
      }
    }

    
    return () => clearTimeout(timer);
  }, [currentText, isTyping, currentIndex, services]);


  const trustedCompanies = [
    {
      name: "FACEBOOK",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/640px-Facebook_f_logo_%282019%29.svg.png",
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/640px-Google_2015_logo.svg.png",
    },
    {
      name: "NETFLIX",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/640px-Netflix_2015_logo.svg.png",
    },
    {
      name: "P&G",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Procter_%26_Gamble_logo.svg/640px-Procter_%26_Gamble_logo.svg.png",
    },
    {
      name: "PayPal",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/640px-PayPal.svg.png",
    },
    {
      name: "Meta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/640px-Meta_Platforms_Inc._logo.svg.png",
    },
    {
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/640px-Apple_logo_black.svg.png",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/640px-Amazon_logo.svg.png",
    },
  ];

  const serviceCategories = [
    { name: "Website Design" },
    { name: "UI/UX" },
    { name: "Graphic Design" },
    { name: "Digital Marketing" },
    { name: "SEO" },
    { name: "Content Writing" },
  ];

 const handleSearchSubmit = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };


const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearchSubmit();
  }
};

  return (
    <>
      <header className="service-hero">
        <div className="service-hero-container">
          {/* Navigation */}
          <nav className="service-hero-nav">
            <div className="nav-left">
              <h1 className="logo">freelumo.</h1>
              <div className="nav-links">
                <a href="#" className="nav-link">Freelumo Pro</a>
                <a href="#" className="nav-link">Explore</a>
                <a href="#" className="nav-link">English</a>
              </div>
            </div>
            <div className="nav-right">
              <button className="nav-btn">Become a Seller</button>
              <a href="#" className="nav-link">Sign In</a>
              <button className="nav-btn-primary">Join</button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="hero-main-content">
            <div className="hero-left">
              <h1 className="hero-title">
                Find the perfect <span className="typing-text">{currentText}</span>
                <span className="cursor">|</span> services for your business
              </h1>

              {/* Search Bar */}
               <div className="hero-search-container">
                <div className="search-bar-wrapper">
                  <input
                    type="text"
                    placeholder='Try "building mobile app"'
                    className="search-input"
                    aria-label="Search services"
                    value={searchQuery} // ADD value binding
                    onChange={(e) => setSearchQuery(e.target.value)} // ADD onChange
                    onKeyDown={handleKeyPress} 
                  />
                  <button 
                    className="search-btn"
                    onClick={handleSearchSubmit} // ADD onClick
                  >
                    <FaSearch /> Search
                  </button>
                </div>

                {/* Service Categories under Search Bar */}
                 <div className="service-categories-under-search">
                  {serviceCategories.map((service, index) => (
                    <div key={index} className="service-category-tag">
                      {service.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Girl Image */}
            <div className="hero-right">
              <div className="girl-image-container">
                <img
                  src={Girl}
                  alt="Professional freelancer"
                  className="girl-image"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Trusted By Section - PLACED HERE UNDER HERO SECTION */}
      <section className="trusted-section-outside">
        <div className="trusted-container">
          <span className="trusted-label">Trusted by:</span>
          <div className="company-logos-container">
            <div className="company-logos-track">
              {/* First set */}
              {trustedCompanies.map((company, index) => (
                <div key={`${company.name}-1`} className="company-logo-item">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="company-logo-image"
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {trustedCompanies.map((company, index) => (
                <div key={`${company.name}-2`} className="company-logo-item">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="company-logo-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}