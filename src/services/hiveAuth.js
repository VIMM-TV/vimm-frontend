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
        console.log('Found stored auth for user:', user);
        return { user, token };
      } else {
        console.log('No stored auth found');
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
      console.log('Stored auth for user:', user);
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
      console.log('Cleared stored auth');
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  }

  /**
   * Get challenge from server
   */
  async getChallenge() {
    try {
      console.log('Requesting challenge from server...'); // Debug log
      const response = await fetch(config.core.server + '/api/auth/challenge', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get challenge: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received challenge:', result.challenge); // Debug log
      
      if (!result.challenge) {
        throw new Error('No challenge received from server');
      }

      return result.challenge;
    } catch (error) {
      console.error('Challenge request error:', error);
      throw new Error('Failed to get authentication challenge from server');
    }
  }

  /**
   * Verify auth token with server
   */
  async verifyAuthToken(token) {
    try {
      console.log('Verifying auth token...');
      const response = await fetch(config.core.server + '/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      const isValid = response.ok;
      console.log('Token verification result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Token verification error:', error);
      // If there's a network error, we can't be sure the token is invalid
      // So we'll assume it's still valid to avoid logging out users unnecessarily
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.warn('Network error during token verification, assuming token is still valid');
        return true; // Assume valid on network errors
      }
      return false;
    }
  }

  /**
   * Authenticate with Hive Keychain
   */
  async authenticateWithKeychain(username) {
    return new Promise(async (resolve, reject) => {
      if (!this.isKeychainAvailable()) {
        reject(new Error('Hive Keychain is not installed. Please install it to authenticate.'));
        return;
      }

      if (!username || typeof username !== 'string') {
        reject(new Error('Please enter a valid Hive username'));
        return;
      }

      try {
        // Get challenge from server first
        const challenge = await this.getChallenge();
        console.log('Using challenge for signing:', challenge); // Debug log

        // Request signature from Hive Keychain
        window.hive_keychain.requestSignBuffer(
          username.toLowerCase().trim(),
          challenge,
          'Posting',
          async (response) => {
            if (response.success) {
              try {
                console.log('Keychain signature successful, authenticating with server...'); // Debug log
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
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Authenticate with server using signature
   */
  async authenticateWithServer(username, challenge, signature) {
    try {
      console.log('Sending authentication request to server...', { username, challenge: challenge.substring(0, 20) + '...' }); // Debug log
      
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
      console.log('Server response:', { success: result.success, error: result.error }); // Debug log

      if (response.ok && result.success) {
        // Store authentication state
        this.isAuthenticated = true;
        this.currentUser = username;
        this.authToken = result.token;

        // Store in localStorage
        this.storeAuth(username, result.token);

        console.log('Authentication successful for user:', username); // Debug log

        return {
          success: true,
          user: username,
          token: result.token,
          profile: result.profile
        };
      } else {
        throw new Error(result.error || result.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Server authentication error:', error);
      throw error; // Re-throw the original error instead of creating a generic one
    }
  }

  // ...existing code...
  /**
   * Initialize authentication from stored data
   */
  async initializeAuth() {
    console.log('Initializing authentication...');
    const stored = this.getStoredAuth();
    
    if (stored) {
      console.log('Restoring authentication for user:', stored.user);
      
      // Restore authentication state from stored data
      this.isAuthenticated = true;
      this.currentUser = stored.user;
      this.authToken = stored.token;
      
      // Verify the stored token is still valid in the background
      // Don't block initialization on this check
      this.verifyAuthToken(stored.token).then(isValid => {
        if (!isValid) {
          console.log('Stored token is invalid, logging out...');
          this.logout();
        } else {
          console.log('Token verified successfully');
        }
      }).catch(error => {
        console.warn('Token verification failed, but keeping user logged in:', error);
        // Keep user logged in even if verification fails (network issues, etc.)
      });
      
      return {
        success: true,
        user: stored.user,
        token: stored.token
      };
    }
    
    console.log('No stored authentication found');
    return { success: false };
  }

  /**
   * Logout user
   */
  async logout() {
    // Store the current token before clearing it
    const currentToken = this.authToken;

    // Clear authentication state
    this.isAuthenticated = false;
    this.currentUser = null;
    this.authToken = null;

    // Clear stored data
    this.clearStoredAuth();

    // Optionally notify server of logout
    try {
      if (currentToken) {
        await fetch(config.core.server + '/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`
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
   * Check if user is currently authenticated (includes checking stored auth)
   */
  isUserAuthenticated() {
    if (this.isAuthenticated) {
      return true;
    }
    
    // Check if we have stored auth that hasn't been loaded yet
    const stored = this.getStoredAuth();
    return !!stored;
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