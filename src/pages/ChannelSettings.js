import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import channelSettingsService from '../services/channelSettingsService';
import './ChannelSettings.css';

const ChannelSettings = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    title: '',
    description: '',
    language: '',
    category: ''
  });
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Popular streaming categories for dropdown
  const categories = [
    'Just Chatting',
    'Gaming',
    'Music',
    'Art',
    'Technology',
    'Education',
    'Cooking',
    'Fitness',
    'Travel',
    'IRL',
    'Other'
  ];

  // Common languages for dropdown
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'other', name: 'Other' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to access channel settings');
      setLoading(false);
      return;
    }

    loadChannelSettings();
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if there are unsaved changes
    const changed = Object.keys(settings).some(key => 
      settings[key] !== originalSettings[key]
    );
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadChannelSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await channelSettingsService.getChannelSettings();
      
      const channelData = {
        title: response.title || '',
        description: response.description || '',
        language: response.language || '',
        category: response.category || ''
      };
      
      setSettings(channelData);
      setOriginalSettings(channelData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user starts editing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges) {
      setError('No changes to save');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await channelSettingsService.updateChannelSettings(settings);
      
      setOriginalSettings(settings);
      setSuccess('Channel settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setError(null);
    setSuccess(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="channel-settings">
        <div className="settings-container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>You must be logged in to access channel settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Channel Settings</h1>
          <p>Customize your stream channel information</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading channel settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="settings-form">
            {error && (
              <div className="message error-message">
                <i className="icon-error"></i>
                {error}
              </div>
            )}
            
            {success && (
              <div className="message success-message">
                <i className="icon-success"></i>
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">Stream Title</label>
              <input
                type="text"
                id="title"
                value={settings.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your stream title"
                maxLength="255"
                className="form-input"
              />
              <small className="form-help">
                A catchy title for your stream (max 255 characters)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell viewers what your stream is about..."
                rows="4"
                className="form-textarea"
              />
              <small className="form-help">
                Describe what viewers can expect from your stream
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={settings.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  Choose the category that best fits your content
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select language</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  Primary language of your stream
                </small>
              </div>
            </div>

            {user && (
              <div className="channel-info">
                <h3>Channel Information</h3>
                <div className="info-item">
                  <strong>Username:</strong> @{user.hiveAccount}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="btn btn-secondary"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChannelSettings;
