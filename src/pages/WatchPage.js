import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import './WatchPage.css';
import config from '../config/default';

function WatchPage() {
  const [searchParams] = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const username = searchParams.get('user');

  // Detect mobile and orientation
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
      
      // Auto-fullscreen on mobile landscape
      if (mobile && landscape && !isFullscreen) {
        setIsFullscreen(true);
      } else if (mobile && !landscape && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, [isFullscreen]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen API
  useEffect(() => {
    if (isFullscreen && isMobile && isLandscape) {
      const streamContainer = document.querySelector('.stream-container');
      if (streamContainer && streamContainer.requestFullscreen) {
        streamContainer.requestFullscreen().catch(console.error);
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  }, [isFullscreen, isMobile, isLandscape]);

  // Generate player and chat URLs
  const playerUrl = useMemo(() => {
    if (!username) return null;
    return `${config.core.server}/player.html?user=${encodeURIComponent(username)}`;
  }, [username]);

  const chatUrl = useMemo(() => {
    if (!username) return null;
    return `${config.chat.server}${config.chat.embedPath.replace(':hiveAccount', encodeURIComponent(username))}`;
  }, [username]);

  if (!username) {
    return (
      <div className="watch-page">
        <div className="error-container">
          <h2>Missing User Parameter</h2>
          <p>Please provide a user parameter in the URL (e.g., /watch?user=username)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`watch-page ${isMobile ? 'mobile' : 'desktop'} ${isLandscape ? 'landscape' : 'portrait'} ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="watch-content">
        {/* Stream Container */}
        <div className="stream-container">
          <div className="stream-player">
            <iframe
              src={playerUrl}
              className="player-iframe"
              frameBorder="0"
              allowFullScreen
              title={`${username}'s stream`}
            />
            {isMobile && (
              <button 
                className="fullscreen-toggle"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? '⤢' : '⤡'}
              </button>
            )}
          </div>
          
          {/* Stream Info */}
          <div className="stream-info">
            <div className="stream-header">
              <img 
                src={`https://images.hive.blog/u/${username}/avatar`}
                alt={`${username}'s avatar`}
                className="stream-avatar"
              />
              <div className="stream-details">
                <h1 className="stream-username">{username}</h1>
                <div className="stream-status">
                  <span className="live-indicator">🔴 LIVE</span>
                </div>
              </div>
            </div>
            
            {/* Example additional content that might cause scrolling */}
            <div className="stream-description">
              <h3>Stream Description</h3>
              <p>Welcome to my stream! Today we're exploring new features and having a great time with the community.</p>
            </div>
            
            <div className="stream-tags">
              <span className="stream-tag">Gaming</span>
              <span className="stream-tag">Live</span>
              <span className="stream-tag">Interactive</span>
              <span className="stream-tag">Community</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="chat-container">
          <div className="chat-iframe-container">
            <iframe
              src={chatUrl}
              className="chat-iframe"
              frameBorder="0"
              title={`${username}'s chat`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchPage;