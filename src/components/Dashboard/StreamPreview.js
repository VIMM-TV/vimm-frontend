/**
 * StreamPreview Component
 * Displays a live preview of the streamer's own stream with controls
 */

import React, { useState, useEffect } from 'react';
import CustomPlayer from '../CustomPlayer';
import './StreamPreview.css';

function StreamPreview({ username, isLive, viewers }) {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="stream-preview">
      <div className="stream-preview-header">
        <h2>Stream Preview</h2>
        <div className="stream-status-badge">
          {isLive ? (
            <>
              <span className="live-dot"></span>
              <span className="status-text">LIVE</span>
            </>
          ) : (
            <>
              <span className="offline-dot"></span>
              <span className="status-text">OFFLINE</span>
            </>
          )}
        </div>
      </div>
      
      <div className="preview-player-container">
        {isLive ? (
          <>
            <CustomPlayer
              username={username}
              className="preview-player"
              autoplay={false}
              muted={isMuted}
            />
            <div className="preview-controls">
              <button 
                className="mute-toggle-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🔊'} {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <div className="preview-viewer-count">
                <span className="viewer-icon">👁️</span>
                <span className="viewer-number">{viewers || 0}</span>
                <span className="viewer-label">viewers</span>
              </div>
            </div>
          </>
        ) : (
          <div className="offline-placeholder">
            <div className="offline-icon">📹</div>
            <p>Your stream is currently offline</p>
            <p className="offline-hint">Start streaming to see a live preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamPreview;
