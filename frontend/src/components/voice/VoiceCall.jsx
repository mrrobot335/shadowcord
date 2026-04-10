import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import SimplePeer from 'simple-peer';

const VoiceCall = ({ socket, friend, callState, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState(callState.status);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const getStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  };

  const cleanup = () => {
    if (peerRef.current && !peerRef.current.destroyed) peerRef.current.destroy();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    peerRef.current = null;
    localStreamRef.current = null;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('call:accepted', async ({ fromSocketId }) => {
      setCallStatus('active');
      const stream = await getStream();
      const peer = new SimplePeer({ initiator: true, trickle: true, stream });
      peer.on('signal', (signal) => {
        if (signal.type === 'offer') socket.emit('call:offer', { targetSocketId: fromSocketId, offer: signal });
        else if (signal.type === 'answer') socket.emit('call:answer', { targetSocketId: fromSocketId, answer: signal });
        else socket.emit('call:ice-candidate', { targetSocketId: fromSocketId, candidate: signal });
      });
      peer.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.play().catch(console.error);
      });
      peerRef.current = peer;
    });

    socket.on('call:offer', async ({ offer, fromSocketId }) => {
      const stream = await getStream();
      const peer = new SimplePeer({ initiator: false, trickle: true, stream });
      peer.on('signal', (signal) => {
        if (signal.type === 'answer') socket.emit('call:answer', { targetSocketId: fromSocketId, answer: signal });
        else socket.emit('call:ice-candidate', { targetSocketId: fromSocketId, candidate: signal });
      });
      peer.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.play().catch(console.error);
      });
      peer.signal(offer);
      peerRef.current = peer;
    });

    socket.on('call:answer', ({ answer }) => { if (peerRef.current && !peerRef.current.destroyed) peerRef.current.signal(answer); });
    socket.on('call:ice-candidate', ({ candidate }) => { if (peerRef.current && !peerRef.current.destroyed) peerRef.current.signal(candidate); });
    socket.on('call:ended', () => { cleanup(); onEndCall(); });
    socket.on('call:rejected', () => { cleanup(); onEndCall(); });

    return () => {
      socket.off('call:accepted'); socket.off('call:offer'); socket.off('call:answer');
      socket.off('call:ice-candidate'); socket.off('call:ended'); socket.off('call:rejected');
    };
  }, [socket]);

  const handleAccept = () => { setCallStatus('active'); socket.emit('call:accept', { targetSocketId: callState.fromSocketId }); };
  const handleDecline = () => { socket.emit('call:reject', { targetSocketId: callState.fromSocketId }); cleanup(); onEndCall(); };
  const handleEnd = () => { socket.emit('call:end', { targetSocketId: callState.targetSocketId || callState.fromSocketId }); cleanup(); onEndCall(); };
  const toggleMute = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl p-8 text-center" style={{ width: '288px', background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-center text-3xl font-bold rounded-full mx-auto mb-4" style={{ width: '80px', height: '80px', background: 'var(--color-primary)', color: '#fff' }}>
          {friend.username?.charAt(0).toUpperCase()}
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-1)' }}>{friend.username}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
          {callStatus === 'incoming' ? 'Incoming voice call...' : callStatus === 'outgoing' ? 'Calling...' : 'Call in progress'}
        </p>
        <div className="flex justify-center gap-4">
          {callStatus === 'incoming' && (
            <button onClick={handleAccept} className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: '#22c55e', border: 'none', cursor: 'pointer' }}>
              <Phone size={22} color="white" />
            </button>
          )}
          {callStatus === 'active' && (
            <button onClick={toggleMute} className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: isMuted ? 'var(--color-primary)' : 'var(--color-bg-5)', border: 'none', cursor: 'pointer' }}>
              {isMuted ? <MicOff size={22} color="white" /> : <Mic size={22} style={{ color: 'var(--color-text-1)' }} />}
            </button>
          )}
          <button onClick={callStatus === 'incoming' ? handleDecline : handleEnd} className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>
            <PhoneOff size={22} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCall;
