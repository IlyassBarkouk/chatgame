"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server/src/index.ts ou server.ts (selon ta config)
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path = require("path");
const DIST_DIR = path.join(__dirname, "../../Client/dist");
const HTML_FILE = path.join(DIST_DIR, "index.html");
const app = (0, express_1.default)();
const port = 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
});
// Map : socket.id → UserData
const userCharacters = {};
// Utilitaire : convertir la Map en tableau d’objets à renvoyer
function formatUsers() {
    return Object.entries(userCharacters).map(([socketId, udata]) => ({
        socketId,
        characterId: udata.characterId,
        position: udata.position,
        userName: udata.userName,
    }));
}
// Connexion socket.io
io.on("connection", (socket) => {
    console.log(`✅ Utilisateur connecté : ${socket.id}`);
    // Envoyer la liste des utilisateurs à l'utilisateur connecté
    socket.emit("all-users", formatUsers());
    // Événement de sélection de personnage
    socket.on("register-character", ({ characterId, userName }) => {
        // Vérifier si l'avatar est déjà pris
        const isTaken = Object.values(userCharacters).some((u) => u.characterId === characterId);
        if (isTaken) {
            socket.emit("character-taken", { characterId });
            return;
        }
        // Sinon, enregistrer l'utilisateur
        userCharacters[socket.id] = {
            characterId,
            userName,
            position: { x: 100, y: 100 }, // position initiale
        };
        // Envoyer la liste mise à jour à tous
        io.emit("all-users", formatUsers());
    });
    // Événement de déplacement
    socket.on("move", ({ x, y }) => {
        const user = userCharacters[socket.id];
        if (user) {
            user.position = { x, y };
            io.emit("all-users", formatUsers());
        }
    });
    // **NOUVEAU : signalisation WebRTC**
    // data = { to: <socketIdCible>, signal: <objetSignalisation> }
    socket.on("signal", (data) => {
        const { to, signal } = data;
        // On envoie le signal uniquement à la socket cible
        io.to(to).emit("signal", { from: socket.id, signal });
    });
    // Déconnexion
    socket.on("disconnect", () => {
        console.log(`❌ Utilisateur déconnecté : ${socket.id}`);
        delete userCharacters[socket.id];
        io.emit("all-users", formatUsers());
    });
});
server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Serveur Socket.IO lancé sur http://localhost:${port}`);
});
app.use(express_1.default.static(DIST_DIR));
