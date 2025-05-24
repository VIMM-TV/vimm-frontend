import React, { useState } from 'react';
import './Navbar.css';

function Navbar({ isLoggedIn, userData, onLogin, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
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
        {isLoggedIn ? (
          <div className="user-menu">
            <img 
              src={userData.avatar} 
              alt={`${userData.username}'s avatar`} 
              className="user-avatar" 
            />
            <div className="dropdown-menu">
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Settings</div>
              <div className="dropdown-item" onClick={onLogout}>Logout</div>
            </div>
          </div>
        ) : (
          <button className="login-button" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;