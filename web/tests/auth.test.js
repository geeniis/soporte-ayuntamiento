const request = require('supertest');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

function uniqueEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random()*1000)}@example.com`;
}

describe('Auth flow', () => {
  let email;
  let password = 'Secret123!';
  test('register new user', async () => {
    email = uniqueEmail();
    const res = await request(BASE)
      .post('/api/auth/register')
      .send({ email, nombre: 'Test User', password });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
  });

  test('login returns token', async () => {
    const res = await request(BASE)
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
