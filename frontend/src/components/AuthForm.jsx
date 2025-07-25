import React, { useState, useEffect, useRef } from 'react';
import { User, MessageCircle, Send, Eye, EyeOff } from 'lucide-react';

// Mock API functions (replace with real API calls)
const mockAPI = {
  login: async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (email === 'demo@example.com' && password === 'password') {
      return {
        token: 'mock-jwt-token',
        user: {
          _id: 'user123',
          name: 'Demo User',
          email: 'demo@example.com',
          username: 'demouser'
        }
      };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    return {
      token: 'mock-jwt-token',
      user: {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        username: userData.username
      }
    };
  },
  
  getConversations: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        _id: 'conv1',
        participants: ['John Doe', 'Jane Smith'],
        lastMessage: {
          content: 'Hey, how are you doing?',
          senderId: 'user456',
          senderName: 'John Doe',
          createdAt: new Date().toISOString()
        }
      },
      {
        _id: 'conv2',
        participants: ['Alice Johnson'],
        lastMessage: {
          content: 'See you tomorrow!',
          senderId: 'user123',
          senderName: 'You',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      }
    ];
  },
  
  getMessages: async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        _id: 'msg1',
        content: 'Hello there!',
        senderId: 'user456',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        _id: 'msg2',
        content: 'Hi! How are you?',
        senderId: 'user123',
        createdAt: new Date(Date.now() - 3000000).toISOString()
      }
    ];
  },
  
  sendMessage: async (conversationId, content) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      _id: Date.now().toString(),
      content,
      senderId: 'user123',
      createdAt: new Date().toISOString()
    };
  }
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

    try {
      let data;
      if (isLogin) {
        data = await mockAPI.login(formData.email, formData.password);
      } else {
        data = await mockAPI.register(formData);
      }
      
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Join ChatApp'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue chatting' : 'Create your account to get started'}
          </p>
          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Demo Credentials:</p>
              <p className="text-xs text-blue-600">Email: demo@example.com</p>
              <p className="text-xs text-blue-600">Password: password</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-shake">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Choose a unique username"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [text]);

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
    <div onSubmit={handleSubmit} className="flex items-end gap-3 p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none overflow-hidden min-h-[44px] max-h-[120px] px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
      />
      <button 
        onClick={handleSubmit} 
        disabled={!text.trim() || disabled}
        className="w-11 h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

// Chat Window Component
const ChatWindow = ({ conversation, userId }) => {
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
      if (!conversation) return;
      
      setLoading(true);
      try {
        const data = await mockAPI.getMessages(conversation._id);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [conversation]);

  const handleSend = async (content) => {
    if (!conversation) return;
    
    const optimisticMessage = {
      _id: Date.now().toString(),
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
      sending: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      const newMessage = await mockAPI.sendMessage(conversation._id, content);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === optimisticMessage._id ? newMessage : msg
        )
      );
    } catch (err) {
      console.error('Error sending message', err);
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 opacity-20">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
      <div className="px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          {conversation.participants.join(', ')}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-center">
            <div>
              <div className="text-4xl mb-4">👋</div>
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = message.senderId === userId;
            const showTime = index === 0 || 
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;
            
            return (
              <div key={message._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isMe 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {showTime && (
                    <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  )}
                  {message.sending && (
                    <span className="text-xs opacity-70 ml-2">⏳</span>
                  )}
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

// Sidebar Component
const Sidebar = ({ conversations, onSelect, selectedConvo, currentUserId, user, onLogout }) => {
  const getInitials = (participants) => {
    if (!participants || participants.length === 0) return '?';
    return participants
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  };

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
    
    const truncatedContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) {
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

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with user info and logout */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map(convo => {
            const lastMessagePreview = getLastMessagePreview(convo);
            const isSelected = selectedConvo?._id === convo._id;
            
            return (
              <div
                key={convo._id}
                className={`flex items-center p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => onSelect(convo)}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(convo.participants)}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {convo.participants.join(', ')}
                    </h4>
                    {lastMessagePreview.time && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {lastMessagePreview.time}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {lastMessagePreview.sender && (
                      <span className="font-medium">
                        {lastMessagePreview.sender}: 
                      </span>
                    )}
                    <span className="ml-1">{lastMessagePreview.text}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
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

  useEffect(() => {
    // Simulate checking for existing session
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        const data = await mockAPI.getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };
    
    fetchConversations();
  }, [user]);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setConversations([]);
    setSelectedConvo(null);
  };

  const handleSelectConversation = (convo) => {
    setSelectedConvo(convo);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-lg font-medium text-gray-700">Loading ChatApp...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar 
        conversations={conversations} 
        onSelect={handleSelectConversation}
        selectedConvo={selectedConvo}
        currentUserId={user._id}
        user={user}
        onLogout={handleLogout}
      />
      <ChatWindow 
        conversation={selectedConvo} 
        userId={user._id} 
      />
    </div>
  );
};

export default App;