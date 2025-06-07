# 🎮 Chat Game: Proximity Video Call

Ce projet est un jeu de chat en temps réel construit avec **React** pour le côté client et **Node.js** pour le côté serveur. Il offre la possibilité d'initier un appel vidéo entre deux personnages lorsqu'ils se trouvent à proximité dans l'environnement du jeu.

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
git clone https://github.com/IlyassBarkouk/chatgame.git
cd chatgame/Projet/Projetfin
```

### 2. Installer les dépendances

```bash
cd Server
npm install
cd ..
cd Client
npm install
cd ..
```

---

## ▶️ Lancer le projet en développement

1.  **Lancer le serveur**

    Dans un terminal :

    ```bash
    cd server
    npm start
    ```

2.  **Lancer le client**

    Dans un *autre* terminal :
    
    ```bash
    cd client
    npm run dev
    ```

    
**NB : L’application ne fonctionnera pas tant que les étapes suivantes ne sont pas réalisées :**
    ![test](https://github.com/user-attachments/assets/51193a4e-2774-470f-a1a3-28a9ecf783ad)
    
    Ouvrir le fichier src/Map/character.tsx.
    Remplacer l’@host dans la variable :
    const SOCKET_SERVER_URL = "http://<adresse_host>:3001";
    Arrêter le client, puis le relancer.

---

**NB : Une fois les applications lancées, vous pouvez effectuer les actions suivantes :**

Pour que le navigateur Firefox accepte d’ouvrir la caméra ou le micro sur une URL externe, vous pouvez définir certaines valeurs sur true dans les paramètres **about:config**, comme illustré sur cette image.

![send](https://github.com/user-attachments/assets/ac85e25b-e6f9-48a9-80a1-fea293083277)

![send1](https://github.com/user-attachments/assets/f7210013-2f43-4ec5-986d-d7175646e163)

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
