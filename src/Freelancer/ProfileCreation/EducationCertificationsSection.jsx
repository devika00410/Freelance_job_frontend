import React, { useState } from 'react';
import './EducationCertificationsSection.css';

const EducationCertificationsSection = ({ data, updateData }) => {
const educationCertifications = data?.educationCertifications || {};

  
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialUrl: ''
  });

  const [newCourse, setNewCourse] = useState({
    name: '',
    platform: '',
    completionDate: '',
    certificateUrl: ''
  });

  // Handle highest education changes
  const handleEducationChange = (field, value) => {
    updateData('educationCertifications', {
      ...educationCertifications,
      highestEducation: {
        ...educationCertifications.highestEducation,
        [field]: value
      }
    });
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      const updated = [...educationCertifications.certifications, { ...newCertification, id: Date.now() }];
      updateData('educationCertifications', { certifications: updated });
      setNewCertification({
        name: '', issuer: '', issueDate: '', expirationDate: '', credentialUrl: ''
      });
    }
  };

  const removeCertification = (certId) => {
    const updated = educationCertifications.certifications.filter(c => c.id !== certId);
    updateData('educationCertifications', { certifications: updated });
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.platform) {
      const updated = [...educationCertifications.courses, { ...newCourse, id: Date.now() }];
      updateData('educationCertifications', { courses: updated });
      setNewCourse({
        name: '', platform: '', completionDate: '', certificateUrl: ''
      });
    }
  };

  const removeCourse = (courseId) => {
    const updated = educationCertifications.courses.filter(c => c.id !== courseId);
    updateData('educationCertifications', { courses: updated });
  };

  const canAddCertification = newCertification.name && newCertification.issuer;
  const canAddCourse = newCourse.name && newCourse.platform;

  const educationLevels = [
    'High School Diploma',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD/Doctorate',
    'Professional Degree',
    'Other'
  ];

  return (
    <div className="education-certifications-section">
      <div className="section-header">
        <h2>Education & Certifications</h2>
        <p className="section-description">
          Add your educational background and certifications to build credibility with clients.
        </p>
        <div className="points-info">
          <span className="points-badge">5 Points</span>
          <span className="points-description">(3 mandatory, 2 recommended)</span>
        </div>
      </div>

      <div className="form-content">
        {/* Highest Education - MANDATORY */}
        <div className="form-group">
          <label className="form-label mandatory-label">
            Highest Education Level
          </label>
          <p className="field-help mandatory">Basic information about your highest education</p>
          
          <div className="education-form-grid">
            <div className="form-subgroup">
              <label className="form-sublabel">Degree/Diploma</label>
              <select
                className="form-input"
                value={educationCertifications.highestEducation.degree}
                onChange={(e) => handleEducationChange('degree', e.target.value)}
                required
              >
                <option value="">Select education level</option>
                {educationLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Institution</label>
              <input
                type="text"
                className="form-input"
                value={educationCertifications.highestEducation.institution}
                onChange={(e) => handleEducationChange('institution', e.target.value)}
                placeholder="University or institution name"
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Year</label>
              <input
                type="number"
                className="form-input"
                value={educationCertifications.highestEducation.year}
                onChange={(e) => handleEducationChange('year', e.target.value)}
                placeholder="Graduation year"
                min="1900"
                max="2030"
              />
            </div>
          </div>
        </div>

        {/* Certifications - RECOMMENDED */}
        <div className="form-subsection">
          <h3 className="subsection-title">Certifications</h3>
          <p className="subsection-description">
            Add relevant certifications to showcase your expertise (optional)
          </p>

          <div className="certification-form-grid">
            <div className="form-subgroup">
              <label className="form-sublabel">Certification Name</label>
              <input
                type="text"
                className="form-input"
                value={newCertification.name}
                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Issuing Organization</label>
              <input
                type="text"
                className="form-input"
                value={newCertification.issuer}
                onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="e.g., Amazon Web Services"
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Issue Date</label>
              <input
                type="month"
                className="form-input"
                value={newCertification.issueDate}
                onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Expiration Date</label>
              <input
                type="month"
                className="form-input"
                value={newCertification.expirationDate}
                onChange={(e) => setNewCertification(prev => ({ ...prev, expirationDate: e.target.value }))}
              />
            </div>

            <div className="form-subgroup full-width">
              <label className="form-sublabel">Credential URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                value={newCertification.credentialUrl}
                onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                placeholder="https://credential-url.com"
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={addCertification} 
            className="add-button"
            disabled={!canAddCertification}
          >
            Add Certification
          </button>

          {/* Certifications List */}
          <div className="items-list">
            {educationCertifications.certifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <p className="empty-text">No certifications added yet</p>
              </div>
            ) : (
              educationCertifications.certifications.map(cert => (
                <div key={cert.id} className="item-card">
                  <div className="item-header">
                    <h4 className="item-title">{cert.name}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeCertification(cert.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-details">
                    <div className="item-detail">
                      <strong>Issuer:</strong> {cert.issuer}
                    </div>
                    {cert.issueDate && (
                      <div className="item-detail">
                        <strong>Issued:</strong> {cert.issueDate}
                      </div>
                    )}
                    {cert.expirationDate && (
                      <div className="item-detail">
                        <strong>Expires:</strong> {cert.expirationDate}
                      </div>
                    )}
                    {cert.credentialUrl && (
                      <div className="item-detail">
                        <strong>Credential:</strong> 
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="credential-link">
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Courses - RECOMMENDED */}
        <div className="form-subsection">
          <h3 className="subsection-title">Courses & Training</h3>
          <p className="subsection-description">
            Add relevant courses, workshops, or training programs (optional)
          </p>

          <div className="course-form-grid">
            <div className="form-subgroup">
              <label className="form-sublabel">Course Name</label>
              <input
                type="text"
                className="form-input"
                value={newCourse.name}
                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., React Masterclass"
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Platform/Provider</label>
              <input
                type="text"
                className="form-input"
                value={newCourse.platform}
                onChange={(e) => setNewCourse(prev => ({ ...prev, platform: e.target.value }))}
                placeholder="e.g., Coursera, Udemy, LinkedIn Learning"
              />
            </div>

            <div className="form-subgroup">
              <label className="form-sublabel">Completion Date</label>
              <input
                type="month"
                className="form-input"
                value={newCourse.completionDate}
                onChange={(e) => setNewCourse(prev => ({ ...prev, completionDate: e.target.value }))}
              />
            </div>

            <div className="form-subgroup full-width">
              <label className="form-sublabel">Certificate URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                value={newCourse.certificateUrl}
                onChange={(e) => setNewCourse(prev => ({ ...prev, certificateUrl: e.target.value }))}
                placeholder="https://certificate-url.com"
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={addCourse} 
            className="add-button"
            disabled={!canAddCourse}
          >
            Add Course
          </button>

          {/* Courses List */}
          <div className="items-list">
            {educationCertifications.courses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <p className="empty-text">No courses added yet</p>
              </div>
            ) : (
              educationCertifications.courses.map(course => (
                <div key={course.id} className="item-card">
                  <div className="item-header">
                    <h4 className="item-title">{course.name}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeCourse(course.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="item-details">
                    <div className="item-detail">
                      <strong>Platform:</strong> {course.platform}
                    </div>
                    {course.completionDate && (
                      <div className="item-detail">
                        <strong>Completed:</strong> {course.completionDate}
                      </div>
                    )}
                    {course.certificateUrl && (
                      <div className="item-detail">
                        <strong>Certificate:</strong> 
                        <a href={course.certificateUrl} target="_blank" rel="noopener noreferrer" className="credential-link">
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completion Status */}
        <div className="completion-status">
          <div className="status-row">
            <span className="status-label">Mandatory Fields:</span>
            <span className="status-count">
              {educationCertifications.highestEducation.degree ? '1/1 completed' : '0/1 completed'}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">Recommended Fields:</span>
            <span className="status-count">
              {(() => {
                const completed = [
                  educationCertifications.certifications.length > 0,
                  educationCertifications.courses.length > 0
                ].filter(Boolean).length;
                return `${completed}/2 completed`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationCertificationsSection;