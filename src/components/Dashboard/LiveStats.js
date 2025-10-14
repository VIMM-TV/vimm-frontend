/**
 * LiveStats Component
 * Displays real-time stream statistics and metrics
 */

import React, { useState, useEffect } from 'react';
import './LiveStats.css';

function LiveStats({ stats, followerGrowthData }) {
  const [uptime, setUptime] = useState('00:00:00');

  // Format uptime
  useEffect(() => {
    if (!stats?.uptime) {
      setUptime('00:00:00');
      return;
    }

    const updateUptime = () => {
      const now = Date.now();
      const elapsed = now - stats.uptime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      setUptime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateUptime();
    const interval = setInterval(updateUptime, 1000);

    return () => clearInterval(interval);
  }, [stats?.uptime]);

  // Format watch time
  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate follower growth percentage
  const calculateGrowth = () => {
    if (!followerGrowthData || followerGrowthData.length < 2) return 0;
    const oldest = followerGrowthData[0].followers;
    const newest = followerGrowthData[followerGrowthData.length - 1].followers;
    return oldest > 0 ? (((newest - oldest) / oldest) * 100).toFixed(1) : 0;
  };

  const growthPercentage = calculateGrowth();

  return (
    <div className="live-stats">
      <div className="stats-header">
        <h2>Live Statistics</h2>
        <span className="stats-refresh-indicator">
          <span className="refresh-dot"></span> Live
        </span>
      </div>

      <div className="stats-grid">
        {/* Current Viewers */}
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.currentViewers || 0}</div>
            <div className="stat-label">Current Viewers</div>
          </div>
        </div>

        {/* Peak Viewers */}
        <div className="stat-card">
          <div className="stat-icon">🔝</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.peakViewers || 0}</div>
            <div className="stat-label">Peak Viewers</div>
          </div>
        </div>

        {/* Chat Rate */}
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{stats?.chatMessageRate || 0}</div>
            <div className="stat-label">Messages/Min</div>
          </div>
        </div>

        {/* New Followers */}
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value highlight">{stats?.newFollowers || 0}</div>
            <div className="stat-label">New Followers</div>
          </div>
        </div>

        {/* Total Watch Time */}
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatWatchTime(stats?.totalWatchTime || 0)}</div>
            <div className="stat-label">Total Watch Time</div>
          </div>
        </div>

        {/* Uptime */}
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-value">{uptime}</div>
            <div className="stat-label">Stream Uptime</div>
          </div>
        </div>
      </div>

      {/* Follower Growth Chart */}
      {followerGrowthData && followerGrowthData.length > 0 && (
        <div className="follower-growth-section">
          <div className="growth-header">
            <h3>Follower Growth (Last 7 Days)</h3>
            <div className={`growth-badge ${growthPercentage >= 0 ? 'positive' : 'negative'}`}>
              {growthPercentage >= 0 ? '📈' : '📉'} {Math.abs(growthPercentage)}%
            </div>
          </div>
          <div className="growth-chart">
            {followerGrowthData.map((data, index) => {
              const maxFollowers = Math.max(...followerGrowthData.map(d => d.followers));
              const height = (data.followers / maxFollowers) * 100;
              
              return (
                <div key={index} className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${data.date}: ${data.followers} followers`}
                  >
                    <span className="bar-value">{data.followers}</span>
                  </div>
                  <div className="chart-label">
                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveStats;
