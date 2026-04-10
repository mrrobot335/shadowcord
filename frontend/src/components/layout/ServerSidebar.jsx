import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateServerModal from '../modals/CreateServerModal';

const ServerSidebar = ({ servers, selectedServer, onSelectServer, onSelectFriends, onOpenSettings, onServersUpdate }) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleServerCreated = (newServer) => {
    onServersUpdate(prev => [...prev, newServer]);
    onSelectServer(newServer);
  };

  const btnBase = { transition: 'all 0.2s', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', cursor: 'pointer', border: 'none' };

  return (
    <>
      <div className="flex flex-col items-center py-3 gap-2 overflow-y-auto" style={{ width: '72px', background: 'var(--color-bg-2)', borderRight: '1px solid var(--color-border)' }}>
        <button onClick={onSelectFriends} title="Direct Messages"
          style={{ ...btnBase, background: !selectedServer ? 'var(--color-primary)' : 'var(--color-bg-4)', color: 'var(--color-text-1)' }}>
          <img src="/logo.png" alt="Home" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        </button>

        <div style={{ width: '32px', height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

        {servers.map(server => (
          <button key={server.id} onClick={() => onSelectServer(server)} title={server.name}
            style={{ ...btnBase, background: selectedServer?.id === server.id ? 'var(--color-primary)' : 'var(--color-bg-4)', color: 'var(--color-text-1)', outline: selectedServer?.id === server.id ? '3px solid var(--color-primary)' : 'none', outlineOffset: '2px', overflow: 'hidden', fontSize: '14px', fontWeight: 'bold' }}>
            {server.iconUrl ? <img src={server.iconUrl} alt={server.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : server.name.charAt(0).toUpperCase()}
          </button>
        ))}

        <button onClick={() => setShowCreateModal(true)} title="Create or Join Server"
          style={{ ...btnBase, background: 'var(--color-bg-4)', color: 'var(--color-text-2)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-4)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}>
          <Plus size={20} />
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={onOpenSettings} title="Settings"
          style={{ ...btnBase, background: 'var(--color-bg-4)', color: 'var(--color-text-2)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-1)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-2)'}>
          <Settings size={18} />
        </button>

        <div style={{ ...btnBase, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'default' }} title={user?.username}>
          {user?.avatarUrl ? <img src={user.avatarUrl} alt="You" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} /> : user?.username?.charAt(0).toUpperCase()}
        </div>
      </div>

      {showCreateModal && <CreateServerModal onClose={() => setShowCreateModal(false)} onServerCreated={handleServerCreated} />}
    </>
  );
};

export default ServerSidebar;
