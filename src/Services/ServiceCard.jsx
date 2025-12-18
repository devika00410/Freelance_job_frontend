import React from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceCard.css";
import { FaArrowRight } from "react-icons/fa";

export default function ServiceCard({ service, onBrowseTalent }) {
  const navigate = useNavigate();

  const handleBrowseClick = () => {
    if (onBrowseTalent) {
      onBrowseTalent(service.id || service._id, service.name);
    } else {
      navigate(`/search?service=${service.id}&q=${encodeURIComponent(service.name)}`);
    }
  };

  // SIMPLE FIX: Always navigate directly to service detail page
  const handleMoreDetailsClick = () => {
    navigate(`/service/${service.id}`);
  };

  const imageSrc = service.image || service.imageUrl || service.img || service.thumbnail || "";

  return (
    <article className="service-card" aria-labelledby={`svc-title-${service.id || service._id}`}>
      <div className="card-media" role="img" aria-hidden={imageSrc ? "false" : "true"}>
        {imageSrc ? (
          <img src={imageSrc} alt={service.name} className="card-image" />
        ) : (
          <div className="card-image placeholder">
            <div className="placeholder-text">{service.category || "Service"}</div>
          </div>
        )}

        <div className="media-overlay">
          <span className="category-pill">{service.category}</span>
          <span className="rating-pill" aria-label={`Rating ${service.rating} out of 5`}>
            ⭐ {service.rating?.toFixed ? service.rating.toFixed(1) : service.rating || '4.5'}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 id={`svc-title-${service.id || service._id}`} className="service-title">
          {service.name}
        </h3>

        <p className="service-desc">
          {service.description || service.desc || 'Professional service with expert freelancers'}
        </p>

        <div className="service-stats">
          <div className="stat">
            <div className="stat-label">Rate / hr</div>
            <div className="stat-value">
              ${service.price?.min || service.rate?.min || '25'} - ${service.price?.max || service.rate?.max || '75'}
            </div>
          </div>

          <div className="stat">
            <div className="stat-label">Delivery</div>
            <div className="stat-value">{service.delivery || "24–48 hrs"}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Talent</div>
            <div className="stat-value">{service.availableTalents || service.available || "50+ Talents"}</div>
          </div>
        </div>
      </div>

      <footer className="card-footer">
        <button className="btn-primary" onClick={handleBrowseClick}>
          Browse Talent
        </button>
        <button
          className="service-details-btn"
          onClick={handleMoreDetailsClick}
        >
          More Details <FaArrowRight />
        </button>
      </footer>
    </article>
  );
}
