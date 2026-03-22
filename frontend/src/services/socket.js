import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Change to your backend URL

let socket = null;

export function connectSocket() {
  if (!socket) {
    socket = io(SOCKET_URL);
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
