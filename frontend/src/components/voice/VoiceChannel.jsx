import React from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

const VoiceChannel = ({ voiceState }) => {
  const { isInVoice, isMuted, leaveVoiceChannel, toggleMute } = voiceState;
  if (!isInVoice) return null;

  return (
    <div className="absolute bottom-0 z-10 p-3 flex items-center gap-2"
      style={{ left: '72px', width: '240px', background: 'rgba(34,197,94,0.15)', borderTop: '1px solid rgba(34,197,94,0.3)' }}>
      <div className="rounded-full animate-pulse" style={{ width: '8px', height: '8px', background: '#22c55e' }} />
      <span className="text-xs font-medium flex-1" style={{ color: '#22c55e' }}>Voice Connected</span>
      <button onClick={toggleMute} className="p-1.5 rounded-md" style={{ color: isMuted ? 'var(--color-primary)' : 'var(--color-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
        {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
      </button>
      <button onClick={leaveVoiceChannel} className="p-1.5 rounded-md" style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
        <PhoneOff size={14} />
      </button>
    </div>
  );
};

export default VoiceChannel;
