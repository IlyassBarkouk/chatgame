import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import mapImage from "../img/samplemap_32.png";
import char1 from "../img/Adam.png";
import char2 from "../img/Alex.png";
import char3 from "../img/Amelia.png";
import char4 from "../img/Bob.png";

type Position = { x: number; y: number };

interface UserInfo {
  socketId: string;
  characterId: string;
  position: Position;
  userName: string;
}

const SOCKET_SERVER_URL = "http://192.168.11.107:3000";

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

  // --- WebRTC refs ---
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const socketIo = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    setSocket(socketIo);

    socketIo.on("connect", () => {
      setConnected(true);
      console.log("Connecté avec ID:", socketIo.id);
    });

    socketIo.on("disconnect", () => {
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

    // WebRTC signaling
    socketIo.on("signal", async ({ from, signal }) => {
      if (!pc.current) return;

      if (signal.type === "offer") {
        // Offre reçue, on crée une réponse
        await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        socketIo.emit("signal", { to: from, signal: pc.current.localDescription });
      } else if (signal.type === "answer") {
        // Réponse reçue
        await pc.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        // ICE candidate reçu
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(signal));
        } catch (err) {
          console.error("Erreur ajout ICE candidate", err);
        }
      }
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

  // Détecte la proximité
  useEffect(() => {
    if (!socket || !chosenCharacterId) return;

    const me = allUsers.find((u) => u.socketId === socket.id);
    if (!me) {
      setNearbyUser(null);
      return;
    }

    const threshold = 60;
    const nearby = allUsers.find(
      (u) => u.socketId !== socket.id && distance(me.position, u.position) < threshold
    );

    setNearbyUser(nearby || null);
  }, [allUsers, socket, chosenCharacterId]);

  const distance = (p1: Position, p2: Position) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  // --- WebRTC Functions ---

  async function startCall() {
    if (!socket || !nearbyUser) return;

    // Création RTCPeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Capture audio micro
    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.current.getTracks().forEach((track) => {
      pc.current?.addTrack(track, localStream.current!);
    });

    // Quand on reçoit un flux audio vidéo
    pc.current.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play();
      }
    };

    // Gestion ICE candidates
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", { to: nearbyUser.socketId, signal: event.candidate });
      }
    };

    // Créer une offre
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    // Envoyer l’offre via Socket.IO
    socket.emit("signal", { to: nearbyUser.socketId, signal: offer });

    setInCall(true);
  }

  function endCall() {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    setInCall(false);
  }

  // --- Rendu ---

  if (!connected) {
    return <p>Connexion au serveur...</p>;
  }

  if (!chosenCharacterId) {
    return (
      <div>
        <h3>Choisis ton avatar et entre ton nom :</h3>
        <input
          placeholder="Ton nom"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        {Object.entries(characterSprites).map(([id, src]) => (
          <img
            key={id}
            src={src}
            alt={id}
            style={{
              width: 60,
              height: 60,
              margin: 10,
              cursor: "pointer",
              border: chosenCharacterId === id ? "3px solid green" : "1px solid gray",
            }}
            onClick={() => {
              if (userName.trim() === "") {
                alert("Entre ton nom avant de choisir l’avatar");
                return;
              }
              setChosenCharacterId(id);
              setRegistrationError("");
            }}
          />
        ))}
        {registrationError && <p style={{ color: "red" }}>{registrationError}</p>}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: 800, height: 600, border: "1px solid black" }}>
      <img src={mapImage} alt="carte" style={{ width: "100%", height: "100%" }} />
      {allUsers.map(({ socketId, characterId, position, userName }) => {
        const sprite = characterSprites[characterId] || char1;
        return (
          <div
            key={socketId}
            title={userName}
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              width: 40,
              height: 40,
            }}
          >
            <img
              src={sprite}
              alt={characterId}
              style={{
                width: 40,
                height: 40,
                border: socketId === socket?.id ? "2px solid blue" : "none",
              }}
            />
            <div style={{ textAlign: "center", fontSize: 12 }}>{userName}</div>
          </div>
        );
      })}

      {nearbyUser && !inCall && (
        <button
          onClick={startCall}
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Appeler {nearbyUser.userName}
        </button>
      )}
      {inCall && (
        <button
          onClick={endCall}
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Raccrocher
        </button>
      )}

      {/* Balise audio pour écouter le flux entrant */}
      <audio ref={remoteAudioRef} autoPlay hidden></audio>
    </div>
  );
}
