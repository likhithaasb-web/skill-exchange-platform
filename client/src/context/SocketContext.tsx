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
                      window.location.origin;

    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (user && user._id) {
        socketInstance.emit('user-online', user);
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
    if (socket && isConnected && user && user._id) {
      socket.emit('user-online', user);
    }
  }, [user, socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

