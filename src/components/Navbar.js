import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HiveLogin from './auth/HiveLogin';
import './Navbar.css';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to directory page with search query
      navigate(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Navigate to directory page without search
      navigate('/directory');
    }
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
        <Link to="/" className="logo"><img src="/logo.svg" alt="VIMM Logo" className="logo-image" /> VIMM</Link>
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
              <Link to="/dashboard/streamer" className="dropdown-item">Streamer Dashboard</Link>
              <div className="dropdown-item">Profile</div>
              <Link to="/stream-key" className="dropdown-item">Stream Key</Link>
              <Link to="/settings" className="dropdown-item">Channel Settings</Link>
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