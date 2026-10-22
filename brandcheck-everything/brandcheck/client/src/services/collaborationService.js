import { apiFetch } from './apiClient.js';

export const collaborationService = {
  /**
   * Create an invitation link for a workspace (Owner only)
   */
  async createInvitation(workspaceId, { role = 'reviewer', expiresInHours = 72 }) {
    return await apiFetch(`/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ role, expiresInHours }),
    });
  },

  /**
   * Inspect invitation by token
   */
  async getInvitation(token) {
    return await apiFetch(`/invitations/${token}`);
  },

  /**
   * Accept an invitation and join workspace
   */
  async acceptInvitation(token) {
    return await apiFetch(`/invitations/${token}/accept`, {
      method: 'POST',
    });
  },

  /**
   * Add comment to review or specific finding
   */
  async addComment(reviewId, { findingId = null, body }) {
    return await apiFetch(`/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ findingId, body }),
    });
  },

  /**
   * Get all comments for a review
   */
  async getComments(reviewId) {
    const data = await apiFetch(`/reviews/${reviewId}/comments`);
    return data.comments || [];
  },

  /**
   * Sign-off: approve review or request changes (enforces ADR-020)
   */
  async updateStatus(reviewId, { status, note }) {
    return await apiFetch(`/reviews/${reviewId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    });
  },

  /**
   * Get append-only audit trail events
   */
  async getEvents(reviewId) {
    const data = await apiFetch(`/reviews/${reviewId}/events`);
    return data.events || [];
  },
};
