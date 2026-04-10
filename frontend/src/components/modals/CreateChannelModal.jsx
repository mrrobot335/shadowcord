import React, { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import apiClient from '../../api/client';

const CreateChannelModal = ({ serverId, defaultType, onClose, onChannelCreated }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultType || 'text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Channel name required');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/channels', { name, type, serverId });
      onChannelCreated(data.channel);
      onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create channel'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md p-6 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-1)' }}>Create Channel</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {error && <p className="text-sm mb-4 p-2 rounded" style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary)' }}>{error}</p>}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ value: 'text', label: 'Text Channel', icon: <Hash size={20} /> }, { value: 'voice', label: 'Voice Channel', icon: <Volume2 size={20} /> }].map(opt => (
            <button key={opt.value} onClick={() => setType(opt.value)} className="p-3 rounded-lg flex flex-col items-center gap-2 text-sm"
              style={{ background: type === opt.value ? 'var(--color-bg-5)' : 'var(--color-bg-2)', border: `2px solid ${type === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`, color: type === opt.value ? 'var(--color-text-1)' : 'var(--color-text-3)', cursor: 'pointer' }}>
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-2)' }}>Channel Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'text' ? 'general' : 'General Voice'} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-2)', border: 'none', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="flex-1 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
