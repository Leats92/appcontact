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

async function registerAndLogin(app) {
  await request(app).post('/auth/register').send({
    email: 'c1@example.com',
    password: 'Passw0rd!',
    phone: '0612345678',
    firstName: 'Alice',
    lastName: 'Smith'
  });
  const login = await request(app)
    .post('/auth/login')
    .send({ email: 'c1@example.com', password: 'Passw0rd!' });
  return login.body.token;
}

describe('Contacts CRUD', () => {
  let token;
  beforeAll(async () => {
    token = await registerAndLogin(app);
  });

  test('create -> list -> patch -> delete', async () => {

    const c = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Marie', lastName: 'Durand', phone: '0712345678' });
    expect(c.status).toBe(201);
    const created = c.body;
    expect(created.firstName).toBe('Marie');

    
    const list = await request(app)
      .get('/contacts')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);

   
    const id = created._id || created.id;
    const patch = await request(app)
      .patch(`/contacts/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '0799999999' });
    expect(patch.status).toBe(200);
    expect(patch.body.phone).toBe('0799999999');


    const del = await request(app)
      .delete(`/contacts/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });
});
