import { apiFetch } from './apiClient.js';

export const contentService = {
  /**
   * Submit new draft content
   * @param {string} workspaceId
   * @param {{ title: string, body: string }} payload
   * @returns {Promise<Object>}
   */
  async createContent(workspaceId, payload) {
    return await apiFetch(`/workspaces/${workspaceId}/contents`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * List all content submissions in workspace
   * @param {string} workspaceId
   * @returns {Promise<Array>}
   */
  async getContents(workspaceId) {
    const data = await apiFetch(`/workspaces/${workspaceId}/contents`);
    return data.contents;
  },

  /**
   * Get single content with current version
   * @param {string} workspaceId
   * @param {string} contentId
   * @returns {Promise<Object>}
   */
  async getContent(workspaceId, contentId) {
    const data = await apiFetch(`/workspaces/${workspaceId}/contents/${contentId}`);
    return data.content;
  },

  /**
   * Get revision history versions for a content item
   * @param {string} workspaceId
   * @param {string} contentId
   * @returns {Promise<Array>}
   */
  async getContentVersions(workspaceId, contentId) {
    const data = await apiFetch(`/workspaces/${workspaceId}/contents/${contentId}/versions`);
    return data.versions;
  },

  /**
   * Create next revision version
   * @param {string} workspaceId
   * @param {string} contentId
   * @param {{ body: string }} payload
   * @returns {Promise<Object>}
   */
  async createVersion(workspaceId, contentId, payload) {
    const data = await apiFetch(`/workspaces/${workspaceId}/contents/${contentId}/versions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.version;
  },
};
