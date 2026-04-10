import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const TYPING_TIMEOUT = 2000;

const MessageInput = ({ placeholder, onSend, onTyping }) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!isTypingRef.current) { isTypingRef.current = true; onTyping(true); }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { isTypingRef.current = false; onTyping(false); }, TYPING_TIMEOUT);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
    clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) { isTypingRef.current = false; onTyping(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  return (
    <div className="px-4 pb-4">
      <div className="flex items-end gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--color-bg-5)' }}>
        <textarea value={message} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder={placeholder} rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
          style={{ color: 'var(--color-text-1)', maxHeight: '120px', minHeight: '24px' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
        <button onClick={handleSend} disabled={!message.trim()} className="p-1.5 rounded-md disabled:opacity-30" style={{ color: message.trim() ? 'var(--color-primary)' : 'var(--color-text-3)', background: 'transparent', border: 'none', cursor: message.trim() ? 'pointer' : 'default' }}>
          <Send size={18} />
        </button>
      </div>
      <p className="text-xs mt-1 ml-1" style={{ color: 'var(--color-text-3)' }}>Enter to send · Shift+Enter for new line</p>
    </div>
  );
};

export default MessageInput;
