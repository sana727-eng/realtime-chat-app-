import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,  // sends the httpOnly cookie during handshake
  autoConnect: false,     // we'll connect manually once we know user is logged in
});