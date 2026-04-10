import React, { useState } from 'react';
import { Hash, Volume2, Plus, Trash2, Mic, MicOff, PhoneOff, ChevronDown, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateChannelModal from '../modals/CreateChannelModal';

const ChannelSidebar = ({ server, channels, selectedChannel, onSelectChannel, view, onOpenDM, voiceState, onChannelsUpdate }) => {
  const { user } = useAuth();
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelType, setChannelType] = useState('text');

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  const handleChannelCreated = (newChannel) => onChannelsUpdate(prev => [...prev, newChannel]);

  if (view === 'friends' || view === 'dm') {
    return (
      <div className="flex flex-col" style={{ width: '240px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text-1)' }}>Direct Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2" />
        <UserPanel user={user} voiceState={voiceState} />
      </div>
    );
  }

  if (!server) return <div style={{ width: '240px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }} />;

  return (
    <>
      <div className="flex flex-col" style={{ width: '240px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-1)' }}>{server.name}</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(server.id);
              alert('Server ID copied! Share it with friends so they can join.');
            }}
            title="Copy Server ID to invite friends"
            style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Text Channels</span>
              <button onClick={() => { setChannelType('text'); setShowCreateChannel(true); }} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} />
              </button>
            </div>
            {textChannels.map(channel => (
              <ChannelItem key={channel.id} channel={channel} selected={selectedChannel?.id === channel.id}
                onClick={() => onSelectChannel(channel)} icon={<Hash size={16} />} onChannelsUpdate={onChannelsUpdate} />
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Voice Channels</span>
              <button onClick={() => { setChannelType('voice'); setShowCreateChannel(true); }} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} />
              </button>
            </div>
            {voiceChannels.map(channel => (
              <VoiceChannelItem key={channel.id} channel={channel} voiceState={voiceState} onChannelsUpdate={onChannelsUpdate} />
            ))}
          </div>
        </div>

        <UserPanel user={user} voiceState={voiceState} />
      </div>

      {showCreateChannel && (
        <CreateChannelModal serverId={server.id} defaultType={channelType}
          onClose={() => setShowCreateChannel(false)} onChannelCreated={handleChannelCreated} />
      )}
    </>
  );
};

const ChannelItem = ({ channel, selected, onClick, icon, onChannelsUpdate }) => {
  const [hovered, setHovered] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete #${channel.name}?`)) return;
    try {
      const { default: apiClient } = await import('../../api/client');
      await apiClient.delete(`/channels/${channel.id}`);
      onChannelsUpdate(prev => prev.filter(c => c.id !== channel.id));
    } catch { alert('Failed to delete channel'); }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer"
      style={{ background: selected ? 'var(--color-bg-5)' : hovered ? 'var(--color-bg-4)' : 'transparent', color: selected ? 'var(--color-text-1)' : 'var(--color-text-2)' }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{ color: 'var(--color-text-3)' }}>{icon}</span>
      <span className="text-sm flex-1 truncate">{channel.name}</span>
      {hovered && <button onClick={handleDelete} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>}
    </div>
  );
};

const VoiceChannelItem = ({ channel, voiceState, onChannelsUpdate }) => {
  const isInThisChannel = voiceState.isInVoice && voiceState.currentChannelId === channel.id;
  const voiceUsers = channel.voiceChannelUsers || [];

  const handleClick = async () => {
    try {
      if (isInThisChannel) voiceState.leaveVoiceChannel();
      else {
        if (voiceState.isInVoice) voiceState.leaveVoiceChannel();
        await voiceState.joinVoiceChannel(channel.id);
      }
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer"
        style={{ color: isInThisChannel ? 'var(--color-primary)' : 'var(--color-text-2)' }}
        onClick={handleClick}
        onMouseEnter={(e) => { if (!isInThisChannel) e.currentTarget.style.background = 'var(--color-bg-4)'; }}
        onMouseLeave={(e) => { if (!isInThisChannel) e.currentTarget.style.background = 'transparent'; }}>
        <Volume2 size={16} style={{ color: 'var(--color-text-3)', flexShrink: 0 }} />
        <span className="text-sm flex-1 truncate">{channel.name}</span>
        {isInThisChannel && <PhoneOff size={13} style={{ color: 'var(--color-primary)' }} />}
      </div>
      {voiceUsers.map(vu => (
        <div key={vu.user?.id || vu.id} className="flex items-center gap-2 py-0.5" style={{ paddingLeft: '32px' }}>
          <div className="flex items-center justify-center text-xs rounded-full" style={{ width: '20px', height: '20px', background: 'var(--color-bg-5)' }}>
            {vu.user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{vu.user?.username}</span>
        </div>
      ))}
    </div>
  );
};

const UserPanel = ({ user, voiceState }) => (
  <div className="p-2 flex items-center gap-2" style={{ background: 'var(--color-bg-2)', borderTop: '1px solid var(--color-border)' }}>
    <div className="relative">
      <div className="flex items-center justify-center text-sm font-bold rounded-full" style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: '#fff' }}>
        {user?.avatarUrl
          ? <img src={user.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          : user?.username?.charAt(0).toUpperCase()}
      </div>
      <div className="absolute rounded-full border-2" style={{ width: '12px', height: '12px', bottom: '-2px', right: '-2px', background: '#22c55e', borderColor: 'var(--color-bg-2)' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-1)' }}>{user?.username}</p>
      {/* Show the discriminator tag */}
      <p className="text-xs truncate font-mono" style={{ color: 'var(--color-text-3)' }}>
        #{user?.discriminator || '0000'}
      </p>
    </div>
    {voiceState?.isInVoice && (
      <button onClick={voiceState.toggleMute} className="p-1.5 rounded-md"
        style={{ color: voiceState.isMuted ? 'var(--color-primary)' : 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
        {voiceState.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
    )}
  </div>
);

export default ChannelSidebar;
