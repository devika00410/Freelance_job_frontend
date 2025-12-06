import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaCalendarAlt } from 'react-icons/fa';
import './ProfileReviews.css'

const ProfileReviews = ({ profile }) => {
  const { clientFeedback, userInfo } = profile;

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

  const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="reviews-star-component">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <FaStar key={index} className="reviews-star-item reviews-star-filled" />;
          } else if (index === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={index} className="reviews-star-item reviews-star-filled" />;
          } else {
            return <FaRegStar key={index} className="reviews-star-item" />;
          }
        })}
        <span className="reviews-rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!clientFeedback || clientFeedback.length === 0) {
    return (
      <div className="reviews-main-container">
        <div className="reviews-empty-container">
          <div className="reviews-empty-content">
            <FaStar className="reviews-empty-icon" />
            <h3 className="reviews-empty-title">No Reviews Yet</h3>
            <p className="reviews-empty-text">This freelancer hasn't received any reviews yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-main-container">
      <div className="reviews-header-section">
        <h3 className="reviews-main-title">Client Reviews</h3>
        <p className="reviews-subtitle">Feedback from completed projects</p>
      </div>

      <div className="reviews-layout-grid">
        {/* Rating Overview */}
        <div className="reviews-overview-card">
          <div className="reviews-overview-main">
            <div className="reviews-average-rating">
              <div className="reviews-rating-number">{averageRating.toFixed(1)}</div>
              <div className="reviews-star-rating">
                <StarRating rating={averageRating} />
              </div>
              <div className="reviews-total-count">{totalReviews} total reviews</div>
            </div>
          </div>

          <div className="reviews-breakdown-section">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="reviews-rating-bar">
                <span className="reviews-stars-label">{stars} star</span>
                <div className="reviews-bar-container">
                  <div 
                    className="reviews-bar-fill"
                    style={{ 
                      width: `${totalReviews > 0 ? (ratingStats[stars] / totalReviews) * 100 : 0}%` 
                    }}></div>
                </div>
                <span className="reviews-bar-count">{ratingStats[stars]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="reviews-list-container">
          <h4 className="reviews-list-title">Recent Feedback</h4>
          {clientFeedback.map((review, index) => (
            <div key={index} className="reviews-review-card">
              <div className="reviews-review-header">
                <div className="reviews-reviewer-info">
                  <div className="reviews-reviewer-avatar">
                    {review.clientAvatar ? (
                      <img src={review.clientAvatar} alt={review.clientName} />
                    ) : (
                      <FaUser className="reviews-default-avatar"/>
                    )}
                  </div>
                  <div className="reviews-reviewer-details">
                    <h5 className="reviews-reviewer-name">{review.clientName}</h5>
                    <div className="reviews-review-project">{review.project}</div>
                  </div>
                </div>
                <div className="reviews-review-meta">
                  <StarRating rating={review.rating}/>
                  <div className="reviews-review-date">
                    <FaCalendarAlt/>
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="reviews-review-content">
                <p>{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviews;