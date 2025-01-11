import { Server } from 'socket.io';

let io; // Keep the Socket.IO server instance in memory

export function GET(req, res) {
  if (!io) {
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    console.log('Socket.IO server initialized.');

    // Handle connections
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Listen for custom events
      socket.on('message', (data) => {
        console.log('Message received:', data);
        io.emit('message', data); // Broadcast to all connected clients
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });
  }

  res.status(200).json({ message: 'Socket.IO server is running!' });
}
