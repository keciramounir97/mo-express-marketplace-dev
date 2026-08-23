// ============================================================================
// FICHIER : backend 2/config/socket.js
// RÔLE : Configuration et gestionnaire d'événements du serveur WebSocket (Socket.io)
// ============================================================================

import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
  if (!httpServer) return null;
  
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  console.log("⚡ Serveur WebSocket (Socket.io) initialisé et prêt pour le temps réel");

  io.on("connection", (socket) => {
    console.log(`🔌 Nouveau client connecté via WebSocket [ID Socket : ${socket.id}]`);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`👤 Client [${socket.id}] a rejoint la salle de discussion : ${roomId}`);
    });

    socket.on("send_message", (messageData) => {
      console.log(`💬 Message reçu dans la salle [${messageData.roomId}] :`, messageData.text);
      io.to(messageData.roomId).emit("receive_message", messageData);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("user_typing", data);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client déconnecté [ID Socket : ${socket.id}] - Raison : ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    return {
      to: () => ({ emit: () => {} }),
      in: () => ({ emit: () => {} }),
      emit: () => {},
    };
  }
  return io;
};

export default {
  initSocket,
  getIO,
};
