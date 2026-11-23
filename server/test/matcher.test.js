import test from 'node:test';
import assert from 'node:assert';
import { scoreCandidate, rankCandidates, computeCosineSimilarity } from '../src/services/matcher.js';
import { extractSkillsFromRepos, getRecencyMultiplier } from '../src/services/skillExtractor.js';

test('Recency Multiplier', () => {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const nineMonthsAgo = new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000);
  const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);

  assert.strictEqual(getRecencyMultiplier(threeMonthsAgo), 1.0);
  assert.strictEqual(getRecencyMultiplier(nineMonthsAgo), 0.7);
  assert.strictEqual(getRecencyMultiplier(twoYearsAgo), 0.4);
});

test('Worked Example Matching from Section 11.3', () => {
  const requirement = [
    { name: 'React', importance: 3 },
    { name: 'Node.js', importance: 2 },
    { name: 'MongoDB', importance: 2 },
  ];
  const niceToHave = ['TypeScript'];

  const asha = {
    user: { username: 'asha', stats: { recentCommits: 84, contributionStreak: 21 } },
    skills: [
      { name: 'React', weight: 0.95 },
      { name: 'Node.js', weight: 0.80 },
      { name: 'MongoDB', weight: 0.75 },
      { name: 'TypeScript', weight: 0.70 },
    ],
  };

  const ravi = {
    user: { username: 'ravi', stats: { recentCommits: 52, contributionStreak: 12 } },
    skills: [
      { name: 'React', weight: 0.90 },
      { name: 'Node.js', weight: 0.70 },
      { name: 'TypeScript', weight: 0.80 },
    ],
  };

  const ashaRes = scoreCandidate(asha, requirement, niceToHave);
  const raviRes = scoreCandidate(ravi, requirement, niceToHave);

  // Assert Coverage formulas match Section 11.3
  assert.strictEqual(ashaRes.coverage, 0.85);
  assert.strictEqual(raviRes.coverage, 0.59);

  // Assert Asha ranks higher than Ravi
  assert.ok(ashaRes.score > raviRes.score);
  assert.deepStrictEqual(ashaRes.missing, []);
  assert.deepStrictEqual(raviRes.missing, ['MongoDB']);
});

test('Skill Extractor correctly computes weights from repos', () => {
  const repos = [
    {
      name: 'mern-app',
      stars: 10,
      pushedAt: new Date(),
      languages: [
        { name: 'JavaScript', bytes: 80000 },
        { name: 'CSS', bytes: 20000 },
      ],
      topics: ['react', 'express'],
      frameworks: ['React', 'Express.js', 'MongoDB'],
    },
  ];

  const extracted = extractSkillsFromRepos(repos);
  assert.ok(extracted.length > 0);
  const jsSkill = extracted.find((s) => s.name === 'JavaScript');
  assert.ok(jsSkill);
  assert.ok(jsSkill.weight > 0 && jsSkill.weight <= 1.0);
});
