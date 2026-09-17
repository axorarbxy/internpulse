// INTERNAL MODULE 4 FUNCTIONALITY — REST client for Module 4's API
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api',
});

// Assumes Module 1's login flow stores a JWT the whole app shares.
// Adjust the storage key to match Module 1/Module 2's actual auth implementation.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const conversationsApi = {
  list: () => api.get('/conversations'),
  create: (participantIds, internshipId) => api.post('/conversations', { participantIds, internshipId }),
  messages: (conversationId, params) => api.get(`/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, ciphertext, iv) =>
    api.post(`/conversations/${conversationId}/messages`, { ciphertext, iv }),
};

export const certificatesApi = {
  issue: (internshipId) => api.post('/certificates', { internshipId }),
  get: (id) => api.get(`/certificates/${id}`),
  downloadUrl: (id) => `${api.defaults.baseURL}/certificates/${id}/download`,
  verify: (certificateId) => api.get(`/certificates/verify/${certificateId}`),
};

export default api;
