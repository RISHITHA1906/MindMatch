import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
      });
      socketRef.current.on('connect', () => {
        setConnected(true);
        socketRef.current.emit('join', { user_id: user.id });
      });
      socketRef.current.on('disconnect', () => setConnected(false));
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('set_offline', { user_id: user.id });
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, token]);

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const on = (event, cb) => socketRef.current?.on(event, cb);
  const off = (event, cb) => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}
