/**
 * Dashboard Service - Handles all dashboard-related API calls for streamers
 */

import config from '../config';

class DashboardService {
  constructor() {
    this.coreServer = config.core.server;
    this.chatServer = config.chat.server;
  }

  /**
   * Get stream statistics for the authenticated user
   * @param {string} username - The streamer's Hive username
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Stream statistics
   */
  async getStreamStats(username, authToken) {
    try {
      const response = await fetch(
        `${this.coreServer}/api/streams/stats/${encodeURIComponent(username)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stream stats: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        currentViewers: data.currentViewers || 0,
        peakViewers: data.peakViewers || 0,
        totalWatchTime: data.totalWatchTime || 0,
        newFollowers: data.newFollowers || 0,
        chatMessageRate: data.chatMessageRate || 0,
        uptime: data.uptime || 0,
        isLive: data.isLive || false
      };
    } catch (error) {
      console.error('Error fetching stream stats:', error);
      // Return mock data for development
      return {
        currentViewers: Math.floor(Math.random() * 100),
        peakViewers: Math.floor(Math.random() * 200),
        totalWatchTime: Math.floor(Math.random() * 10000),
        newFollowers: Math.floor(Math.random() * 20),
        chatMessageRate: Math.floor(Math.random() * 50),
        uptime: Date.now() - (Math.random() * 3600000),
        isLive: true
      };
    }
  }

  /**
   * Get follower growth data for charts
   * @param {string} username - The streamer's Hive username
   * @param {string} authToken - JWT authentication token
   * @param {number} days - Number of days to fetch (default: 7)
   * @returns {Promise<Array>} Follower growth data
   */
  async getFollowerGrowth(username, authToken, days = 7) {
    try {
      const response = await fetch(
        `${this.coreServer}/api/streams/followers/growth/${encodeURIComponent(username)}?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch follower growth: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching follower growth:', error);
      // Return mock data for development
      const mockData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          followers: Math.floor(Math.random() * 50) + 100
        });
      }
      return mockData;
    }
  }

  /**
   * Update stream settings
   * @param {string} username - The streamer's Hive username
   * @param {Object} settings - Stream settings to update
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Updated settings
   */
  async updateStreamSettings(username, settings, authToken) {
    try {
      const response = await fetch(
        `${this.coreServer}/api/streams/settings/${encodeURIComponent(username)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stream settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating stream settings:', error);
      throw error;
    }
  }

  /**
   * Get chat moderation settings
   * @param {string} username - The streamer's Hive username
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Moderation settings
   */
  async getChatModerationSettings(username, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/config/${encodeURIComponent(username)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch moderation settings: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        slowMode: data.slowMode || false,
        slowModeDelay: data.slowModeDelay || 0,
        followersOnly: data.followersOnly || false,
        emoteOnly: data.emoteOnly || false,
        moderators: data.moderators || []
      };
    } catch (error) {
      console.error('Error fetching moderation settings:', error);
      return {
        slowMode: false,
        slowModeDelay: 0,
        followersOnly: false,
        emoteOnly: false,
        moderators: []
      };
    }
  }

  /**
   * Update chat moderation settings
   * @param {string} username - The streamer's Hive username
   * @param {Object} settings - Moderation settings to update
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Updated settings
   */
  async updateChatModerationSettings(username, settings, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/config/${encodeURIComponent(username)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update moderation settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating moderation settings:', error);
      throw error;
    }
  }

  /**
   * Ban a user from chat
   * @param {string} channelUsername - The channel owner's username
   * @param {string} targetUsername - The user to ban
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Ban result
   */
  async banUser(channelUsername, targetUsername, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/ban/${encodeURIComponent(channelUsername)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: targetUsername })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to ban user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  /**
   * Timeout a user from chat
   * @param {string} channelUsername - The channel owner's username
   * @param {string} targetUsername - The user to timeout
   * @param {number} duration - Timeout duration in seconds
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Timeout result
   */
  async timeoutUser(channelUsername, targetUsername, duration, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/timeout/${encodeURIComponent(channelUsername)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: targetUsername, duration })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to timeout user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error timing out user:', error);
      throw error;
    }
  }

  /**
   * Unban a user from chat
   * @param {string} channelUsername - The channel owner's username
   * @param {string} targetUsername - The user to unban
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Unban result
   */
  async unbanUser(channelUsername, targetUsername, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/unban/${encodeURIComponent(channelUsername)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: targetUsername })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unban user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  /**
   * Get list of banned users
   * @param {string} username - The channel owner's username
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Array>} List of banned users
   */
  async getBannedUsers(username, authToken) {
    try {
      const response = await fetch(
        `${this.chatServer}/api/chat/banned/${encodeURIComponent(username)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch banned users: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching banned users:', error);
      return [];
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;
