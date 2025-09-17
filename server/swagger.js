const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API d\'authentification',
      version: '1.0.0',
      description: 'Documentation des routes d\'authentification',
      contact: {
        name: 'Projet FullStack JS'
      },
      servers: [{
        url: 'http://localhost:3000'
      }]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: [
            'email',
            'password',
            'phone'
          ],
          properties: {
            id: {
              type: 'integer',
              description: 'ID auto-généré de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Mot de passe haché de l\'utilisateur'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone, uniquement chiffres',
              minLength: 10,
              pattern: '^\\d+$'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            }
          },
          example: {
            id: 1,
            email: 'user@example.com',
            password: '$2b$10$X/XZ7OcjV.QHC0Xd9hJQa.1XOa0PtV1Nw0o5XkxLfCb8jNOZqOBMi',
            phone: '+33123456789',
            firstName: 'Alex',
            lastName: 'Martin',
            createdAt: '2023-11-15T12:00:00.000Z'
          }
        },
        Contact: {
          type: 'object',
          required: [
            'firstName',
            'lastName',
            'phone'
          ],
          properties: {
            _id: {
              type: 'string',
              description: "ID MongoDB du contact"
            },
            firstName: {
              type: 'string',
              description: "Prénom du contact"
            },
            lastName: {
              type: 'string',
              description: "Nom de famille du contact"
            },
            phone: {
              type: 'string',
              description: "Numéro de téléphone, uniquement chiffres",
              minLength: 10,
              pattern: '^\\d+$'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du contact'
            }
          },
          example: {
            _id: '6503b6a5a2f3a4c9c8e5d123',
            firstName: 'Marie',
            lastName: 'Durand',
            phone: '+33601020304',
            createdAt: '2023-11-15T12:00:00.000Z'
          }
        },
        ContactCreate: {
          type: 'object',
          required: [ 'firstName', 'lastName', 'phone' ],
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' }
          },
          example: {
            firstName: 'Marie',
            lastName: 'Durand',
            phone: '+33601020304'
          }
        },
        ContactUpdate: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' }
          },
          example: {
            firstName: 'Marie'
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Connexion réussie'
            },
            token: {
              type: 'string',
              description: 'Token JWT à utiliser pour les requêtes authentifiées'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  example: 1
                },
                email: {
                  type: 'string',
                  example: 'user@example.com'
                },
                phone: {
                  type: 'string',
                  example: '+33123456789'
                },
                firstName: {
                  type: 'string',
                  example: 'Alex'
                },
                lastName: {
                  type: 'string',
                  example: 'Martin'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erreur lors de l\'opération'
            }
          }
        }
      }
    }
  },
  apis: ['./user.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);


const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log('Documentation Swagger disponible à l\'URL: http://localhost:3000/api-docs');
};

module.exports = { setupSwagger };
