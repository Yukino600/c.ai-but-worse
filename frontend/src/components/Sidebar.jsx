import React, { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar({ conversations, onSelect, selectedConvo, currentUserId, onStartAIChat, onCreateCharacter }) {
  const [characters, setCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  // Load characters from database
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/characters');
      const data = await response.json();
      
      if (data.success) {
        setCharacters(data.characters);
      } else {
        console.error('Failed to load characters:', data.message);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoadingCharacters(false);
    }
  };

  // Helper function to get initials from participant names
  const getInitials = (participants) => {
    if (!participants || participants.length === 0) return '?';
    return participants
      .slice(0, 2) // Take first 2 participants max
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  };

  // Helper function to get avatar for conversation
  const getConversationAvatar = (conversation) => {
    // If we have participant user data, use it
    if (conversation.participantUsers && conversation.participantUsers.length > 0) {
      // Find the first participant that has an avatar
      for (const participant of conversation.participantUsers) {
        if (participant.avatar) {
          // Special handling for EnderZip - use Character avatar if available
          if (participant.username === 'EnderZip' || participant.name === 'EnderZip') {
            // For EnderZip, use the uploaded avatar from Character collection
            return (
              <img 
                src="http://localhost:5000/uploads/avatars/avatar-1753450827212-242164846.png"
                alt={participant.name || participant.username}
                className="conversation-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            );
          } else {
            // For other participants, determine avatar path
            const isUploadedAvatar = participant.avatar.startsWith('avatar-');
            const avatarPath = isUploadedAvatar 
              ? `/uploads/avatars/${participant.avatar}` 
              : `/avatars/${participant.avatar}`;
              
            return (
              <img 
                src={`http://localhost:5000${avatarPath}`} 
                alt={participant.name || participant.username}
                className="conversation-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            );
          }
        }
      }
    }
    
    return null; // Return null to show fallback
  };

  // Helper function to truncate long participant lists
  const getParticipantDisplay = (participants) => {
    if (!participants || participants.length === 0) return 'Unknown';
    if (participants.length <= 2) {
      return participants.join(', ');
    }
    return `${participants.slice(0, 2).join(', ')} +${participants.length - 2}`;
  };

  // Helper function to format the last message preview
  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) {
      return {
        text: 'Start a conversation...',
        sender: null,
        time: null
      };
    }

    const { content, senderId, senderName, createdAt } = conversation.lastMessage;
    const isCurrentUser = senderId === currentUserId;
    const senderDisplay = isCurrentUser ? 'You' : (senderName || 'Unknown');
    
    // Truncate long messages
    const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    // Format time (you can customize this based on your needs)
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) { // Less than a week
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    };

    return {
      text: truncatedContent,
      sender: senderDisplay,
      time: formatTime(createdAt)
    };
  };

  // Handle character selection for AI chat
  const handleCharacterSelect = (character) => {
    console.log('🎯 Character clicked:', character);
    console.log('🎯 Character name:', character?.name);
    console.log('🎯 Character ID:', character?._id);
    console.log('🎯 Character isOfficial:', character?.isOfficial);
    onStartAIChat(character);
  };

  return (
    <div className="sidebar">
      {/* Messages Section */}
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-list">
          {conversations.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              No conversations yet
            </div>
          ) : (
            conversations.map(convo => {
              const lastMessagePreview = getLastMessagePreview(convo);
              
              return (
                <div
                  key={convo._id}
                  className={`chat-item ${selectedConvo?._id === convo._id ? 'selected' : ''}`}
                  onClick={() => onSelect(convo)}
                >
                  <div className="chat-avatar">
                    {getConversationAvatar(convo)}
                    <div 
                      className="conversation-avatar-fallback"
                      style={{ 
                        display: (convo.participantUsers?.[0]?.avatar) ? 'none' : 'flex' 
                      }}
                    >
                      {getInitials(convo.participants)}
                    </div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-header-row">
                      <div className="chat-name">
                        {getParticipantDisplay(convo.participants)}
                      </div>
                      {lastMessagePreview.time && (
                        <div className="chat-time">
                          {lastMessagePreview.time}
                        </div>
                      )}
                    </div>
                    <div className="chat-last">
                      {lastMessagePreview.sender && (
                        <span className="sender-name">
                          {lastMessagePreview.sender}: 
                        </span>
                      )}
                      <span className="message-preview">
                        {lastMessagePreview.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Characters Section */}
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h2>AI Characters</h2>
        </div>
        <div className="character-list">
          {loadingCharacters ? (
            <div className="loading-characters">
              Loading characters...
            </div>
          ) : characters.length === 0 ? (
            <div className="no-characters">
              No characters available
            </div>
          ) : (
            characters.map(character => (
              <div
                key={character._id}
                className="character-item"
                onClick={() => handleCharacterSelect(character)}
              >
                <div className="character-avatar">
                  {character.avatar ? (
                    <img 
                      src={character.avatar.includes('avatar-') ? `http://localhost:5000/uploads/avatars/${character.avatar}` : `/avatars/${character.avatar}`}
                      alt={character.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="character-avatar-fallback"
                    style={{ display: character.avatar ? 'none' : 'flex' }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="character-info">
                  <div className="character-name">
                    {character.name}
                    {character.isOfficial && (
                      <span className="official-badge">★</span>
                    )}
                  </div>
                  <div className="character-description">
                    {character.description}
                  </div>
                  {!character.isOfficial && (
                    <div className="character-creator">
                      by {character.createdByUsername}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create AI Button */}
        <div className="create-ai-section">
          <button 
            className="create-ai-button" 
            onClick={onCreateCharacter}
            title="Create your own AI character"
          >
            <span className="create-ai-icon">+</span>
            <span className="create-ai-text">Create AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}