export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken() {
  return window.localStorage.getItem('internpulse_token');
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem('internpulse_token', token);
  } else {
    window.localStorage.removeItem('internpulse_token');
  }
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || payload.detail || `Request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export default apiRequest;
