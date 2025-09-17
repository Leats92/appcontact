const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.MONGO_DB_NAME = 'jestdb';
  process.env.JWT_SECRET = 'test_secret_key';
  jest.resetModules();
  app = require('../user');
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  try { await mongoose.connection.close(); } catch {}
  if (mongoServer) await mongoServer.stop();
});

describe('Auth flows', () => {

  test('register -> 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: 'Passw0rd!',
        phone: '0123456789',
        firstName: 'John',
        lastName: 'Doe',
      });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('user1@example.com');
  });

  test('duplicate email -> 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: 'Another!',
        phone: '0123456789',
      });
    expect(res.status).toBe(400);
  });

  test('login -> 200 + token, profile -> 200', async () => {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Passw0rd!' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const profile = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe('user1@example.com');
  });
});
