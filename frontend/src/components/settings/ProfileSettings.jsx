import React, { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    setLoading(true); setMessage('');
    try {
      const formData = new FormData();
      if (username !== user.username) formData.append('username', username);
      if (avatar) formData.append('avatar', avatar);
      const { data } = await apiClient.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setMessage('Profile updated successfully');
    } catch (err) { setMessage(err.response?.data?.error || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold uppercase mb-3" style={{ color: 'var(--color-text-2)' }}>Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center font-bold text-2xl rounded-full overflow-hidden" style={{ width: '80px', height: '80px', background: 'var(--color-primary)', color: '#fff' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.username?.charAt(0).toUpperCase()}
          </div>
          <label className="px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2" style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-1)', border: '1px solid var(--color-border)' }}>
            <Upload size={14} />Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-text-2)' }}>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-text-2)' }}>Email Address</label>
        <input value={user?.email || ''} readOnly className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-60 cursor-not-allowed"
          style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>Email cannot be changed</p>
      </div>

      {message && <p className="text-sm p-2 rounded" style={{ background: message.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)', color: message.includes('success') ? '#22c55e' : 'var(--color-primary)' }}>{message}</p>}

      <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
        style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
        <Save size={16} />{loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default ProfileSettings;
