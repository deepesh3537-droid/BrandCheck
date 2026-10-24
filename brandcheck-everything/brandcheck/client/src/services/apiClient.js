const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Universal fetch wrapper enforcing JSON & credential cookies
 * @param {string} endpoint - e.g. '/auth/login'
 * @param {RequestInit} [options]
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('brandcheck_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends and receives httpOnly auth cookies
  });

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('brandcheck_token', data.token);
    }
  } else {
    data = await response.text();
  }

  if (endpoint === '/auth/logout' && typeof window !== 'undefined') {
    localStorage.removeItem('brandcheck_token');
  }

  if (!response.ok) {
    if (response.status === 401 && endpoint !== '/auth/me' && typeof window !== 'undefined') {
      localStorage.removeItem('brandcheck_token');
    }
    const error = new Error(data?.error?.message || response.statusText || 'Request failed');
    error.status = response.status;
    error.code = data?.error?.code || 'REQUEST_FAILED';
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}
