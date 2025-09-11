import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HiveLogin from './auth/HiveLogin';
import './Navbar.css';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  // Get avatar URL for authenticated user
  const getAvatarUrl = () => {
    if (user) {
      return `https://images.hive.blog/u/${user}/avatar`;
    }
    return null;
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">VIMM</div>
      </div>
      
      <div className="navbar-center">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search streams or users..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="search-icon">🔍</i>
          </button>
        </form>
      </div>
      
      <div className="navbar-right">
        {loading ? (
          <div className="auth-loading">
            <span className="loading-spinner"></span>
          </div>
        ) : isAuthenticated ? (
          <div className="user-menu">
            <img 
              src={getAvatarUrl()} 
              alt={`${user}'s avatar`} 
              className="user-avatar" 
            />
            <span className="username">@{user}</span>
            <div className="dropdown-menu">
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Settings</div>
              <div className="dropdown-item" onClick={handleLogout}>Logout</div>
            </div>
          </div>
        ) : (
          <button className="login-button" onClick={handleLogin}>
            🔑 Login with Hive
          </button>
        )}
      </div>
      
      {showLoginModal && (
        <HiveLogin onClose={closeLoginModal} />
      )}
    </nav>
  );
}

export default Navbar;