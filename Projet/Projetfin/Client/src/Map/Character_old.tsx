// Client/src/components/Character.tsx

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import mapImage from "../img/samplemap_32.png"; // ta carte (800×600)
import char1 from "../img/Adam.png";
import char2 from "../img/Alex.png";
import char3 from "../img/Amelia.png";
import char4 from "../img/Bob.png";

// Définition des positions
type Position = { x: number; y: number };

interface UserInfo {
  socketId: string;
  characterId: string;
  position: Position;
  userName: string;
}

const SOCKET_SERVER_URL = "http://localhost:3000";

// Mapping characterId → sprite importée
const characterSprites: Record<string, string> = {
  char1: char1,
  char2: char2,
  char3: char3,
  char4: char4,
};

export default function Character() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [chosenCharacterId, setChosenCharacterId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [registrationError, setRegistrationError] = useState<string>("");

  const [nearbyUser, setNearbyUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const socketIo = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log(">> Connecté au serveur, socket id :", socketIo.id);
      setConnected(true);
    });

    socketIo.on("disconnect", () => {
      console.log(">> Déconnecté du serveur");
      setConnected(false);
      setChosenCharacterId("");
      setUserName("");
    });

    socketIo.on("all-users", (usersList: UserInfo[]) => {
      setAllUsers(usersList);
    });

    socketIo.on("character-taken", (data: { characterId: string }) => {
      setRegistrationError(`Avatar "${data.characterId}" déjà pris.`);
      setChosenCharacterId("");
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !connected || !chosenCharacterId || !userName) return;
    socket.emit("register-character", { characterId: chosenCharacterId, userName });
  }, [chosenCharacterId, userName, socket, connected]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!socket || !connected || !chosenCharacterId) return;
      const me = allUsers.find((u) => u.socketId === socket.id);
      if (!me) return;

      let { x: curX, y: curY } = me.position;
      let newX = curX;
      let newY = curY;

      switch (e.key) {
        case "ArrowUp":
          newY = curY - 10;
          break;
        case "ArrowDown":
          newY = curY + 10;
          break;
        case "ArrowLeft":
          newX = curX - 10;
          break;
        case "ArrowRight":
          newX = curX + 10;
          break;
        default:
          return;
      }

      newX = Math.max(0, Math.min(760, newX));
      newY = Math.max(0, Math.min(560, newY));
      socket.emit("move", { x: newX, y: newY });
    },
    [socket, connected, allUsers, chosenCharacterId]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Vérification des distances
  useEffect(() => {
    if (!socket || !chosenCharacterId) return;

    const me = allUsers.find((u) => u.socketId === socket.id);
    if (!me) {
      setNearbyUser(null);
      return;
    }

    const threshold = 60;
    const nearby = allUsers.find((u) => u.socketId !== socket.id && distance(me.position, u.position) < threshold);

    setNearbyUser(nearby || null);
  }, [allUsers, socket, chosenCharacterId]);

  const distance = (p1: Position, p2: Position) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  if (!connected) {
    return <div>Connexion au serveur en cours…</div>;
  }

  if (!chosenCharacterId || !userName) {
    const takenIds = new Set(allUsers.map((u) => u.characterId));
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Entrez votre nom et choisissez votre personnage</h2>
        <input
          type="text"
          placeholder="Votre nom"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", marginBottom: "20px" }}
        />
        {userName && <p>Bonjour, <strong>{userName}</strong> ! Choisissez un avatar :</p>}
        {registrationError && <p style={{ color: "red" }}>{registrationError}</p>}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
          {Object.entries(characterSprites).map(([charId, spriteUrl]) => {
            const isTaken = takenIds.has(charId);
            return (
              <div key={charId} style={{ textAlign: "center", opacity: isTaken ? 0.3 : 1 }}>
                <img
                  src={spriteUrl}
                  alt={charId}
                  style={{
                    width: "80px",
                    height: "80px",
                    border: isTaken ? "2px solid red" : "2px solid #ccc",
                    borderRadius: "8px",
                    cursor: (!userName || isTaken) ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (!isTaken && userName) {
                      setChosenCharacterId(charId);
                      setRegistrationError("");
                    }
                  }}
                />
                <div style={{ marginTop: "8px" }}>{charId}</div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: "20px", color: "#666" }}>
          (Les avatars en rouge sont déjà pris ou choisissez un nom d'abord)
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginTop: "20px" }}>
      {/* Carte */}
      <div style={{ position: "relative", width: "800px", height: "600px", backgroundImage: `url(${mapImage})`, backgroundSize: "cover", border: "2px solid #333" }}>
        {allUsers.map((user) => {
          const spriteUrl = characterSprites[user.characterId];
          return (
            <img
              key={user.socketId}
              src={spriteUrl}
              alt={`Perso ${user.characterId}`}
              style={{
                position: "absolute",
                top: user.position.y,
                left: user.position.x,
                width: "30px",
                height: "55px",
                transition: "0.1s",
              }}
            />
          );
        })}
      </div>

      {/* Liste des utilisateurs connectés à droite */}
     {/* Liste des utilisateurs connectés à droite */}
<div style={{
  width: "220px",
  marginLeft: "20px",
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "15px",
  maxHeight: "600px",
  overflowY: "auto"
}}>
  <h3 style={{ marginBottom: "15px", textAlign: "center" }}>👥 Joueurs en ligne</h3>
  {allUsers.map((user) => (
    <div key={user.socketId} style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "12px",
      padding: "5px",
      borderBottom: "1px solid #eee"
    }}>
      <img
        src={characterSprites[user.characterId]}
        alt={user.characterId}
        style={{
          width: "32px",
          height: "32px",
          marginRight: "10px",
          borderRadius: "50%",
          border: "1px solid #aaa"
        }}
      />
      <div>
        <div style={{ fontWeight: "bold" }}>{user.userName}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>{user.characterId}</div>
      </div>
    </div>
  ))}
</div>


      {/* Modale si proximité détectée */}
      {nearbyUser && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            border: "2px solid #333",
            borderRadius: "10px",
            padding: "20px",
            zIndex: 1000,
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <h3>Vous êtes proche de {nearbyUser.userName}</h3>
          <button onClick={() => alert("Démarrage de l'appel audio...")} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>
            Lancer un appel audio
          </button>
        </div>
      )}
    </div>
  );
}
