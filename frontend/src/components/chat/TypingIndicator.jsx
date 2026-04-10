import React from 'react';

const TypingIndicator = ({ users }) => {
  if (users.length === 0) return <div style={{ height: '24px', padding: '0 16px' }} />;
  let text;
  if (users.length === 1) text = `${users[0].username} is typing...`;
  else if (users.length === 2) text = `${users[0].username} and ${users[1].username} are typing...`;
  else text = 'Several people are typing...';

  return (
    <div className="flex items-center gap-2 px-4" style={{ height: '24px' }}>
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-full animate-bounce" style={{ width: '6px', height: '6px', background: 'var(--color-text-3)', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{text}</span>
    </div>
  );
};

export default TypingIndicator;
