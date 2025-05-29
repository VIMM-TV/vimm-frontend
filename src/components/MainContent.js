import React, { useState, useEffect, useMemo } from 'react';
import './MainContent.css';
import config from '../config/default';

function MainContent({ activeStreams, loading, error, onRefresh }) {
  const [featuredStream, setFeaturedStream] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the stream data to prevent unnecessary re-renders
  const memoizedStreams = useMemo(() => {
    return activeStreams;
  }, [JSON.stringify(activeStreams)]);

  // Only set featured stream once during initial load
  useEffect(() => {
    if (memoizedStreams && memoizedStreams.length > 0 && !isInitialized) {
      const randomIndex = Math.floor(Math.random() * memoizedStreams.length);
      setFeaturedStream(memoizedStreams[randomIndex]);
      setIsInitialized(true);
    }
  }, [memoizedStreams, isInitialized]);

  // Function to manually change featured stream
  const changeFeaturedStream = (stream) => {
    setFeaturedStream(stream);
  };

  // Function to get thumbnail URL or fallback
  const getThumbnailUrl = (stream) => {
    if (stream.thumbnail) {
      return stream.thumbnail;
    }
    // Fallback to a generated thumbnail or placeholder
    return `https://via.placeholder.com/320x180/18181b/ff7c0a?text=${encodeURIComponent(stream.username)}`;
  };

  // Function to get the vimm-core player URL
  const getPlayerUrl = (stream) => {
    // Use the config server URL for vimm-core
    return `${config.core.server}/player.html?user=${encodeURIComponent(stream.username)}`;
  };

  // Memoize the iframe to prevent re-rendering when props don't actually change
  const PlayerIframe = useMemo(() => {
    if (!featuredStream) return null;
    
    return (
      <iframe
        key={featuredStream.id} // Use stream ID as key to force re-render only when stream actually changes
        src={getPlayerUrl(featuredStream)}
        className="player-iframe"
        frameBorder="0"
        allowFullScreen
        title={`${featuredStream.username}'s stream`}
      />
    );
  }, [featuredStream?.id, featuredStream?.username]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="error-container">
          <h2>Error Loading Streams</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Featured Stream Section */}
      {featuredStream && (
        <div className="featured-section">
          <div className="featured-header">
            <h2 className="featured-title">Featured Stream</h2>
            {onRefresh && (
              <button onClick={onRefresh} className="refresh-button" title="Refresh streams">
                🔄 Refresh
              </button>
            )}
          </div>
          <div className="featured-stream">
            <div className="featured-player">
              {PlayerIframe}
            </div>
            <div className="featured-info">
              <div className="featured-streamer">
                <img 
                  src={featuredStream.avatar} 
                  alt={`${featuredStream.username}'s avatar`}
                  className="featured-avatar"
                />
                <div className="featured-details">
                  <h3 className="featured-username">{featuredStream.username}</h3>
                  <p className="featured-stream-title">{featuredStream.title}</p>
                  <div className="featured-stats">
                    <span className="viewer-count">{featuredStream.viewers} viewers</span>
                    {featuredStream.category && (
                      <span className="category">{featuredStream.category}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Streams Section */}
      <div className="streams-section">
        <h2 className="section-title">Live Streams</h2>
        {memoizedStreams && memoizedStreams.length > 0 ? (
          <div className="streams-grid">
            {memoizedStreams.map(stream => (
              <div key={stream.id} className="stream-card" onClick={() => {
                // Change featured stream when clicking on a stream card
                changeFeaturedStream(stream);
              }}>
                <div className="stream-thumbnail-container">
                  <img 
                    src={getThumbnailUrl(stream)} 
                    alt={`${stream.username}'s stream thumbnail`}
                    className="stream-thumbnail"
                  />
                  <div className="thumbnail-overlay">
                    <div className="live-badge">🔴 LIVE</div>
                    <div className="viewer-badge">{stream.viewers}</div>
                    <div className="play-overlay">
                      <div className="play-button-small">▶</div>
                    </div>
                  </div>
                </div>
                <div className="stream-card-info">
                  <div className="stream-header">
                    <img 
                      src={stream.avatar} 
                      alt={`${stream.username}'s avatar`}
                      className="stream-card-avatar"
                    />
                    <div className="stream-text-info">
                      <h4 className="stream-card-title">{stream.title}</h4>
                      <p className="stream-card-username">{stream.username}</p>
                      {stream.category && (
                        <p className="stream-card-category">{stream.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-streams">
            <h3>No Active Streams</h3>
            <p>Check back later for live content!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainContent;