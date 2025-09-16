const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';


let users = [];
let nextId = 1;


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
    

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    bcrypt.hash(password, 10).then(hash => {
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
      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword
      });
    })
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
    

    const user = users.find(user => user.email === email);
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
        { id: user.id, email: user.email },
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
    const user = users.find(user => user.email === email);
    if(!user) {
      return res.status(404).json({ message: 'L\'utilisateur n\'existe pas' });
    }
    
    bcrypt.compare(password, user.password, (error, response) => {
      if(error) {
        return res.status(500).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }
      if(response) {

        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
        );
        
        return res.status(200).json({
          message: 'Connexion réussie',
          token,
          user: {
            id: user.id,
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
    const userId = parseInt(id);

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez accéder qu\'à vos propres informations.' });
    }

    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

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
    const userId = parseInt(id);

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez supprimer que votre propre compte.' });
    }

    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    users.splice(userIndex, 1);
    return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
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
    const userId = parseInt(id);
    const { email, phone, firstName, lastName } = req.body;
    
 
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé. Vous ne pouvez mettre à jour que votre propre compte.' });
    }
    
    if (!email || !phone) {
      return res.status(400).json({ message: 'Les champs email et phone sont requis' });
    }
    
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    

    const emailExists = users.some(user => user.email === email && user.id !== userId);
    if (emailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    

    users[userIndex] = {
      ...users[userIndex],
      email,
      phone,
      firstName: firstName ?? users[userIndex].firstName,
      lastName: lastName ?? users[userIndex].lastName,
    };
    
   
    const { password, ...userWithoutPassword } = users[userIndex];
    return res.status(200).json(userWithoutPassword);
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

  
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
