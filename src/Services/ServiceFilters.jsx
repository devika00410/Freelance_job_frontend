import React from "react";
import "./ServiceFilters.css";

export default function ServiceFilters() {
  return (
    <div className="filters">
      <input className="f-search" placeholder="Search services..." aria-label="search services"/>
      <select className="f-select" aria-label="category">
        <option>All categories</option>
        <option>Design</option>
        <option>Development</option>
        <option>Writing</option>
        <option>Marketing</option>
      </select>
      <select className="f-select" aria-label="sort">
        <option>Most popular</option>
        <option>Highest rated</option>
        <option>Price: low to high</option>
      </select>
    </div>
  );
}
