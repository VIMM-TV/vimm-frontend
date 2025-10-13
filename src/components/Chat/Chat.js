/**
 * Chat Component - Real-time chat implementation
 * Implements the vimm-chat integration as per CHAT_INTEGRATION_SPEC.md
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import chatService from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config';
import './Chat.css';

function Chat({ hiveAccount }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatConfig, setChatConfig] = useState(null);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const room = `chat-${hiveAccount}`;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages and config
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load messages
        const messagesData = await chatService.getMessages(hiveAccount, 50);
        setMessages(messagesData);

        // Load chat config
        const configData = await chatService.getConfig(hiveAccount);
        setChatConfig(configData);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load chat data:', err);
        setError('Failed to load chat. Please try again.');
        setLoading(false);
      }
    };

    if (hiveAccount) {
      loadChatData();
    }
  }, [hiveAccount]);

  // Connect to Socket.IO
  useEffect(() => {
    if (!hiveAccount) return;

    console.log('Initializing Socket.IO connection to:', config.chat.server);

    // Initialize socket connection
    socketRef.current = io(config.chat.server, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      console.log('Joining room:', room);
      socketRef.current.emit('join-room', room);
      setConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setConnected(false);
    });

    // Listen for new messages
    socketRef.current.on('chat-message', (data) => {
      console.log('Received chat message via socket:', data);
      setMessages((prevMessages) => {
        // Avoid duplicates - check if message already exists
        const messageExists = prevMessages.some(
          msg => msg.id === data.id || 
          (msg.timestamp === data.timestamp && msg.username === data.username && msg.message === data.message)
        );
        
        if (messageExists) {
          console.log('Duplicate message detected, skipping');
          return prevMessages;
        }
        
        return [...prevMessages, data];
      });
    });

    // Listen for message acknowledgment
    socketRef.current.on('message-sent', (data) => {
      console.log('Message acknowledgment received:', data);
    });

    // Listen for any other events (debugging)
    socketRef.current.onAny((eventName, ...args) => {
      console.log('Socket.IO event received:', eventName, args);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
      // Don't set error state for connection issues to avoid blocking UI
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [hiveAccount, room]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !token || sending) {
      return;
    }

    const messageText = inputMessage.trim();
    const username = user?.username || user?.hiveAccount;

    try {
      setSending(true);

      // Clear input immediately for better UX
      setInputMessage('');

      // Send via REST API for persistence
      const result = await chatService.sendMessage(hiveAccount, messageText, token);
      
      console.log('Message sent successfully:', result);

      // Add message to local state immediately
      // The socket broadcast should handle this, but we add it as fallback
      if (result.data) {
        setMessages((prevMessages) => {
          // Check if message already exists
          const messageExists = prevMessages.some(
            msg => msg.id === result.data.id
          );
          
          if (messageExists) {
            console.log('Message already in state');
            return prevMessages;
          }
          
          console.log('Adding message to local state');
          return [...prevMessages, result.data];
        });
      }

      // ALSO broadcast via Socket.IO to notify other clients
      // (The server should also do this, but we do it for redundancy)
      if (socketRef.current && socketRef.current.connected) {
        console.log('Broadcasting message via Socket.IO to room:', room);
        socketRef.current.emit('chat-message', {
          room: room,
          username: username,
          message: messageText,
          hiveAccount: hiveAccount,
          timestamp: result.data?.timestamp || new Date().toISOString(),
          id: result.data?.id
        });
      } else {
        console.warn('Socket not connected, message not broadcast to other clients');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert(err.message || 'Failed to send message. Please try again.');
      // Restore message on error
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Handle message delete (moderator only)
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!token) return;

    try {
      await chatService.deleteMessage(hiveAccount, messageId, token);
      // Remove message from local state
      setMessages((prevMessages) => 
        prevMessages.filter((msg) => msg.id !== messageId)
      );
    } catch (err) {
      console.error('Error deleting message:', err);
      alert(err.message || 'Failed to delete message.');
    }
  }, [hiveAccount, token]);

  // Check if user is moderator or owner
  const isModerator = useCallback(() => {
    if (!user) return false;
    const username = user.username || user.hiveAccount;
    return (
      username === hiveAccount ||
      (chatConfig?.moderators && chatConfig.moderators.includes(username))
    );
  }, [user, hiveAccount, chatConfig]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="chat-component">
        <div className="chat-loading">Loading chat...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="chat-component">
        <div className="chat-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="chat-component">
      {/* Connection status */}
      {!connected && !loading && (
        <div className="chat-status-message" style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderColor: 'rgba(255, 68, 68, 0.2)' }}>
          Chat server disconnected. Attempting to reconnect...
        </div>
      )}
      
      {/* Chat status message */}
      {chatConfig?.slowMode && (
        <div className="chat-status-message">
          Slow mode: {chatConfig.slowModeInterval}s between messages
        </div>
      )}
      {chatConfig?.followersOnly && (
        <div className="chat-status-message">
          Followers-only mode
        </div>
      )}

      {/* Messages container */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty">
            No messages yet. Be the first to chat!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id || message.timestamp} className="chat-message">
              <div className="chat-message-content">
                <span
                  className={`chat-message-username ${
                    message.username === hiveAccount
                      ? 'owner'
                      : message.isModerator
                      ? 'moderator'
                      : ''
                  }`}
                >
                  {message.username}:
                </span>
                <span className="chat-message-text">{message.message}</span>
                <span className="chat-message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {isModerator() && (
                <div className="chat-message-actions">
                  <button
                    className="chat-message-delete-btn"
                    onClick={() => handleDeleteMessage(message.id)}
                    title="Delete message"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="chat-input-container">
        {user && token ? (
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              placeholder="Send a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={!inputMessage.trim() || sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        ) : (
          <div className="chat-login-message">
            <a href="/login" className="chat-login-link">
              Log in
            </a>{' '}
            to chat
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
