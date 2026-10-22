import { apiFetch } from './apiClient.js';

export const reviewService = {
  /**
   * Run or retrieve review for a specific content item
   * @param {string} contentId
   * @returns {Promise<{ review: Object }>}
   */
  async triggerReview(contentId) {
    return await apiFetch(`/contents/${contentId}/reviews`, {
      method: 'POST',
    });
  },

  /**
   * Get review by reviewId with all findings and cited sources
   * @param {string} reviewId
   * @returns {Promise<{ review: Object }>}
   */
  async getReview(reviewId) {
    return await apiFetch(`/reviews/${reviewId}`);
  },

  /**
   * Record human decision on a finding (accept, edit, reject, defer, challenge)
   * @param {string} findingId
   * @param {{ decision: string, decision_text?: string, decision_note?: string }} payload
   * @returns {Promise<{ finding: Object }>}
   */
  async recordDecision(findingId, payload) {
    return await apiFetch(`/findings/${findingId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
