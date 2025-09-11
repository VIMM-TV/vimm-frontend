/**
 * Follow/Unfollow service for channel interactions
 * Integrates with vimm-core API endpoints
 */

import config from '../config';
import hiveAuthService from './hiveAuth';

class FollowService {
  /**
   * Get list of channels the current user is following
   */
  async getFollowing() {
    try {
      const authHeaders = hiveAuthService.getAuthHeaders();
      
      const response = await fetch(config.core.server + '/api/follows/following', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch following list: ${response.status}`);
      }

      const data = await response.json();
      return data.following || [];
    } catch (error) {
      console.error('Error fetching following list:', error);
      throw error;
    }
  }

  /**
   * Get list of followers for a specific channel
   */
  async getFollowers(username) {
    try {
      const response = await fetch(
        config.core.server + `/api/follows/followers/${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.status}`);
      }

      const data = await response.json();
      return data.followers || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  /**
   * Check if current user is following a specific channel
   */
  async isFollowing(username) {
    try {
      const authHeaders = hiveAuthService.getAuthHeaders();
      
      if (!authHeaders.Authorization) {
        return false; // Not authenticated
      }

      const response = await fetch(
        config.core.server + `/api/follows/status/${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return false; // Not authenticated
        }
        throw new Error(`Failed to check follow status: ${response.status}`);
      }

      const data = await response.json();
      return data.isFollowing || false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Follow a channel
   */
  async followChannel(username) {
    try {
      const authHeaders = hiveAuthService.getAuthHeaders();
      
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required to follow channels');
      }

      const response = await fetch(config.core.server + '/api/follows/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          username: username.toLowerCase().trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to follow channel: ${response.status}`);
      }

      return {
        success: true,
        message: data.message || 'Successfully followed channel'
      };
    } catch (error) {
      console.error('Error following channel:', error);
      throw error;
    }
  }

  /**
   * Unfollow a channel
   */
  async unfollowChannel(username) {
    try {
      const authHeaders = hiveAuthService.getAuthHeaders();
      
      if (!authHeaders.Authorization) {
        throw new Error('Authentication required to unfollow channels');
      }

      const response = await fetch(config.core.server + '/api/follows/unfollow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          username: username.toLowerCase().trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to unfollow channel: ${response.status}`);
      }

      return {
        success: true,
        message: data.message || 'Successfully unfollowed channel'
      };
    } catch (error) {
      console.error('Error unfollowing channel:', error);
      throw error;
    }
  }

  /**
   * Get follow statistics for a channel
   */
  async getFollowStats(username) {
    try {
      const response = await fetch(
        config.core.server + `/api/follows/stats/${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch follow stats: ${response.status}`);
      }

      const data = await response.json();
      return {
        followerCount: data.followerCount || 0,
        followingCount: data.followingCount || 0
      };
    } catch (error) {
      console.error('Error fetching follow stats:', error);
      return {
        followerCount: 0,
        followingCount: 0
      };
    }
  }

  /**
   * Get recommended channels to follow
   */
  async getRecommendedChannels(limit = 10) {
    try {
      const response = await fetch(
        config.core.server + `/api/follows/recommendations?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
}

// Create singleton instance
const followService = new FollowService();

export default followService;