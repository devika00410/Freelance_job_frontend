import React, { useState } from 'react';
import './SkillsSection.css';

const SkillsSection = ({ data, updateData }) => {
  // SAFER default values - provide all necessary properties
  const skillsTools = data?.skillsTools || {
    skills: [],
    yearsOfExperience: '',
    toolsTechnologies: [],
    specializations: [],
    certifications: []
  };

  // Ensure all arrays exist
  const safeSkillsTools = {
    skills: Array.isArray(skillsTools.skills) ? skillsTools.skills : [],
    yearsOfExperience: skillsTools.yearsOfExperience || '',
    toolsTechnologies: Array.isArray(skillsTools.toolsTechnologies) ? skillsTools.toolsTechnologies : [],
    specializations: Array.isArray(skillsTools.specializations) ? skillsTools.specializations : [],
    certifications: Array.isArray(skillsTools.certifications) ? skillsTools.certifications : []
  };

  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [newTool, setNewTool] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const predefinedSkills = [
    // Web Development
    'React',
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Express.js',
    'MongoDB',
    'REST APIs',
    'Full-Stack Web Development',
    'Frontend Development',
    'Backend Development',
    'Website Optimization',
    'Performance Optimization',

    // Mobile App Development
    'React Native',
    'Flutter',
    'Android Development',
    'iOS Development',
    'Cross-Platform App Development',

    // UI/UX & Design
    'UI Design',
    'UX Research',
    'Wireframing',
    'Prototyping',
    'Figma',
    'Adobe XD',
    'User Experience Design',
    'Design Systems',

    // Graphic Design
    'Graphic Design',
    'Brand Identity Design',
    'Logo Design',
    'Social Media Creatives',
    'Marketing Collateral Design',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Canva',

    // Content Writing
    'Content Writing',
    'Website Content Writing',
    'SEO Content Writing',
    'Blog Writing',
    'Copywriting',
    'Technical Writing',
    'Product Descriptions',
    'Script Writing',

    // Digital Marketing
    'Digital Marketing',
    'Social Media Marketing',
    'Performance Marketing',
    'Paid Advertising',
    'Email Marketing',
    'Marketing Strategy',
    'Lead Generation',
    'Conversion Optimization',

    // SEO
    'Search Engine Optimization (SEO)',
    'On-Page SEO',
    'Off-Page SEO',
    'Technical SEO',
    'Keyword Research',
    'Link Building',
    'SEO Audits',
    'Local SEO',

    // Video Editing
    'Video Editing',
    'Short-Form Video Editing',
    'Reels & Shorts Editing',
    'YouTube Video Editing',
    'Motion Graphics',
    'Adobe Premiere Pro',
    'After Effects',

    // Supporting & Advanced Skills
    'Python',
    'Automation',
    'DevOps Basics',
    'Cloud Deployment',
    'Data Analysis',
    'Machine Learning Basics'
  ];

  const addSkill = () => {
    if (newSkill.trim() && !safeSkillsTools.skills.find(s => s.name === newSkill.trim())) {
      const updatedSkills = [
        ...safeSkillsTools.skills,
        { name: newSkill.trim(), level: skillLevel }
      ];
      updateData('skillsTools', { skills: updatedSkills });
      setNewSkill('');
    }
  };

  const removeSkill = (skillName) => {
    const updatedSkills = safeSkillsTools.skills.filter(s => s.name !== skillName);
    updateData('skillsTools', { skills: updatedSkills });
  };

  const updateSkillLevel = (skillName, level) => {
    const updatedSkills = safeSkillsTools.skills.map(s =>
      s.name === skillName ? { ...s, level } : s
    );
    updateData('skillsTools', { skills: updatedSkills });
  };

  const addTool = () => {
    if (newTool.trim() && !safeSkillsTools.toolsTechnologies.includes(newTool.trim())) {
      const updatedTools = [...safeSkillsTools.toolsTechnologies, newTool.trim()];
      updateData('skillsTools', { toolsTechnologies: updatedTools });
      setNewTool('');
    }
  };

  const removeTool = (tool) => {
    const updatedTools = safeSkillsTools.toolsTechnologies.filter(t => t !== tool);
    updateData('skillsTools', { toolsTechnologies: updatedTools });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !safeSkillsTools.specializations.includes(newSpecialization.trim())) {
      const updatedSpecializations = [...safeSkillsTools.specializations, newSpecialization.trim()];
      updateData('skillsTools', { specializations: updatedSpecializations });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec) => {
    const updatedSpecializations = safeSkillsTools.specializations.filter(s => s !== spec);
    updateData('skillsTools', { specializations: updatedSpecializations });
  };

  const addCertification = () => {
    if (newCertification.trim() && !safeSkillsTools.certifications.includes(newCertification.trim())) {
      const updatedCertifications = [...safeSkillsTools.certifications, newCertification.trim()];
      updateData('skillsTools', { certifications: updatedCertifications });
      setNewCertification('');
    }
  };

  const removeCertification = (cert) => {
    const updatedCertifications = safeSkillsTools.certifications.filter(c => c !== cert);
    updateData('skillsTools', { certifications: updatedCertifications });
  };

  const canAddSkill = newSkill.trim() && !safeSkillsTools.skills.find(s => s.name === newSkill.trim());
  const isMinimumSkillsMet = safeSkillsTools.skills.length >= 5;

  return (
    <div className="skills-tools-section">
      <div className="section-header">
        <h2>Skills, Tools & Expertise</h2>
        <p className="section-description">
          Showcase your technical skills and expertise. Minimum 5 skills required.
        </p>
        <div className="points-info">
          <span className="points-badge">15 Points</span>
          <span className="points-description">(10 mandatory, 5 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Skills - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Technical Skills (Minimum 5)
          </label>
          <p className="field-help mandatory">
            {isMinimumSkillsMet ? '✓ Minimum requirement met' : `Need ${5 - safeSkillsTools.skills.length} more skills`}
          </p>
          
          <div className="add-skill-form">
            <div className="input-group">
              <input
                type="text"
                className="form-input"
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
                className="level-select"
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
                className="add-btn"
                disabled={!canAddSkill}
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Skills List */}
          <div className="skills-list">
            {safeSkillsTools.skills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <p className="empty-text">No skills added yet</p>
              </div>
            ) : (
              safeSkillsTools.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <span className="skill-name">{skill.name}</span>
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkillLevel(skill.name, e.target.value)}
                    className={`skill-level skill-level-${skill.level}`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.name)}
                    className="skill-remove"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Years of Experience - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Years of Experience
          </label>
          <select
            className="form-input"
            value={safeSkillsTools.yearsOfExperience}
            onChange={(e) => updateData('skillsTools', { yearsOfExperience: e.target.value })}
            required
          >
            <option value="">Select your experience level</option>
            <option value="0-1">0-1 years (Entry Level)</option>
            <option value="1-3">1-3 years (Junior)</option>
            <option value="3-5">3-5 years (Mid-Level)</option>
            <option value="5-10">5-10 years (Senior)</option>
            <option value="10+">10+ years (Expert)</option>
          </select>
        </div>

        {/* Tools & Technologies - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Tools & Technologies
          </label>
          <div className="add-tool-form">
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                placeholder="Add tool/technology (e.g., Figma, Docker, AWS)"
              />
              <button 
                type="button" 
                onClick={addTool} 
                className="add-btn"
                disabled={!newTool.trim()}
              >
                Add
              </button>
            </div>
          </div>
          <div className="tags-list">
            {safeSkillsTools.toolsTechnologies.map((tool, index) => (
              <span key={index} className="tag">
                {tool}
                <button 
                  type="button"
                  onClick={() => removeTool(tool)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Specializations - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Specializations
          </label>
          <div className="add-specialization-form">
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="Add specialization (e.g., Performance SEO, CRO, Accessibility)"
              />
              <button 
                type="button" 
                onClick={addSpecialization} 
                className="add-btn"
                disabled={!newSpecialization.trim()}
              >
                Add
              </button>
            </div>
          </div>
          <div className="tags-list">
            {safeSkillsTools.specializations.map((spec, index) => (
              <span key={index} className="tag">
                {spec}
                <button 
                  type="button"
                  onClick={() => removeSpecialization(spec)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Certifications - RECOMMENDED */}
        <div className="form-group">
          <label className="form-label recommended-label">
            Certifications
          </label>
          <div className="add-certification-form">
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Add certification (e.g., AWS Certified, Google Analytics)"
              />
              <button 
                type="button" 
                onClick={addCertification} 
                className="add-btn"
                disabled={!newCertification.trim()}
              >
                Add
              </button>
            </div>
          </div>
          <div className="tags-list">
            {safeSkillsTools.certifications.map((cert, index) => (
              <span key={index} className="tag">
                {cert}
                <button 
                  type="button"
                  onClick={() => removeCertification(cert)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Completion Status */}
        <div className="completion-status">
          <div className="status-row">
            <span className="status-label">Mandatory Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  safeSkillsTools.skills.length >= 5,
                  safeSkillsTools.yearsOfExperience
                ].filter(Boolean).length;
                return `${completed}/2 completed`;
              })()}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Recommended Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  safeSkillsTools.toolsTechnologies.length > 0,
                  safeSkillsTools.specializations.length > 0,
                  safeSkillsTools.certifications.length > 0
                ].filter(Boolean).length;
                return `${completed}/3 completed`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;