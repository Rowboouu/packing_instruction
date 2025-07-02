import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    socket.on('connect_error', (error) => {
      console.error('Connection Error', error);
    });

    socket.on('connect_timeout', () => {
      console.error('Connection Timeout');
    });
  }

  return socket;
}
