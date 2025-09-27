/**
 * Channel settings service for managing user's stream channel settings
 */

import config from '../config';

class ChannelSettingsService {
  /**
   * Get the authenticated user's channel settings
   */
  async getChannelSettings() {
    try {
      const token = localStorage.getItem('vimm-auth-token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${config.core.server}/api/channels/my-channel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch channel settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel settings:', error);
      throw error;
    }
  }

  /**
   * Update the authenticated user's channel settings
   */
  async updateChannelSettings(settings) {
    try {
      const token = localStorage.getItem('vimm-auth-token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${config.core.server}/api/channels/my-channel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update channel settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating channel settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
const channelSettingsService = new ChannelSettingsService();
export default channelSettingsService;
