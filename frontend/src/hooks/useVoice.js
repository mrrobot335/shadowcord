import { useRef, useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';

export const useVoice = (socket) => {
  const [isInVoice, setIsInVoice] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [voicePeers, setVoicePeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Microphone access denied:', error);
      throw new Error('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const createPeer = (targetSocketId, initiator, stream) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (signal) => {
      if (signal.type === 'offer') socket.emit('voice:offer', { targetSocketId, offer: signal });
      else if (signal.type === 'answer') socket.emit('voice:answer', { targetSocketId, answer: signal });
      else socket.emit('voice:ice-candidate', { targetSocketId, candidate: signal });
    });

    peer.on('stream', (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.play().catch(e => console.error('Audio play error:', e));
    });

    peer.on('error', (err) => { console.error('Peer error:', err); });
    peer.on('close', () => { console.log('Peer connection closed with:', targetSocketId); });

    peersRef.current[targetSocketId] = peer;
    setVoicePeers(prev => ({ ...prev, [targetSocketId]: peer }));
    return peer;
  };

  const joinVoiceChannel = async (channelId) => {
    try {
      await getLocalStream();
      setIsInVoice(true);
      setCurrentChannelId(channelId);
      socket.emit('voice:join', { channelId });
    } catch (error) {
      throw error;
    }
  };

  const leaveVoiceChannel = () => {
    if (currentChannelId) socket.emit('voice:leave', { channelId: currentChannelId });
    Object.values(peersRef.current).forEach(peer => { if (!peer.destroyed) peer.destroy(); });
    peersRef.current = {};
    setVoicePeers({});
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsInVoice(false);
    setCurrentChannelId(null);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setIsMuted(!audioTrack.enabled); }
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('voice:existing-peers', ({ peers }) => {
      peers.forEach(({ socketId }) => {
        if (localStreamRef.current) createPeer(socketId, true, localStreamRef.current);
      });
    });

    socket.on('voice:user-joined', ({ socketId }) => {
      if (localStreamRef.current) createPeer(socketId, false, localStreamRef.current);
    });

    socket.on('voice:offer', ({ offer, fromSocketId }) => {
      const peer = peersRef.current[fromSocketId];
      if (peer && !peer.destroyed) peer.signal(offer);
    });

    socket.on('voice:answer', ({ answer, fromSocketId }) => {
      const peer = peersRef.current[fromSocketId];
      if (peer && !peer.destroyed) peer.signal(answer);
    });

    socket.on('voice:ice-candidate', ({ candidate, fromSocketId }) => {
      const peer = peersRef.current[fromSocketId];
      if (peer && !peer.destroyed) peer.signal(candidate);
    });

    socket.on('voice:user-left', ({ socketId }) => {
      const peer = peersRef.current[socketId];
      if (peer && !peer.destroyed) peer.destroy();
      delete peersRef.current[socketId];
      setVoicePeers(prev => { const updated = { ...prev }; delete updated[socketId]; return updated; });
    });

    return () => {
      socket.off('voice:existing-peers');
      socket.off('voice:user-joined');
      socket.off('voice:offer');
      socket.off('voice:answer');
      socket.off('voice:ice-candidate');
      socket.off('voice:user-left');
    };
  }, [socket]);

  return { isInVoice, currentChannelId, isMuted, joinVoiceChannel, leaveVoiceChannel, toggleMute };
};