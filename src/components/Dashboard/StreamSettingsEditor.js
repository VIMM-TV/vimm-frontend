/**
 * StreamSettingsEditor Component
 * Form for editing stream metadata and settings
 */

import React, { useState, useEffect } from 'react';
import './StreamSettingsEditor.css';

function StreamSettingsEditor({ initialSettings, onSave, loading }) {
  const [settings, setSettings] = useState({
    title: '',
    description: '',
    tags: [],
    language: '',
    contentRating: 'general'
  });
  const [tagInput, setTagInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings({
        title: initialSettings.title || '',
        description: initialSettings.description || '',
        tags: initialSettings.tags || [],
        language: initialSettings.language || '',
        contentRating: initialSettings.contentRating || 'general'
      });
      setLastUpdated(initialSettings.lastUpdated);
    }
  }, [initialSettings]);

  useEffect(() => {
    // Check if there are changes
    if (initialSettings) {
      const changed = 
        settings.title !== (initialSettings.title || '') ||
        settings.description !== (initialSettings.description || '') ||
        JSON.stringify(settings.tags) !== JSON.stringify(initialSettings.tags || []) ||
        settings.language !== (initialSettings.language || '') ||
        settings.contentRating !== (initialSettings.contentRating || 'general');
      
      setHasChanges(changed);
    }
  }, [settings, initialSettings]);

  const validateForm = () => {
    const newErrors = {};

    if (!settings.title.trim()) {
      newErrors.title = 'Stream title is required';
    } else if (settings.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (settings.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (settings.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    
    if (tag && !settings.tags.includes(tag) && settings.tags.length < 10) {
      setSettings(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(settings);
    }
  };

  const languages = [
    { code: '', name: 'Select Language' },
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

  const contentRatings = [
    { value: 'general', label: 'General Audience', description: 'Suitable for all ages' },
    { value: 'teen', label: 'Teen', description: 'May contain mild language or themes' },
    { value: 'mature', label: 'Mature', description: 'Adult content, strong language' }
  ];

  return (
    <div className="stream-settings-editor">
      <div className="settings-header">
        <h2>Stream Settings</h2>
        {lastUpdated && (
          <span className="last-updated">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Stream Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Stream Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            value={settings.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter your stream title"
            maxLength={100}
          />
          <div className="form-helper">
            <span className={errors.title ? 'error-text' : ''}>
              {errors.title || `${settings.title.length}/100 characters`}
            </span>
          </div>
        </div>

        {/* Stream Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            value={settings.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your stream..."
            rows={4}
            maxLength={500}
          />
          <div className="form-helper">
            <span className={errors.description ? 'error-text' : ''}>
              {errors.description || `${settings.description.length}/500 characters`}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags" className="form-label">
            Tags/Categories
          </label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              className="form-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              placeholder="Add tags (press Enter)"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="add-tag-btn"
              disabled={!tagInput.trim() || settings.tags.length >= 10}
            >
              Add Tag
            </button>
          </div>
          <div className="tags-container">
            {settings.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="form-helper">
            <span className={errors.tags ? 'error-text' : ''}>
              {errors.tags || `${settings.tags.length}/10 tags`}
            </span>
          </div>
        </div>

        {/* Language */}
        <div className="form-group">
          <label htmlFor="language" className="form-label">
            Language
          </label>
          <select
            id="language"
            className="form-select"
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content Rating */}
        <div className="form-group">
          <label className="form-label">Content Rating</label>
          <div className="radio-group">
            {contentRatings.map((rating) => (
              <label key={rating.value} className="radio-label">
                <input
                  type="radio"
                  name="contentRating"
                  value={rating.value}
                  checked={settings.contentRating === rating.value}
                  onChange={(e) => handleInputChange('contentRating', e.target.value)}
                  className="radio-input"
                />
                <div className="radio-content">
                  <div className="radio-title">{rating.label}</div>
                  <div className="radio-description">{rating.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={!hasChanges || loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Saving...
              </>
            ) : (
              <>💾 Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StreamSettingsEditor;
