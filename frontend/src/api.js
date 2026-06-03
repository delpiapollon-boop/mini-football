import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (email, password, businessName) =>
    api.post('/auth/register', { email, password, businessName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  verify: () =>
    api.get('/auth/verify'),
};

// Teams
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  addMembers: (teamId, playerIds) =>
    api.post(`/teams/${teamId}/members`, { playerIds }),
  removeMember: (teamId, memberId) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),
};

// Players
export const playersAPI = {
  getAll: (includeTemporary = false) =>
    api.get('/players', { params: { includeTemporary } }),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
};

// Matches
export const matchesAPI = {
  getAll: (filters) => api.get('/matches', { params: filters }),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
  cancel: (id) => api.delete(`/matches/${id}`),
  checkOverlap: (pitchId, matchDate, timeSlotId) =>
    api.post('/matches/check-overlap', { pitchId, matchDate, timeSlotId }),
};

// Pitches
export const pitchesAPI = {
  getAll: () => api.get('/pitches'),
  getAvailableSlots: (pitchId, date) =>
    api.get(`/pitches/${pitchId}/available`, { params: { pitchId, date } }),
  update: (id, data) => api.put(`/pitches/${id}`, data),
};

// Requests
export const requestsAPI = {
  getAll: (filters) => api.get('/requests', { params: filters }),
  create: (data) => api.post('/requests', data),
  getSuggestions: (teamId, skillLevel, requestType) =>
    api.post('/requests/suggestions', { teamId, skillLevel, requestType }),
  getPlayerSuggestions: (skillLevel, count) =>
    api.post('/requests/player-suggestions', { skillLevel, count }),
  update: (id, data) => api.put(`/requests/${id}`, data),
  cancel: (id) => api.delete(`/requests/${id}`),
};

export default api;
