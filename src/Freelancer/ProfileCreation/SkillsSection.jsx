import React, { useState } from 'react';
import './SkillsSection.css';

const SkillsSection = ({ data, updateData }) => {
  const { skills } = data;
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');

  const predefinedSkills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'HTML', 'CSS',
    'UI/UX Design', 'Graphic Design', 'SEO', 'Content Writing', 'Digital Marketing',
    'Mobile Development', 'DevOps', 'Data Science', 'Machine Learning'
  ];

  const serviceCategories = [
    'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
    'Digital Marketing', 'Content Writing', 'SEO Optimization', 'Data Analysis',
    'DevOps', 'E-commerce Development', 'WordPress Development', 'API Development'
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skills.technicalSkills.find(s => s.name === newSkill.trim())) {
      const updatedSkills = [
        ...skills.technicalSkills,
        { name: newSkill.trim(), level: skillLevel, years: '' }
      ];
      updateData('skills', { technicalSkills: updatedSkills });
      setNewSkill('');
    }
  };

  const removeSkill = (skillName) => {
    const updatedSkills = skills.technicalSkills.filter(s => s.name !== skillName);
    updateData('skills', { technicalSkills: updatedSkills });
  };

  const updateSkillLevel = (skillName, level) => {
    const updatedSkills = skills.technicalSkills.map(s =>
      s.name === skillName ? { ...s, level } : s
    );
    updateData('skills', { technicalSkills: updatedSkills });
  };

  const toggleServiceCategory = (category) => {
    const updatedCategories = skills.serviceCategories.includes(category)
      ? skills.serviceCategories.filter(c => c !== category)
      : [...skills.serviceCategories, category];
    
    updateData('skills', { serviceCategories: updatedCategories });
  };

  const canAddSkill = newSkill.trim() && !skills.technicalSkills.find(s => s.name === newSkill.trim());

  const getLevelClass = (level) => {
    return `skills-section__skill-level skills-section__skill-level--${level}`;
  };

  return (
    <div className="skills-section">
      <h2 className="skills-section__title">Skills & Expertise</h2>
      <p className="skills-section__description">
        Showcase your technical skills and service offerings. Highlight your expertise levels and the categories you specialize in to attract the right clients.
      </p>

      {/* Technical Skills */}
      <div className="skills-section__subsection">
        <h3 className="skills-section__subsection-title">Technical Skills</h3>
        
        <div className="skills-section__add-form">
          <div className="skills-section__input-group">
            <input
              type="text"
              className="skills-section__skill-input"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., React, Photoshop, SEO, Python)"
              list="predefined-skills"
            />
            <datalist id="predefined-skills">
              {predefinedSkills.map(skill => (
                <option key={skill} value={skill} />
              ))}
            </datalist>
            
            <select
              className="skills-section__level-select"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            
            <button 
              type="button" 
              onClick={addSkill} 
              className="skills-section__add-button"
              disabled={!canAddSkill}
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="skills-section__skills-list">
          {skills.technicalSkills.length === 0 ? (
            <div className="skills-section__empty-state">
              <div className="skills-section__empty-icon">💡</div>
              <p className="skills-section__empty-text">No skills added yet</p>
            </div>
          ) : (
            skills.technicalSkills.map((skill, index) => (
              <div key={index} className="skills-section__skill-item">
                <span className="skills-section__skill-name">{skill.name}</span>
                <select
                  value={skill.level}
                  onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                  className={getLevelClass(skill.level)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="skills-section__skill-remove"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Service Categories */}
      <div className="skills-section__subsection">
        <h3 className="skills-section__subsection-title">Service Categories</h3>
        <p className="skills-section__subsection-description">
          Select the types of services you offer to help clients find you for relevant projects:
        </p>
        
        <div className="skills-section__categories-grid">
          {serviceCategories.map(category => (
            <label key={category} className="skills-section__category-checkbox">
              <input
                type="checkbox"
                checked={skills.serviceCategories.includes(category)}
                onChange={() => toggleServiceCategory(category)}
              />
              <span className="skills-section__checkmark"></span>
              <span className="skills-section__category-label">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Primary Skill Categories */}
      <div className="skills-section__subsection">
        <h3 className="skills-section__subsection-title">Primary Skill Categories</h3>
        <p className="skills-section__subsection-description">
          Choose your main areas of expertise to highlight your core competencies:
        </p>
        
        <div className="skills-section__category-tags">
          {['Frontend Development', 'Backend Development', 'Full-Stack Development', 
            'UI/UX Design', 'Mobile Development', 'DevOps', 'Data Science', 'Machine Learning'].map(category => (
            <button
              key={category}
              type="button"
              className={`skills-section__category-tag ${
                skills.categories.includes(category) ? 'skills-section__category-tag--active' : ''
              }`}
              onClick={() => {
                const updated = skills.categories.includes(category)
                  ? skills.categories.filter(c => c !== category)
                  : [...skills.categories, category];
                updateData('skills', { categories: updated });
              }}
            >
              <span className="skills-section__category-tag-text">{category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;