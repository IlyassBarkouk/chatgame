# 🎮 Chat Game: Proximity Video Call

This project is a real-time chat game built with **React** for the client-side and **Node.js** for the server-side. It features a unique ability to initiate a video call between two characters when they are in close proximity within the game environment.

---

## 🚀 Fonctionnalités

* **Chat en temps réel:** Engagez-vous dans des discussions instantanées avec d'autres joueurs.
* **Mouvement des personnages:** Contrôlez le déplacement de votre personnage dans le monde du jeu.
* **Appels vidéo basés sur la proximité:** Lancez automatiquement un appel vidéo lorsque deux personnages se rapprochent, favorisant des interactions dynamiques.
* **Architecture scalable:** Construit avec un frontend React et un backend Node.js, permettant de futures extensions.

---

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository_url>
cd <repository_name>
```

### 2. Installer les dépendances

```bash
cd server
npm install
cd ..
cd client
npm install
cd ..
```

---

## ▶️ Lancer le projet en développement

1.  **Lancer le serveur backend**

    Dans un terminal :

    ```bash
    cd server
    npm start
    ```

2.  **Lancer le frontend**

    Dans un *autre* terminal :

    ```bash
    cd client
    npm run dev
    ```

Le client sera disponible sur `http://localhost:5173` (ou selon la configuration de Vite).

---

## ✅ Pré-requis

* **Node.js** (version LTS recommandée)
* **npm** (Node Package Manager)
* **Git**
* Un navigateur moderne (Chrome, Firefox, etc.)

---

## 🧪 Technologies utilisées

* ⚛️ **React**: Une bibliothèque JavaScript pour la construction d'interfaces utilisateur.
* **WebRTC**: Pour la communication en temps réel (appels vidéo) via une bibliothèque comme Simple-Peer.
* **Socket.IO**: Pour la communication bidirectionnelle, événementielle et en temps réel entre le client et le serveur.
* **Node.js**: Un environnement d'exécution JavaScript côté serveur.
* **Express.js**: Un framework web minimaliste pour Node.js.

---

## 🗂️ Structure du projet

```
my-project/
├── client/                 # Frontend React
│   ├── public/             # Assets publics (ex: favicon, images statiques)
│   ├── src/                # Code source React
│   │   ├── assets/         # Fichiers statiques et médias (ex: polices, icônes)
│   │   ├── img/            # Images spécifiques à l'application
│   │   ├── Map/            # Composants ou logiques liés à la carte du jeu
│   │   ├── middlewares/    # Middlewares spécifiques à Redux ou autre logique
│   │   ├── store/          # Configuration du store Redux (slices, actions, reducers)
│   │   ├── App.tsx         # Composant React principal (gestion du routing)
│   │   └── main.tsx        # Point d'entrée de l'application React
│   ├── package.json        # Dépendances du client
│   └── vite.config.ts      # Configuration de Vite (pour le bundling et le développement)
│
├── server/                 # Backend Node.js / Express
│   ├── src/                # Code source du serveur
│   │   ├── dist/           # Fichiers transpilés (si TypeScript est utilisé)
│   │   ├── routes/         # Définition des routes de l'API
│   │   └── index.ts        # Point d'entrée principal du serveur (gestion des connexions Socket.IO, Express)
│   ├── package.json        # Dépendances du serveur
│   └── ...                 # Autres fichiers liés au serveur (ex: fichiers de configuration, utilitaires)
└── README.md               # Le fichier README du projet
```