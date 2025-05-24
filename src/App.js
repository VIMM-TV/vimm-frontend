import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock user data - in a real app this would come from authentication
  const userData = {
    username: 'chiren',
    avatar: 'https://images.hive.blog/u/chiren/avatar'
  };
  
  // Mock active streams data - in a real app this would come from an API
  const activeStreams = [
    { id: 1, username: 'gamer123', title: 'Playing Fortnite', viewers: 1243, avatar: 'https://i.pravatar.cc/40?u=gamer123' },
    { id: 2, username: 'streamqueen', title: 'Just Chatting', viewers: 856, avatar: 'https://i.pravatar.cc/40?u=streamqueen' },
    { id: 3, username: 'proplayer', title: 'Ranked matches', viewers: 2105, avatar: 'https://i.pravatar.cc/40?u=proplayer' },
    { id: 4, username: 'artcreator', title: 'Digital painting', viewers: 437, avatar: 'https://i.pravatar.cc/40?u=artcreator' },
    { id: 5, username: 'musiclover', title: 'Piano practice', viewers: 691, avatar: 'https://i.pravatar.cc/40?u=musiclover' }
  ];
  
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