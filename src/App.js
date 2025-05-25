import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import config from './config';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeStreams, setActiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock user data - in a real app this would come from authentication
  const userData = {
    username: 'chiren',
    avatar: 'https://images.hive.blog/u/chiren/avatar'
  };
  
  // Fetch streams from API
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        //const response = await fetch(config.core.server + config.core.endpoints.streams);
        const response = await fetch("http://localhost:3000/api/streams");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match the expected format for the Sidebar component
        const transformedStreams = data.streams.map(stream => ({
          id: stream.id,
          username: stream.username,
          title: stream.title || 'Untitled Stream',
          viewers: Math.floor(Math.random() * 2000) + 100, // TODO: Add viewer count to API
          avatar: `https://images.hive.blog/u/${stream.username}/avatar`, // TODO: Add avatar URL to API
          thumbnail: stream.thumbnail,
          isLive: stream.isLive,
          streamPath: stream.streamPath,
          startTime: stream.startTime,
          description: stream.description,
          language: stream.language,
          category: stream.category
        }));
        
        setActiveStreams(transformedStreams);
        console.log('Fetched streams:', transformedStreams); // Debugging line
      } catch (err) {
        console.error('Failed to fetch streams:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        const fallbackStreams = [
          { id: 1, username: 'gamer123', title: 'Playing Fortnite', viewers: 1243, avatar: 'https://i.pravatar.cc/40?u=gamer123' },
          { id: 2, username: 'streamqueen', title: 'Just Chatting', viewers: 856, avatar: 'https://i.pravatar.cc/40?u=streamqueen' },
          { id: 3, username: 'proplayer', title: 'Ranked matches', viewers: 2105, avatar: 'https://i.pravatar.cc/40?u=proplayer' },
          { id: 4, username: 'artcreator', title: 'Digital painting', viewers: 437, avatar: 'https://i.pravatar.cc/40?u=artcreator' },
          { id: 5, username: 'musiclover', title: 'Piano practice', viewers: 691, avatar: 'https://i.pravatar.cc/40?u=musiclover' }
        ];
        setActiveStreams(fallbackStreams);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    
    // Optional: Set up polling to refresh streams periodically
    const interval = setInterval(fetchStreams, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Mock login handler - in a real app this would integrate with auth system
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  // Mock logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        userData={userData}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <div className="content-container">
        <Sidebar activeStreams={activeStreams} />
        <MainContent />
      </div>
    </div>
  );
}

export default App;