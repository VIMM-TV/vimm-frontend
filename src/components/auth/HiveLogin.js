/**
 * Hive Keychain Login Component
 * Based on vimm-chat authentication pattern
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './HiveLogin.css';

function HiveLogin({ onClose }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const result = await login(username.trim());
      
      if (result.success && onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="hive-login-modal">
      <div className="hive-login-content">
        <div className="hive-login-header">
          <h2>Login with Hive Keychain</h2>
          {onClose && (
            <button 
              className="close-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              ×
            </button>
          )}
        </div>

        <div className="hive-login-body">
          <div className="keychain-info">
            <div className="keychain-icon">🔐</div>
            <p>
              Sign in securely using your Hive account and Keychain browser extension.
              Your private keys never leave your device.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Hive Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your Hive username"
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="login-button"
                disabled={!username.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    🔑 Sign with Keychain
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="keychain-help">
            <h4>Don't have Hive Keychain?</h4>
            <p>
              Install the Hive Keychain browser extension to securely manage your Hive account:
            </p>
            <div className="browser-links">
              <a 
                href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep" 
                target="_blank" 
                rel="noopener noreferrer"
                className="browser-link"
              >
                Chrome
              </a>
              <a 
                href="https://addons.mozilla.org/en-US/firefox/addon/hive-keychain/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="browser-link"
              >
                Firefox
              </a>
              <a 
                href="https://microsoftedge.microsoft.com/addons/detail/hive-keychain/mnibkjjhbdiijkbeldkkdafdgciimhpd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="browser-link"
              >
                Edge
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HiveLogin;