import React from 'react';
import './ScheduleCall.css';

export default function ScheduleCall() {
  return (
    <section className="schedule-wrapper">
      <div className="schedule-content">
        <h1 className="schedule-title">Schedule a Call</h1>
        <p className="schedule-desc">
          Our enterprise onboarding team will connect with you to understand your
          requirements and provide a custom solution.
        </p>

        <button className="schedule-btn">Book a Call</button>
      </div>
    </section>
  );
}
