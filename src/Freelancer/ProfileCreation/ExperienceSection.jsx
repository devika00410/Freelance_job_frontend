import React, { useState } from 'react';
import './ExperienceSection.css';

const ExperienceSection = ({ data, updateData }) => {
  const { experience } = data;
  
  const [newExperience, setNewExperience] = useState({
    jobTitle: '',
    company: '',
    employmentType: 'full-time',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: ''
  });

  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    field: '',
    graduationYear: '',
    description: ''
  });

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialUrl: ''
  });

  const addExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      const updated = [...experience.workExperience, { ...newExperience, id: Date.now() }];
      updateData('experience', { workExperience: updated });
      setNewExperience({
        jobTitle: '', company: '', employmentType: 'full-time',
        startDate: '', endDate: '', current: false, description: '', achievements: ''
      });
    }
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      const updated = [...experience.education, { ...newEducation, id: Date.now() }];
      updateData('experience', { education: updated });
      setNewEducation({
        degree: '', institution: '', field: '', graduationYear: '', description: ''
      });
    }
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      const updated = [...experience.certifications, { ...newCertification, id: Date.now() }];
      updateData('experience', { certifications: updated });
      setNewCertification({
        name: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: ''
      });
    }
  };

  const removeItem = (type, id) => {
    const updated = experience[type].filter(item => item.id !== id);
    updateData('experience', { [type]: updated });
  };

  const canAddExperience = newExperience.jobTitle && newExperience.company && newExperience.startDate;
  const canAddEducation = newEducation.degree && newEducation.institution;
  const canAddCertification = newCertification.name && newCertification.issuer;

  return (
    <div className="experience-section">
      <h2 className="experience-section__title">Experience & Education</h2>
      <p className="experience-section__description">
        Showcase your professional journey. Add your work experience, education, and certifications to build credibility with potential clients.
      </p>

      {/* Work Experience */}
      <div className="experience-section__subsection">
        <h3 className="experience-section__subsection-title">Work Experience</h3>
        
        <div className="experience-section__form-grid">
          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Job Title
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newExperience.jobTitle}
              onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Company
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newExperience.company}
              onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Company name"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Employment Type</label>
            <select
              className="experience-section__select"
              value={newExperience.employmentType}
              onChange={(e) => setNewExperience(prev => ({ ...prev, employmentType: e.target.value }))}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Start Date
            </label>
            <input
              type="month"
              className="experience-section__input"
              value={newExperience.startDate}
              onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">End Date</label>
            <input
              type="month"
              className="experience-section__input"
              value={newExperience.endDate}
              onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
              disabled={newExperience.current}
            />
            <div className="experience-section__checkbox-group">
              <input
                type="checkbox"
                className="experience-section__checkbox"
                checked={newExperience.current}
                onChange={(e) => setNewExperience(prev => ({ 
                  ...prev, 
                  current: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
              />
              <label className="experience-section__checkbox-label">
                I currently work here
              </label>
            </div>
          </div>

          <div className="experience-section__form-group experience-section__form-group--full">
            <label className="experience-section__label">Description</label>
            <textarea
              className="experience-section__textarea"
              value={newExperience.description}
              onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your responsibilities, technologies used, and key contributions..."
              rows="4"
            />
          </div>

          <div className="experience-section__form-group experience-section__form-group--full">
            <label className="experience-section__label">Key Achievements</label>
            <textarea
              className="experience-section__textarea"
              value={newExperience.achievements}
              onChange={(e) => setNewExperience(prev => ({ ...prev, achievements: e.target.value }))}
              placeholder="List your key achievements, projects delivered, or impact made (one per line)..."
              rows="3"
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={addExperience} 
          className="experience-section__add-button"
          disabled={!canAddExperience}
        >
          Add Experience
        </button>

        {/* Experience List */}
        <div className="experience-section__items-list">
          {experience.workExperience.length === 0 ? (
            <div className="experience-section__empty-state">
              <div className="experience-section__empty-icon">💼</div>
              <p className="experience-section__empty-text">No work experience added yet</p>
            </div>
          ) : (
            experience.workExperience.map(exp => (
              <div key={exp.id} className="experience-section__item-card">
                <div className="experience-section__item-header">
                  <h4 className="experience-section__item-title">{exp.jobTitle} at {exp.company}</h4>
                  <button 
                    type="button" 
                    onClick={() => removeItem('workExperience', exp.id)}
                    className="experience-section__remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div className="experience-section__item-details">
                  <div className="experience-section__item-detail">
                    {exp.employmentType} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <p className="experience-section__item-description">{exp.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Education */}
      <div className="experience-section__subsection">
        <h3 className="experience-section__subsection-title">Education</h3>
        
        <div className="experience-section__form-grid">
          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Degree/Certificate
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newEducation.degree}
              onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
              placeholder="e.g., Bachelor of Science in Computer Science"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Institution
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newEducation.institution}
              onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="University or institution name"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Field of Study</label>
            <input
              type="text"
              className="experience-section__input"
              value={newEducation.field}
              onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
              placeholder="e.g., Computer Science, Business Administration"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Graduation Year</label>
            <input
              type="number"
              className="experience-section__input"
              value={newEducation.graduationYear}
              onChange={(e) => setNewEducation(prev => ({ ...prev, graduationYear: e.target.value }))}
              placeholder="2020"
              min="1900"
              max="2030"
            />
          </div>

          <div className="experience-section__form-group experience-section__form-group--full">
            <label className="experience-section__label">Description</label>
            <textarea
              className="experience-section__textarea"
              value={newEducation.description}
              onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about your education, honors, or relevant coursework..."
              rows="3"
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={addEducation} 
          className="experience-section__add-button"
          disabled={!canAddEducation}
        >
          Add Education
        </button>

        {/* Education List */}
        <div className="experience-section__items-list">
          {experience.education.length === 0 ? (
            <div className="experience-section__empty-state">
              <div className="experience-section__empty-icon">🎓</div>
              <p className="experience-section__empty-text">No education added yet</p>
            </div>
          ) : (
            experience.education.map(edu => (
              <div key={edu.id} className="experience-section__item-card">
                <div className="experience-section__item-header">
                  <h4 className="experience-section__item-title">{edu.degree}</h4>
                  <button 
                    type="button" 
                    onClick={() => removeItem('education', edu.id)}
                    className="experience-section__remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div className="experience-section__item-details">
                  <div className="experience-section__item-detail">
                    {edu.institution}
                  </div>
                  {edu.graduationYear && (
                    <div className="experience-section__item-detail">
                      Graduated: {edu.graduationYear}
                    </div>
                  )}
                  {edu.field && (
                    <div className="experience-section__item-detail">
                      Field: {edu.field}
                    </div>
                  )}
                </div>
                {edu.description && (
                  <p className="experience-section__item-description">{edu.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Certifications */}
      <div className="experience-section__subsection">
        <h3 className="experience-section__subsection-title">Certifications</h3>
        
        <div className="experience-section__form-grid">
          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Certification Name
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., AWS Certified Solutions Architect"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label experience-section__required">
              Issuing Organization
            </label>
            <input
              type="text"
              className="experience-section__input"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
              placeholder="e.g., Amazon Web Services"
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Issue Date</label>
            <input
              type="month"
              className="experience-section__input"
              value={newCertification.issueDate}
              onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Expiration Date</label>
            <input
              type="month"
              className="experience-section__input"
              value={newCertification.expirationDate}
              onChange={(e) => setNewCertification(prev => ({ ...prev, expirationDate: e.target.value }))}
            />
          </div>

          <div className="experience-section__form-group">
            <label className="experience-section__label">Credential URL</label>
            <input
              type="url"
              className="experience-section__input"
              value={newCertification.credentialUrl}
              onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
              placeholder="https://credential-url.com"
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={addCertification} 
          className="experience-section__add-button"
          disabled={!canAddCertification}
        >
          Add Certification
        </button>

        {/* Certifications List */}
        <div className="experience-section__items-list">
          {experience.certifications.length === 0 ? (
            <div className="experience-section__empty-state">
              <div className="experience-section__empty-icon">🏆</div>
              <p className="experience-section__empty-text">No certifications added yet</p>
            </div>
          ) : (
            experience.certifications.map(cert => (
              <div key={cert.id} className="experience-section__item-card">
                <div className="experience-section__item-header">
                  <h4 className="experience-section__item-title">{cert.name}</h4>
                  <button 
                    type="button" 
                    onClick={() => removeItem('certifications', cert.id)}
                    className="experience-section__remove-button"
                  >
                    Remove
                  </button>
                </div>
                <div className="experience-section__item-details">
                  <div className="experience-section__item-detail">
                    {cert.issuer}
                  </div>
                  {cert.issueDate && (
                    <div className="experience-section__item-detail">
                      Issued: {cert.issueDate}
                    </div>
                  )}
                  {cert.expirationDate && (
                    <div className="experience-section__item-detail">
                      Expires: {cert.expirationDate}
                    </div>
                  )}
                  {cert.credentialUrl && (
                    <div className="experience-section__item-detail">
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" 
                         style={{color: '#3b82f6', textDecoration: 'none'}}>
                        View Credential
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;