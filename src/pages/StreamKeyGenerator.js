import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/default';
import './StreamKeyGenerator.css';

function StreamKeyGenerator() {
  const { isAuthenticated, user } = useAuth();
  const [streamKey, setStreamKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasPostingAuth, setHasPostingAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [keychainReady, setKeychainReady] = useState(false);
  const POSTER_ACCOUNT = 'vimm';

  // Check if Hive Keychain is available
  useEffect(() => {
    const checkKeychain = () => {
      if (window.hive_keychain) {
        console.log('Hive Keychain found');
        setKeychainReady(true);
        
        // Initialize handshake
        window.hive_keychain.requestHandshake(() => {
          console.log('Hive Keychain handshake successful');
        });
      } else {
        console.log('Hive Keychain not found, retrying...');
        setTimeout(checkKeychain, 500);
      }
    };

    checkKeychain();
  }, []);

  // Check posting authority when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      checkPostingAuth();
    }
  }, [isAuthenticated, user]);

  const checkPostingAuth = async () => {
    if (!user) return;
    
    setCheckingAuth(true);
    try {
      const response = await fetch('https://api.openhive.network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "condenser_api.get_accounts",
          params: [[user]],
          id: 1
        })
      });
      const data = await response.json();
      
      if (data.result && data.result[0]) {
        const posting = data.result[0].posting;
        const hasAuth = posting.account_auths.some(auth => auth[0] === POSTER_ACCOUNT);
        setHasPostingAuth(hasAuth);
      }
    } catch (error) {
      console.error('Error checking posting auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const generateStreamKey = async () => {
    if (!keychainReady) {
      setError('Hive Keychain is required but not found. Please install it and refresh the page.');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Request signature from Hive Keychain to verify ownership
      const signResult = await new Promise((resolve, reject) => {
        window.hive_keychain.requestSignBuffer(
          user,
          'Sign to verify your Hive account ownership for stream key generation',
          'Posting',
          response => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error(response.message || 'Signature verification failed'));
            }
          }
        );
      });

      // Request stream key from server
      const response = await fetch(`${config.core.server}/api/auth/stream-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate stream key: ${response.status}`);
      }

      const data = await response.json();
      setStreamKey(data.streamKey);

    } catch (error) {
      console.error('Error generating stream key:', error);
      setError(error.message || 'Failed to generate stream key');
    } finally {
      setLoading(false);
    }
  };

  const grantPostingAuth = async () => {
    if (!keychainReady) {
      setError('Hive Keychain is required but not found. Please install it and refresh the page.');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      // Get current authorities to preserve them
      const response = await fetch('https://api.openhive.network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "condenser_api.get_accounts",
          params: [[user]],
          id: 1
        })
      });
      const data = await response.json();
      const posting = data.result[0].posting;
      
      // Check if authority already exists
      const existingAuth = posting.account_auths.find(auth => auth[0] === POSTER_ACCOUNT);
      if (existingAuth) {
        setError('Posting authority already granted');
        return;
      }
      
      // Request authority update
      window.hive_keychain.requestUpdateAuth(
        user,
        'posting',
        {
          account_auths: [...posting.account_auths, [POSTER_ACCOUNT, posting.weight_threshold]],
          key_auths: posting.key_auths,
          weight_threshold: posting.weight_threshold
        },
        response => {
          if (response.success) {
            setHasPostingAuth(true);
            setError(null);
            alert(`Successfully granted posting authority to @${POSTER_ACCOUNT}`);
          } else {
            setError('Failed to grant posting authority: ' + response.message);
          }
        }
      );
    } catch (error) {
      console.error('Error granting posting authority:', error);
      setError('Failed to update posting authority: ' + error.message);
    }
  };

  const copyStreamKey = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey).then(() => {
        alert('Stream key copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = streamKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Stream key copied to clipboard!');
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="stream-key-generator">
        <div className="container">
          <h1>Stream Key Generator</h1>
          <div className="auth-required">
            <p>Please log in with your Hive account to generate a stream key.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-key-generator">
      <div className="container">
        <h1>Vimm Stream Key Generator</h1>
        
        <div className="key-generator">
          <div className="user-info">
            <p>Logged in as: <strong>@{user}</strong></p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="actions">
            <button 
              className="button primary"
              onClick={generateStreamKey}
              disabled={loading || !keychainReady}
            >
              {loading ? 'Generating...' : !keychainReady ? 'Checking Hive Keychain...' : 'Generate Stream Key'}
            </button>
          </div>

          {streamKey && (
            <div className="stream-key-display">
              <h3>Your Stream Key</h3>
              <div className="key-container">
                <input 
                  type="text" 
                  value={streamKey} 
                  readOnly 
                  className="stream-key-input"
                />
                <button 
                  className="button secondary"
                  onClick={copyStreamKey}
                >
                  Copy
                </button>
              </div>
              <p className="warning">
                <strong>Keep this key secure!</strong> Don't share it with anyone. 
                Use this key in your streaming software (OBS, etc.) to stream to Vimm.
              </p>
            </div>
          )}

          <div className="posting-auth">
            <h3>Posting Authority</h3>
            <div className="auth-container">
              <p>
                Grant posting authority to <span className="poster-account">@{POSTER_ACCOUNT}</span> to enable 
                automated announcements when you go live.
              </p>
              
              {checkingAuth ? (
                <p>Checking current posting authority...</p>
              ) : hasPostingAuth ? (
                <div className="auth-granted">
                  <p>✅ Posting authority already granted to @{POSTER_ACCOUNT}</p>
                </div>
              ) : (
                <button 
                  className="button secondary"
                  onClick={grantPostingAuth}
                  disabled={!keychainReady}
                >
                  Grant Posting Authority
                </button>
              )}
            </div>
            <p className="info">
              This will add posting authority while preserving your existing authorized accounts.
            </p>
          </div>

          <div className="instructions">
            <h3>How to use your stream key</h3>
            <ol>
              <li>Copy your stream key using the button above</li>
              <li>Open your streaming software (OBS Studio, Streamlabs, etc.)</li>
              <li>Go to Settings → Stream</li>
              <li>Set Service to "Custom..."</li>
              <li>Set Server to: <code>rtmp://vimm.tv/live</code></li>
              <li>Paste your stream key in the "Stream Key" field</li>
              <li>Click OK and start streaming!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamKeyGenerator;
