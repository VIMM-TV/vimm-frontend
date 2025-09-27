/**
 * Hive authentication service using Keychain
 * Based on vimm-chat authentication pattern
 */

import config from '../config';

class HiveAuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authToken = null;
  }

  /**
   * Check if Hive Keychain is available
   */
  isKeychainAvailable() {
    return typeof window !== 'undefined' && !!window.hive_keychain;
  }

  /**
   * Get stored authentication data from localStorage
   */
  getStoredAuth() {
    try {
      const user = localStorage.getItem('vimm-auth-user');
      const token = localStorage.getItem('vimm-auth-token');
      
      if (user && token) {
        return { user, token };
      }
    } catch (error) {
      console.error('Error reading stored auth:', error);
    }
    return null;
  }

  /**
   * Store authentication data in localStorage
   */
  storeAuth(user, token) {
    try {
      localStorage.setItem('vimm-auth-user', user);
      localStorage.setItem('vimm-auth-token', token);
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  }

  /**
   * Clear stored authentication data
   */
  clearStoredAuth() {
    try {
      localStorage.removeItem('vimm-auth-user');
      localStorage.removeItem('vimm-auth-token');
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  }

  /**
   * Verify auth token with server
   */
  async verifyAuthToken(token) {
    try {
      const response = await fetch(config.core.server + '/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Authenticate with Hive Keychain
   */
  async authenticateWithKeychain(username) {
    return new Promise((resolve, reject) => {
      if (!this.isKeychainAvailable()) {
        reject(new Error('Hive Keychain is not installed. Please install it to authenticate.'));
        return;
      }

      if (!username || typeof username !== 'string') {
        reject(new Error('Please enter a valid Hive username'));
        return;
      }

      // Generate a challenge message
      const challenge = `vimm-auth-${Date.now()}-${Math.random()}`;

      // Request signature from Hive Keychain
      window.hive_keychain.requestSignBuffer(
        username.toLowerCase().trim(),
        challenge,
        'Posting',
        async (response) => {
          if (response.success) {
            try {
              // Send to server for verification
              const authResult = await this.authenticateWithServer(
                username.toLowerCase().trim(),
                challenge,
                response.result
              );
              resolve(authResult);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(response.message || 'Keychain authentication failed'));
          }
        }
      );
    });
  }

  /**
   * Authenticate with server using signature
   */
  async authenticateWithServer(username, challenge, signature) {
    try {
      const response = await fetch(config.core.server + '/api/auth/hive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          challenge,
          signature,
          method: 'keychain'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store authentication state
        this.isAuthenticated = true;
        this.currentUser = username;
        this.authToken = result.token;

        // Store in localStorage
        this.storeAuth(username, result.token);

        return {
          success: true,
          user: username,
          token: result.token,
          profile: result.profile
        };
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Server authentication error:', error);
      throw new Error('Authentication failed. Please try again.');
    }
  }

  /**
   * Initialize authentication from stored data
   */
  async initializeAuth() {
    const stored = this.getStoredAuth();
    
    if (stored) {
      // Verify the stored token is still valid
      const isValid = await this.verifyAuthToken(stored.token);
      
      if (isValid) {
        this.isAuthenticated = true;
        this.currentUser = stored.user;
        this.authToken = stored.token;
        
        return {
          success: true,
          user: stored.user,
          token: stored.token
        };
      } else {
        // Token is invalid, clear stored auth
        this.clearStoredAuth();
      }
    }
    
    return { success: false };
  }

  /**
   * Logout user
   */
  async logout() {
    // Clear authentication state
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authToken = null;

    // Clear stored data
    this.clearStoredAuth();

    // Optionally notify server of logout
    try {
      if (this.authToken) {
        await fetch(config.core.server + '/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }

    return { success: true };
  }

  /**
   * Get current authentication status
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      token: this.authToken
    };
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders() {
    if (this.authToken) {
      return {
        'Authorization': `Bearer ${this.authToken}`
      };
    }
    return {};
  }
}

// Create singleton instance
const hiveAuthService = new HiveAuthService();

export default hiveAuthService;