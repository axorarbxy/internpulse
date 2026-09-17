// INTERNAL MODULE 4 FUNCTIONALITY — Socket.IO client wrapper with reconnection
import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (socket && socket.connected) return socket;

  socket = io(import.meta.env.VITE_MODULE4_SOCKET_URL || 'http://localhost:5004', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
