import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UpvoteButton.css';

function UpvoteButton({ username, permlink }) {
  const { user, isAuthenticated } = useAuth();
  const [showSlider, setShowSlider] = useState(false);
  const [votePercentage, setVotePercentage] = useState(100);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Close slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSlider(false);
      }
    };

    if (showSlider) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSlider]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      setError('Please log in to upvote');
      return;
    }

    if (!window.hive_keychain) {
      setError('Hive Keychain not detected. Please install it to vote.');
      return;
    }

    if (!permlink) {
      setError('Stream post not found');
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      // Use Hive Keychain to vote
      const weight = votePercentage * 100; // Keychain expects weight from 0-10000
      
      window.hive_keychain.requestVote(
        user.username,
        username,
        permlink,
        weight,
        (response) => {
          setIsVoting(false);
          if (response.success) {
            setHasVoted(true);
            setShowSlider(false);
            // Reset voted state after 5 seconds to allow re-voting with different percentage
            setTimeout(() => setHasVoted(false), 5000);
          } else {
            setError(response.message || 'Failed to upvote');
          }
        }
      );
    } catch (err) {
      setIsVoting(false);
      setError('Failed to upvote. Please try again.');
      console.error('Upvote error:', err);
    }
  };

  const handleMouseEnter = () => {
    if (isAuthenticated) {
      setShowSlider(true);
    }
  };

  const handlePercentageClick = (percentage) => {
    setVotePercentage(percentage);
  };

  return (
    <div 
      className="upvote-button-container" 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
    >
      <button
        className={`upvote-button ${hasVoted ? 'voted' : ''} ${!isAuthenticated || !permlink ? 'disabled' : ''}`}
        onClick={handleUpvote}
        disabled={isVoting || !isAuthenticated || !permlink}
        title={
          !permlink ? 'Stream post not available' :
          !isAuthenticated ? 'Log in to upvote' : 
          'Upvote this stream'
        }
      >
        <svg 
          viewBox="0 0 24 24" 
          className="upvote-icon"
          fill="currentColor"
        >
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
        <span className="upvote-text">
          {hasVoted ? 'Voted!' : isVoting ? 'Voting...' : 'Upvote'}
        </span>
      </button>

      {showSlider && isAuthenticated && (
        <div className="upvote-slider-panel">
          <div className="slider-header">
            <span>Vote Weight</span>
            <span className="percentage-display">{votePercentage}%</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="100"
            value={votePercentage}
            onChange={(e) => setVotePercentage(Number(e.target.value))}
            className="vote-slider"
          />

          <div className="quick-select">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                className={`quick-select-btn ${votePercentage === percentage ? 'active' : ''}`}
                onClick={() => handlePercentageClick(percentage)}
              >
                {percentage}%
              </button>
            ))}
          </div>

          <button
            className="confirm-vote-btn"
            onClick={handleUpvote}
            disabled={isVoting}
          >
            {isVoting ? 'Voting...' : `Upvote ${votePercentage}%`}
          </button>
        </div>
      )}

      {error && (
        <div className="upvote-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default UpvoteButton;
