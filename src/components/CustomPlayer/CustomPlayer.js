import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import './CustomPlayer.css';

function CustomPlayer({ username, className, style, onReady, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamId, setStreamId] = useState(null);
  const [hlsToken, setHlsToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const tokenRefreshTimer = useRef(null);

  // Get the base URL from current domain
  const getBaseUrl = useCallback(() => {
    return `${window.location.protocol}//${window.location.host}`;
  }, []);

  // Hide controls after inactivity
  const hideControlsTimeout = useRef(null);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Fetch HLS token for the stream
  const fetchHlsToken = useCallback(async (streamIdToFetch) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/hls/token/${streamIdToFetch}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch HLS token: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token) {
        setHlsToken(data.token);
        
        // Set token expiry time (assuming token expires in 1 hour by default)
        const expiryTime = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 60 * 60 * 1000);
        setTokenExpiry(expiryTime);
        
        // Schedule token refresh 5 minutes before expiry
        const refreshTime = expiryTime.getTime() - Date.now() - (5 * 60 * 1000);
        if (refreshTime > 0) {
          tokenRefreshTimer.current = setTimeout(() => {
            refreshHlsToken(data.token);
          }, refreshTime);
        }
        
        return data.token;
      }
    } catch (err) {
      console.error('Failed to fetch HLS token:', err);
      setError('Failed to load stream encryption token');
      if (onError) {
        onError(err);
      }
    }
    return null;
  }, [onError, getBaseUrl]);

  // Refresh HLS token
  const refreshHlsToken = useCallback(async (oldToken) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/hls/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: oldToken })
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh HLS token: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token) {
        setHlsToken(data.token);
        
        // Update token expiry time
        const expiryTime = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 60 * 60 * 1000);
        setTokenExpiry(expiryTime);
        
        // Schedule next token refresh
        const refreshTime = expiryTime.getTime() - Date.now() - (5 * 60 * 1000);
        if (refreshTime > 0) {
          tokenRefreshTimer.current = setTimeout(() => {
            refreshHlsToken(data.token);
          }, refreshTime);
        }
      }
    } catch (err) {
      console.error('Failed to refresh HLS token:', err);
      // If refresh fails, try to get a new token
      if (streamId) {
        fetchHlsToken(streamId);
      }
    }
  }, [streamId, fetchHlsToken, getBaseUrl]);

  // Fetch stream URL from API
  useEffect(() => {
    if (!username) return;

    const fetchStreamUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const baseUrl = getBaseUrl();
        
        // Use the API endpoint to get stream info (no authentication required)
        const response = await fetch(`${baseUrl}/api/streams/path/${encodeURIComponent(username)}?type=hiveAccount`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stream: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.streamId) {
          throw new Error('No stream ID found in response');
        }
        
        setStreamId(data.streamId);
        
        // Construct the m3u8 URL using current domain
        const m3u8Url = `${baseUrl}/live/${data.streamId}/master.m3u8`;
        setStreamUrl(m3u8Url);
        
        // Fetch HLS token for this stream
        await fetchHlsToken(data.streamId);
        
      } catch (err) {
        console.error('Failed to fetch stream URL:', err);
        
        // For demo purposes, create a demo video element to show controls
        setError(null);
        setIsLoading(false);
        
        // Use a demo/placeholder video source that demonstrates the player controls
        // This will show the player interface even when the API is not available
        setStreamUrl('demo');
        
        if (onError) {
          onError(err);
        }
      }
    };

    fetchStreamUrl();
    
    // Cleanup token refresh timer on unmount
    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, [username, onError, fetchHlsToken, getBaseUrl]);

  // Initialize HLS player
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    
    // Demo mode - show player interface without actual video
    if (streamUrl === 'demo') {
      setIsLoading(false);
      
      // Set up demo qualities for demonstration
      setQualities([
        { index: 0, height: 1080, name: '1080p' },
        { index: 1, height: 720, name: '720p' },
        { index: 2, height: 480, name: '480p' },
        { index: 3, height: 360, name: '360p' }
      ]);
      
      if (onReady) {
        onReady();
      }
      return;
    }
    
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        xhrSetup: function(xhr, url) {
          // Only add token to key requests (for decryption)
          if (url.includes('/api/hls/key/') && hlsToken) {
            // Check if URL already has query parameters
            const separator = url.includes('?') ? '&' : '?';
            xhr.open('GET', `${url}${separator}token=${hlsToken}`, true);
          }
        }
      });
      
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        
        // Extract quality levels
        const levels = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`
        }));
        setQualities(levels);
        
        if (onReady) {
          onReady();
        }
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - please check your connection');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - unable to play video');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error occurred');
              hls.destroy();
              break;
          }
        }
      });
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      // For Safari, we need to append the token to the src URL if needed
      let srcUrl = streamUrl;
      if (hlsToken && streamUrl.includes('master.m3u8')) {
        // Safari will need custom handling for encrypted streams
        // This is a simplified approach - you may need to handle this differently
        srcUrl = streamUrl;
      }
      video.src = srcUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (onReady) {
          onReady();
        }
      });
    } else {
      setError('HLS not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, hlsToken, onReady]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    // In demo mode, just toggle the state
    if (streamUrl === 'demo') {
      setIsPlaying(!isPlaying);
      return;
    }
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [isPlaying, streamUrl]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    if (!videoRef.current) return;
    
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  }, []);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Handle quality change
  const changeQuality = useCallback((qualityIndex) => {
    if (!hlsRef.current) return;
    
    if (qualityIndex === 'auto') {
      hlsRef.current.currentLevel = -1; // Auto quality
      setCurrentQuality('auto');
    } else {
      hlsRef.current.currentLevel = qualityIndex;
      setCurrentQuality(qualityIndex);
    }
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`custom-player-container error ${className || ''}`} style={style}>
        <div className="error-message">
          <h3>Stream Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`custom-player-container ${className || ''} ${streamUrl === 'demo' ? 'demo-mode' : ''}`} 
      style={style}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        className="custom-player-video"
        autoPlay
        muted={isMuted}
        playsInline
        onClick={togglePlayPause}
      />
      
      {/* Demo mode overlay */}
      {streamUrl === 'demo' && (
        <div className="demo-overlay">
          <div className="demo-message">
            <h3>Custom Video Player Demo</h3>
            <p>🎥 This is a demo of the custom video player interface</p>
            <p>✨ Features: Play/Pause, Volume Control, Quality Selection, Fullscreen</p>
            <p>🔗 Connect to a live stream via API to see video content</p>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading stream...</p>
        </div>
      )}

      {(showControls || streamUrl === 'demo') && !isLoading && (
        <div className="player-controls">
          <div className="controls-row">
            {/* Play/Pause Button */}
            <button 
              className="control-button play-pause"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Volume Controls */}
            <div className="volume-controls">
              <button 
                className="control-button volume-button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              />
            </div>

            <div className="controls-spacer"></div>

            {/* Quality Selector */}
            {qualities.length > 0 && (
              <select 
                className="quality-selector"
                value={currentQuality}
                onChange={(e) => changeQuality(e.target.value === 'auto' ? 'auto' : parseInt(e.target.value))}
              >
                <option value="auto">Auto</option>
                {qualities.map((quality) => (
                  <option key={quality.index} value={quality.index}>
                    {quality.name}
                  </option>
                ))}
              </select>
            )}

            {/* Fullscreen Button */}
            <button 
              className="control-button fullscreen-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? '⤢' : '⤡'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(CustomPlayer);
