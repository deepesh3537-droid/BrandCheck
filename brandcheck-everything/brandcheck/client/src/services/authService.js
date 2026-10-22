import { apiFetch } from './apiClient.js';

export const authService = {
  async register({ email, password, displayName }) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    return res.user;
  },

  async login({ email, password }) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.user;
  },

  async logout() {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    const res = await apiFetch('/auth/me');
    return res.user;
  },
};
