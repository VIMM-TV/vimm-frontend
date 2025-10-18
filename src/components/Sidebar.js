import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ activeStreams }) {
  const location = useLocation();
  const navigate = useNavigate();
  
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
            <div key={stream.id} className="stream-item" onClick={() => {
              navigate(`/watch?user=${stream.username}`);
            }}>
              <img 
                src={stream.avatar} 
                alt={`${stream.username}'s avatar`} 
                className="sbstream-avatar" 
              />
              <div className="sbstream-info">
                <div className="sbstream-username">{stream.username}</div>
                <div className="sbstream-category">{stream.game || stream.category || 'Just Chatting'}</div>
                <div className="stream-viewers">{stream.viewers} viewers</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ============================================
          ADVERTISEMENT BLOCK
          Replace this section with your own ad code
          Current size: 120x60
          ============================================ */}
      <div id="frame" style={{width: '120px', margin: 'auto', zIndex: 99998, height: 'auto'}}>
        <iframe 
          data-aa='2374197' 
          src='//ad.a-ads.com/2374197/?size=120x60&background_color=1f1f23&title_color=ff7c0a&title_hover_color=fa0&text_color=efeff1&link_color=ff7c0a&link_hover_color=fa0'
          style={{border: 0, padding: 0, width: '120px', height: '60px', overflow: 'hidden', display: 'block', margin: 'auto'}}
          title="Advertisement"
        ></iframe>
      </div>
      {/* ============================================
          END ADVERTISEMENT BLOCK
          ============================================ */}
    </div>
  );
}

export default Sidebar;