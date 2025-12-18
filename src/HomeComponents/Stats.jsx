import React, { useEffect, useRef } from "react";
import "./Stats.css";

export default function Stats() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && ref.current.classList.add("visible"),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
  }, []);

  return (
    <section className="stats-wrapper">
      <div className="stats-card" ref={ref}>
        <h2 className="stats-title">Our results in numbers</h2>

        <div className="stats-grid">
          <Stat
            value="99%"
            title="Customer satisfaction"
            desc="Consistently delivering high-quality outcomes and client trust."
          />
          <Stat
            value="32M"
            title="Active users"
            desc="Users actively engaging with our platform every month."
          />
          <Stat
            value="125+"
            title="Team members"
            desc="A diverse team driving innovation and execution worldwide."
          />
          <Stat
            value="240%"
            title="Company growth"
            desc="Sustained growth through innovation and long-term partnerships."
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, title, desc }) {
  return (
    <div className="stat-item">
      <h3>{value}</h3>
      <p className="stat-title">{title}</p>
      <p className="stat-desc">{desc}</p>
    </div>
  );
}
