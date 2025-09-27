import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import FollowButton from './auth/FollowButton';
import './Sidebar.css';

function Sidebar({ activeStreams }) {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', icon: '🏠', path: '/' },
    { name: 'Directory', icon: '📂', path: '/directory' },
    { name: 'Following', icon: '❤️', path: '/following' },
    { name: 'FAQ', icon: '❓', path: '/faq' }
  ];

  return (
    <div className="sidebar">
      <div className="nav-links">
        {navLinks.map(link => (
          <Link 
            key={link.name} 
            to={link.path} 
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-text">{link.name}</span>
          </Link>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="streams-section">
        <h3 className="section-title">Active Streams</h3>
        <div className="active-streams">
          {activeStreams.map(stream => (
            <div key={stream.id} className="stream-item">
              <img 
                src={stream.avatar} 
                alt={`${stream.username}'s avatar`} 
                className="stream-avatar" 
              />
              <div className="stream-info">
                <div className="stream-username">{stream.username}</div>
                <div className="stream-title">{stream.title}</div>
                <div className="stream-viewers">{stream.viewers} viewers</div>
              </div>
              <div className="stream-actions">
                <FollowButton 
                  username={stream.username} 
                  size="small"
                  className="sidebar-follow-btn"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;