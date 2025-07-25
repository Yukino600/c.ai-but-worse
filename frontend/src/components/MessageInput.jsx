import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import './MessageInput.css';

export default function MessageInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled || isComposing) return;
    
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        disabled={disabled}
        rows={1}
        style={{
          resize: 'none',
          overflow: 'hidden',
          minHeight: '20px',
          maxHeight: '120px',
          lineHeight: '20px',
          padding: '14px 18px',
          border: '2px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '24px',
          background: 'rgba(248, 250, 252, 0.8)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#1e293b',
          fontSize: '1rem',
          fontFamily: 'inherit',
          flex: 1
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6366f1';
          e.target.style.background = '#ffffff';
          e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)';
          e.target.style.background = 'rgba(248, 250, 252, 0.8)';
          e.target.style.boxShadow = 'none';
        }}
      />
      <button 
        type="submit" 
        disabled={!text.trim() || disabled || isComposing}
        style={{
          opacity: (!text.trim() || disabled || isComposing) ? 0.5 : 1,
          cursor: (!text.trim() || disabled || isComposing) ? 'not-allowed' : 'pointer'
        }}
      >
        <IoSend />
      </button>
    </form>
  );
}