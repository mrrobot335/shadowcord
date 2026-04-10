import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, MessageSquare, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../api/client';

const FriendsList = ({ onOpenDM }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addUsername, setAddUsername] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { socket } = useSocket();

  useEffect(() => { loadFriends(); }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('user:online', ({ userId }) => setFriends(prev => prev.map(f => f.id === userId ? { ...f, status: 'online' } : f)));
    socket.on('user:offline', ({ userId }) => setFriends(prev => prev.map(f => f.id === userId ? { ...f, status: 'offline' } : f)));

    // Listen for incoming friend requests in real time
    socket.on('friend:request', ({ targetUserId, friendship }) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser?.id === targetUserId) {
        setPendingRequests(prev => [...prev, friendship]);
      }
    });

    return () => {
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('friend:request');
    };
  }, [socket]);

  const [sentRequests, setSentRequests] = useState([]);

  const loadFriends = async () => {
    try {
      const { data } = await apiClient.get('/friends');
      setFriends(data.friends);
      setPendingRequests(data.pendingRequests);
      setSentRequests(data.sentRequests); // add this
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!addUsername.trim()) return;
    setAddError(''); setAddSuccess('');
    try {
      await apiClient.post('/friends/request', { displayId: addUsername.trim() });
      setAddSuccess(`Friend request sent to ${addUsername}`);
      setAddUsername('');
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAccept = async (friendshipId, initiator) => {
    try {
      await apiClient.post(`/friends/accept/${friendshipId}`);
      setPendingRequests(prev => prev.filter(r => r.id !== friendshipId));
      setFriends(prev => [...prev, initiator]);
    } catch (err) { console.error('Failed to accept:', err); }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Remove this friend?')) return;
    try {
      await apiClient.delete(`/friends/${friendId}`);
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) { console.error('Failed to remove:', err); }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-4)' }}>
      <div className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--color-text-1)' }}>Friends</h3>
        <div className="flex gap-1">
          {['all', 'pending'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="px-3 py-1 rounded-md text-sm capitalize"
              style={{ background: activeTab === tab ? 'var(--color-bg-5)' : 'transparent', color: activeTab === tab ? 'var(--color-text-1)' : 'var(--color-text-3)', border: 'none', cursor: 'pointer' }}>
              {tab} {tab === 'pending' && pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddFriend(!showAddFriend)} className="ml-auto px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5"
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <UserPlus size={14} /> Add Friend
        </button>
      </div>

      {showAddFriend && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-3)' }}>
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--color-text-3)' }}>Add Friend by Username</p>
          <div className="flex gap-2">
            <input
              value={addUsername}
              onChange={(e) => setAddUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
              placeholder="Enter tag e.g. shadow#4821"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }}
            />
            <button onClick={handleAddFriend} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>Send</button>
          </div>
          {addError && <p className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>{addError}</p>}
          {addSuccess && <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{addSuccess}</p>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'pending' && (
          <div>
            {pendingRequests.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: 'var(--color-text-3)' }}>
                  Incoming — {pendingRequests.length}
                </p>
                {pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: 'var(--color-bg-3)' }}>
                    <div className="flex items-center justify-center font-bold rounded-full" style={{ width: '40px', height: '40px', background: 'var(--color-bg-5)' }}>
                      {request.initiator?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>{request.initiator?.displayId}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Incoming request</p>
                    </div>
                    <button onClick={() => handleAccept(request.id, request.initiator)} className="p-2 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: 'none', cursor: 'pointer' }}>
                      <Check size={14} />
                    </button>
                    <button className="p-2 rounded-full" style={{ background: 'rgba(220,38,38,0.2)', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sentRequests.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase mb-2 px-1" style={{ color: 'var(--color-text-3)' }}>
                  Sent — {sentRequests.length}
                </p>
                {sentRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: 'var(--color-bg-3)' }}>
                    <div className="flex items-center justify-center font-bold rounded-full" style={{ width: '40px', height: '40px', background: 'var(--color-bg-5)' }}>
                      {request.receiver?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>{request.receiver?.displayId}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Pending...</p>
                    </div>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#f59e0b' }} />
                  </div>
                ))}
              </div>
            )}

            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-3)' }}>No pending requests</p>
            )}
          </div>
        )}

        {activeTab === 'all' && (
          friends.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-3)' }}>No friends yet. Add someone!</p>
          ) : (
            friends.map(friend => (
              <div key={friend.id} className="flex items-center gap-3 p-3 rounded-lg mb-2 group" style={{ background: 'var(--color-bg-3)' }}>
                <div className="relative">
                  <div className="flex items-center justify-center font-bold rounded-full" style={{ width: '40px', height: '40px', background: 'var(--color-primary)', color: '#fff' }}>
                    {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> : friend.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute rounded-full border-2" style={{ width: '14px', height: '14px', bottom: '-2px', right: '-2px', background: friend.status === 'online' ? '#22c55e' : '#6b7280', borderColor: 'var(--color-bg-3)' }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>{friend.username}</p>
                  <p className="text-xs" style={{ color: friend.status === 'online' ? '#22c55e' : 'var(--color-text-3)' }}>{friend.status === 'online' ? 'Online' : 'Offline'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onOpenDM(friend)} className="p-2 rounded-lg" style={{ background: 'var(--color-bg-4)', color: 'var(--color-text-2)', border: 'none', cursor: 'pointer' }} title="Message">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => handleRemoveFriend(friend.id)} className="p-2 rounded-lg" style={{ background: 'var(--color-bg-4)', color: 'var(--color-text-3)', border: 'none', cursor: 'pointer' }} title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default FriendsList;
