import io from "socket.io-client";
import { store } from "../store";
import type { Middleware } from "redux";

// Connexion socket
const socket = io("http://localhost:3000");

const socketMiddleware: Middleware = () => (next) => (action: unknown) => {
  // Type-guard basique
  if (typeof action === "object" && action !== null && "type" in action) {
    const typedAction = action as { type: string; meta?: { remote?: boolean } };

    if (typedAction.meta?.remote) {
      // Action reçue via socket, ne pas réémettre
      return next(typedAction);
    }

    // Émission de l'action au serveur
    socket.emit("action", typedAction);
    return next(typedAction);
  }

  // Sinon passer l'action normalement
  return next(action);
};

socket.on("action", (action) => {
  store.dispatch({ ...action, meta: { ...(action.meta || {}), remote: true } });
});

export default socketMiddleware;
