import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';
import MessageItem from '../chat/MessageItem';
import MessageInput from '../chat/MessageInput';
import VoiceCall from '../voice/VoiceCall';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const DirectMessage = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [callState, setCallState] = useState(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await apiClient.get(`/messages/dm/${friend.id}`);
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      } catch (err) { console.error('Failed to load DMs:', err); }
    };
    loadMessages();
  }, [friend.id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('dm:new', ({ message }) => {
      const isRelevant = (message.senderId === friend.id || message.receiverId === friend.id) && (message.senderId === user.id || message.receiverId === user.id);
      if (isRelevant) { setMessages(prev => [...prev, message]); setTimeout(scrollToBottom, 50); }
    });
    socket.on('call:incoming', ({ fromSocketId, fromUserId, fromUsername }) => {
      if (fromUserId === friend.id) setCallState({ status: 'incoming', fromSocketId, fromUserId, fromUsername });
    });
    return () => { socket.off('dm:new'); socket.off('call:incoming'); };
  }, [socket, friend.id, user.id]);

  const handleSend = (content) => { if (!socket) return; socket.emit('dm:send', { receiverId: friend.id, content }); };
  const handleStartCall = () => { if (!socket) return; socket.emit('call:initiate', { targetUserId: friend.id }); setCallState({ status: 'outgoing', targetUserId: friend.id }); };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-4)' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-center font-bold text-sm rounded-full" style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: '#fff' }}>
          {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} /> : friend.username?.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-semibold" style={{ color: 'var(--color-text-1)' }}>{friend.username}</h3>
        <div className="ml-auto">
          <button onClick={handleStartCall} className="p-2 rounded-lg flex items-center gap-1.5 text-sm" style={{ background: 'var(--color-bg-5)', color: '#22c55e', border: 'none', cursor: 'pointer' }}>
            <Phone size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-3)' }}>Start a conversation with {friend.username}</p>
        ) : (
          messages.map((msg, i) => (
            <MessageItem key={msg.id} message={{ ...msg, user: msg.sender }} showHeader={i === 0 || messages[i-1]?.senderId !== msg.senderId} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput placeholder={`Message ${friend.username}`} onSend={handleSend} onTyping={() => {}} />

      {callState && <VoiceCall socket={socket} friend={friend} callState={callState} onEndCall={() => setCallState(null)} />}
    </div>
  );
};

export default DirectMessage;
