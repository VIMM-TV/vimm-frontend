/**
 * Chat Service - Handles all chat-related API calls
 * Implements the vimm-chat API integration as per CHAT_INTEGRATION_SPEC.md
 */

import config from '../config';

class ChatService {
  constructor() {
    this.chatApiBase = config.chat.server;
  }

  /**
   * Get chat messages for a channel
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {number} limit - Number of messages to return (default: 50, max: 100)
   * @param {string} before - ISO timestamp to get messages before
   * @param {string} after - ISO timestamp to get messages after
   * @returns {Promise<Array>} Array of message objects
   */
  async getMessages(hiveAccount, limit = 50, before = null, after = null) {
    try {
      let url = `${this.chatApiBase}/api/chat/messages/${hiveAccount}?limit=${limit}`;
      
      if (before) {
        url += `&before=${before}`;
      }
      if (after) {
        url += `&after=${after}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  /**
   * Send a chat message
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} message - Message content
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Response with message data
   */
  async sendMessage(hiveAccount, message, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/messages/${hiveAccount}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Delete a chat message (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} messageId - ID of message to delete
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Success response
   */
  async deleteMessage(hiveAccount, messageId, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/messages/${hiveAccount}/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }
  }

  /**
   * Get chat configuration for a channel
   * @param {string} hiveAccount - Channel owner's Hive username
   * @returns {Promise<Object>} Chat configuration object
   */
  async getConfig(hiveAccount) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/config/${hiveAccount}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chat config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat config:', error);
      throw error;
    }
  }

  /**
   * Update chat configuration (owner only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {Object} config - Configuration object
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Updated configuration
   */
  async updateConfig(hiveAccount, configData, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/config/${hiveAccount}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(configData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update chat config');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating chat config:', error);
      throw error;
    }
  }

  /**
   * Ban a user from chat (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} username - Username to ban
   * @param {string} reason - Reason for ban
   * @param {number|null} duration - Ban duration in seconds (null = permanent)
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Ban information
   */
  async banUser(hiveAccount, username, reason, duration, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/ban/${hiveAccount}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, reason, duration })
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
   * Unban a user from chat (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} username - Username to unban
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Success response
   */
  async unbanUser(hiveAccount, username, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/ban/${hiveAccount}/${username}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
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
   * Get list of banned users (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} List of banned users
   */
  async getBannedUsers(hiveAccount, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/bans/${hiveAccount}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get banned users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting banned users:', error);
      throw error;
    }
  }

  /**
   * Timeout a user (temporary ban) (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} username - Username to timeout
   * @param {number} duration - Timeout duration in seconds (default: 600)
   * @param {string} reason - Reason for timeout
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Timeout information
   */
  async timeoutUser(hiveAccount, username, duration = 600, reason, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/timeout/${hiveAccount}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, duration, reason })
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
   * Clear all chat messages (moderator only)
   * @param {string} hiveAccount - Channel owner's Hive username
   * @param {string} authToken - JWT authentication token
   * @returns {Promise<Object>} Success response
   */
  async clearChat(hiveAccount, authToken) {
    try {
      const response = await fetch(
        `${this.chatApiBase}/api/chat/clear/${hiveAccount}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear chat');
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing chat:', error);
      throw error;
    }
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
