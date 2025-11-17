import React, { useState } from 'react';
import './IndustryInnovation.css';

const IndustryInnovation = () => {
  const [activeTab, setActiveTab] = useState('skills');

  const tabs = [
    { id: 'skills', label: 'Emerging Skills' },
    { id: 'trends', label: 'Future Trends' },
    { id: 'features', label: 'Platform Features' }
  ];

  const skills = [
    {
      category: 'ai',
      icon: '🤖',
      title: 'AI & Machine Learning',
      description: 'Prompt engineering, AI model training, ML pipeline development',
      trend: { type: 'hot', label: '🔥 Hot', growth: '+320%' },
      stats: { rate: '$120/hr', projects: '2.4k' }
    },
    {
      category: 'web3',
      icon: '⛓️',
      title: 'Web3 & Blockchain',
      description: 'Smart contracts, dApp development, NFT marketplace creation',
      trend: { type: 'growing', label: '📈 Growing', growth: '+180%' },
      stats: { rate: '$95/hr', projects: '1.8k' }
    },
    {
      category: 'metaverse',
      icon: '🌐',
      title: 'Metaverse Development',
      description: 'VR/AR experiences, virtual world building, 3D environment design',
      trend: { type: 'new', label: '🆕 New', growth: '+240%' },
      stats: { rate: '$85/hr', projects: '1.2k' }
    }
  ];

  const trends = [
    {
      title: 'Remote Collaboration Evolution',
      description: '73% of companies are adopting hybrid work models, driving demand for remote collaboration tools and virtual team management specialists.',
      metrics: [
        { number: '47%', label: 'Growth in remote tools' },
        { number: '2.1x', label: 'More remote projects' }
      ]
    },
    {
      title: 'AI Integration Acceleration',
      description: '68% of businesses plan to integrate AI tools within 12 months, creating massive opportunities for AI implementation specialists.',
      metrics: [
        { number: '3.5x', label: 'AI project demand' },
        { number: '89%', label: 'Success rate increase' }
      ]
    }
  ];

  const features = {
    comparison: [
      { feature: 'AI Project Matching', ours: true, upwork: false, fiverr: false },
      { feature: 'Success Predictor', ours: true, upwork: false, fiverr: false },
      { feature: 'Blockchain Payments', ours: true, upwork: false, fiverr: false },
      { feature: 'Real-time Collaboration', ours: true, upwork: 'Limited', fiverr: false }
    ],
    exclusives: [
      {
        icon: '🛡️',
        title: 'Smart Contract Escrow',
        description: 'Blockchain-based secure payments with automated milestone releases'
      },
      {
        icon: '🎯',
        title: 'Talent Success Scoring',
        description: 'AI-powered performance prediction and quality assurance'
      },
      {
        icon: '🌍',
        title: 'Global Talent Pool',
        description: 'Access to vetted professionals from 150+ countries'
      }
    ]
  };

  return (
    <section className="innovation-section">
      <div className="container">
        <div className="section-header">
          <h2>Industry Innovation</h2>
          <p>Stay ahead with emerging technologies and platform-exclusive features</p>
        </div>

        <div className="innovation-tabs">
          <div className="tab-headers">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {/* Emerging Skills Tab */}
            {activeTab === 'skills' && (
              <div className="tab-pane active">
                <div className="skills-grid">
                  {skills.map((skill, index) => (
                    <div key={index} className="skill-card" data-category={skill.category}>
                      <div className="skill-header">
                        <div className="skill-icon">{skill.icon}</div>
                        <div className="skill-trend">
                          <span className={`trend-badge ${skill.trend.type}`}>
                            {skill.trend.label}
                          </span>
                          <span className="growth">{skill.trend.growth}</span>
                        </div>
                      </div>
                      <h3>{skill.title}</h3>
                      <p>{skill.description}</p>
                      <div className="skill-stats">
                        <div className="stat">
                          <span className="label">Avg. Rate</span>
                          <span className="value">{skill.stats.rate}</span>
                        </div>
                        <div className="stat">
                          <span className="label">Projects</span>
                          <span className="value">{skill.stats.projects}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Future Trends Tab */}
            {activeTab === 'trends' && (
              <div className="tab-pane active">
                <div className="trends-container">
                  {trends.map((trend, index) => (
                    <div key={index} className="trend-card">
                      <div className="trend-visual">
                        {index === 0 ? (
                          <div className="trend-chart">
                            <div className="chart-bar" style={{ height: '80%' }}></div>
                            <div className="chart-bar" style={{ height: '60%' }}></div>
                            <div className="chart-bar" style={{ height: '90%' }}></div>
                          </div>
                        ) : (
                          <div className="ai-adoption-gauge">
                            <div className="gauge-fill" style={{ transform: 'rotate(180deg)' }}></div>
                            <span className="gauge-value">68%</span>
                          </div>
                        )}
                      </div>
                      <div className="trend-content">
                        <h3>{trend.title}</h3>
                        <p>{trend.description}</p>
                        <div className="trend-metrics">
                          {trend.metrics.map((metric, idx) => (
                            <div key={idx} className="metric">
                              <span className="number">{metric.number}</span>
                              <span className="label">{metric.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Features Tab */}
            {activeTab === 'features' && (
              <div className="tab-pane active">
                <div className="features-comparison">
                  <div className="comparison-header">
                    <div className="platform-name">Feature</div>
                    <div className="platform-name">Our Platform</div>
                    <div className="platform-name">Upwork</div>
                    <div className="platform-name">Fiverr</div>
                  </div>

                  {features.comparison.map((feature, index) => (
                    <div key={index} className={`comparison-row ${index === 3 ? 'highlight' : ''}`}>
                      <div className="feature-name">{feature.feature}</div>
                      <div className={`feature-check ${feature.ours === true ? 'ours' : ''}`}>
                        {feature.ours === true ? '✅' : feature.ours === 'Limited' ? '⚠️' : '❌'}
                      </div>
                      <div className="feature-check">
                        {feature.upwork === true ? '✅' : feature.upwork === 'Limited' ? '⚠️' : '❌'}
                      </div>
                      <div className="feature-check">
                        {feature.fiverr === true ? '✅' : feature.fiverr === 'Limited' ? '⚠️' : '❌'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="exclusive-features">
                  <h3>Platform Exclusives</h3>
                  <div className="exclusive-grid">
                    {features.exclusives.map((feature, index) => (
                      <div key={index} className="exclusive-card">
                        <div className="exclusive-icon">{feature.icon}</div>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryInnovation;