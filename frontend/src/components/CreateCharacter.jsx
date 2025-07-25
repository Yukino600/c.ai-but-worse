import React, { useState } from 'react';
import './CreateCharacter.css';

const API_BASE_URL = 'http://localhost:5000/api';

const CreateCharacter = ({ isOpen, onClose, onCharacterCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    background: '',
    responseStyle: 'casual',
    tags: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const responseStyles = [
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'formal', label: 'Formal & Professional' },
    { value: 'energetic', label: 'Energetic & Enthusiastic' },
    { value: 'calm', label: 'Calm & Peaceful' },
    { value: 'humorous', label: 'Witty & Humorous' },
    { value: 'serious', label: 'Serious & Thoughtful' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Avatar file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.personality.trim()) {
      setError('Name, description, and personality are required');
      setIsSubmitting(false);
      return;
    }

    if (formData.name.length > 50) {
      setError('Character name must be 50 characters or less');
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append text data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Append avatar if selected
      if (avatar) {
        submitData.append('avatar', avatar);
      }

      const token = localStorage.getItem('chatapp_token');
      const response = await fetch(`${API_BASE_URL}/characters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          personality: '',
          background: '',
          responseStyle: 'casual',
          tags: ''
        });
        setAvatar(null);
        setAvatarPreview(null);
        
        // Notify parent component
        onCharacterCreated(data.character);
        onClose();
      } else {
        setError(data.message || 'Failed to create character');
      }
    } catch (error) {
      console.error('Error creating character:', error);
      setError('Failed to create character. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-character-overlay">
      <div className="create-character-modal">
        <div className="create-character-header">
          <h2>Create Your AI Character</h2>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-character-form">
          {error && <div className="error-message">{error}</div>}

          {/* Avatar Upload */}
          <div className="form-group">
            <label>Character Avatar</label>
            <div className="avatar-upload-section">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>📷</span>
                    <p>Upload Avatar</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Character Name */}
          <div className="form-group">
            <label htmlFor="name">Character Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Sherlock Holmes"
              maxLength={50}
              required
              disabled={isSubmitting}
            />
            <small>{formData.name.length}/50 characters</small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Short Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., A brilliant detective from Victorian London"
              maxLength={200}
              required
              disabled={isSubmitting}
            />
            <small>{formData.description.length}/200 characters</small>
          </div>

          {/* Personality */}
          <div className="form-group">
            <label htmlFor="personality">Personality & Traits *</label>
            <textarea
              id="personality"
              name="personality"
              value={formData.personality}
              onChange={handleInputChange}
              placeholder="Describe the character's personality, traits, and how they should behave. Be specific about their speaking style, interests, and quirks."
              maxLength={500}
              rows={4}
              required
              disabled={isSubmitting}
            />
            <small>{formData.personality.length}/500 characters</small>
          </div>

          {/* Response Style */}
          <div className="form-group">
            <label htmlFor="responseStyle">Response Style</label>
            <select
              id="responseStyle"
              name="responseStyle"
              value={formData.responseStyle}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              {responseStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Background (Optional) */}
          <div className="form-group">
            <label htmlFor="background">Background Story (Optional)</label>
            <textarea
              id="background"
              name="background"
              value={formData.background}
              onChange={handleInputChange}
              placeholder="Additional background information, history, or context that helps define the character."
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
            />
            <small>{formData.background.length}/1000 characters</small>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., detective, smart, british, mystery"
              disabled={isSubmitting}
            />
            <small>Separate tags with commas</small>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCharacter;
