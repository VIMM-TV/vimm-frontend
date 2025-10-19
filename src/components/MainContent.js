import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainContent.css';
import config from '../config';
import CustomPlayer from './CustomPlayer';

function MainContent({ activeStreams, loading, error, onRefresh }) {
  const [featuredStream, setFeaturedStream] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Dynamically generate ad URL using CSS variables
  const adUrl = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const getColor = (varName) => rootStyles.getPropertyValue(varName).trim().replace('#', '');
    
    const bgColor = getColor('--color-background');
    const primaryColor = getColor('--color-primary');
    const primaryHover = getColor('--color-primary-hover');
    const textColor = getColor('--color-text-primary');
    const linkColor = getColor('--color-text-secondary');
    const linkHover = getColor('--color-primary');
    
    return `//acceptable.a-ads.com/2413321/?size=Adaptive&background_color=${bgColor}&title_color=${primaryColor}&title_hover_color=${primaryHover}&text_color=${textColor}&link_color=${linkColor}&link_hover_color=${linkHover}`;
  }, []);

  // Memoize the stream data to prevent unnecessary re-renders
  const memoizedStreams = useMemo(() => {
    return activeStreams;
  }, [activeStreams]);

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

  // Memoize the custom player to prevent re-rendering when props don't actually change
  const PlayerComponent = useMemo(() => {
    if (!featuredStream) return null;
    
    return (
      <CustomPlayer
        key={featuredStream.id} // Use stream ID as key to force re-render only when stream actually changes
        username={featuredStream.username}
        className="featured-custom-player"
        onReady={() => console.log(`Player ready for ${featuredStream.username}`)}
        onError={(error) => console.error(`Player error for ${featuredStream.username}:`, error)}
      />
    );
  }, [featuredStream]);

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
              {PlayerComponent}
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
                    <span className="viewer-counter">{featuredStream.viewers} viewers</span>
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

      {/* ============================================
          ADVERTISEMENT BLOCK
          Replace this section with your own ad code
          Current size: Adaptive (70% width)
          Colors are dynamically pulled from CSS variables
          ============================================ */}
      <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: 99998, marginBottom: 'var(--spacing-xl)'}}>
        <iframe 
          data-aa='2413321' 
          src={adUrl}
          style={{border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto'}}
          title="Advertisement"
        ></iframe>
      </div>
      {/* ============================================
          END ADVERTISEMENT BLOCK
          ============================================ */}

      {/* All Streams Section */}
      <div className="streams-section">
        <h2 className="section-title">Live Streams</h2>
        {memoizedStreams && memoizedStreams.length > 0 ? (
          <div className="streams-grid">
            {memoizedStreams.map(stream => (
              <div key={stream.id} className="stream-card" onClick={() => {
                // Navigate to watch page with the stream username
                navigate(`/watch?user=${stream.username}`);
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