import React from 'react';
import './Sidebar.css';

function Sidebar({ activeStreams }) {
  const navLinks = [
    { name: 'Home', icon: '🏠' },
    { name: 'Directory', icon: '📂' },
    { name: 'Following', icon: '❤️' },
    { name: 'FAQ', icon: '❓' },
    { name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="sidebar">
      <div className="nav-links">
        {navLinks.map(link => (
          <div key={link.name} className="nav-link">
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-text">{link.name}</span>
          </div>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;