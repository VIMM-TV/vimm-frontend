import React from 'react';
import './MainContent.css';

function MainContent() {
  return (
    <div className="main-content">
      <h1>Welcome to VIMM</h1>
      <p>This is where the main content will go, such as featured streams, categories, or recommended content.</p>
      <div className="placeholder-content">
        <div className="content-box">Featured Streams</div>
        <div className="content-box">Popular Categories</div>
        <div className="content-box">Recommended For You</div>
      </div>
    </div>
  );
}

export default MainContent;