// FindWork.jsx - OPTIMIZED VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaMoneyBillWave, FaClock,
  FaMapMarkerAlt, FaStar, FaBookmark, FaBriefcase,
  FaCalendar, FaUser, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import './FindWork.css';

const FindWork = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states (separate to prevent unnecessary re-renders)
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [projectType, setProjectType] = useState('');
  const [location, setLocation] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    skills: [],
    experienceLevels: [],
    projectTypes: [],
    budgetRange: { minBudget: 0, maxBudget: 100000 }
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    totalAmount: '',
    estimatedDays: ''
  });

  // Refs for optimization
  const initialMount = useRef(true);
  const searchTimeout = useRef(null);

  // Memoized fetch function
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build params
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        minBudget: minBudget || undefined,
        maxBudget: maxBudget || undefined,
        experienceLevel: experienceLevel || undefined,
        projectType: projectType || undefined,
        location: location || undefined,
        skills: skillsInput || undefined
      };

      // Remove undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get('http://localhost:3000/api/freelancer/jobs/browse', {
        headers: { 'Authorization': `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalJobs: response.data.totalJobs,
          hasNextPage: response.data.hasNextPage,
          hasPrevPage: response.data.hasPrevPage
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, minBudget, maxBudget, experienceLevel, projectType, location, skillsInput, pagination.currentPage]);

  // Initial fetch only on mount
  useEffect(() => {
    const initData = async () => {
      await fetchFilterOptions();
      await fetchJobs();
      initialMount.current = false;
    };
    initData();

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Debounced filter effect
  useEffect(() => {
    if (initialMount.current) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      // Reset to page 1 when filters change
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      fetchJobs();
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, category, minBudget, maxBudget, experienceLevel, projectType, location, skillsInput]);

  // Page change effect
  useEffect(() => {
    if (initialMount.current) return;
    fetchJobs();
  }, [pagination.currentPage]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/freelancer/jobs/filters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Filter handlers
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleMinBudgetChange = (e) => setMinBudget(e.target.value);
  const handleMaxBudgetChange = (e) => setMaxBudget(e.target.value);
  const handleExperienceLevelChange = (e) => setExperienceLevel(e.target.value);
  const handleProjectTypeChange = (e) => setProjectType(e.target.value);
  const handleLocationChange = (e) => setLocation(e.target.value);
  const handleSkillsChange = (e) => setSkillsInput(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Immediate search
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchJobs();
  };

  const handleJobClick = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/freelancer/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedJob(response.data.job);
        setShowJobModal(true);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleApplyJob = (job) => {
    setApplyingJob(job);
    setProposalData({
      coverLetter: '',
      totalAmount: job.budget || '',
      estimatedDays: job.duration || 30
    });
  };

  // FIXED Proposal Submission
  const submitProposal = async () => {
    try {
      const token = localStorage.getItem('token');

      // Generate proposal ID
      const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await axios.post('http://localhost:3000/api/freelancer/proposals',
        {
          projectId: applyingJob._id,
          serviceCategory: applyingJob.category || 'General',
          coverLetter: proposalData.coverLetter,
          proposalDetails: {
            coverLetter: proposalData.coverLetter,
            totalAmount: parseFloat(proposalData.totalAmount) || 0,
            estimatedDays: parseInt(proposalData.estimatedDays) || 30,
            estimatedHours: (parseInt(proposalData.estimatedDays) || 30) * 8, // 8 hours per day
            deliveryTime: `${proposalData.estimatedDays || 30} days`
          }
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Proposal submitted successfully!');
        setApplyingJob(null);
        setProposalData({ coverLetter: '', totalAmount: '', estimatedDays: '' });
        fetchJobs(); // Refresh jobs
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert(error.response?.data?.message || 'Error submitting proposal');
    }
  };

  const saveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/freelancer/jobs/${jobId}/save`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setJobs(prev => prev.map(job =>
        job._id === jobId ? { ...job, isSaved: true } : job
      ));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setSkillsInput('');
    setMinBudget('');
    setMaxBudget('');
    setExperienceLevel('');
    setProjectType('');
    setLocation('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Job Card Component
  const JobCard = ({ job }) => {
    // Helper function to get client initial
    // In JobCard component - SIMPLIFIED:
    const getClientInitial = () => {
      if (job.clientName) return job.clientName.charAt(0);
      if (job.clientId?.name) return job.clientId.name.charAt(0);
      return 'C';
    };

    const getClientName = () => {
      if (job.clientName) return job.clientName;
      if (job.clientId?.name) return job.clientId.name;
      return 'Client'; // Simpler default
    };

    const getClientRating = () => {
      if (job.clientRating) return job.clientRating;
      if (job.client?.rating) return job.client.rating;
      return null;
    };

    return (
      <div className="job-card">
        <div className="job-card-header">
          <div className="job-title-section">
            <h3 onClick={() => handleJobClick(job._id)} className="job-title">
              {job.title}
            </h3>
            <button
              className={`save-btn ${job.isSaved ? 'saved' : ''}`}
              onClick={() => saveJob(job._id)}
            >
              <FaBookmark />
            </button>
          </div>
          <div className="job-budget">${job.budget?.toLocaleString() || 0}</div>
        </div>

        <p className="job-description">
          {job.description?.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description || 'No description provided'
          }
        </p>

        <div className="job-meta">
          <div className="meta-item">
            <FaClock />
            <span>{job.duration || 'N/A'} days</span>
          </div>
          <div className="meta-item">
            <FaBriefcase />
            <span>{job.experienceLevel || 'Not specified'}</span>
          </div>
          {job.location && (
            <div className="meta-item">
              <FaMapMarkerAlt />
              <span>{job.location}</span>
            </div>
          )}
        </div>

        <div className="job-skills">
          {job.skillsRequired?.slice(0, 4).map((skill, index) => (
            <span key={index} className="skill-tag">{skill}</span>
          ))}
          {job.skillsRequired?.length > 4 && (
            <span className="skill-more">+{job.skillsRequired.length - 4} more</span>
          )}
          {(!job.skillsRequired || job.skillsRequired.length === 0) && (
            <span className="skill-tag">No skills specified</span>
          )}
        </div>

        <div className="job-client">
          <div className="client-info">
            <div className="client-avatar">
              {getClientInitial()}
            </div>
            <div className="client-details">
              <span className="client-name">{getClientName()}</span>
              {getClientRating() && (
                <span className="client-rating">
                  <FaStar /> {getClientRating()}
                </span>
              )}
            </div>
          </div>
          <div className="job-actions">
            {job.hasApplied ? (
              <button className="btn-applied" disabled>
                <FaCheckCircle /> Applied
              </button>
            ) : (
              <button
                className="btn-apply"
                onClick={() => handleApplyJob(job)}
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        <div className="job-footer">
          <span className="proposal-count">
            {job.proposalCount || 0} proposal{job.proposalCount !== 1 ? 's' : ''}
          </span>
          <span className="post-date">
            {job.createdAt ? `Posted ${new Date(job.createdAt).toLocaleDateString()}` : 'Recently posted'}
          </span>
        </div>
      </div>
    );
  };
  // Filters Sidebar
  const FiltersSidebar = () => (
    <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="close-filters" onClick={() => setShowFilters(false)}>
          <FaTimes />
        </button>
      </div>

      <div className="filter-group">
        <label>Budget Range</label>
        <div className="budget-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minBudget}
            onChange={handleMinBudgetChange}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxBudget}
            onChange={handleMaxBudgetChange}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select value={category} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {filterOptions.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Experience Level</label>
        <select value={experienceLevel} onChange={handleExperienceLevelChange}>
          <option value="">Any Level</option>
          {filterOptions.experienceLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Project Type</label>
        <select value={projectType} onChange={handleProjectTypeChange}>
          <option value="">Any Type</option>
          {filterOptions.projectTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Skills</label>
        <input
          type="text"
          placeholder="e.g., React, Node.js, Design"
          value={skillsInput}
          onChange={handleSkillsChange}
        />
      </div>

      <div className="filter-group">
        <label>Location</label>
        <input
          type="text"
          placeholder="Any location"
          value={location}
          onChange={handleLocationChange}
        />
      </div>

      <button className="btn-clear-filters" onClick={clearAllFilters}>
        Clear All Filters
      </button>
    </div>
  );

  // Job Details Modal
  const JobDetailsModal = () => (
    <div className={`modal ${showJobModal ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{selectedJob?.title}</h2>
          <button className="close-modal" onClick={() => setShowJobModal(false)}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="job-details-grid">
            <div className="main-content">
              <div className="job-description-full">
                <h3>Job Description</h3>
                <p>{selectedJob?.description}</p>
              </div>

              <div className="job-requirements">
                <h3>Skills Required</h3>
                <div className="skills-list">
                  {selectedJob?.skillsRequired?.map((skill, index) => (
                    <span key={index} className="skill-tag large">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="sidebar-content">
              <div className="job-info-card">
                <h4>Job Details</h4>
                <div className="info-item">
                  <FaMoneyBillWave />
                  <span>Budget: ${selectedJob?.budget}</span>
                </div>
                <div className="info-item">
                  <FaClock />
                  <span>Duration: {selectedJob?.duration} days</span>
                </div>
                <div className="info-item">
                  <FaBriefcase />
                  <span>Level: {selectedJob?.experienceLevel}</span>
                </div>
                <div className="info-item">
                  <FaCalendar />
                  <span>Deadline: {new Date(selectedJob?.deadline).toLocaleDateString()}</span>
                </div>
                {selectedJob?.location && (
                  <div className="info-item">
                    <FaMapMarkerAlt />
                    <span>Location: {selectedJob.location}</span>
                  </div>
                )}
              </div>

              <div className="client-info-card">
                <h4>Client Information</h4>
                <div className="client-detail">
                  <div className="client-avatar large">
                    {selectedJob?.clientName?.charAt(0) ||
                      selectedJob?.clientId?.name?.charAt(0) ||
                      'C'}
                  </div>
                  <div className="client-info">
                    <span className="client-name">
                      {selectedJob?.clientName ||
                        selectedJob?.clientId?.name ||
                        'Client'}
                    </span>
                    {selectedJob?.clientRating && (
                      <span className="client-rating">
                        <FaStar /> {selectedJob.clientRating} Rating
                      </span>
                    )}
                  </div>
                </div>
                <div className="client-stats">
                  <span>{selectedJob?.clientId?.totalProjects || 0} Projects</span>
                  <span>Member since {new Date(selectedJob?.clientId?.createdAt).getFullYear()}</span>
                </div>
              </div>

              {!selectedJob?.hasApplied ? (
                <button
                  className="btn-apply-large"
                  onClick={() => handleApplyJob(selectedJob)}
                >
                  Apply for this Job
                </button>
              ) : (
                <button className="btn-applied-large" disabled>
                  <FaCheckCircle /> Already Applied
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Proposal Modal
  const ProposalModal = () => (
    <div className={`modal ${applyingJob ? 'show' : ''}`}>
      <div className="modal-content proposal-modal">
        <div className="modal-header">
          <h2>Submit Proposal for {applyingJob?.title}</h2>
          <button className="close-modal" onClick={() => setApplyingJob(null)}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Cover Letter *</label>
            <textarea
              value={proposalData.coverLetter}
              onChange={(e) => setProposalData(prev => ({
                ...prev,
                coverLetter: e.target.value
              }))}
              placeholder="Describe why you're the best fit for this project..."
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Proposed Amount ($) *</label>
              <input
                type="number"
                value={proposalData.totalAmount}
                onChange={(e) => setProposalData(prev => ({
                  ...prev,
                  totalAmount: e.target.value
                }))}
                placeholder="Enter your proposed amount"
              />
            </div>

            <div className="form-group">
              <label>Estimated Days *</label>
              <input
                type="number"
                value={proposalData.estimatedDays}
                onChange={(e) => setProposalData(prev => ({
                  ...prev,
                  estimatedDays: e.target.value
                }))}
                placeholder="Days to complete"
              />
            </div>
          </div>

          <div className="proposal-summary">
            <h4>Job Summary</h4>
            <p><strong>Budget:</strong> ${applyingJob?.budget}</p>
            <p><strong>Duration:</strong> {applyingJob?.duration} days</p>
            <p><strong>Category:</strong> {applyingJob?.category || 'General'}</p>
            <p><strong>Skills:</strong> {applyingJob?.skillsRequired?.join(', ')}</p>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setApplyingJob(null)}>
              Cancel
            </button>
            <button
              className="btn-submit"
              onClick={submitProposal}
              disabled={!proposalData.coverLetter || !proposalData.totalAmount || !proposalData.estimatedDays}
            >
              Submit Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="find-work-container">
      <div className="find-work-header">
        <div className="header-content">
          <h1>Find Work</h1>
          <p>Discover projects that match your skills and interests</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="search-bar-large">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search jobs by title, skills, or keywords..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>
      </div>

      <div className="find-work-content">
        <FiltersSidebar />

        <div className="main-content">
          <div className="content-header">
            <div className="results-info">
              <h2>Available Jobs</h2>
              <span className="results-count">{pagination.totalJobs} jobs found</span>
            </div>

            <div className="content-actions">
              <button
                className="btn-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-jobs">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <FaBriefcase className="no-jobs-icon" />
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button className="btn-clear-filters" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-pagination"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      currentPage: prev.currentPage - 1
                    }))}
                  >
                    Previous
                  </button>

                  <span className="page-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    className="btn-pagination"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPagination(prev => ({
                      ...prev,
                      currentPage: prev.currentPage + 1
                    }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <JobDetailsModal />
      <ProposalModal />
    </div>
  );
};

export default FindWork;