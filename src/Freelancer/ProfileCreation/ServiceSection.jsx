import React, { useState } from 'react';
import './ServiceSection.css';

const ServicesSection = ({ data, updateData }) => {
  const { services } = data;
  
  const [newPackage, setNewPackage] = useState({
    name: '',
    type: 'basic',
    description: '',
    features: [''],
    deliveryTime: '',
    revisions: '',
    price: ''
  });

  const addServicePackage = () => {
    if (newPackage.name && newPackage.description && newPackage.price) {
      const updated = [...services.servicePackages, { ...newPackage, id: Date.now() }];
      updateData('services', { servicePackages: updated });
      setNewPackage({
        name: '', type: 'basic', description: '', features: [''], 
        deliveryTime: '', revisions: '', price: ''
      });
    }
  };

  const addFeature = () => {
    setNewPackage(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    const updatedFeatures = [...newPackage.features];
    updatedFeatures[index] = value;
    setNewPackage(prev => ({ ...prev, features: updatedFeatures }));
  };

  const removeFeature = (index) => {
    const updatedFeatures = newPackage.features.filter((_, i) => i !== index);
    setNewPackage(prev => ({ ...prev, features: updatedFeatures }));
  };

  const removePackage = (packageId) => {
    const updated = services.servicePackages.filter(p => p.id !== packageId);
    updateData('services', { servicePackages: updated });
  };

  const canAddPackage = newPackage.name && newPackage.description && newPackage.price;

  const getTypeColor = (type) => {
    const colors = {
      basic: '#3b82f6',
      standard: '#8b5cf6',
      premium: '#f59e0b',
      custom: '#ef4444'
    };
    return colors[type] || '#3b82f6';
  };

  return (
    <div className="service-section">
      <h2 className="service-section__title">Services & Pricing</h2>
      <p className="service-section__description">
        Define your service packages and pricing structure to attract the right clients and showcase your value proposition.
      </p>

      {/* Pricing Model */}
      <div className="service-section__subsection">
        <h3 className="service-section__subsection-title">Pricing Model</h3>
        <div className="service-section__pricing-options">
          <label className="service-section__pricing-option">
            <input
              type="radio"
              name="pricingModel"
              value="hourly"
              checked={services.pricingModel === 'hourly'}
              onChange={(e) => updateData('services', { pricingModel: e.target.value })}
            />
            <div className="service-section__option-content">
              <strong className="service-section__option-title">Hourly Rate</strong>
              <p className="service-section__option-description">
                Charge by the hour - perfect for ongoing projects and support work
              </p>
            </div>
            <div className="service-section__option-check">✓</div>
          </label>

          <label className="service-section__pricing-option">
            <input
              type="radio"
              name="pricingModel"
              value="fixed"
              checked={services.pricingModel === 'fixed'}
              onChange={(e) => updateData('services', { pricingModel: e.target.value })}
            />
            <div className="service-section__option-content">
              <strong className="service-section__option-title">Fixed Project Rate</strong>
              <p className="service-section__option-description">
                Charge per project - ideal for well-defined scopes and deliverables
              </p>
            </div>
            <div className="service-section__option-check">✓</div>
          </label>

          <label className="service-section__pricing-option">
            <input
              type="radio"
              name="pricingModel"
              value="package"
              checked={services.pricingModel === 'package'}
              onChange={(e) => updateData('services', { pricingModel: e.target.value })}
            />
            <div className="service-section__option-content">
              <strong className="service-section__option-title">Package Pricing</strong>
              <p className="service-section__option-description">
                Offer service packages - great for standardized services with clear value
              </p>
            </div>
            <div className="service-section__option-check">✓</div>
          </label>
        </div>
      </div>

      {/* Service Packages */}
      {services.pricingModel === 'package' && (
        <div className="service-section__subsection">
          <h3 className="service-section__subsection-title">Service Packages</h3>
          
          <div className="service-section__package-form">
            <div className="service-section__form-grid">
              <div className="service-section__form-group">
                <label className="service-section__label service-section__required">
                  Package Name
                </label>
                <input
                  type="text"
                  className="service-section__input"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Basic Website Package"
                />
              </div>

              <div className="service-section__form-group">
                <label className="service-section__label">Package Type</label>
                <select
                  className="service-section__select"
                  value={newPackage.type}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="service-section__form-group">
                <label className="service-section__label service-section__required">
                  Price (USD)
                </label>
                <input
                  type="number"
                  className="service-section__input"
                  value={newPackage.price}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="299"
                  min="0"
                  step="1"
                />
              </div>

              <div className="service-section__form-group">
                <label className="service-section__label">Delivery Time</label>
                <input
                  type="text"
                  className="service-section__input"
                  value={newPackage.deliveryTime}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, deliveryTime: e.target.value }))}
                  placeholder="e.g., 2 weeks, 5-7 business days"
                />
              </div>

              <div className="service-section__form-group">
                <label className="service-section__label">Revisions Included</label>
                <input
                  type="text"
                  className="service-section__input"
                  value={newPackage.revisions}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, revisions: e.target.value }))}
                  placeholder="e.g., 2 rounds, Unlimited revisions"
                />
              </div>

              <div className="service-section__form-group service-section__form-group--full">
                <label className="service-section__label service-section__required">
                  Package Description
                </label>
                <textarea
                  className="service-section__textarea"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what clients get with this package, the value they'll receive, and the problems you'll solve for them..."
                  rows="3"
                />
              </div>

              {/* Features */}
              <div className="service-section__form-group service-section__form-group--full">
                <label className="service-section__label">What's Included</label>
                <div className="service-section__feature-group">
                  {newPackage.features.map((feature, index) => (
                    <div key={index} className="service-section__feature-input">
                      <input
                        type="text"
                        className="service-section__feature-input-field"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., Responsive design, SEO optimization, 3 pages"
                      />
                      {newPackage.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="service-section__feature-remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addFeature} className="service-section__add-feature">
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={addServicePackage} 
              className="service-section__add-package"
              disabled={!canAddPackage}
            >
              Add Service Package
            </button>
          </div>

          {/* Packages List */}
          <div className="service-section__packages-list">
            <div className="service-section__packages-title">
              Your Service Packages
              <span className="service-section__packages-count">
                {services.servicePackages.length} package{services.servicePackages.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="service-section__packages-grid">
              {services.servicePackages.length === 0 ? (
                <div className="service-section__empty-state">
                  <div className="service-section__empty-icon">💼</div>
                  <p className="service-section__empty-text">No service packages added yet</p>
                  <p className="service-section__empty-subtext">
                    Create your first service package to showcase your offerings
                  </p>
                </div>
              ) : (
                services.servicePackages.map(pkg => (
                  <div key={pkg.id} className="service-section__package-card">
                    <div className="service-section__package-header">
                      <div className="service-section__package-info">
                        <h5 className="service-section__package-name">{pkg.name}</h5>
                        <span 
                          className="service-section__package-type"
                          style={{ 
                            background: `linear-gradient(135deg, ${getTypeColor(pkg.type)}20 0%, ${getTypeColor(pkg.type)}10 100%)`,
                            color: getTypeColor(pkg.type),
                            borderColor: `${getTypeColor(pkg.type)}40`
                          }}
                        >
                          {pkg.type}
                        </span>
                      </div>
                      <div>
                        <div className="service-section__package-price">
                          ${pkg.price}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePackage(pkg.id)}
                          className="service-section__package-remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="service-section__package-description">{pkg.description}</p>
                    {pkg.features.filter(f => f.trim()).length > 0 && (
                      <ul className="service-section__features-list">
                        {pkg.features.filter(f => f.trim()).map((feature, index) => (
                          <li key={index} className="service-section__feature-item">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    {(pkg.deliveryTime || pkg.revisions) && (
                      <div className="service-section__package-meta">
                        {pkg.deliveryTime && (
                          <div className="service-section__meta-item">
                            Delivery: {pkg.deliveryTime}
                          </div>
                        )}
                        {pkg.revisions && (
                          <div className="service-section__meta-item">
                            Revisions: {pkg.revisions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Preferences */}
      <div className="service-section__subsection">
        <h3 className="service-section__subsection-title">Service Preferences</h3>
        
        <div className="service-section__form-grid">
          <div className="service-section__form-group">
            <label className="service-section__label">Preferred Project Types</label>
            <select multiple className="service-section__select">
              <option value="short-term">Short-term projects</option>
              <option value="long-term">Long-term collaborations</option>
              <option value="one-time">One-time projects</option>
              <option value="ongoing">Ongoing support</option>
            </select>
            <small style={{color: '#64748b', fontSize: '0.8rem', marginTop: '4px'}}>
              Hold Ctrl to select multiple options
            </small>
          </div>

          <div className="service-section__form-group">
            <label className="service-section__label">Team Size Preference</label>
            <select className="service-section__select">
              <option value="">No preference</option>
              <option value="solo">Work solo</option>
              <option value="small-team">Small team (2-5 people)</option>
              <option value="large-team">Large team (5+ people)</option>
            </select>
          </div>

          <div className="service-section__form-group">
            <label className="service-section__label">Communication Preference</label>
            <select className="service-section__select">
              <option value="email">Email</option>
              <option value="video-call">Video calls</option>
              <option value="chat">Chat/messaging</option>
              <option value="phone">Phone calls</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;