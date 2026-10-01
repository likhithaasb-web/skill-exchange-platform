import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null, 
  isConnected: false,
  onlineUserIds: [],
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to server origin or configured backend URL
    const socketUrl = (import.meta.env.VITE_SOCKET_URL as string) ||
                      (import.meta.env.VITE_API_URL as string) ||
                      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : window.location.origin);

    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (user && (user._id || (user as any).id)) {
        socketInstance.emit('user-online', {
          ...user,
          _id: (user._id || (user as any).id).toString(),
        });
      }
    });

    socketInstance.on('online-users-list', (ids: string[]) => {
      setOnlineUserIds(ids);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?._id]);

  // If user state updates while already connected, emit user-online
  useEffect(() => {
    if (socket && isConnected && user && (user._id || (user as any).id)) {
      socket.emit('user-online', {
        ...user,
        _id: (user._id || (user as any).id).toString(),
      });
    }
  }, [user, socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

