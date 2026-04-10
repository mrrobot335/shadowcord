import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import apiClient from '../../api/client';

const CreateServerModal = ({ onClose, onServerCreated }) => {
  const [mode, setMode] = useState('create');
  const [name, setName] = useState('');
  const [serverId, setServerId] = useState('');
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) { setIcon(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleCreate = async () => {
    if (!name.trim()) return setError('Server name required');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (icon) formData.append('icon', icon);
      const { data } = await apiClient.post('/servers', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onServerCreated(data.server);
      onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to create server'); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!serverId.trim()) return setError('Server ID required');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/servers/join', { serverId: serverId.trim() });
      onServerCreated(data.server);
      onClose();
    } catch (err) { setError(err.response?.data?.error || 'Failed to join server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md p-6 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-1)' }}>{mode === 'create' ? 'Create Server' : 'Join Server'}</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div className="flex mb-6 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-2)' }}>
          {['create', 'join'].map(m => (
            <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 text-sm font-medium capitalize"
              style={{ background: mode === m ? 'var(--color-primary)' : 'transparent', color: mode === m ? '#fff' : 'var(--color-text-2)', border: 'none', cursor: 'pointer' }}>
              {m}
            </button>
          ))}
        </div>

        {error && <p className="text-sm mb-4 p-2 rounded" style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--color-primary)' }}>{error}</p>}

        {mode === 'create' ? (
          <>
            <div className="flex flex-col items-center mb-4">
              <label className="flex flex-col items-center justify-center rounded-full cursor-pointer overflow-hidden"
                style={{ width: '80px', height: '80px', background: 'var(--color-bg-5)', border: '2px dashed var(--color-border)' }}>
                {preview ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={20} style={{ color: 'var(--color-text-3)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Icon</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-2)' }}>Server Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Server" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
            </div>
            <button onClick={handleCreate} disabled={loading} className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Creating...' : 'Create Server'}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1 uppercase" style={{ color: 'var(--color-text-2)' }}>Server ID</label>
              <input value={serverId} onChange={(e) => setServerId(e.target.value)} placeholder="Paste server ID here" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>Ask the server owner for the server ID</p>
            </div>
            <button onClick={handleJoin} disabled={loading} className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Joining...' : 'Join Server'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateServerModal;
