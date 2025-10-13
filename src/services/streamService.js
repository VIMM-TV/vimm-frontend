/**
 * Stream service for fetching stream/channel information
 */

import config from '../config';

class StreamService {
  /**
   * Get information about a specific stream/channel by username
   * @param {string} username - The Hive username of the streamer
   * @returns {Promise<Object>} Stream information including title, description, etc.
   */
  async getStreamInfo(username) {
    try {
      // First, get the stream ID from the username
      const pathResponse = await fetch(
        `${config.core.server}/api/streams/path/${encodeURIComponent(username)}?type=hiveAccount`
      );

      if (!pathResponse.ok) {
        if (pathResponse.status === 404) {
          // Stream not found - return default info
          return {
            username,
            title: `${username}'s Stream`,
            description: 'No stream information available.',
            isLive: false,
            viewers: 0,
            category: 'General'
          };
        }
        throw new Error(`Failed to fetch stream path: ${pathResponse.status}`);
      }

      const pathData = await pathResponse.json();
      const streamId = pathData.streamId;

      if (!streamId) {
        throw new Error('Stream ID not found in response');
      }

      // Now fetch the actual stream info using the stream ID
      const response = await fetch(
        `${config.core.server}/api/streams/${encodeURIComponent(streamId)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Stream not found - return default info
          return {
            username,
            title: `${username}'s Stream`,
            description: 'No stream information available.',
            isLive: false,
            viewers: 0,
            category: 'General'
          };
        }
        throw new Error(`Failed to fetch stream info: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        streamId: streamId,
        username: data.username,
        title: data.title || `${username}'s Stream`,
        description: data.description || 'Welcome to the stream!',
        isLive: data.isLive || false,
        viewers: data.viewers || 0,
        category: data.category || 'General',
        language: data.language,
        thumbnail: data.thumbnail,
        startTime: data.startTime,
        streamPath: data.streamPath,
        permlink: data.permlink || data.postPermlink
      };
    } catch (error) {
      console.error('Error fetching stream info:', error);
      // Return default info on error
      return {
        username,
        title: `${username}'s Stream`,
        description: 'Welcome to the stream!',
        isLive: false,
        viewers: 0,
        category: 'General'
      };
    }
  }

  /**
   * Get public channel information (non-authenticated)
   * @param {string} username - The Hive username
   * @returns {Promise<Object>} Channel information
   */
  async getChannelInfo(username) {
    try {
      const response = await fetch(
        `${config.core.server}/api/channels/${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        // If endpoint doesn't exist, fall back to stream info
        return this.getStreamInfo(username);
      }

      const data = await response.json();
      return {
        username: data.username,
        title: data.title || data.channelTitle || `${username}'s Channel`,
        description: data.description || data.channelDescription || 'Welcome to my channel!',
        category: data.category || 'General',
        language: data.language,
        ...data
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      // Fall back to stream info
      return this.getStreamInfo(username);
    }
  }
}

// Export singleton instance
const streamService = new StreamService();
export default streamService;
