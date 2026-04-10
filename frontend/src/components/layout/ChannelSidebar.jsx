import React, { useState, useEffect } from 'react';
import { Hash, Volume2, Plus, Trash2, Mic, MicOff, PhoneOff, ChevronDown, Copy, Settings, LogOut, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateChannelModal from '../modals/CreateChannelModal';

const ChannelSidebar = ({ server, channels, selectedChannel, onSelectChannel, view, onOpenDM, voiceState, onChannelsUpdate, socket }) => {
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
        <div className="flex-1 overflow-y-auto p-2">
          <DMFriendsList onOpenDM={onOpenDM} />
        </div>
        <UserPanel user={user} voiceState={voiceState} />
      </div>
    );
  }

  if (!server) return <div style={{ width: '240px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }} />;

  return (
    <>
      <div className="flex flex-col" style={{ width: '240px', background: 'var(--color-bg-3)', borderRight: '1px solid var(--color-border)' }}>
        <ServerHeader server={server} onChannelsUpdate={onChannelsUpdate} />

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
              <VoiceChannelItem key={channel.id} channel={channel} voiceState={voiceState} onChannelsUpdate={onChannelsUpdate} socket={socket} />
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

const ServerHeader = ({ server, onChannelsUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between cursor-pointer relative"
        style={{ borderBottom: '1px solid var(--color-border)' }}
        onClick={() => setShowDropdown(!showDropdown)}>
        <h2 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-1)' }}>{server.name}</h2>
        <ChevronDown size={16} style={{ color: 'var(--color-text-3)', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 rounded-lg overflow-hidden shadow-xl"
            style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)', margin: '4px 8px' }}>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(server.id);
                alert('Server ID copied! Share it with friends.');
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              <Copy size={14} />
              Copy Invite ID
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              <Settings size={14} />
              Server Settings
            </button>

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!confirm('Leave this server?')) return;
                try {
                  const { default: apiClient } = await import('../../api/client');
                  await apiClient.delete(`/servers/${server.id}/leave`);
                  window.location.reload();
                } catch (err) {
                  alert('Failed to leave server');
                }
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left"
              style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-4)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              <LogOut size={14} />
              Leave Server
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <ServerSettingsModal server={server} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

const ServerSettingsModal = ({ server, onClose }) => {
  const [name, setName] = useState(server.name);
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(server.iconUrl || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) { setIcon(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { default: apiClient } = await import('../../api/client');
      const formData = new FormData();
      formData.append('name', name);
      if (icon) formData.append('icon', icon);
      await apiClient.put(`/servers/${server.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Server updated successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage('Failed to update server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md p-6 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-1)' }}>Server Settings</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <label className="flex items-center justify-center rounded-full cursor-pointer overflow-hidden mb-2"
            style={{ width: '80px', height: '80px', background: 'var(--color-bg-5)', border: '2px dashed var(--color-border)' }}>
            {preview
              ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div className="flex flex-col items-center gap-1">
                <Upload size={20} style={{ color: 'var(--color-text-3)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Icon</span>
              </div>
            }
            <input type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
          </label>
          <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Click to change server icon</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-2)' }}>Server Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-2)' }}>Invite ID</label>
          <div className="flex gap-2">
            <input value={server.id} readOnly
              className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none opacity-60"
              style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
            <button
              onClick={() => { navigator.clipboard.writeText(server.id); setMessage('Copied!'); setTimeout(() => setMessage(''), 2000); }}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <Copy size={14} />
            </button>
          </div>
        </div>

        {message && <p className="text-xs mb-3" style={{ color: message.includes('success') || message === 'Copied!' ? '#22c55e' : 'var(--color-primary)' }}>{message}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm"
            style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-2)', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
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

const VoiceChannelItem = ({ channel, voiceState, onChannelsUpdate, socket }) => {
  const isInThisChannel = voiceState.isInVoice && voiceState.currentChannelId === channel.id;
  const [voiceUsers, setVoiceUsers] = useState(channel.voiceChannelUsers || []);

  useEffect(() => {
    if (!socket) return;

    socket.on('voice:users-update', ({ channelId, users }) => {
      if (channelId === channel.id) {
        setVoiceUsers(users);
      }
    });

    return () => {
      socket.off('voice:users-update');
    };
  }, [socket, channel.id]);

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
      {voiceUsers.map(u => (
        <div key={u.id} className="flex items-center gap-2 py-1" style={{ paddingLeft: '24px' }}>
          <div className="flex items-center justify-center text-xs font-bold rounded-full flex-shrink-0"
            style={{ width: '20px', height: '20px', background: 'var(--color-primary)', color: '#fff' }}>
            {u.avatarUrl
              ? <img src={u.avatarUrl} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
              : u.username?.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>{u.username}</span>
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

const DMFriendsList = ({ onOpenDM }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { default: apiClient } = await import('../../api/client');
        const { data } = await apiClient.get('/friends');
        setFriends(data.friends);
      } catch (err) {
        console.error('Failed to load friends for DM sidebar:', err);
      }
    };
    load();
  }, []);

  if (friends.length === 0) {
    return <p className="text-xs px-2 py-2" style={{ color: 'var(--color-text-3)' }}>No friends yet</p>;
  }

  return (
    <>
      {friends.map(friend => (
        <button key={friend.id} onClick={() => onOpenDM(friend)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-4)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <div className="relative flex-shrink-0">
            <div className="flex items-center justify-center text-xs font-bold rounded-full"
              style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: '#fff' }}>
              {friend.avatarUrl
                ? <img src={friend.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                : friend.username?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute rounded-full border-2" style={{
              width: '10px', height: '10px', bottom: '-1px', right: '-1px',
              background: friend.status === 'online' ? '#22c55e' : '#6b7280',
              borderColor: 'var(--color-bg-3)'
            }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm truncate" style={{ color: 'var(--color-text-1)' }}>{friend.username}</p>
            <p className="text-xs truncate" style={{ color: friend.status === 'online' ? '#22c55e' : 'var(--color-text-3)' }}>
              {friend.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>
      ))}
    </>
  );
};

export default ChannelSidebar;