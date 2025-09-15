const mongoose = require("mongoose");
const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const port = 3000;
const Users = require('./model/userModel.js');
const mongoDBURL = 'mongodb+srv://username:password@cluster0.mongodb.net/userDB?retryWrites=true&w=majority';


app.use(express.json());
app.use(cors());

app.post('/inscription', async (req, res) => {
  try {
    if (
      !req.body.username || !req.body.password || !req.body.numero
    )
     {
      return res.status(400).send({
        message: 'envoyez tout les champs requis'
      })
     }

    const { username, password, numero } = req.body;
    bcrypt.hash(password, 10).then(hash => {
      Users.create({username, password: hash, numero}).then(user => res.json(user))
    })
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })

  }

});

app.post('/connexion', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await Users.findOne({username: username});
      if(!user) {
        return res.status(404).json('L\'utilisateur n\'existe pas');
      }
      
      bcrypt.compare(password, user.password, (error, response) => {
        if(error) {
          return res.status(500).json('Erreur lors de la vérification du mot de passe');
        }
        if(response) {
          return res.status(200).json('Connexion réussie');
        } else {
          return res.status(401).json('Mot de passe erroné');
        }
      });
    } catch(error) {
      console.log(error.message);
      res.status(500).send({ message: error.message });
    }
});

app.get('/utilisateur/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json(user);  
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
});

app.delete('/utilisateur/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Users.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
});

app.put('/utilisateur/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, numero } = req.body;
    
    // Vérifier si les champs requis sont présents
    if (!username || !numero) {
      return res.status(400).json({ message: 'Les champs username et numero sont requis' });
    }
    
    const updatedUser = await Users.findByIdAndUpdate(
      id, 
      { username, numero },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json(updatedUser);
  } catch(error) {
    console.log(error.message);
    res.status(500).send({ 
      message: error.message 
    })
  }
})


mongoose.connect(mongoDBURL).then(() => {
  console.log("App connected to database")
  app.listen(port, () => {
    console.log(`Application exemple à l'écoute sur le port ${port}!`);
    });
}).catch((error) => {
    console.log(error);
})
