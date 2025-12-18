import React from "react";
import ServiceCard from "./ServiceCard";
import "./ServiceGrid.css";

export default function ServiceGrid({ 
  services = [], 
  onBrowseTalent,
  onServiceDetails,
  loading = false,
  error = null,
  emptyMessage = "No services found"
}) {
  
  if (loading) {
    return (
      <div className="services-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-error">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Error Loading Services</h3>
        <p className="error-message">{error}</p>
        <button className="retry-btn">Retry</button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="services-empty">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">{emptyMessage}</h3>
        <p className="empty-subtitle">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="services-grid">
      {services.map((service) => (
        <ServiceCard 
          key={service.id} 
          service={service}
          onBrowseTalent={onBrowseTalent}
          onServiceDetails={onServiceDetails} 
        />
      ))}
    </div>
  );
}
