import React from 'react';
import './FormNavigation.css';

const FormNavigation = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onSubmit, 
  isLastStep 
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="form-nav-container">
      <div className="form-step-progress">
        <div 
          className="form-step-progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="form-nav-buttons">
        {currentStep > 1 ? (
          <button type="button" onClick={onPrev} className="form-nav-btn-secondary">
            ← Previous
          </button>
        ) : (
          <div></div> // Empty div for spacing when no back button
        )}
        
        <div className="form-step-indicator">
          Step {currentStep} of {totalSteps}
        </div>

        {!isLastStep ? (
          <button type="button" onClick={onNext} className="form-nav-btn-primary">
            Continue →
          </button>
        ) : (
          <button type="button" onClick={onSubmit} className="form-nav-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Publish Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;