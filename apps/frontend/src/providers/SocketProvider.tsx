import { getSocket } from '@/lib/socket-client';
import React from 'react';
import { Socket } from 'socket.io-client';

export const SocketContext = React.createContext<Socket | null>(null);

const isDev = import.meta.env.DEV;

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const socket = getSocket();

  React.useEffect(() => {
    if (socket) {
      // socket.connect();

      if (isDev) {
        socket.on('connect', () => {
          console.log('Socket connected: ', socket.id);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => React.useContext(SocketContext);
