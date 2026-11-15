import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  demoLogin: (username) => api.post('/auth/demo-login', { username }),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getMe: () => api.get('/api/me'),
  updateMe: (data) => api.patch('/api/me', data),
  syncGitHub: () => api.post('/api/sync'),
  updateRepo: (id, data) => api.patch(`/api/repos/${id}`, data),
  updateSkills: (skills) => api.put('/api/skills', { skills }),
  getPublicProfile: (username) => api.get(`/api/users/${username}`),
};

export const matchAPI = {
  rankDevelopers: (required, niceToHave = [], limit = 15) =>
    api.post('/api/match', { required, niceToHave, limit }),
  searchDevelopers: (params) => api.get('/api/search', { params }),
};

export const projectAPI = {
  getProjects: (params) => api.get('/api/projects', { params }),
  createProject: (data) => api.post('/api/projects', data),
  getProjectById: (id) => api.get(`/api/projects/${id}`),
  getProjectMatches: (id) => api.get(`/api/projects/${id}/matches`),
  updateProject: (id, data) => api.patch(`/api/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
};

export const requestAPI = {
  getRequests: () => api.get('/api/requests'),
  sendRequest: (data) => api.post('/api/requests', data),
  updateRequestStatus: (id, status) => api.patch(`/api/requests/${id}`, { status }),
};

export default api;
