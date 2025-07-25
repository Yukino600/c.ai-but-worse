import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Eye, EyeOff, LogOut, Moon, Sun } from 'lucide-react';
import './App.css';

// Import components
import Sidebar from './components/Sidebar';
import CreateCharacter from './components/CreateCharacter';

// Import character avatars
import itsukiAvatar from './avatars/itsuki.jpg';
import mikuAvatar from './avatars/miku.jpg';
import trumpAvatar from './avatars/Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg';
import ronaldoAvatar from './avatars/Ronaldo.jpg';
import march7thAvatar from './avatars/March7th.jpg';

// DISABLED: Import voice-over files - Python TTS functionality disabled
// import march7thVoice from './voice-over/March7thEN.pth';


// Avatar Component for handling both image and emoji avatars
const Avatar = ({ src, alt, className, fallback, size = "40px" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check if src is an image URL
  const isImageUrl = src && (
    typeof src === 'string' && (
      src.includes('.jpg') || 
      src.includes('.png') || 
      src.includes('.jpeg') || 
      src.includes('.gif') ||
      src.includes('.webp') ||
      src.startsWith('data:image/') ||
      src.startsWith('blob:') ||
      src.startsWith('/static/') ||
      src.includes('avatar')
    )
  );
  
  const handleImageError = (e) => {
    console.error(`Avatar image failed to load: ${src}`, e);
    setImageError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  if (isImageUrl && !imageError) {
    return (
      <img 
        src={src} 
        alt={alt || 'Avatar'}
        className={`avatar-image ${className || ''}`}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover',
          display: imageLoaded ? 'block' : 'none'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  }
  
  return (
    <div 
      className={`avatar-fallback ${className || ''}`}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: src && !isImageUrl ? '1.5rem' : '1rem',
        background: 'var(--surface-secondary)'
      }}
    >
      {(!isImageUrl && src) || fallback || '👤'}
    </div>
  );
};

// DISABLED: VoiceOver Component - Python TTS functionality disabled
const VoiceOver = ({ character, text, isEnabled = false }) => {
  // Voice over functionality has been disabled to prevent Python-related malfunctions
  return null;
  
  // Original voice over code commented out:
  /*
  const [isPlaying, setIsPlaying] = useState(false);
  // Note: audioUrl and audioRef are reserved for future .pth file implementation
  // const [audioUrl, setAudioUrl] = useState(null);
  // const audioRef = useRef(null);

  // Character voice mappings
  const voiceFiles = {
    // 'march7th': march7thVoice,  // DISABLED: Voice files disabled
    // Add more character voices here as you get them
    // 'itsuki': itsukiVoice,
    // 'miku': mikuVoice,
    // 'trump': trumpVoice,
    // 'ronaldo': ronaldoVoice,
  };

  const playVoiceOver = async () => {
    if (!isEnabled || !text) return;
    
    try {
      setIsPlaying(true);
      
      // Try to use backend TTS for characters with custom voice models
      if (voiceFiles[character]) {
        try {
          const response = await fetch(`${API_BASE_URL}/tts/synthesize/${character}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('chatapp_token')}`,
            },
            body: JSON.stringify({ text }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.audioUrl) {
              // Play the generated audio
              const audio = new Audio(result.audioUrl);
              audio.onended = () => setIsPlaying(false);
              audio.onerror = () => {
                console.error('Failed to play custom voice audio');
                fallbackToWebSpeech();
              };
              await audio.play();
              return;
            }
          }
        } catch (error) {
          console.error('Backend TTS error:', error);
        }
      }
      
      // Fallback to Web Speech API
      fallbackToWebSpeech();
      
    } catch (error) {
      console.error('Voice over error:', error);
      setIsPlaying(false);
    }
  };
  
  const fallbackToWebSpeech = () => {
    // Use Web Speech API as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Character-specific voice settings
      switch (character) {
        case 'march7th':
          utterance.pitch = 1.2;
          utterance.rate = 1.1;
          break;
        case 'itsuki':
          utterance.pitch = 1.0;
          utterance.rate = 0.9;
          break;
        case 'miku':
          utterance.pitch = 1.3;
          utterance.rate = 1.2;
          break;
        case 'trump':
          utterance.pitch = 0.8;
          utterance.rate = 0.8;
          break;
        case 'ronaldo':
          utterance.pitch = 0.9;
          utterance.rate = 1.0;
          break;
        default:
          utterance.pitch = 1.0;
          utterance.rate = 1.0;
      }
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  const stopVoiceOver = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <div className="voice-over-controls">
      {voiceFiles[character] && (
        <button
          onClick={isPlaying ? stopVoiceOver : playVoiceOver}
          className={`voice-button ${isPlaying ? 'playing' : ''}`}
          title={isPlaying ? 'Stop voice' : 'Play voice'}
          disabled={!text}
        >
          {isPlaying ? '🔊' : '🔉'}
        </button>
      )}
    </div>
  );
  */
};

// API configuration - replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// API service for backend communication
const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  // Conversations endpoints
  getConversations: async (token) => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    
    return response.json();
  },

  // Messages endpoints
  getMessages: async (conversationId, token) => {
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    
    return response.json();
  },

  sendMessage: async (conversationId, content, token) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, content }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  },

  // AI endpoints
  startAIChat: async (token, character = 'itsuki') => {
    const response = await fetch(`${API_BASE_URL}/ai/start-chat/${character}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start AI chat with ${character}`);
    }
    
    return response.json();
  },

  getAICharacters: async (token) => {
    // Return predefined AI characters that will appear in conversation list
    return [
      {
        _id: 'ai-itsuki',
        name: 'Itsuki Nakano',
        username: 'Itsuki_Nakano',
        avatar: itsukiAvatar, // Will fallback to emoji if image fails
        fallbackAvatar: '🍰',
        isAI: true,
        character: 'itsuki'
      },
      {
        _id: 'ai-miku', 
        name: 'Hatsune Miku',
        username: 'Hatsune_Miku',
        avatar: mikuAvatar,
        fallbackAvatar: '🎵',
        isAI: true,
        character: 'miku'
      },
      {
        _id: 'ai-trump',
        name: 'Donald Trump',
        username: 'Donald_Trump',
        avatar: trumpAvatar,
        fallbackAvatar: '🇺🇸',
        isAI: true,
        character: 'trump'
      },
      {
        _id: 'ai-ronaldo',
        name: 'Cristiano Ronaldo',
        username: 'Cristiano_Ronaldo',
        avatar: ronaldoAvatar,
        fallbackAvatar: '⚽',
        isAI: true,
        character: 'ronaldo'
      },
      {
        _id: 'ai-march7th',
        name: 'March 7th',
        username: 'March_7th',
        avatar: march7thAvatar,
        fallbackAvatar: '❄️',
        isAI: true,
        character: 'march7th'
      }
    ];
  },

  sendAIMessage: async (token, conversationId, message) => {
    const response = await fetch(`${API_BASE_URL}/ai/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send AI message');
    }
    
    return response.json();
  },
};

// Auth Form Component
const AuthForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let response;
      if (isLogin) {
        response = await api.login(formData.email, formData.password);
      } else {
        response = await api.register(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        onLogin(response.user, response.token);
      }, 800); // Small delay to show success animation
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess(false);
    setFormData({
      email: '',
      password: '',
      username: '',
      name: ''
    });
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${success ? 'success-state' : ''}`}>
        <div className="auth-header">
          <div className="auth-icon">
            {success ? (
              <div className="success-checkmark">✓</div>
            ) : (
              <MessageCircle size={32} />
            )}
          </div>
          <h1>{success ? 'Welcome!' : (isLogin ? 'Welcome Back' : 'Create Account')}</h1>
          <p>{success ? 'Successfully authenticated' : (isLogin ? 'Sign in to continue' : 'Join our chat platform')}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">🎉</span>
            {isLogin ? 'Login successful! Welcome back.' : 'Account created successfully! Welcome aboard.'}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  minLength="6"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`auth-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-mode"
              disabled={loading}
            >
              {isLogin ? '✨ Create New Account' : '🔐 Sign In Instead'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="message-input"
        />
        <button 
          type="submit"
          disabled={!text.trim() || disabled}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// Chat Window Component
const ChatWindow = ({ conversation, userId, token }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation || !token) return;
      
      setLoading(true);
      try {
        const data = await api.getMessages(conversation._id, token);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [conversation, token]);

  const handleSend = async (content) => {
    if (!conversation || !token) return;

    // Debug: Log conversation structure to see what we're working with
    console.log('🔍 DEBUG: Conversation participants:', conversation.participants);
    console.log('🔍 DEBUG: Full conversation object:', conversation);

    // Detect if this is an AI conversation (supports multiple AI characters)
    const aiCharacters = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th', 'EnderZip'];
    const isAIConversation = conversation.participants?.some(
      p => {
        console.log('🔍 DEBUG: Checking participant:', p, 'Type:', typeof p);
        if (typeof p === 'string') {
          const matches = aiCharacters.includes(p.replace(' ', '_'));
          console.log('🔍 DEBUG: String participant matches AI:', matches);
          return matches;
        } else if (typeof p === 'object') {
          const usernameMatch = aiCharacters.includes(p.username);
          const nameMatch = aiCharacters.includes(p.name?.replace(' ', '_'));
          console.log('🔍 DEBUG: Object participant - username:', p.username, 'name:', p.name, 'usernameMatch:', usernameMatch, 'nameMatch:', nameMatch);
          return usernameMatch || nameMatch;
        }
        return false;
      }
    );

    console.log('🔍 DEBUG: Is AI Conversation:', isAIConversation);

    const optimisticMessage = {
      _id: Date.now().toString(),
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      if (isAIConversation) {
        // Use AI endpoint
        const response = await api.sendAIMessage(token, conversation._id, content);
        setMessages(prev => [
          ...prev.filter(msg => msg._id !== optimisticMessage._id),
          response.userMessage,
          response.aiMessage
        ]);
      } else {
        // Use regular endpoint
        const newMessage = await api.sendMessage(conversation._id, content, token);
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? newMessage : msg
          )
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => 
        prev.filter(msg => msg._id !== optimisticMessage._id)
      );
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversation) {
    return (
      <div className="chat-window-empty">
        <div className="empty-state">
          <MessageCircle size={48} className="empty-icon" />
          <h3>Select a conversation</h3>
          <p>Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {conversation.participants && conversation.participants.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Show avatar for AI characters */}
              {conversation.participants.map((participant, index) => {
                // Check if this participant is an AI character - use precise detection
                const isItsuki = (typeof participant === 'object' && 
                                 (participant._id === '6883850a461f9a1f0b795128' || 
                                  participant.username === 'Itsuki_Nakano' || 
                                  participant.name === 'Itsuki Nakano')) ||
                                 (typeof participant === 'string' && participant === 'Itsuki_Nakano');
                const isMiku = (typeof participant === 'object' && 
                               (participant._id === '6883850a461f9a1f0b79512c' ||
                                participant.username === 'Hatsune_Miku' || 
                                participant.name === 'Hatsune Miku')) ||
                               (typeof participant === 'string' && participant === 'Hatsune_Miku');
                const isTrump = (typeof participant === 'object' && 
                                (participant._id === '6883850a461f9a1f0b795130' ||
                                 participant.username === 'Donald_Trump' || 
                                 participant.name === 'Donald Trump')) ||
                                (typeof participant === 'string' && participant === 'Donald_Trump');
                const isRonaldo = (typeof participant === 'object' && 
                                  (participant._id === '6883850b461f9a1f0b795134' ||
                                   participant.username === 'Cristiano_Ronaldo' || 
                                   participant.name === 'Cristiano Ronaldo')) ||
                                  (typeof participant === 'string' && participant === 'Cristiano_Ronaldo');
                const isMarch7th = (typeof participant === 'object' && 
                                   (participant._id === '6883850b461f9a1f0b795138' ||
                                    participant.username === 'March_7th' || 
                                    participant.name === 'March 7th')) ||
                                   (typeof participant === 'string' && participant === 'March_7th');
                // For EnderZip, ONLY match the Character ID to distinguish from user EnderZip
                const isEnderZip = (typeof participant === 'object' && 
                                   participant._id === '6883894b66fb50430d298b37');
                
                if (isItsuki || isMiku || isTrump || isRonaldo || isMarch7th || isEnderZip) {
                  return (
                    <Avatar 
                      key={index}
                      src={isEnderZip ? '/uploads/avatars/avatar-1753450827212-242164846.png' :
                           isItsuki ? itsukiAvatar : isMiku ? mikuAvatar : isTrump ? trumpAvatar : isRonaldo ? ronaldoAvatar : march7thAvatar}
                      alt={isEnderZip ? 'EnderZip' :
                           isItsuki ? 'Itsuki Nakano' : isMiku ? 'Hatsune Miku' : isTrump ? 'Donald Trump' : isRonaldo ? 'Cristiano Ronaldo' : 'March 7th'}
                      size="32px"
                      fallback={isEnderZip ? '🎮' :
                                isItsuki ? '🍰' : isMiku ? '🎵' : isTrump ? '🇺🇸' : isRonaldo ? '⚽' : '❄️'}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
          <h2>{conversation.participants?.join(', ') || 'Chat'}</h2>
        </div>
      </div>
      
      <div className="messages-container">
        {loading ? (
          <div className="loading-state">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <div>👋</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = message.senderId === userId || 
                        message.senderId?._id === userId ||
                        (typeof message.senderId === 'string' && message.senderId === userId);
            
            // Check if message is from any AI character by ID or username
            // AI character IDs (these are Character collection IDs, not User IDs)
            const aiCharacterIds = [
              '6883850a461f9a1f0b795128', // Itsuki Nakano
              '6883850a461f9a1f0b79512c', // Hatsune Miku  
              '6883850a461f9a1f0b795130', // Donald Trump
              '6883850b461f9a1f0b795134', // Cristiano Ronaldo
              '6883850b461f9a1f0b795138', // March 7th
              '6883894b66fb50430d298b37'  // EnderZip (Character, not User)
            ];
            
            const aiCharacterNames = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'];
            
            // Check if it's an AI character by ID ONLY (no name checking for EnderZip to avoid confusion)
            const isAI = aiCharacterIds.includes(message.senderId?._id) || 
                        aiCharacterIds.includes(message.senderId) ||
                        // Only check names for official characters (not EnderZip)
                        (aiCharacterNames.includes(message.senderId?.username) || 
                         aiCharacterNames.includes(message.senderId?.name?.replace(' ', '_')));
            
            // Determine which AI character for styling - use IDs for precision
            const isItsuki = message.senderId === '6883850a461f9a1f0b795128' ||
                           message.senderId?._id === '6883850a461f9a1f0b795128' ||
                           message.senderId?.username === 'Itsuki_Nakano' || 
                           message.senderId?.name === 'Itsuki Nakano';
            const isMiku = message.senderId === '6883850a461f9a1f0b79512c' ||
                         message.senderId?._id === '6883850a461f9a1f0b79512c' ||
                         message.senderId?.username === 'Hatsune_Miku' || 
                         message.senderId?.name === 'Hatsune Miku';
            const isTrump = message.senderId === '6883850a461f9a1f0b795130' ||
                          message.senderId?._id === '6883850a461f9a1f0b795130' ||
                          message.senderId?.username === 'Donald_Trump' || 
                          message.senderId?.name === 'Donald Trump';
            const isRonaldo = message.senderId === '6883850b461f9a1f0b795134' ||
                            message.senderId?._id === '6883850b461f9a1f0b795134' ||
                            message.senderId?.username === 'Cristiano_Ronaldo' || 
                            message.senderId?.name === 'Cristiano Ronaldo';
            const isMarch7th = message.senderId === '6883850b461f9a1f0b795138' ||
                             message.senderId?._id === '6883850b461f9a1f0b795138' ||
                             message.senderId?.username === 'March_7th' || 
                             message.senderId?.name === 'March 7th';
            // For EnderZip, ONLY use Character ID to distinguish from user EnderZip
            const isEnderZip = message.senderId === '6883894b66fb50430d298b37' ||
                             message.senderId?._id === '6883894b66fb50430d298b37';
            
            const showTime = index === 0 || 
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;
            
            let messageClass = 'message-other';
            if (isMe) {
              messageClass = 'message-me';
            } else if (isAI) {
              if (isItsuki) {
                messageClass = 'message-ai message-itsuki';
              } else if (isMiku) {
                messageClass = 'message-ai message-miku';
              } else if (isTrump) {
                messageClass = 'message-ai message-trump';
              } else if (isRonaldo) {
                messageClass = 'message-ai message-ronaldo';
              } else if (isMarch7th) {
                messageClass = 'message-ai message-march7th';
              } else if (isEnderZip) {
                messageClass = 'message-ai message-enderzip';
              }
            }
            
            return (
              <div key={message._id} className={`message ${messageClass}`}>
                <div className="message-content">
                  {isAI && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '700', 
                      marginBottom: '6px',
                      color: isItsuki ? '#ff6b9d' : isMiku ? '#4facfe' : isTrump ? '#dc2626' : isRonaldo ? '#16a34a' : '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Avatar 
                        src={isEnderZip ? '/uploads/avatars/avatar-1753450827212-242164846.png' :
                             isItsuki ? itsukiAvatar : isMiku ? mikuAvatar : isTrump ? trumpAvatar : isRonaldo ? ronaldoAvatar : march7thAvatar}
                        alt={isEnderZip ? 'EnderZip' : 
                             isItsuki ? 'Itsuki Nakano' : isMiku ? 'Hatsune Miku' : isTrump ? 'Donald Trump' : isRonaldo ? 'Cristiano Ronaldo' : 'March 7th'}
                        size="24px"
                        fallback={isEnderZip ? '🎮' : 
                                  isItsuki ? '🍰' : isMiku ? '🎵' : isTrump ? '🇺🇸' : isRonaldo ? '⚽' : '❄️'}
                      />
                      {message.senderId?.name || (isEnderZip ? 'EnderZip' :
                       isItsuki ? 'Itsuki Nakano' : isMiku ? 'Hatsune Miku' : isTrump ? 'Donald Trump' : isRonaldo ? 'Cristiano Ronaldo' : 'March 7th')}
                      {/* DISABLED: VoiceOver component - Python TTS functionality disabled
                      <VoiceOver 
                        character={isItsuki ? 'itsuki' : isMiku ? 'miku' : isTrump ? 'trump' : isRonaldo ? 'ronaldo' : 'march7th'}
                        text={message.content}
                        isEnabled={true}
                      />
                      */}
                    </div>
                  )}
                  {message.content}
                  {showTime && (
                    <div className="message-time">
                      {formatTime(message.createdAt)}
                    </div>
                  )}
                  {message.sending && <span className="sending-indicator">⏳</span>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSend={handleSend} disabled={loading} />
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme

  // Theme toggle functionality
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('chatapp_theme', newTheme ? 'dark' : 'light');
    
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('chatapp_theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkTheme(isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      // Default to dark theme
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('chatapp_token');
    const savedUser = localStorage.getItem('chatapp_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('chatapp_token');
        localStorage.removeItem('chatapp_user');
      }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !token) return;
      
      try {
        // Get regular conversations
        const data = await api.getConversations(token);
        
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        if (err.message.includes('401') || err.message.includes('403')) {
          handleLogout();
        }
      }
    };
    
    fetchConversations();
  }, [user, token]);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('chatapp_token', userToken);
    localStorage.setItem('chatapp_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setConversations([]);
    setSelectedConvo(null);
    localStorage.removeItem('chatapp_token');
    localStorage.removeItem('chatapp_user');
  };

  const handleStartAIChat = async (character) => {
    try {
      // Handle both old string format and new character object format
      let characterId;
      let characterName;
      
      if (typeof character === 'string') {
        // Legacy string format
        const characterNames = {
          'itsuki': 'Itsuki Nakano',
          'miku': 'Hatsune Miku',
          'trump': 'Donald Trump',
          'ronaldo': 'Cristiano Ronaldo',
          'march7th': 'March 7th'
        };
        characterId = character;
        characterName = characterNames[character] || character;
      } else if (character && character.name) {
        // New character object format - check if it's a user-created character
        if (character.isOfficial === false || character.createdBy) {
          // User-created character - use character ID directly
          characterId = character._id;
          characterName = character.name;
        } else {
          // Official character - map username to backend route parameter
          const usernameToId = {
            'Itsuki_Nakano': 'itsuki',
            'Hatsune_Miku': 'miku',
            'Donald_Trump': 'trump',
            'Cristiano_Ronaldo': 'ronaldo',
            'March_7th': 'march7th'
          };
          characterId = usernameToId[character.username] || character.name.toLowerCase().replace(' ', '');
          characterName = character.name;
        }
      } else {
        // Default fallback
        characterId = 'itsuki';
        characterName = 'Itsuki Nakano';
      }
      
      console.log(`🤖 Starting AI chat with ${characterName}...`);
      const response = await api.startAIChat(token, characterId);
      console.log(`🤖 AI chat response:`, response);
      
      // Update conversations list to include the AI conversation
      const updatedConversations = await api.getConversations(token);
      console.log('📋 Updated conversations:', updatedConversations);
      setConversations(updatedConversations);
      
      // Select the AI conversation
      console.log('🎯 Selecting AI conversation:', response.conversation);
      setSelectedConvo(response.conversation);
      
    } catch (error) {
      console.error('Error starting AI chat:', error);
      const displayName = typeof character === 'string' ? 
        (character === 'miku' ? 'Hatsune Miku' : 
         character === 'trump' ? 'Donald Trump' : 
         character === 'ronaldo' ? 'Cristiano Ronaldo' : 
         character === 'march7th' ? 'March 7th' : 'Itsuki Nakano') : 
        (character?.name || 'the character');
      alert(`Failed to start chat with ${displayName}`);
    }
  };

  const handleSelectConversation = async (convo) => {
    // If it's an AI character, start/get the AI chat
    if (convo.isAI) {
      try {
        console.log(`🤖 Starting AI chat with ${convo.character}...`);
        const response = await api.startAIChat(token, convo.character);
        
        // Update conversations to include the real AI conversation
        const updatedConversations = await api.getConversations(token);
        setConversations(updatedConversations);
        
        // Select the actual AI conversation
        setSelectedConvo(response.conversation);
      } catch (error) {
        console.error('Error starting AI chat:', error);
        alert(`Failed to start chat with ${convo.name}`);
      }
    } else {
      // Regular conversation
      setSelectedConvo(convo);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <span>Loading ChatApp...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Handle character creation
  const handleCreateCharacter = () => {
    setShowCreateCharacter(true);
  };

  const handleCharacterCreated = (newCharacter) => {
    console.log('New character created:', newCharacter);
    // Characters will be automatically loaded by the Sidebar component
    // You could add a success message here if needed
  };

  const handleCloseCreateCharacter = () => {
    setShowCreateCharacter(false);
  };

  return (
    <div className="app-container">
      {/* App Header with User Profile */}
      <header className="app-header">
        <div className="app-header-left">
          <h1 className="app-title">
            <MessageCircle size={24} />
            ChatApp
          </h1>
        </div>
        <div className="app-header-right">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name || user.username}</span>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      <div className="app-body">
        <Sidebar 
          conversations={conversations} 
          onSelect={handleSelectConversation}
          selectedConvo={selectedConvo}
          currentUserId={user._id}
          onStartAIChat={handleStartAIChat}
          onCreateCharacter={handleCreateCharacter}
        />
        <ChatWindow 
          conversation={selectedConvo} 
          userId={user._id}
          token={token}
        />
      </div>
      
      {/* Character Creation Modal */}
      <CreateCharacter
        isOpen={showCreateCharacter}
        onClose={handleCloseCreateCharacter}
        onCharacterCreated={handleCharacterCreated}
      />
    </div>
  );
};

export default App;