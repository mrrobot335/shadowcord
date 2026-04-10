import React, { useState, useEffect } from 'react';
import ServerSidebar from './ServerSidebar';
import ChannelSidebar from './ChannelSidebar';
import MemberList from './MemberList';
import ChatArea from '../chat/ChatArea';
import FriendsList from '../friends/FriendsList';
import DirectMessage from '../friends/DirectMessage';
import SettingsPage from '../settings/SettingsPage';
import { useVoice } from '../../hooks/useVoice';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../api/client';

const AppLayout = () => {
  const { socket } = useSocket();
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [view, setView] = useState('friends');
  const [dmUser, setDmUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const voice = useVoice(socket);

  useEffect(() => { loadServers(); }, []);

  const loadServers = async () => {
    try {
      const { data } = await apiClient.get('/servers');
      setServers(data.servers);
    } catch (error) { console.error('Failed to load servers:', error); }
  };

  const handleSelectServer = async (server) => {
    setSelectedServer(server);
    setView('server');
    setSelectedChannel(null);
    try {
      const [channelsRes, membersRes] = await Promise.all([
        apiClient.get(`/channels/server/${server.id}`),
        apiClient.get(`/servers/${server.id}/members`)
      ]);
      setChannels(channelsRes.data.channels);
      setMembers(membersRes.data.members);
    } catch (error) { console.error('Failed to load server data:', error); }
  };

  const handleSelectChannel = (channel) => {
    if (channel.type === 'text') setSelectedChannel(channel);
  };

  const handleOpenDM = (user) => {
    setDmUser(user);
    setView('dm');
    setSelectedServer(null);
    setSelectedChannel(null);
  };

  if (showSettings) return <SettingsPage onClose={() => setShowSettings(false)} />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-1)' }}>
      <ServerSidebar servers={servers} selectedServer={selectedServer} onSelectServer={handleSelectServer}
        onSelectFriends={() => { setView('friends'); setSelectedServer(null); }}
        onOpenSettings={() => setShowSettings(true)} onServersUpdate={setServers} />

      <ChannelSidebar server={selectedServer} channels={channels} selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel} view={view} onOpenDM={handleOpenDM}
        voiceState={voice} onChannelsUpdate={setChannels} />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {view === 'friends' && <FriendsList onOpenDM={handleOpenDM} />}
          {view === 'dm' && dmUser && <DirectMessage friend={dmUser} voiceState={voice} />}
          {view === 'server' && selectedChannel && selectedChannel.type === 'text' && (
            <ChatArea channel={selectedChannel} server={selectedServer} />
          )}
          {view === 'server' && !selectedChannel && (
            <div className="flex-1 flex items-center justify-center h-full" style={{ color: 'var(--color-text-3)' }}>
              <div className="text-center">
                <p className="text-lg font-medium">Select a channel to start chatting</p>
                <p className="text-sm mt-1">Or join a voice channel to talk</p>
              </div>
            </div>
          )}
        </div>
        {view === 'server' && selectedServer && (
          <MemberList members={members} server={selectedServer} channels={channels} voiceState={voice} />
        )}
      </div>
    </div>
  );
};

export default AppLayout;
