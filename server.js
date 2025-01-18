import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: '/socket.io'
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a chat room
    socket.on("join_chat", (userId) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined chat: ${userId}`);
    });

    // Handle new messages with more detailed logging
    socket.on("new_message", (data) => {
      console.log("Broadcasting message to room:", data.replyTo);
      console.log("Message data:", data);
      
      // Broadcast to the specific room (userId)
      io.to(data.replyTo).emit("receive_message", {
        userId: data.userId,
        userName: data.userName || 'Bot',
        content: data.message,
        messageType: data.messageType,
        createdAt: new Date().toISOString(),
        replyTo: data.replyTo
      });
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});