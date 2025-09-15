# Application de Gestion de Contacts

Une application fullstack JavaScript pour gérer les contacts des utilisateurs.

## Structure du Projet

- **Client** : Application frontend React/Vite
- **Serveur** : API backend Express.js avec MongoDB

## Fonctionnalités

- Inscription et connexion des utilisateurs
- Gestion du profil utilisateur (affichage, mise à jour, suppression)
- Interface utilisateur réactive

## Technologies Utilisées

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Bcrypt pour le hachage des mots de passe

## Installation

### Prérequis
- Node.js
- MongoDB (local ou Atlas)

### Étapes d'installation

1. Cloner le dépôt
   ```
   git clone https://github.com/Leats92/appcontact.git
   cd appcontact
   ```

2. Installer les dépendances du serveur
   ```
   cd server
   npm install
   ```

3. Installer les dépendances du client
   ```
   cd ../client
   npm install
   ```

4. Configurer la base de données
   - Modifier l'URL de connexion MongoDB dans `server/user.js`

5. Démarrer le serveur
   ```
   cd ../server
   npm start
   ```

6. Démarrer le client
   ```
   cd ../client
   npm run dev
   ```

## Auteur

- Leats92