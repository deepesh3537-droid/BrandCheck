import { apiFetch } from './apiClient.js';

export const sourceService = {
  /**
   * List brand sources in workspace
   * @param {string} workspaceId
   * @param {{ type?: string }} [params]
   * @returns {Promise<Array>}
   */
  async getSources(workspaceId, params = {}) {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    const qs = query.toString() ? `?${query.toString()}` : '';

    const data = await apiFetch(`/workspaces/${workspaceId}/sources${qs}`);
    return data.sources;
  },

  /**
   * Create a new brand source item
   * @param {string} workspaceId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createSource(workspaceId, payload) {
    const data = await apiFetch(`/workspaces/${workspaceId}/sources`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.source;
  },

  /**
   * Seed workspace with default Verdant Botanicals brand rules
   * @param {string} workspaceId
   * @returns {Promise<{ count: number, sources: Array }>}
   */
  async seedSources(workspaceId) {
    const data = await apiFetch(`/workspaces/${workspaceId}/sources/seed`, {
      method: 'POST',
    });
    return data;
  },

  /**
   * Update existing source
   * @param {string} workspaceId
   * @param {string} sourceId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSource(workspaceId, sourceId, updates) {
    const data = await apiFetch(`/workspaces/${workspaceId}/sources/${sourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return data.source;
  },

  /**
   * Delete source item
   * @param {string} workspaceId
   * @param {string} sourceId
   * @returns {Promise<void>}
   */
  async deleteSource(workspaceId, sourceId) {
    await apiFetch(`/workspaces/${workspaceId}/sources/${sourceId}`, {
      method: 'DELETE',
    });
  },
};
