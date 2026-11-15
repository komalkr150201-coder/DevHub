import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seed.js';

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  await seedDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) server.close();
  await closeDB();
});

test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');
});

test('POST /api/match returns Section 11.3 ranked results', async () => {
  const reqBody = {
    required: [
      { name: 'React', importance: 3 },
      { name: 'Node.js', importance: 2 },
      { name: 'MongoDB', importance: 2 },
    ],
    niceToHave: ['TypeScript'],
    limit: 10,
    excludeSelf: false,
  };

  const res = await fetch(`${baseUrl}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.ok(data.results.length >= 2);

  const asha = data.results.find((r) => r.username === 'asha');
  const ravi = data.results.find((r) => r.username === 'ravi');

  assert.ok(asha, 'Asha should be in results');
  assert.ok(ravi, 'Ravi should be in results');
  assert.ok(asha.score > ravi.score, 'Asha should rank higher than Ravi');
  assert.deepStrictEqual(asha.missing, []);
  assert.deepStrictEqual(ravi.missing, ['MongoDB']);
});

test('GET /api/users/asha returns public profile data', async () => {
  const res = await fetch(`${baseUrl}/api/users/asha`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.user.username, 'asha');
  assert.ok(data.repos.length > 0);
  assert.ok(data.skills.length > 0);
});

test('GET /:username returns Open Graph HTML for SEO sharing', async () => {
  const res = await fetch(`${baseUrl}/asha`);
  const html = await res.text();
  assert.strictEqual(res.status, 200);
  assert.ok(html.includes('og:title'));
  assert.ok(html.includes('Asha Sharma'));
  assert.ok(html.includes('DevHub'));
});

test('POST /auth/demo-login logs in user and returns session', async () => {
  const res = await fetch(`${baseUrl}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'asha' }),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.strictEqual(data.user.username, 'asha');

  const cookie = res.headers.get('set-cookie');
  assert.ok(cookie && cookie.includes('token='), 'Should set HTTP-only token cookie');
});
