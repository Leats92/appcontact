require('dotenv').config();
if (!process.env.MONGO_URI && !process.env.JWT_SECRET) {
  try {
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
  } catch {}
}
const express = require('express');
const app = express();
const cors = require('cors');
const { setupSwagger } = require('./swagger');
const path = require('path');
const mongoose = require('mongoose');
const userController = require('./controller/userController');
const contactController = require('./controller/contactController');
const port = process.env.PORT || 3000;


process.on('unhandledRejection', (reason) => {
  console.error('UnhandledRejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('UncaughtException:', err?.message || err);
});


setupSwagger(app);

app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'fullstackjs';
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, { dbName: MONGO_DB_NAME })
    .then(() => console.log(`Connecté à MongoDB (db: ${MONGO_DB_NAME})`))
    .catch(err => console.error('Erreur connexion MongoDB:', err.message));
} else {
  console.log('MONGO_URI non défini: API fonctionnelle, contacts non persistés.');
}

if (!process.env.JWT_SECRET) {
  console.warn('Attention: JWT_SECRET non défini. Utilisation d\'une valeur par défaut (dev).');
}

app.post('/auth/register', userController.register);
app.post('/auth/login', userController.login);
app.get('/auth/profile', userController.requireAuth, userController.getProfile);

app.get('/health/db', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIdx = mongoose.connection.readyState;
  const state = states[stateIdx] || 'unknown';
  const conn = mongoose.connection;
  const info = {
    connected: state === 'connected',
    state,
    dbName: conn?.name || process.env.MONGO_DB_NAME || null,
    host: (conn && conn.host) || null,
  };
  res.status(200).json(info);
});

app.get('/utilisateur/:id', userController.requireAuth, userController.getUserById);
app.delete('/utilisateur/:id', userController.requireAuth, userController.deleteUser);
app.put('/utilisateur/:id', userController.requireAuth, userController.updateUser);


app.post('/contacts', userController.requireAuth, contactController.createContact);
app.get('/contacts', userController.requireAuth, contactController.listContacts);
app.patch('/contacts/:id', userController.requireAuth, contactController.updateContact);
app.delete('/contacts/:id', userController.requireAuth, contactController.deleteContact);


// Servez le build du front: tente server/public d'abord (Render), sinon client/dist (dev)
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, '../client/dist');
const staticRoot = fs.existsSync(publicDir) ? publicDir : distDir;
console.log('Static hosting root:', staticRoot);
console.log('Exists publicDir?', fs.existsSync(publicDir));
console.log('Exists distDir?', fs.existsSync(distDir));
if (!fs.existsSync(staticRoot)) {
  console.warn('Aucun build front trouvé. Placez le build dans server/public ou client/dist.');
}
app.use(express.static(staticRoot, { index: false }));


app.get(/^(?!\/auth|\/connexion|\/utilisateur|\/contacts|\/api-docs).*/, (req, res) => {
  const indexPath = path.join(staticRoot, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send('Frontend non construit: veuillez builder le client.');
});

/**
 * @openapi
 * /contacts/{id}:
 *   patch:
 *     tags: [Contacts]
 *     summary: Mettre à jour partiellement un contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactUpdate'
 *     responses:
 *       200:
 *         description: Contact mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Contacts]
 *     summary: Supprimer un contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du contact
 *     responses:
 *       200:
 *         description: Suppression réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Contact non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Application exemple à l'écoute sur le port ${port}!`);
    console.log('Routes d\'authentification disponibles:');
    console.log('- POST /auth/register - Inscription');
    console.log('- POST /auth/login - Connexion');
    console.log('- GET /auth/profile - Profil utilisateur (protégé)');
    console.log('Routes contacts disponibles (protégées):');
    console.log('- POST /contacts - Créer un contact');
    console.log('- GET /contacts - Lister les contacts');
    console.log('- PATCH /contacts/:id - Mettre à jour un contact (partiel)');
    console.log('- DELETE /contacts/:id - Supprimer un contact');
  });
}

module.exports = app;
