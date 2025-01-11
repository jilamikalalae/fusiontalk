import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function useSocket(userId) {
  const socket = useRef(null);

  useEffect(() => {
    // Initialize socket connection with explicit configuration
    socket.current = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connect to specific user's chat
    if (userId) {
      socket.current.emit('join_chat', userId);
      console.log('Joining chat room:', userId);
    }

    // Error handling
    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId]);

  const sendMessage = (messageData) => {
    if (socket.current?.connected) {
      console.log('Sending message:', messageData);
      socket.current.emit('new_message', messageData);
    } else {
      console.error('Socket not connected');
    }
  };

  return { sendMessage };
}
