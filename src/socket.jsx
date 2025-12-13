import { io } from 'socket.io-client';
import { SOCKET_URL } from './Config';

const socket = io(SOCKET_URL, {
  withCredentials: true,
});

export default socket;
