import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaCheckCircle, 
  FaUsers,
  FaGlobe,
  FaChartLine,
  FaRocket,
  FaArrowRight,
  FaCrown,
  FaLightbulb,
  FaShieldAlt,
  FaClock,
  FaCode,
  FaPalette,
  FaPenNib,
  FaBullhorn,
  FaMobileAlt,
  FaVideo,
  FaRegBookmark,
  FaTimes,
  FaChevronDown,
  FaSortAmountDown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ServiceGrid from "../Services/ServiceGrid";
import SearchBar from "../Components/Common/SearchBar";
import "./ServicePage.css";

// Sample data
const SAMPLE_SERVICES = [
  { id: 1, name: "Web Development", category: "Development", desc: "Modern responsive websites and web applications built with React, Vue, and Node.js", price: { min: 30, max: 120 }, rating: 4.9 },
  { id: 2, name: "UI/UX Design", category: "Design", desc: "User-centered product design and prototyping for digital products", price: { min: 35, max: 140 }, rating: 4.8 },
  { id: 3, name: "Content Writing", category: "Writing", desc: "SEO-optimized content and copywriting for blogs and marketing", price: { min: 20, max: 80 }, rating: 4.7 },
  { id: 4, name: "Digital Marketing", category: "Marketing", desc: "Social media marketing and growth strategy for businesses", price: { min: 25, max: 100 }, rating: 4.6 },
  { id: 5, name: "Mobile App Dev", category: "Development", desc: "iOS and Android app development with React Native & Flutter", price: { min: 40, max: 150 }, rating: 4.9 },
  { id: 6, name: "Video Editing", category: "Creative", desc: "Professional video editing and post-production services", price: { min: 25, max: 90 }, rating: 4.5 },
  { id: 7, name: "SEO Optimization", category: "Marketing", desc: "Search engine optimization and website traffic growth", price: { min: 30, max: 110 }, rating: 4.7 },
  { id: 8, name: "Data Analysis", category: "Analytics", desc: "Data visualization and business intelligence insights", price: { min: 35, max: 130 }, rating: 4.8 },
];

const CATEGORIES = [
  { id: "all", name: "All Categories", icon: <FaRocket /> },
  { id: "development", name: "Development", icon: <FaCode /> },
  { id: "design", name: "Design", icon: <FaPalette /> },
  { id: "marketing", name: "Marketing", icon: <FaBullhorn /> },
  { id: "writing", name: "Writing", icon: <FaPenNib /> },
  { id: "creative", name: "Creative", icon: <FaVideo /> },
  { id: "analytics", name: "Analytics", icon: <FaChartLine /> },
  { id: "mobile", name: "Mobile", icon: <FaMobileAlt /> },
];

const FEATURED_FREELANCERS = [
  { id: 1, name: "John Doe", role: "Full Stack Developer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", rating: 4.9 },
  { id: 2, name: "Sarah Chen", role: "UI/UX Designer", image: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400&q=80", rating: 4.8 },
  { id: 3, name: "Mike Johnson", role: "Content Writer", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80", rating: 4.7 },
  { id: 4, name: "Emma Wilson", role: "Marketing Expert", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", rating: 4.9 },
  { id: 5, name: "Alex Turner", role: "SEO Specialist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", rating: 4.6 },
  { id: 6, name: "Lisa Wong", role: "Video Editor", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", rating: 4.5 },
];

export default function ServicePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredServices, setFilteredServices] = useState(SAMPLE_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [activeFilters, setActiveFilters] = useState([]);

  // Stats data
  const stats = [
    { icon: <FaUsers />, value: "500K+", label: "Active Freelancers" },
    { icon: <FaGlobe />, value: "180+", label: "Countries" },
    { icon: <FaStar />, value: "4.9/5", label: "Avg Rating" },
    { icon: <FaChartLine />, value: "98%", label: "Success Rate" },
  ];

  // Benefits data
  const benefits = [
    { icon: <FaCrown />, title: "Top Talent", desc: "Vetted professionals with proven track records" },
    { icon: <FaShieldAlt />, title: "Safe & Secure", desc: "Protected payments and NDAs available" },
    { icon: <FaClock />, title: "Fast Delivery", desc: "Most projects completed within 48 hours" },
    { icon: <FaLightbulb />, title: "Innovative Solutions", desc: "Cutting-edge approaches to your challenges" },
  ];

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      setFilteredServices(SAMPLE_SERVICES);
    } else {
      setFilteredServices(SAMPLE_SERVICES.filter(service => 
        service.category.toLowerCase() === categoryId
      ));
    }
  };

  // Handle browse talent click
  const handleBrowseTalent = (serviceId, serviceName) => {
    navigate(`/search?service=${serviceId}&q=${encodeURIComponent(serviceName)}`);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      handleCategoryClick(selectedCategory);
    } else {
      const filtered = SAMPLE_SERVICES.filter(service =>
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.desc.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    let sorted = [...filteredServices];
    
    switch(value) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        sorted.sort((a, b) => a.price.min - b.price.min);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price.max - a.price.max);
        break;
      case "recommended":
      default:
        // Default order
        break;
    }
    
    setFilteredServices(sorted);
  };

  // Handle freelancer search
  const handleFreelancerSearch = (freelancerName) => {
    navigate(`/search?q=${encodeURIComponent(freelancerName)}&type=freelancers`);
  };

  return (
    <div className="freelance-service-page">
      {/* Hero Section */}
      <section className="freelance-hero-section">
        <div className="freelance-container">
          <div className="freelance-hero-content">
            <div className="freelance-hero-text">
              <div className="freelance-hero-badge">
                <FaCheckCircle className="badge-icon" />
                <span>Trusted by 50,000+ companies worldwide</span>
              </div>
              
              <h1 className="freelance-hero-title">
                Find Top <span className="freelance-gradient-text">Freelance Talent</span> for Your Projects
              </h1>
              
              <p className="freelance-hero-subtitle">
                Connect with verified professionals across 100+ skills. From startups to enterprises, 
                we have the perfect match for your needs.
              </p>
              
              {/* Search Bar */}
              <div className="freelance-search-wrapper">
                <div className="freelance-search-container">
                  <SearchBar 
                    className="freelance-search-bar"
                    placeholder="Search services or freelancers (e.g., Web Development, John Doe)"
                    onSearch={handleSearch}
                  />
                </div>
                
                <div className="freelance-search-tags">
                  <span className="tags-label">Popular Searches:</span>
                  <div className="tags-container">
                    <button 
                      className="tag-btn"
                      onClick={() => handleSearch("Web Development")}
                    >
                      Web Development
                    </button>
                    <button 
                      className="tag-btn"
                      onClick={() => handleSearch("UI/UX Design")}
                    >
                      UI/UX Design
                    </button>
                    <button 
                      className="tag-btn"
                      onClick={() => handleSearch("Digital Marketing")}
                    >
                      Digital Marketing
                    </button>
                    <button 
                      className="tag-btn"
                      onClick={() => handleFreelancerSearch("John Doe")}
                    >
                      John Doe
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="freelance-hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="freelance-stat-item">
                    <div className="stat-icon-wrapper">{stat.icon}</div>
                    <div className="stat-content-wrapper">
                      <div className="stat-value-display">{stat.value}</div>
                      <div className="stat-label-display">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Freelancer Collage */}
            <div className="freelance-collage-section">
              <div className="freelance-collage-grid">
                {FEATURED_FREELANCERS.map((freelancer, index) => (
                  <div 
                    key={freelancer.id} 
                    className={`freelance-collage-item item-${index + 1}`}
                    onClick={() => handleFreelancerSearch(freelancer.name)}
                  >
                    <img 
                      src={freelancer.image} 
                      alt={freelancer.name}
                      className="freelancer-image"
                    />
                    <div className="freelancer-overlay">
                      <div className="freelancer-info">
                        <h4>{freelancer.name}</h4>
                        <p>{freelancer.role}</p>
                        <div className="freelancer-rating">
                          <FaStar />
                          <span>{freelancer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="freelance-collage-stats">
                <div className="stats-card">
                  <FaUsers className="stats-card-icon" />
                  <div className="stats-card-content">
                    <h4>250+ Freelancers</h4>
                    <p>Available for hire today</p>
                  </div>
                </div>
                <button 
                  className="view-all-freelancers-btn"
                  onClick={() => navigate('/search?type=freelancers')}
                >
                  View All Freelancers
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="freelance-categories-section">
        <div className="freelance-container">
          <div className="section-header-wrapper">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find the perfect talent for your specific needs</p>
          </div>
          
          <div className="freelance-categories-grid">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`freelance-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                {selectedCategory === category.id && (
                  <FaArrowRight className="category-arrow" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="freelance-services-section">
        <div className="freelance-container">
          <div className="section-header-wrapper">
            <div className="header-content">
              <h2 className="section-title">Popular Services</h2>
              <p className="section-subtitle">Most requested services by our clients</p>
            </div>
            
            <div className="services-controls-wrapper">
              <div className="controls-left-section">
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <span className="filter-count">{activeFilters.length}</span>
                  )}
                </button>
                
                <div className="sort-select-wrapper">
                  <FaSortAmountDown className="sort-icon" />
                  <select 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select-dropdown"
                  >
                    <option value="recommended">Sort by: Recommended</option>
                    <option value="rating">Sort by: Rating</option>
                    <option value="price-low">Sort by: Price: Low to High</option>
                    <option value="price-high">Sort by: Price: High to Low</option>
                  </select>
                </div>
              </div>
              
              <div className="results-count-display">
                Showing {filteredServices.length} services
              </div>
            </div>
          </div>

          {/* Active Filters (if any) */}
          {activeFilters.length > 0 && (
            <div className="active-filters-wrapper">
              <div className="active-filters">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="active-filter-item">
                    <span>{filter}</span>
                    <button 
                      className="remove-filter-btn"
                      onClick={() => {
                        const newFilters = activeFilters.filter((_, i) => i !== index);
                        setActiveFilters(newFilters);
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button 
                  className="clear-all-filters-btn"
                  onClick={() => setActiveFilters([])}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="services-grid-wrapper">
            <ServiceGrid 
              services={filteredServices}
              columns={4}
              onBrowseTalent={handleBrowseTalent}
              emptyMessage="No services found for your search. Try adjusting your criteria."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="freelance-benefits-section">
        <div className="freelance-container">
          <div className="section-header-wrapper">
            <h2 className="section-title">Why Choose Our Platform</h2>
            <p className="section-subtitle">Everything you need to succeed with freelance talent</p>
          </div>
          
          <div className="freelance-benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card-item">
                <div className="benefit-icon-wrapper">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="freelance-cta-section">
        <div className="freelance-container">
          <div className="cta-content-wrapper">
            <div className="cta-text-content">
              <h2 className="cta-title">Ready to Start Your Project?</h2>
              <p className="cta-subtitle">
                Join thousands of businesses who found their perfect freelancer match
              </p>
            </div>
            
            <div className="cta-actions-wrapper">
              <button 
                className="cta-primary-btn"
                onClick={() => navigate('/post-project')}
              >
                Post a Project
                <FaArrowRight />
              </button>
              <button 
                className="cta-secondary-btn"
                onClick={() => navigate('/search?type=freelancers')}
              >
                Browse Freelancers
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}