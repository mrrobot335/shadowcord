import React, { useState, useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const ChatArea = ({ channel, server }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!channel) return;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/messages/channel/${channel.id}`);
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      } catch (error) { console.error('Failed to load messages:', error); }
      finally { setLoading(false); }
    };
    loadMessages();
  }, [channel?.id]);

  useEffect(() => {
    if (!socket || !channel) return;
    socket.emit('channel:join', channel.id);

    socket.on('message:new', ({ message }) => {
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 50);
    });

    socket.on('typing:start', ({ userId, username, channelId }) => {
      if (channelId !== channel.id) return;
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
    });

    socket.on('typing:stop', ({ userId, channelId }) => {
      if (channelId !== channel.id) return;
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    return () => {
      socket.emit('channel:leave', channel.id);
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, channel?.id]);

  const handleSendMessage = (content) => {
    if (!socket || !content.trim()) return;
    socket.emit('message:send', { channelId: channel.id, content });
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { channelId: channel.id });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-4)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Hash size={20} style={{ color: 'var(--color-text-3)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--color-text-1)' }}>{channel.name}</h3>
        <span className="text-sm ml-1" style={{ color: 'var(--color-text-3)' }}>{server?.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <Hash size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-3)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text-1)' }}>Welcome to #{channel.name}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-3)' }}>This is the beginning of the channel.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageItem key={msg.id} message={msg} showHeader={index === 0 || messages[index - 1]?.user?.id !== msg.user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <TypingIndicator users={typingUsers.filter(u => u.userId !== user?.id)} />
      <MessageInput placeholder={`Message #${channel.name}`} onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatArea;
