import React from 'react';
import { FaCode, FaChartBar, FaPenFancy, FaPalette, FaVideo, FaSearch, FaBullhorn, FaUserTie, FaDatabase, FaTools } from 'react-icons/fa';
import './ProfileSkills.css';

const ProfileSkills = ({ profile }) => {
  const { technicalSkills } = profile;

  const skillCategories = {
    'Web Development': { icon: <FaCode />, color: '#3b82f6' },
    'Data Analytics': { icon: <FaDatabase />, color: '#10b981' },
    'Content Writing': { icon: <FaPenFancy />, color: '#f59e0b' },
    'Graphics Design': { icon: <FaPalette />, color: '#8b5cf6' },
    'Video Editing': { icon: <FaVideo />, color: '#ef4444' },
    'SEO': { icon: <FaSearch />, color: '#06b6d4' },
    'Digital Marketing': { icon: <FaBullhorn />, color: '#ec4899' },
    'Virtual Assistance': { icon: <FaUserTie />, color: '#0a1f3d' },
    'UI/UX Design': { icon: <FaChartBar />, color: '#6366f1' }
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
      beginner: { label: 'Beginner', width: '30%', color: '#cbd5e0' },
      intermediate: { label: 'Intermediate', width: '60%', color: '#3b82f6' },
      advanced: { label: 'Advanced', width: '85%', color: '#8b5cf6' },
      expert: { label: 'Expert', width: '100%', color: '#10b981' }
    };
    return levels[level] || levels.beginner;
  };

  if (!technicalSkills || technicalSkills.length === 0) {
    return (
      <div className="skills-main-container">
        <div className="skills-empty-container">
          <div className="skills-empty-content">
            <FaTools className="skills-empty-icon" />
            <h3>No Skills Added</h3>
            <p>This freelancer hasn't added any skills yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-main-container">
      <div className="skills-header">
        <h2>Skills & Expertise</h2>
        <p>Professional skills and proficiency levels</p>
      </div>

      <div className="skills-grid">
        {/* Skills Categories */}
        <div className="skills-categories">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="skill-category-card">
              <div className="category-header">
                <div 
                  className="category-icon"
                  style={{ backgroundColor: skillCategories[category]?.color + '15', color: skillCategories[category]?.color }}
                >
                  {skillCategories[category]?.icon || <FaCode />}
                </div>
                <div>
                  <h3>{category}</h3>
                  <span className="skill-count">{categorySkills.length} skills</span>
                </div>
              </div>
              
              <div className="skills-list">
                {categorySkills.map((skill, index) => {
                  const levelInfo = getLevelInfo(skill.proficiencyLevel);
                  return (
                    <div key={index} className="skill-item">
                      <div className="skill-info">
                        <span className="skill-name">{skill.skillName}</span>
                        <span className="skill-level">{levelInfo.label}</span>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: levelInfo.width,
                            background: levelInfo.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Service Categories Overview */}
        <div className="skills-overview">
          <div className="overview-header">
            <h3>Service Categories</h3>
            <span className="total-categories">{Object.keys(skillCategories).length} categories</span>
          </div>
          <div className="categories-grid">
            {Object.entries(skillCategories).map(([category, info]) => (
              <div 
                key={category} 
                className="category-item"
                style={{ borderLeft: `4px solid ${info.color}` }}
              >
                <div 
                  className="category-icon-small"
                  style={{ color: info.color }}
                >
                  {info.icon}
                </div>
                <span className="category-name">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkills;