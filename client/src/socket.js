import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message);
});

socket.on('reconnect', (attempt) => {
  console.log('Reconnected after', attempt, 'attempts');
});