import React, { useEffect, useState, useRef } from 'react';
import api from '../api.js';
import MessageInput from './MessageInput.jsx';
import './ChatWindow.css';

export default function ChatWindow({ conversation, userId, token }) {
  console.log('🪟 ChatWindow rendered with:', { conversation: conversation?._id, userId, hasToken: !!token });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Add a simple test - if no conversation, show a big red message
  if (!conversation) {
    return (
      <div style={{ 
        padding: '20px', 
        background: 'red', 
        color: 'white', 
        fontSize: '24px',
        textAlign: 'center'
      }}>
        🚨 NO CONVERSATION SELECTED 🚨
      </div>
    );
  }

  // Auto-scroll to bottom when new messages arrive
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
        const res = await api.get(`/messages/${conversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages', err);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [conversation]);

  const handleSend = async (content) => {
    console.log('🚀 handleSend called with:', content);
    if (!conversation) return;
    
    // Debug: Log conversation details
    console.log('💬 Conversation object:', conversation);
    console.log('👥 Participants:', conversation.participants);
    
    // Check if this is an AI conversation (Itsuki Nakano)
    // Check both participants (names) and participantUsers (objects)
    const isAIConversation = 
      conversation.participants?.some(p => {
        if (typeof p === 'string') {
          // Check if it's an official AI character name
          return ['Itsuki Nakano', 'Hatsune Miku', 'Donald Trump', 'Cristiano Ronaldo', 'March 7th'].includes(p);
        } else if (typeof p === 'object' && p) {
          // Check if it's an official AI character username or a user-created character
          const officialAI = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'].includes(p.username);
          const officialName = ['Itsuki Nakano', 'Hatsune Miku', 'Donald Trump', 'Cristiano Ronaldo', 'March 7th'].includes(p.name);
          
          // For user-created characters, check if the ID length is 24 (ObjectId format)
          const isUserCreatedCharacter = p._id && p._id.toString().length === 24 && p._id.toString() !== userId;
          
          return officialAI || officialName || isUserCreatedCharacter;
        }
        return false;
      }) ||
      conversation.participantUsers?.some(p => 
        ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'].includes(p.username) ||
        ['Itsuki Nakano', 'Hatsune Miku', 'Donald Trump', 'Cristiano Ronaldo', 'March 7th'].includes(p.name)
      );
    
    console.log('🤖 Is AI conversation?', isAIConversation);
    
    // Optimistically add the message to the UI
    const optimisticMessage = {
      _id: Date.now().toString(), // temporary ID
      senderId: { _id: userId },
      content,
      createdAt: new Date().toISOString(),
      sending: true // flag to show it's being sent
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      let res;
      if (isAIConversation) {
        console.log('🍰 Sending message to Itsuki:', content);
        console.log('📋 Conversation ID:', conversation._id);
        
        // Use AI message endpoint
        res = await fetch('http://localhost:5000/api/ai/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId: conversation._id,
            message: content,
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ AI message failed:', res.status, errorText);
          throw new Error('Failed to send AI message');
        }
        
        const data = await res.json();
        console.log('✅ AI response received:', data);
        
        // Replace optimistic message with real user message and add AI response
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? data.userMessage : msg
          ).concat(data.aiMessage)
        );
      } else {
        // Use regular message endpoint
        res = await api.post('/messages', {
          conversationId: conversation._id,
          senderId: userId,
          content,
        });
        
        // Replace the optimistic message with the real one
        setMessages(prev => 
          prev.map(msg => 
            msg._id === optimisticMessage._id ? res.data : msg
          )
        );
      }
    } catch (err) {
      console.error('Error sending message', err);
      // Remove the failed message and show error
      setMessages(prev => 
        prev.filter(msg => msg._id !== optimisticMessage._id)
      );
      // You might want to show an error notification here
    }
  };

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to get participant display name
  const getConversationTitle = () => {
    if (!conversation || !conversation.participants) return 'Chat';
    return conversation.participants.join(', ');
  };

  if (!conversation) {
    return (
      <div className="chat-window">
        <div className="chat-window-placeholder">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>💬</div>
            <div>Select a conversation to start chatting</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        {getConversationTitle()}
      </div>
      
      <div className="chat-messages">
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            color: '#64748b'
          }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>👋</div>
              <div>No messages yet. Start the conversation!</div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = (message.senderId?._id || message.senderId) === userId;
            const showTime = index === 0 || 
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes
            
            // Check if this is an AI message (any message not from the current user)
            const isAI = !isMe;
            
            return (
              <div key={message._id} style={{ marginBottom: showTime ? '16px' : '4px' }}>
                {showTime && (
                  <div style={{ 
                    textAlign: 'center', 
                    fontSize: '0.75rem', 
                    color: '#94a3b8',
                    marginBottom: '8px'
                  }}>
                    {formatTime(message.createdAt)}
                  </div>
                )}
                <div
                  className={`message ${isMe ? 'me' : isAI ? 'ai' : 'other'} ${message.sending ? 'sending' : ''}`}
                  style={{
                    opacity: message.sending ? 0.7 : 1
                  }}
                >
                  {isAI && (
                    <div className="message-sender">
                      {message.senderId?.avatar && (
                        <img 
                          src={`${message.senderId.avatar.startsWith('avatar-') 
                            ? 'http://localhost:5000/uploads/avatars/' + message.senderId.avatar 
                            : '/avatars/' + message.senderId.avatar}`}
                          alt={message.senderId?.name || 'AI'} 
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            marginRight: '8px' 
                          }} 
                        />
                      )}
                      {message.senderId?.name || 'AI Assistant'}
                    </div>
                  )}
                  {message.content}
                  {message.sending && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      marginLeft: '8px',
                      opacity: 0.7 
                    }}>
                      ⏳
                    </span>
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
}