import express from "express";

import http from "http";

import { Server, Socket } from "socket.io";

import path from "path";

import dotenv from "dotenv";



dotenv.config();



const EXPRESS_PORT = parseInt(process.env.EXPRESS_PORT || "3000");

const SOCKET_PORT = parseInt(process.env.SOCKET_PORT || "3001");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";



// --- Serveur Express pour le frontend ---

const app = express();

const DIST_DIR = path.join(__dirname, "../../Client/dist");



app.use(express.static(DIST_DIR));



/* app.get("*", (_, res) => {

  res.sendFile(path.join(DIST_DIR, "index.html"));

}); */



app.listen(EXPRESS_PORT, () => {

  console.log(`🌍 Express lancé sur http://localhost:${EXPRESS_PORT}`);

});



// --- Serveur WebSocket (Socket.IO) ---

const wsServer = http.createServer(); // pas besoin de `app` ici

const io = new Server(wsServer, {

  cors: { origin: CLIENT_URL },

});



interface UserData {

  characterId: string;

  position: { x: number; y: number };

  userName: string;

}



const userCharacters: Record<string, UserData> = {};



function formatUsers() {

  return Object.entries(userCharacters).map(([socketId, udata]) => ({

    socketId,

    characterId: udata.characterId,

    position: udata.position,

    userName: udata.userName,

  }));

}



io.on("connection", (socket: Socket) => {

  console.log(`✅ [WS] Connexion : ${socket.id}`);

  socket.emit("all-users", formatUsers());



  socket.on("register-character", ({ characterId, userName }) => {

    const isTaken = Object.values(userCharacters).some(

      (u) => u.characterId === characterId

    );

    if (isTaken) {

      socket.emit("character-taken", { characterId });

      return;

    }



    userCharacters[socket.id] = {

      characterId,

      userName,

      position: { x: 100, y: 100 },

    };



    io.emit("all-users", formatUsers());

  });



  socket.on("move", ({ x, y }) => {

    const user = userCharacters[socket.id];

    if (user) {

      user.position = { x, y };

      io.emit("all-users", formatUsers());

    }

  });



  socket.on("signal", (data: { to: string; signal: any }) => {

    const { to, signal } = data;

    io.to(to).emit("signal", { from: socket.id, signal });

  });



  socket.on("disconnect", () => {

    console.log(`❌ [WS] Déconnexion : ${socket.id}`);

    delete userCharacters[socket.id];

    io.emit("all-users", formatUsers());

  });

});



wsServer.listen(SOCKET_PORT, "0.0.0.0", () => {

  console.log(`🚀 WebSocket lancé sur http://localhost:${SOCKET_PORT}`);

});
