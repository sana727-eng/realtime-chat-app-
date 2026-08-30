import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

socket.on('connect', () => console.log('✅ socket connected:', socket.id));
socket.on('connect_error', (err) => console.log('❌ connect_error:', err.message));