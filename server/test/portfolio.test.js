import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/seed.js';
import { User } from '../src/models/User.js';
import { Repo } from '../src/models/Repo.js';

let server;
let baseUrl;
let authCookie;
let userRepos;

test.before(async () => {
  await connectDB();
  const existingAsha = await User.findOne({ username: 'asha' });
  if (!existingAsha) {
    await seedDatabase();
  }

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  // Login as demo user 'asha'
  const loginRes = await fetch(`${baseUrl}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'asha' }),
  });
  const loginData = await loginRes.json();
  assert.ok(loginData.success, 'Login should succeed');
  authCookie = loginRes.headers.get('set-cookie');
  assert.ok(authCookie, 'Should have auth cookie');

  const user = await User.findOne({ username: 'asha' });
  userRepos = await Repo.find({ userId: user._id });
  assert.ok(userRepos.length > 0, 'User should have repos');
});

test.after(async () => {
  if (server) {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    server.close();
  }
  await closeDB();
});

test('1. GET /api/portfolio initializes a default draft portfolio', async () => {
  const res = await fetch(`${baseUrl}/api/portfolio`, {
    headers: { Cookie: authCookie },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.ok(data.portfolio);
  assert.strictEqual(data.portfolio.status, 'draft');
  assert.strictEqual(data.portfolio.profile.name, 'Asha Sharma');
});

test('2. POST /api/portfolio/generate creates an AI portfolio from repos', async () => {
  const repoIds = userRepos.map((r) => r._id.toString());
  const res = await fetch(`${baseUrl}/api/portfolio/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify({
      repoIds,
      template: 'aurora',
      userInfo: {
        skills: ['GraphQL', 'Docker'],
        education: [{ school: 'MIT', degree: 'BS CS', period: '2018 - 2022' }],
        experience: [{ company: 'Stripe', role: 'Full Stack Engineer', period: '2022 - Present', summary: 'Building payment APIs.' }],
      },
    }),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(data)}`);
  assert.ok(data.success);
  assert.ok(data.portfolio.profile.headline);
  assert.ok(data.portfolio.profile.bio);
  assert.ok(data.portfolio.skills.length > 0);
  assert.ok(data.portfolio.projects.length > 0);
  assert.strictEqual(data.portfolio.template, 'aurora');
  assert.strictEqual(data.portfolio.education.length, 1);
  assert.strictEqual(data.portfolio.experience.length, 1);
});

test('3. POST /api/portfolio/preview renders live preview HTML', async () => {
  const res = await fetch(`${baseUrl}/api/portfolio/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify({
      template: 'terminal',
      profile: { name: 'Asha Preview', headline: 'Staff Engineer' },
    }),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.ok(data.html.includes('Asha Preview'));
  assert.ok(data.html.includes('Staff Engineer'));
  assert.ok(data.html.includes('<style>'));
});

test('4. POST /api/portfolio/regenerate headline updates only headline', async () => {
  const res = await fetch(`${baseUrl}/api/portfolio/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify({
      section: 'headline',
      instruction: 'Make it punchy and modern',
    }),
  });

  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.ok(data.portfolio.profile.headline);
});

test('5. GET /api/portfolio/slug-check checks slug availability', async () => {
  const res = await fetch(`${baseUrl}/api/portfolio/slug-check?slug=asha-portfolio`, {
    headers: { Cookie: authCookie },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(data.success);
  assert.strictEqual(data.slug, 'asha-portfolio');
  assert.strictEqual(data.available, true);
});

test('6. POST /api/portfolio/publish publishes portfolio and serves public page at /u/:slug', async () => {
  const pubRes = await fetch(`${baseUrl}/api/portfolio/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify({ slug: 'asha-rocks' }),
  });

  const pubData = await pubRes.json();
  assert.strictEqual(pubRes.status, 200);
  assert.ok(pubData.success);
  assert.strictEqual(pubData.portfolio.status, 'published');
  assert.strictEqual(pubData.portfolio.slug, 'asha-rocks');

  // Verify public endpoint serves rendered HTML
  const pageRes = await fetch(`${baseUrl}/u/asha-rocks`);
  assert.strictEqual(pageRes.status, 200);
  const pageHtml = await pageRes.text();
  assert.ok(pageHtml.includes('<!DOCTYPE html>'));
  assert.ok(pageHtml.includes('Asha Sharma'));
});

test('7. GET /api/portfolio/export returns valid ZIP archive', async () => {
  const res = await fetch(`${baseUrl}/api/portfolio/export`, {
    headers: { Cookie: authCookie },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('content-type'), 'application/zip');
  const buffer = await res.arrayBuffer();
  assert.ok(buffer.byteLength > 200, 'Zip file should contain bytes');
  // Check PK zip magic header (0x50, 0x4B, 0x03, 0x04)
  const view = new Uint8Array(buffer);
  assert.strictEqual(view[0], 0x50);
  assert.strictEqual(view[1], 0x4b);
});
