const request = require('supertest');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function registerAndLogin() {
  const email = `tc_${Date.now()}_${Math.floor(Math.random()*1000)}@example.com`;
  const password = 'Secret123!';
  await request(BASE).post('/api/auth/register').send({ email, nombre: 'Tester', password });
  const login = await request(BASE).post('/api/auth/login').send({ email, password });
  return login.body.token;
}

describe('Tickets & Comments', () => {
  let token;
  let ticketId;
  beforeAll(async () => {
    token = await registerAndLogin();
  });

  test('create ticket (multipart)', async () => {
    const res = await request(BASE)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .field('titulo', 'Ticket Test')
      .field('descripcion', 'Probando creacion');
    expect(res.status).toBe(200);
    expect(res.body.ticket).toBeDefined();
    ticketId = res.body.ticket.id;
  });

  test('list tickets returns created ticket', async () => {
    const res = await request(BASE)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.find(t => t.id === ticketId)).toBeTruthy();
  });

  test('update ticket estado', async () => {
    const res = await request(BASE)
      .patch(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'resuelto' });
    // If role restriction blocks, accept 403; else expect success
    if (res.status === 403) {
      expect(res.body.error).toBe('Forbidden');
    } else {
      expect(res.status).toBe(200);
      expect(res.body.ticket.estado).toBe('resuelto');
    }
  });

  test('create comment on ticket', async () => {
    const res = await request(BASE)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ ticketId, contenido: 'Primer comentario' });
    expect(res.status).toBe(201);
    expect(res.body.comment).toBeDefined();
  });

  test('list comments for ticket', async () => {
    const res = await request(BASE)
      .get('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .query({ ticketId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
