import React from 'react';

const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  } catch { return ''; }
};

const MessageItem = ({ message, showHeader }) => {
  const { user, content, createdAt } = message;

  return (
    <div className="flex gap-3 px-1 py-0.5 rounded-md"
      style={{ marginBottom: showHeader ? '8px' : '1px' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-5)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width: '40px', flexShrink: 0, paddingTop: '2px' }}>
        {showHeader ? (
          <div className="flex items-center justify-center text-sm font-bold rounded-full" style={{ width: '40px', height: '40px', background: 'var(--color-primary)', color: '#fff' }}>
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> : user?.username?.charAt(0).toUpperCase()}
          </div>
        ) : <div style={{ width: '40px' }} />}
      </div>
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text-1)' }}>{user?.username}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{formatTime(createdAt)}</span>
          </div>
        )}
        <p className="text-sm leading-relaxed break-words" style={{ color: 'var(--color-text-2)' }}>{content}</p>
      </div>
    </div>
  );
};

export default MessageItem;
