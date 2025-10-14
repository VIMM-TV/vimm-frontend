import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import './WatchPage.css';
import CustomPlayer from '../components/CustomPlayer';
import UpvoteButton from '../components/UpvoteButton';
import Chat from '../components/Chat';
import streamService from '../services/streamService';

function WatchPage() {
  const [searchParams] = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const username = searchParams.get('user');

  // Fetch stream/channel information
  useEffect(() => {
    const fetchStreamInfo = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const info = await streamService.getStreamInfo(username);
        setStreamInfo(info);
      } catch (error) {
        console.error('Failed to fetch stream info:', error);
        // Set default info on error
        setStreamInfo({
          username,
          title: `${username}'s Stream`,
          description: 'Welcome to the stream!',
          isLive: false,
          category: 'General'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreamInfo();
  }, [username]);

  // Memoize player callbacks to prevent recreating on every render
  const handlePlayerReady = useCallback(() => {
    console.log('Player ready');
  }, []);

  const handlePlayerError = useCallback((error) => {
    console.error('Player error:', error);
  }, []);

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
            <CustomPlayer
              username={username}
              className="player-iframe"
              onReady={handlePlayerReady}
              onError={handlePlayerError}
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
                  <span className="live-indicator-badge">
                    {streamInfo?.isLive ? '🔴 LIVE' : '⚫ OFFLINE'}
                  </span>
                  {streamInfo?.viewers !== undefined && streamInfo.viewers > 0 && (
                    <span className="viewer-count">{streamInfo.viewers} viewers</span>
                  )}
                </div>
              </div>
              {/* Upvote Button */}
              <div className="upvote-container">
                <UpvoteButton 
                  username={username} 
                  permlink={streamInfo?.permlink}
                />
              </div>
            </div>
            
            {/* Stream Title and Description */}
            {loading ? (
              <div className="stream-description">
                <p>Loading stream information...</p>
              </div>
            ) : (
              <>
                {streamInfo?.title && streamInfo.title !== `${username}'s Stream` && (
                  <div className="stream-title">
                    <h2>{streamInfo.title}</h2>
                  </div>
                )}
                <div className="stream-description">
                  <h3>Stream Description</h3>
                  <p>{streamInfo?.description || 'Welcome to the stream!'}</p>
                </div>
              </>
            )}
            
            <div className="stream-tags">
              {streamInfo?.category && (
                <span className="stream-tag">{streamInfo.category}</span>
              )}
              {streamInfo?.isLive && (
                <span className="stream-tag">Live</span>
              )}
              {streamInfo?.language && (
                <span className="stream-tag">{streamInfo.language}</span>
              )}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="chat-container">
          <Chat hiveAccount={username} />
        </div>
      </div>
    </div>
  );
}

export default WatchPage;