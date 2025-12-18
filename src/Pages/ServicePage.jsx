import React, { useState, useEffect } from "react";
import {
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
  FaTimes,
  FaChevronDown,
  FaSortAmountDown,
  FaFilter
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ServiceGrid from "../Services/ServiceGrid";
import SearchBar from "../Components/Common/SearchBar";
import ServiceHero from "../Services/ServiceHero";
import dummyData from '../Data/dummyData.json';
import ServiceData from '../Data/serviceData.json'
import "./ServicePage.css";



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
  // const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [activeFilters, setActiveFilters] = useState([]);



  // Use in component
  const [filteredServices, setFilteredServices] = useState(ServiceData.services);



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
      setFilteredServices(ServiceData.services);
    } else {
      setFilteredServices(ServiceData.services.filter(service =>
        service.category.toLowerCase() === categoryId
      ));
    }
  };

  // Handle browse talent click
  const handleBrowseTalent = (serviceId, serviceName) => {
    navigate(`/search?service=${serviceId}&q=${encodeURIComponent(serviceName)}`);
  };


  const handleServiceDetails = (serviceId, serviceName) => {
    navigate(`/service/${serviceId}`, {
      state: { serviceName }
    });
  };


  // Handle search
  // const handleSearch = (query) => {
  //   setSearchQuery(query);
  //   if (query.trim() === "") {
  //     handleCategoryClick(selectedCategory);
  //   } else {
  //     const filtered = ServiceData.services.filter(service =>
  //       service.name.toLowerCase().includes(query.toLowerCase()) ||
  //       service.description.toLowerCase().includes(query.toLowerCase()) || 
  //       service.category.toLowerCase().includes(query.toLowerCase())
  //     );
  //     setFilteredServices(filtered);
  //   }
  // };


  const handleBrowseAllFreelancers = () => {
    navigate('/search?q=all+freelancers&type=freelancers');
  };
  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    let sorted = [...filteredServices];

    switch (value) {
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
      {/* Use the new ServiceHero component */}
      <ServiceHero />

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
              onServiceDetails={handleServiceDetails}
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
                onClick={handleBrowseAllFreelancers}
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