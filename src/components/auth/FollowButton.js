/**
 * Follow/Unfollow Button Component
 * Handles channel follow/unfollow interactions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import followService from '../../services/followService';
import './FollowButton.css';

function FollowButton({ username, className = '', size = 'medium', showFollowCount = false }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load initial follow status and stats
  useEffect(() => {
    const loadFollowData = async () => {
      if (!username) return;

      try {
        // Load follow status if user is authenticated
        if (isAuthenticated) {
          const following = await followService.isFollowing(username);
          setIsFollowing(following);
        }

        // Load follower count if requested
        if (showFollowCount) {
          const stats = await followService.getFollowStats(username);
          setFollowerCount(stats.followerCount);
        }
      } catch (err) {
        console.error('Error loading follow data:', err);
      }
    };

    loadFollowData();
  }, [username, isAuthenticated, showFollowCount]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !username || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await followService.unfollowChannel(username);
        setIsFollowing(false);
        if (showFollowCount) {
          setFollowerCount(prev => Math.max(0, prev - 1));
        }
      } else {
        await followService.followChannel(username);
        setIsFollowing(true);
        if (showFollowCount) {
          setFollowerCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Follow operation error:', err);
      setError(err.message);
      
      // Reset error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no username provided
  if (!username) {
    return null;
  }

  const buttonClasses = [
    'follow-button',
    `follow-button--${size}`,
    isFollowing ? 'follow-button--following' : 'follow-button--not-following',
    loading ? 'follow-button--loading' : '',
    !isAuthenticated ? 'follow-button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div className="follow-button-container">
      <button
        className={buttonClasses}
        onClick={handleFollowToggle}
        disabled={!isAuthenticated || loading}
        title={
          !isAuthenticated 
            ? 'Login to follow channels' 
            : isFollowing 
              ? `Unfollow ${username}` 
              : `Follow ${username}`
        }
      >
        {loading ? (
          <>
            <span className="follow-button__spinner"></span>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </>
        ) : (
          <>
            <span className="follow-button__icon">
              {isFollowing ? '✓' : '+'}
            </span>
            {isFollowing ? 'Following' : 'Follow'}
            {showFollowCount && followerCount > 0 && (
              <span className="follow-button__count">
                {formatFollowerCount(followerCount)}
              </span>
            )}
          </>
        )}
      </button>

      {error && (
        <div className="follow-button-error">
          {error}
        </div>
      )}
    </div>
  );
}

export default FollowButton;