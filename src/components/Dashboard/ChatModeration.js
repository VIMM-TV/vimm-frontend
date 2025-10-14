/**
 * ChatModeration Component
 * Chat display with moderation controls for streamers
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import chatService from '../../services/chatService';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config';
import './ChatModeration.css';

function ChatModeration({ hiveAccount }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [moderationSettings, setModerationSettings] = useState({
    slowMode: false,
    slowModeDelay: 0,
    followersOnly: false,
    emoteOnly: false,
    moderators: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModeratorsModal, setShowModeratorsModal] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const room = `chat-${hiveAccount}`;

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load messages
        const messagesData = await chatService.getMessages(hiveAccount, 100);
        setMessages(messagesData);

        // Load moderation settings
        const settings = await dashboardService.getChatModerationSettings(hiveAccount, token);
        setModerationSettings(settings);

        // Load banned users
        const banned = await dashboardService.getBannedUsers(hiveAccount, token);
        setBannedUsers(banned);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load chat data:', err);
        setError('Failed to load chat data');
        setLoading(false);
      }
    };

    if (hiveAccount && token) {
      loadData();
    }
  }, [hiveAccount, token]);

  // Socket.IO connection
  useEffect(() => {
    if (!hiveAccount) return;

    socketRef.current = io(config.chat.server, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      setConnected(true);
      socketRef.current.emit('join-room', room);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setConnected(false);
    });

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('message-deleted', (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-room', room);
        socketRef.current.disconnect();
      }
    };
  }, [hiveAccount, room]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await chatService.deleteMessage(hiveAccount, messageId, token);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message');
    }
  };

  // Ban user
  const handleBanUser = async (username) => {
    if (!window.confirm(`Are you sure you want to ban ${username}?`)) return;
    
    try {
      await dashboardService.banUser(hiveAccount, username, token);
      setBannedUsers(prev => [...prev, { username }]);
      alert(`${username} has been banned`);
    } catch (err) {
      console.error('Failed to ban user:', err);
      alert('Failed to ban user');
    }
  };

  // Timeout user
  const handleTimeoutUser = async (username) => {
    const duration = window.prompt('Timeout duration in seconds:', '300');
    if (!duration) return;
    
    try {
      await dashboardService.timeoutUser(hiveAccount, username, parseInt(duration), token);
      alert(`${username} has been timed out for ${duration} seconds`);
    } catch (err) {
      console.error('Failed to timeout user:', err);
      alert('Failed to timeout user');
    }
  };

  // Unban user
  const handleUnbanUser = async (username) => {
    try {
      await dashboardService.unbanUser(hiveAccount, username, token);
      setBannedUsers(prev => prev.filter(u => u.username !== username));
      alert(`${username} has been unbanned`);
    } catch (err) {
      console.error('Failed to unban user:', err);
      alert('Failed to unban user');
    }
  };

  // Toggle moderation settings
  const toggleSetting = async (setting) => {
    try {
      const newSettings = {
        ...moderationSettings,
        [setting]: !moderationSettings[setting]
      };
      
      await dashboardService.updateChatModerationSettings(hiveAccount, newSettings, token);
      setModerationSettings(newSettings);
    } catch (err) {
      console.error('Failed to update setting:', err);
      alert('Failed to update setting');
    }
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(msg =>
    !searchQuery ||
    msg.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="chat-moderation loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-moderation">
      <div className="moderation-header">
        <h2>Chat Moderation</h2>
        <div className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Moderation Controls */}
      <div className="moderation-controls">
        <button
          className={`control-btn ${moderationSettings.slowMode ? 'active' : ''}`}
          onClick={() => toggleSetting('slowMode')}
          title="Slow Mode"
        >
          🐌 Slow Mode
        </button>
        <button
          className={`control-btn ${moderationSettings.followersOnly ? 'active' : ''}`}
          onClick={() => toggleSetting('followersOnly')}
          title="Followers Only"
        >
          ⭐ Followers Only
        </button>
        <button
          className={`control-btn ${moderationSettings.emoteOnly ? 'active' : ''}`}
          onClick={() => toggleSetting('emoteOnly')}
          title="Emote Only"
        >
          😀 Emote Only
        </button>
        <button
          className="control-btn"
          onClick={() => setShowModeratorsModal(true)}
          title="Moderators"
        >
          🛡️ Moderators ({moderationSettings.moderators.length})
        </button>
      </div>

      {/* Search */}
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search messages or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Messages */}
      <div className="messages-container">
        {filteredMessages.length === 0 ? (
          <div className="no-messages">
            {searchQuery ? 'No messages match your search' : 'No messages yet'}
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg._id} className="moderation-message">
              <div className="message-header">
                <img
                  src={`https://images.hive.blog/u/${msg.username}/avatar`}
                  alt={`${msg.username}'s avatar`}
                  className="message-avatar"
                />
                <span className="message-username">{msg.username}</span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
              <div className="message-actions">
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteMessage(msg._id)}
                  title="Delete Message"
                >
                  🗑️
                </button>
                <button
                  className="action-btn timeout"
                  onClick={() => handleTimeoutUser(msg.username)}
                  title="Timeout User"
                >
                  ⏱️
                </button>
                <button
                  className="action-btn ban"
                  onClick={() => handleBanUser(msg.username)}
                  title="Ban User"
                >
                  🚫
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Banned Users Modal */}
      {showModeratorsModal && (
        <div className="modal-overlay" onClick={() => setShowModeratorsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Moderation Settings</h3>
            
            <div className="modal-section">
              <h4>Moderators ({moderationSettings.moderators.length})</h4>
              <div className="moderators-list">
                {moderationSettings.moderators.length === 0 ? (
                  <p className="empty-list">No moderators assigned</p>
                ) : (
                  moderationSettings.moderators.map((mod, index) => (
                    <div key={index} className="moderator-item">
                      {mod}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-section">
              <h4>Banned Users ({bannedUsers.length})</h4>
              <div className="banned-list">
                {bannedUsers.length === 0 ? (
                  <p className="empty-list">No banned users</p>
                ) : (
                  bannedUsers.map((user, index) => (
                    <div key={index} className="banned-item">
                      <span>{user.username}</span>
                      <button
                        className="unban-btn"
                        onClick={() => handleUnbanUser(user.username)}
                      >
                        Unban
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              className="modal-close-btn"
              onClick={() => setShowModeratorsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatModeration;
