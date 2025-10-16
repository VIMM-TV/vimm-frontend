import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from '../components/auth/FollowButton';
import followService from '../services/followService';
import config from '../config/default';
import './Following.css';

function Following() {
  const { isAuthenticated, user } = useAuth();
  const [followedChannels, setFollowedChannels] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [offlineChannels, setOfflineChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchFollowingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get followed channels from follow service
        const followed = await followService.getFollowing();
        setFollowedChannels(followed);

        if (followed.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch current streams to check which followed channels are live
        const response = await fetch(config.core.server + config.core.endpoints.streams);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const currentStreams = data.streams || [];

        // Separate live and offline channels
        const liveChannelUsernames = new Set(currentStreams.map(stream => stream.username));
        
        const live = [];
        const offline = [];

        followed.forEach(channel => {
          const streamData = currentStreams.find(stream => stream.username === channel.username);
          
          if (liveChannelUsernames.has(channel.username)) {
            live.push({
              ...channel,
              ...streamData,
              viewers: streamData?.viewers || 0,
              thumbnail: streamData.thumbnail || 'https://picsum.photos/320/180?random=' + Math.random(),
              isLive: true
            });
          } else {
            offline.push({
              ...channel,
              isLive: false,
              lastSeen: channel.lastSeen || 'Recently'
            });
          }
        });

        setLiveStreams(live);
        setOfflineChannels(offline);

      } catch (err) {
        console.error('Failed to fetch following data:', err);
        setError(err.message);
        
        // Fallback to mock data for demonstration
        if (followedChannels.length > 0) {
          const mockLive = [
            {
              username: 'gamer123',
              title: 'Epic Gaming Session',
              viewers: 1245,
              avatar: 'https://i.pravatar.cc/150?u=gamer123',
              thumbnail: 'https://picsum.photos/320/180?random=1',
              category: 'Gaming',
              isLive: true
            }
          ];
          
          const mockOffline = [
            {
              username: 'streamqueen',
              avatar: 'https://i.pravatar.cc/150?u=streamqueen',
              isLive: false,
              lastSeen: '2 hours ago'
            }
          ];
          
          setLiveStreams(mockLive);
          setOfflineChannels(mockOffline);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingData();
    
    // Set up periodic refresh to check for new streams
    const interval = setInterval(fetchFollowingData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user, followedChannels.length]);

  const handleStreamClick = (stream) => {
    window.location.href = `/watch?channel=${stream.username}`;
  };

  const handleUnfollow = (username) => {
    // Remove from followed channels
    setFollowedChannels(prev => prev.filter(channel => channel.username !== username));
    setLiveStreams(prev => prev.filter(stream => stream.username !== username));
    setOfflineChannels(prev => prev.filter(channel => channel.username !== username));
  };

  if (!isAuthenticated) {
    return (
      <div className="following-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>You need to be logged in to see your followed channels.</p>
          <p>Click the "Login with Hive" button in the top right to get started!</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="following-container">
        <div className="following-loading">
          <div className="loading-spinner"></div>
          <p>Loading your followed channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="following-container">
        <div className="following-error">
          <h2>Error Loading Following</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (followedChannels.length === 0) {
    return (
      <div className="following-container">
        <div className="following-header">
          <h1>Following</h1>
          <p>Channels you follow will appear here</p>
        </div>
        
        <div className="no-following">
          <h3>You're not following anyone yet</h3>
          <p>Discover amazing streamers in the <a href="/directory">Directory</a> and start following them!</p>
          <a href="/directory" className="browse-button">Browse Streams</a>
        </div>
      </div>
    );
  }

  return (
    <div className="following-container">
      <div className="following-header">
        <h1>Following</h1>
        <p>Stay updated with your favorite streamers</p>
      </div>

      {liveStreams.length > 0 && (
        <div className="following-section">
          <h2 className="section-title">
            🔴 Live Now ({liveStreams.length})
          </h2>
          <div className="streams-grid">
            {liveStreams.map(stream => (
              <div key={stream.username} className="stream-card live" onClick={() => handleStreamClick(stream)}>
                <div className="stream-thumbnail">
                  <img src={stream.thumbnail} alt={`${stream.title} thumbnail`} />
                  <div className="live-indicator">🔴 LIVE</div>
                  <div className="viewer-count">{stream.viewers} viewers</div>
                </div>
                <div className="stream-details">
                  <div className="stream-header">
                    <img 
                      src={stream.avatar} 
                      alt={`${stream.username}'s avatar`} 
                      className="streamer-avatar" 
                    />
                    <div className="stream-info">
                      <h3 className="stream-title">{stream.title}</h3>
                      <p className="streamer-name">{stream.username}</p>
                      <p className="stream-category">{stream.category}</p>
                    </div>
                  </div>
                  <div className="stream-actions">
                    <FollowButton 
                      username={stream.username} 
                      size="small"
                      onUnfollow={() => handleUnfollow(stream.username)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {offlineChannels.length > 0 && (
        <div className="following-section">
          <h2 className="section-title">
            ⚫ Offline ({offlineChannels.length})
          </h2>
          <div className="offline-channels">
            {offlineChannels.map(channel => (
              <div key={channel.username} className="offline-channel">
                <img 
                  src={channel.avatar} 
                  alt={`${channel.username}'s avatar`} 
                  className="channel-avatar" 
                />
                <div className="channel-info">
                  <h3 className="channel-name">{channel.username}</h3>
                  <p className="last-seen">Last seen: {channel.lastSeen}</p>
                </div>
                <div className="channel-actions">
                  <FollowButton 
                    username={channel.username} 
                    size="small"
                    onUnfollow={() => handleUnfollow(channel.username)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="following-stats">
        <p>
          Following {followedChannels.length} channel{followedChannels.length !== 1 ? 's' : ''} • 
          {liveStreams.length} live • {offlineChannels.length} offline
        </p>
      </div>
    </div>
  );
}

export default Following;
