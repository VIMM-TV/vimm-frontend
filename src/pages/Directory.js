import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FollowButton from '../components/auth/FollowButton';
import config from '../config/default';
import './Directory.css';

function Directory() {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('viewers'); // viewers, username, title
  const [filterCategory, setFilterCategory] = useState('all');
  
  const location = useLocation();

  // Get search query from URL parameters or navigation state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch streams from API
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(config.core.server + config.core.endpoints.streams);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match the expected format
        const transformedStreams = data.streams.map(stream => ({
          id: stream.id,
          username: stream.username,
          title: stream.title || 'Untitled Stream',
          viewers: Math.floor(Math.random() * 2000) + 100,
          avatar: `https://images.hive.blog/u/${stream.username}/avatar`,
          thumbnail: stream.thumbnail,
          isLive: stream.isLive,
          streamPath: stream.streamPath,
          startTime: stream.startTime,
          description: stream.description,
          language: stream.language,
          category: stream.category || 'General'
        }));
        
        setStreams(transformedStreams);
      } catch (err) {
        console.error('Failed to fetch streams:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        const fallbackStreams = [
          { 
            id: 1, 
            username: 'gamer123', 
            title: 'Playing Fortnite Battle Royale', 
            viewers: 1243, 
            avatar: 'https://i.pravatar.cc/150?u=gamer123',
            thumbnail: 'https://picsum.photos/320/180?random=1',
            category: 'Gaming',
            isLive: true,
            description: 'Epic wins and fails in Fortnite!'
          },
          { 
            id: 2, 
            username: 'streamqueen', 
            title: 'Just Chatting with Viewers', 
            viewers: 856, 
            avatar: 'https://i.pravatar.cc/150?u=streamqueen',
            thumbnail: 'https://picsum.photos/320/180?random=2',
            category: 'Just Chatting',
            isLive: true,
            description: 'Come hang out and chat!'
          },
          { 
            id: 3, 
            username: 'proplayer', 
            title: 'Competitive Ranked Matches', 
            viewers: 2105, 
            avatar: 'https://i.pravatar.cc/150?u=proplayer',
            thumbnail: 'https://picsum.photos/320/180?random=3',
            category: 'Esports',
            isLive: true,
            description: 'Climbing the leaderboards!'
          },
          { 
            id: 4, 
            username: 'artcreator', 
            title: 'Digital Art Creation Session', 
            viewers: 437, 
            avatar: 'https://i.pravatar.cc/150?u=artcreator',
            thumbnail: 'https://picsum.photos/320/180?random=4',
            category: 'Art',
            isLive: true,
            description: 'Creating beautiful digital artwork'
          },
          { 
            id: 5, 
            username: 'musiclover', 
            title: 'Piano Practice and Covers', 
            viewers: 691, 
            avatar: 'https://i.pravatar.cc/150?u=musiclover',
            thumbnail: 'https://picsum.photos/320/180?random=5',
            category: 'Music',
            isLive: true,
            description: 'Playing your favorite songs!'
          }
        ];

        setStreams(fallbackStreams);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Filter and sort streams
  useEffect(() => {
    let filtered = [...streams];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stream => 
        stream.username.toLowerCase().includes(query) ||
        stream.title.toLowerCase().includes(query) ||
        stream.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(stream => 
        stream.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viewers':
          return b.viewers - a.viewers;
        case 'username':
          return a.username.localeCompare(b.username);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return b.viewers - a.viewers;
      }
    });

    setFilteredStreams(filtered);
  }, [streams, searchQuery, sortBy, filterCategory]);

  const categories = ['all', ...new Set(streams.map(stream => stream.category))];

  const handleStreamClick = (stream) => {
    // Navigate to watch page with stream details
    window.location.href = `/watch?user=${stream.username}`;
  };

  if (loading) {
    return (
      <div className="directory-container">
        <div className="directory-loading">
          <div className="loading-spinner"></div>
          <p>Loading streams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directory-container">
        <div className="directory-error">
          <h2>Error Loading Streams</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-container">
      <div className="directory-header">
        <h1>Stream Directory</h1>
        <p>Discover live streams from the VIMM community</p>
      </div>

      {/* Advertisement Section */}
      <div id="frame" style={{width: '100%', margin: 'auto', position: 'relative', zIndex: 99998, marginBottom: 'var(--spacing-xl)'}}>
        <iframe data-aa='2413321' src='//acceptable.a-ads.com/2413321/?size=Adaptive'
          style={{border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto'}}></iframe>
      </div>
      {/* End Advertisement Section */}

      <div className="directory-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search streams, users, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="directory-search"
          />
        </div>

        <div className="filter-section">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-filter"
          >
            <option value="viewers">Sort by Viewers</option>
            <option value="username">Sort by Username</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      <div className="directory-stats">
        <p>{filteredStreams.length} stream{filteredStreams.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="streams-grid">
        {filteredStreams.map(stream => (
          <div key={stream.id} className="stream-card" onClick={() => handleStreamClick(stream)}>
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
              {stream.description && (
                <p className="stream-description">{stream.description}</p>
              )}
              <div className="stream-actions">
                <FollowButton 
                  username={stream.username} 
                  size="small"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStreams.length === 0 && !loading && (
        <div className="no-results">
          <h3>No streams found</h3>
          <p>Try adjusting your search criteria or check back later.</p>
        </div>
      )}
    </div>
  );
}

export default Directory;
