const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = require('../model/userModel');


const JWT_SECRET = process.env.JWT_SECRET || 'une_chaine_longue_aleatoire';

const isDatabaseMarche = () => mongoose.connection && mongoose.connection.readyState === 1;



const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }
    
    const token = authHeader.split(' ')[1];
    

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};

const register = async (req, res) => {
  try {
    if (
      !req.body.email || !req.body.password || !req.body.phone
    )
     {
      return res.status(400).send({
        message: 'Tous les champs sont requis (email, password, phone)'
      })
     }
    const { email, password, phone, firstName, lastName } = req.body;

    if (isDatabaseMarche()) {
      const existingUser = await Users.findOne({ email }).lean();
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      const hash = await bcrypt.hash(password, 10);
      const doc = await Users.create({
        email,
        password: hash,
        phone,
        firstName: firstName || '',
        lastName: lastName || '',
      });
      const { password: _, ...userWithoutPassword } = doc.toObject();
      return res.status(201).json({ message: 'Utilisateur créé avec succès', user: userWithoutPassword });
    } else {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      const hash = await bcrypt.hash(password, 10);
      const newUser = {
        id: nextId++,
        email,
        password: hash,
        phone,
        firstName: firstName || '',
        lastName: lastName || '',
        createdAt: new Date()
      };
      users.push(newUser);
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ message: 'Utilisateur créé avec succès', user: userWithoutPassword });
    }
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    let user;
    if (isDatabaseMarche()) {
      user = await Users.findOne({ email }).lean();
    } else {
      user = users.find(u => u.email === email);
    }
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
      
      const token = jwt.sign(
        { id: (user._id ? String(user._id) : user.id), email: user.email },
        JWT_SECRET,
      );
      

      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: userWithoutPassword
      });
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
const connexion = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    if (isDatabaseMarche()) {
      user = await Users.findOne({ email }).lean();
    } else {
      user = users.find(u => u.email === email);
    }
    if(!user) {
      return res.status(404).json({ message: 'L\'utilisateur n\'existe pas' });
    }
    
    bcrypt.compare(password, user.password, (error, response) => {
      if(error) {
        return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }
      if(response) {

        const token = jwt.sign(
          { id: (user._id ? String(user._id) : user.id), email: user.email },
          JWT_SECRET,
        );
        
        return res.status(200).json({
          message: 'Connexion réussie',
          token,
          user: {
            id: (user._id ? String(user._id) : user.id),
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      } else {
        return res.status(401).json({ message: 'Mot de passe erroné' });
      }
    });
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = String(req.user.id);
    if (requesterId !== String(id)) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez accéder qu\'à vos propres informations.' });
    }

    let user;
    if (isDatabaseMarche()) {
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
      user = await Users.findById(id).lean();
    } else {
      const userId = parseInt(id, 10);
      user = users.find(u => u.id === userId);
    }
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = String(req.user.id);
    if (requesterId !== String(id)) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez supprimer que votre propre compte.' });
    }
    if (isDatabaseMarche()) {
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
      const deleted = await Users.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } else {
      const userId = parseInt(id, 10);
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      users.splice(idx, 1);
      return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    }
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, firstName, lastName } = req.body;
    
    const requesterId = String(req.user.id);
    if (requesterId !== String(id)) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez mettre à jour que votre propre compte.' });
    }
    
    if (!email || !phone) {
      return res.status(400).json({ message: 'Les champs email et phone sont requis' });
    }
    if (isDatabaseMarche()) {
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID invalide' });
      const emailExists = await Users.findOne({ email, _id: { $ne: id } }).lean();
      if (emailExists) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      const updated = await Users.findByIdAndUpdate(
        id,
        { $set: { email, phone, firstName, lastName } },
        { new: true }
      ).lean();
      if (!updated) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      const { password, ...userWithoutPassword } = updated;
      return res.status(200).json(userWithoutPassword);
    } else {
      const userId = parseInt(id, 10);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      const emailExists = users.some(u => u.email === email && u.id !== userId);
      if (emailExists) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      users[userIndex] = {
        ...users[userIndex],
        email,
        phone,
        firstName: firstName ?? users[userIndex].firstName,
        lastName: lastName ?? users[userIndex].lastName,
      };
      const { password, ...userWithoutPassword } = users[userIndex];
      return res.status(200).json(userWithoutPassword);
    }
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
};

const getProfile = async (req, res) => {
  try {
    const requesterId = String(req.user.id);
    let user;
    if (isDatabaseMarche()) {
      if (!mongoose.isValidObjectId(requesterId)) return res.status(400).json({ message: 'ID invalide' });
      user = await Users.findById(requesterId).lean();
    } else {
      const userId = parseInt(requesterId, 10);
      user = users.find(u => u.id === userId);
    }
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch(error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requireAuth,
  register,
  login,
  connexion,
  getUserById,
  deleteUser,
  updateUser,
  getProfile
};
