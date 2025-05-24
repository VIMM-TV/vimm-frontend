import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Mock user data - in a real app this would come from authentication
  const userData = {
    username: 'chirenonhive',
    avatar: 'https://avatars.githubusercontent.com/u/44252697?v=4'
  };
  
  // Mock active streams data - in a real app this would come from an API
  const activeStreams = [
    { id: 1, username: 'gamer123', title: 'Playing Fortnite', viewers: 1243, avatar: 'https://via.placeholder.com/40' },
    { id: 2, username: 'streamqueen', title: 'Just Chatting', viewers: 856, avatar: 'https://via.placeholder.com/40' },
    { id: 3, username: 'proplayer', title: 'Ranked matches', viewers: 2105, avatar: 'https://via.placeholder.com/40' },
    { id: 4, username: 'artcreator', title: 'Digital painting', viewers: 437, avatar: 'https://via.placeholder.com/40' },
    { id: 5, username: 'musiclover', title: 'Piano practice', viewers: 691, avatar: 'https://via.placeholder.com/40' }
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