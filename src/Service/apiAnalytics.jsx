// src/services/apiAnalytics.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper: attach token
 */
const getAuthHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const fetchOverview = (token) =>
  axios.get(`${API_URL}/api/client/analytics/overview`, getAuthHeader(token));

export const fetchJobTrends = (token, { months = 6 } = {}) =>
  axios.get(`${API_URL}/api/client/analytics/job-trends?months=${months}`, getAuthHeader(token));

export const fetchFinancial = (token, { months = 12 } = {}) =>
  axios.get(`${API_URL}/api/client/analytics/financial?months=${months}`, getAuthHeader(token));

export const fetchProposalStats = (token) =>
  axios.get(`${API_URL}/api/client/analytics/proposal-stats`, getAuthHeader(token));

export const fetchProjectPerformance = (token) =>
  axios.get(`${API_URL}/api/client/analytics/project-performance`, getAuthHeader(token));
