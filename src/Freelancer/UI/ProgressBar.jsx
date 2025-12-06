import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ steps, currentStep }) => {
  const progressPercentage = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="progress-tracker-container">
      <div className="progress-tracker-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-tracker-step ${index + 1 <= currentStep ? 'completed' : ''} ${
              index + 1 === currentStep ? 'current' : ''
            }`}
          >
            <div className="progress-tracker-step-number">
              {index + 1 <= currentStep - 1 ? '' : index + 1}
            </div>
            <div 
              className="progress-tracker-step-label"
              data-tooltip={step.description || step.title}
            >
              {step.title}
            </div>
          </div>
        ))}
      </div>
      
      <div className="progress-tracker-line">
        <div 
          className="progress-tracker-fill"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
      
      <div className="progress-tracker-percentage">
        Progress: <span>{progressPercentage}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;