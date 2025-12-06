import React from 'react';
import { FaCode, FaChartBar, FaPenFancy, FaPalette, FaVideo, FaSearch, FaBullhorn, FaUserTie, FaDatabase, FaTools } from 'react-icons/fa';
import './ProfileSkills.css'

const ProfileSkills = ({ profile }) => {
  const { technicalSkills } = profile;

  const skillCategories = {
    'Web Development': { icon: <FaCode /> },
    'Data Analytics': { icon: <FaDatabase /> },
    'Content Writing': { icon: <FaPenFancy /> },
    'Graphics Design': { icon: <FaPalette /> },
    'Video Editing': { icon: <FaVideo /> },
    'SEO': { icon: <FaSearch /> },
    'Digital Marketing': { icon: <FaBullhorn /> },
    'Virtual Assistance': { icon: <FaUserTie /> },
    'UI/UX Design': { icon: <FaChartBar /> }
  };

  const groupedSkills = technicalSkills.reduce((acc, skill) => {
    const category = skill.skillCategory || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const getLevelInfo = (level) => {
    const levels = {
      beginner: { label: 'Beginner', class: 'skills-beginner' },
      intermediate: { label: 'Intermediate', class: 'skills-intermediate' },
      advanced: { label: 'Advanced', class: 'skills-advanced' },
      expert: { label: 'Expert', class: 'skills-expert' }
    };
    return levels[level] || levels.beginner;
  };

  if (!technicalSkills || technicalSkills.length === 0) {
    return (
      <div className="skills-main-container">
        <div className="skills-empty-container">
          <div className="skills-empty-content">
            <FaTools className="skills-empty-icon" />
            <h3 className="skills-empty-title">No Skills Added</h3>
            <p className="skills-empty-text">This freelancer hasn't added any skills yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-main-container">
      <div className="skills-header-section">
        <h3 className="skills-main-title">Skills & Expertise</h3>
        <p className="skills-subtitle">Professional skills and proficiency levels</p>
      </div>

      <div className="skills-grid-layout">
        {/* Skills Categories */}
        <div className="skills-categories-section">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="skills-category-card">
              <div className="skills-category-header">
                <div className="skills-category-icon">
                  {skillCategories[category]?.icon || <FaCode />}
                </div>
                <h4 className="skills-category-title">{category}</h4>
              </div>
              
              <div className="skills-list-container">
                {categorySkills.map((skill, index) => {
                  const levelInfo = getLevelInfo(skill.proficiencyLevel);
                  return (
                    <div key={index} className="skills-item">
                      <div className="skills-item-header">
                        <span className="skills-item-name">{skill.skillName}</span>
                        <span className="skills-item-level">{levelInfo.label}</span>
                      </div>
                      <div className="skills-progress-track">
                        <div className={`skills-progress-bar ${levelInfo.class}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Service Categories Overview */}
        <div className="skills-overview-card">
          <h4 className="skills-overview-title">Service Categories</h4>
          <div className="skills-categories-grid">
            {Object.entries(skillCategories).map(([category, info]) => (
              <div key={category} className="skills-category-item">
                <div className="skills-item-icon">
                  {info.icon}
                </div>
                <span className="skills-item-name">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkills;