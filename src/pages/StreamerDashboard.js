/**
 * StreamerDashboard Page
 * Main dashboard interface for streamers with comprehensive stream management tools
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StreamPreview from '../components/Dashboard/StreamPreview';
import LiveStats from '../components/Dashboard/LiveStats';
import StreamSettingsEditor from '../components/Dashboard/StreamSettingsEditor';
import ChatModeration from '../components/Dashboard/ChatModeration';
import dashboardService from '../services/dashboardService';
import streamService from '../services/streamService';
import channelSettingsService from '../services/channelSettingsService';
import './StreamerDashboard.css';

function StreamerDashboard() {
  const { isAuthenticated, user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [streamInfo, setStreamInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [followerGrowth, setFollowerGrowth] = useState([]);
  const [streamSettings, setStreamSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);

      // Load stream info
      const info = await streamService.getStreamInfo(user);
      setStreamInfo(info);

      // Load stats
      const statsData = await dashboardService.getStreamStats(user, token);
      setStats(statsData);

      // Load follower growth
      const growth = await dashboardService.getFollowerGrowth(user, token, 7);
      setFollowerGrowth(growth);

      // Load stream settings
      const settings = await channelSettingsService.getChannelSettings();
      setStreamSettings({
        title: settings.title || '',
        description: settings.description || '',
        tags: settings.tags || [],
        language: settings.language || '',
        contentRating: settings.contentRating || 'general',
        lastUpdated: settings.lastUpdated || new Date().toISOString()
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && token) {
      loadDashboardData();
    }
  }, [user, token, loadDashboardData]);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (!user || !token) return;

    const interval = setInterval(async () => {
      try {
        const statsData = await dashboardService.getStreamStats(user, token);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to refresh stats:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, token]);

  // Handle save stream settings
  const handleSaveSettings = async (newSettings) => {
    try {
      setSavingSettings(true);
      setError(null);
      setSuccess(null);

      await dashboardService.updateStreamSettings(user, newSettings, token);
      
      // Update local state
      setStreamSettings({
        ...newSettings,
        lastUpdated: new Date().toISOString()
      });

      setSuccess('Stream settings saved successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="streamer-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="streamer-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Streamer Dashboard</h1>
          <p className="header-subtitle">Welcome back, @{user}!</p>
        </div>
        <button className="refresh-btn" onClick={loadDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span className="alert-message">{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Top Row: Stream Preview and Live Stats */}
        <div className="dashboard-row">
          <div className="dashboard-section stream-preview-section">
            <StreamPreview
              username={user}
              isLive={streamInfo?.isLive || false}
              viewers={stats?.currentViewers || 0}
            />
          </div>
          <div className="dashboard-section stats-section">
            <LiveStats
              stats={stats}
              followerGrowthData={followerGrowth}
            />
          </div>
        </div>

        {/* Bottom Row: Chat Moderation and Stream Settings */}
        <div className="dashboard-row">
          <div className="dashboard-section chat-section">
            <ChatModeration hiveAccount={user} />
          </div>
          <div className="dashboard-section settings-section">
            <StreamSettingsEditor
              initialSettings={streamSettings}
              onSave={handleSaveSettings}
              loading={savingSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreamerDashboard;
