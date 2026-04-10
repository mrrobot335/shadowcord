import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      if (socket) { socket.disconnect(); setSocket(null); setConnected(false); }
      return;
    }

    const newSocket = io('https://shadowcord-production.up.railway.app', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => { console.log('Socket connected:', newSocket.id); setConnected(true); });
    newSocket.on('disconnect', () => { console.log('Socket disconnected'); setConnected(false); });
    newSocket.on('connect_error', (error) => { console.error('Socket connection error:', error.message); });

    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, [token, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
