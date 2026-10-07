// Base API URL (proxied by Vite to http://localhost:5000)
const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({ message: 'Invalid JSON response from server' }));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Health & Dashboard
  getHealth: () => fetch(`${API_BASE}/health`).then(handleResponse),
  getDashboardStats: () => fetch(`${API_BASE}/dashboard/stats`).then(handleResponse),

  // Authors
  getAuthors: () => fetch(`${API_BASE}/authors`).then(handleResponse),
  getAuthorById: (id) => fetch(`${API_BASE}/authors/${id}`).then(handleResponse),
  createAuthor: (authorData) => fetch(`${API_BASE}/authors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authorData)
  }).then(handleResponse),
  deleteAuthor: (id) => fetch(`${API_BASE}/authors/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Papers
  getPapers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/papers${query ? `?${query}` : ''}`).then(handleResponse);
  },
  getPaperById: (id) => fetch(`${API_BASE}/papers/${id}`).then(handleResponse),
  createPaper: (paperData) => fetch(`${API_BASE}/papers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paperData)
  }).then(handleResponse),
  deletePaper: (id) => fetch(`${API_BASE}/papers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Reviewers
  getReviewers: () => fetch(`${API_BASE}/reviewers`).then(handleResponse),
  getReviewerById: (id) => fetch(`${API_BASE}/reviewers/${id}`).then(handleResponse),
  createReviewer: (reviewerData) => fetch(`${API_BASE}/reviewers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewerData)
  }).then(handleResponse),
  deleteReviewer: (id) => fetch(`${API_BASE}/reviewers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Reviews
  getReviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/reviews${query ? `?${query}` : ''}`).then(handleResponse);
  },
  getReviewById: (id) => fetch(`${API_BASE}/reviews/${id}`).then(handleResponse),
  createReview: (reviewData) => fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  }).then(handleResponse),
  deleteReview: (id) => fetch(`${API_BASE}/reviews/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Conferences
  getConferences: () => fetch(`${API_BASE}/conferences`).then(handleResponse),
  getConferenceById: (id) => fetch(`${API_BASE}/conferences/${id}`).then(handleResponse),
  createConference: (confData) => fetch(`${API_BASE}/conferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(confData)
  }).then(handleResponse),
  deleteConference: (id) => fetch(`${API_BASE}/conferences/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Decisions
  getDecisions: () => fetch(`${API_BASE}/decisions`).then(handleResponse),
  createDecision: (decisionData) => fetch(`${API_BASE}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decisionData)
  }).then(handleResponse),
  deleteDecision: (id) => fetch(`${API_BASE}/decisions/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Query Console
  getQueryPresets: () => fetch(`${API_BASE}/query/presets`).then(handleResponse),
  executeQuery: (sql) => fetch(`${API_BASE}/query/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  }).then(handleResponse)
};
