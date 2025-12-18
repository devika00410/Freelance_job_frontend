import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaCalendarAlt, FaChartBar, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';
import './ProfileReviews.css';

const ProfileReviews = ({ profile }) => {
  const { clientFeedback = [], userInfo } = profile || {};

  const ratingStats = {
    5: clientFeedback.filter(r => r.rating === 5).length,
    4: clientFeedback.filter(r => r.rating === 4).length,
    3: clientFeedback.filter(r => r.rating === 3).length,
    2: clientFeedback.filter(r => r.rating === 2).length,
    1: clientFeedback.filter(r => r.rating === 1).length
  };

  const totalReviews = clientFeedback.length;
  const averageRating = totalReviews > 0 
    ? clientFeedback.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;

  const StarRating = ({ rating, size = 16 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="stars-container">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <FaStar key={index} size={size} className="star filled" />;
          } else if (index === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={index} size={size} className="star filled" />;
          } else {
            return <FaRegStar key={index} size={size} className="star empty" />;
          }
        })}
        <span className="rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!clientFeedback || clientFeedback.length === 0) {
    return (
      <div className="reviews-container">
        <div className="reviews-empty-state">
          <div className="empty-icon">
            <FaStar size={48} />
          </div>
          <h3 className="empty-title">No Reviews Yet</h3>
          <p className="empty-description">
            {userInfo?.fullName || 'This freelancer'} hasn't received any reviews yet.
            Be the first to work with them!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <div className="header-left">
          <h2 className="reviews-title">Client Reviews</h2>
          <p className="reviews-subtitle">Verified feedback from completed projects</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <FaThumbsUp size={20} />
            <div className="stat-content">
              <span className="stat-number">{totalReviews}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
          </div>
          <div className="stat-item">
            <FaCheckCircle size={20} />
            <div className="stat-content">
              <span className="stat-number">100%</span>
              <span className="stat-label">Recommended</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-layout">
        {/* Left Column: Rating Overview */}
        <div className="reviews-sidebar">
          <div className="rating-overview-card">
            <div className="rating-main">
              <div className="average-rating">
                <span className="rating-number">{averageRating.toFixed(1)}</span>
                <div className="rating-stars">
                  <StarRating rating={averageRating} size={24} />
                </div>
                <p className="rating-total">{totalReviews} verified reviews</p>
              </div>
            </div>

            <div className="rating-breakdown">
              <h4 className="breakdown-title">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map(stars => {
                const percentage = totalReviews > 0 ? (ratingStats[stars] / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="rating-row">
                    <div className="rating-label">
                      <span className="star-count">{stars} stars</span>
                      <span className="percentage">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="count">{ratingStats[stars]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="stats-card">
            <h4 className="stats-title">
              <FaChartBar /> Performance Stats
            </h4>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">98%</div>
                <div className="stat-name">On-time Delivery</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">96%</div>
                <div className="stat-name">Budget Adherence</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">99%</div>
                <div className="stat-name">Communication</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">95%</div>
                <div className="stat-name">Work Quality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reviews List */}
        <div className="reviews-main">
          <div className="reviews-filters">
            <div className="filter-group">
              <button className="filter-btn active">All Reviews</button>
              <button className="filter-btn">5 Stars</button>
              <button className="filter-btn">4 Stars</button>
              <button className="filter-btn">3 Stars</button>
            </div>
            <div className="sort-group">
              <span className="sort-label">Sort by:</span>
              <select className="sort-select">
                <option>Most Recent</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>
          </div>

          <div className="reviews-list">
            {clientFeedback.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      {review.clientAvatar ? (
                        <img src={review.clientAvatar} alt={review.clientName} />
                      ) : (
                        <div className="avatar-placeholder">
                          <FaUser />
                        </div>
                      )}
                    </div>
                    <div className="reviewer-details">
                      <h4 className="reviewer-name">{review.clientName}</h4>
                      <div className="reviewer-project">
                        <span className="project-badge">Project:</span>
                        <span className="project-name">{review.project}</span>
                      </div>
                    </div>
                  </div>
                  <div className="review-meta">
                    <div className="review-rating">
                      <StarRating rating={review.rating} size={16} />
                    </div>
                    <div className="review-date">
                      <FaCalendarAlt size={14} />
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                </div>

                <div className="review-footer">
                  <div className="review-tags">
                    {review.tags?.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    )) || (
                      <>
                        <span className="tag">Professional</span>
                        <span className="tag">Timely Delivery</span>
                        <span className="tag">Great Communication</span>
                      </>
                    )}
                  </div>
                  <button className="helpful-btn">
                    <FaThumbsUp size={14} />
                    Helpful
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalReviews > 5 && (
            <div className="load-more">
              <button className="load-more-btn">
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviews;