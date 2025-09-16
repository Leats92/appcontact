require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { setupSwagger } = require('./swagger');
const path = require('path');
const mongoose = require('mongoose');
const userController = require('./controller/userController');
const contactController = require('./controller/contactController');
const port = 3000;


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
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur connexion MongoDB:', err.message));
} else {
  console.log('MONGO_URI non défini: API fonctionnelle, contacts non persistés.');
}

app.post('/auth/register', userController.register);
app.post('/auth/login', userController.login);
app.get('/auth/profile', userController.requireAuth, userController.getProfile);

app.post('/connexion', userController.connexion);

app.get('/utilisateur/:id', userController.requireAuth, userController.getUserById);
app.delete('/utilisateur/:id', userController.requireAuth, userController.deleteUser);
app.put('/utilisateur/:id', userController.requireAuth, userController.updateUser);

/**
 * @openapi
 * /contacts:
 *   get:
 *     tags: [Contacts]
 *     summary: Lister les contacts de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Non autorisé
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
 *   post:
 *     tags: [Contacts]
 *     summary: Créer un contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactCreate'
 *     responses:
 *       201:
 *         description: Contact créé
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
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

app.post('/contacts', userController.requireAuth, contactController.createContact);
app.get('/contacts', userController.requireAuth, contactController.listContacts);
app.patch('/contacts/:id', userController.requireAuth, contactController.updateContact);
app.delete('/contacts/:id', userController.requireAuth, contactController.deleteContact);


const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));


app.get(/^(?!\/auth|\/connexion|\/utilisateur|\/contacts|\/api-docs).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
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
