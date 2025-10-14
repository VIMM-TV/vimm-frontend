import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import WatchPage from './pages/WatchPage';
import StreamKeyGenerator from './pages/StreamKeyGenerator';
import ChannelSettings from './pages/ChannelSettings';
import Directory from './pages/Directory';
import Following from './pages/Following';
import FAQ from './pages/FAQ';
import StreamerDashboard from './pages/StreamerDashboard';
import config from './config/default';

function AppContent() {
  const [activeStreams, setActiveStreams] = useState([]);
  const [sidebarStreams, setSidebarStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const location = useLocation();
  const isWatchPage = location.pathname === '/watch';
  const hideSidebarPaths = ['/watch'];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);
  
  // Fetch streams from API
  const fetchStreams = useCallback(async () => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
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
        category: stream.category
      }));
      
      setSidebarStreams(transformedStreams);
      
      if (isInitialLoad) {
        setActiveStreams(transformedStreams);
        setIsInitialLoad(false);
      }
      
      console.log('Fetched streams for sidebar:', transformedStreams);
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

      setSidebarStreams(fallbackStreams);
      if (isInitialLoad) {
        setActiveStreams(fallbackStreams);
        setIsInitialLoad(false);
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [isInitialLoad]);

  useEffect(() => {
    // Skip fetching streams entirely if we're on the watch page
    if (isWatchPage && isInitialLoad) {
      setIsInitialLoad(false);
      setLoading(false);
      return;
    }
    
    // Initial fetch only if not already loaded and not on watch page
    if (isInitialLoad) {
      fetchStreams();
    }
    
    // Set up polling to refresh sidebar streams periodically
    // Don't poll when on watch page to prevent player reinitialization
    const interval = setInterval(() => {
      if (!isWatchPage) {
        fetchStreams();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isWatchPage, isInitialLoad, fetchStreams]);

  // Function to refresh main content manually
  const refreshMainContent = useCallback(() => {
    setActiveStreams([...sidebarStreams]);
  }, [sidebarStreams]);

  return (
    <div className="App">
      <Navbar />
      <div className={`content-container ${isWatchPage ? 'watch-mode' : ''}`}>
        {!shouldHideSidebar && <Sidebar activeStreams={sidebarStreams} />}
        <Routes>
          <Route 
            path="/" 
            element={
              <MainContent 
                activeStreams={activeStreams}
                loading={loading}
                error={error}
                onRefresh={refreshMainContent}
              />
            } 
          />
          <Route path="/directory" element={<Directory />} />
          <Route path="/following" element={<Following />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/stream-key" element={<StreamKeyGenerator />} />
          <Route path="/settings" element={<ChannelSettings />} />
          <Route path="/dashboard/streamer" element={<StreamerDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;