import React from 'react';
import { Crown, Shield } from 'lucide-react';

const MemberList = ({ members }) => {
  const owners = members.filter(m => m.role === 'owner');
  const admins = members.filter(m => m.role === 'admin');
  const regularMembers = members.filter(m => m.role === 'member');

  const MemberItem = ({ member }) => (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-default"
      style={{ color: 'var(--color-text-2)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-4)'; e.currentTarget.style.color = 'var(--color-text-1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-2)'; }}>
      <div className="relative flex-shrink-0">
        <div className="flex items-center justify-center text-sm font-bold rounded-full" style={{ width: '32px', height: '32px', background: 'var(--color-bg-5)' }}>
          {member.user?.avatarUrl ? <img src={member.user.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} /> : member.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="absolute rounded-full border-2" style={{ width: '12px', height: '12px', bottom: '-2px', right: '-2px', background: member.user?.status === 'online' ? '#22c55e' : '#6b7280', borderColor: 'var(--color-bg-3)' }} />
      </div>
      <span className="text-sm truncate flex-1">{member.user?.username}</span>
      {member.role === 'owner' && <Crown size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />}
      {member.role === 'admin' && <Shield size={12} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
    </div>
  );

  const Section = ({ title, members }) => {
    if (members.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>{title} — {members.length}</p>
        {members.map(m => <MemberItem key={m.id} member={m} />)}
      </div>
    );
  };

  return (
    <div className="overflow-y-auto p-3" style={{ width: '240px', background: 'var(--color-bg-3)', borderLeft: '1px solid var(--color-border)' }}>
      <Section title="Owner" members={owners} />
      <Section title="Admins" members={admins} />
      <Section title="Members" members={regularMembers} />
    </div>
  );
};

export default MemberList;
