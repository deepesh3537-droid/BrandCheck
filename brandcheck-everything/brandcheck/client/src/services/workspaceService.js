import { apiFetch } from './apiClient.js';

export const workspaceService = {
  /**
   * Fetch all workspaces the current user belongs to
   * @returns {Promise<Array>}
   */
  async getWorkspaces() {
    const data = await apiFetch('/workspaces');
    return data.workspaces;
  },

  /**
   * Fetch a single workspace by ID
   * @param {string} workspaceId
   * @returns {Promise<Object>}
   */
  async getWorkspace(workspaceId) {
    const data = await apiFetch(`/workspaces/${workspaceId}`);
    return data.workspace;
  },

  /**
   * Create a new workspace
   * @param {{ name: string }} payload
   * @returns {Promise<Object>}
   */
  async createWorkspace({ name }) {
    const data = await apiFetch('/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return data.workspace;
  },

  /**
   * Fetch members of a workspace
   * @param {string} workspaceId
   * @returns {Promise<Array>}
   */
  async getWorkspaceMembers(workspaceId) {
    const data = await apiFetch(`/workspaces/${workspaceId}/members`);
    return data.members;
  },
};
