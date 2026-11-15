/**
 * Skill Extraction Service
 *
 * Implements Section 11.1 of the DevHub specification:
 * raw(k) = SUM over repos r of [ usage(k, r) * recency(r) * (1 + log(1 + stars(r))) ]
 *
 * usage(k, r):
 *   - For languages: (bytes of language in repo r) / (total bytes in repo r)
 *   - For frameworks/topics: 1.0 if present in repo r
 *
 * recency(r):
 *   - 1.0 if pushed in last 6 months
 *   - 0.7 if within 1 year
 *   - 0.4 otherwise
 *
 * weight(k) = raw(k) / max_over_all_skills(raw)  (normalised to 0.0 - 1.0)
 *
 * Manually confirmed skills receive a boost (e.g. +10%, capped at 1.0)
 * Manually added skills with no code evidence are flagged as 'manual' (self-declared)
 * and have a capped baseline weight (e.g. 0.4 - 0.5).
 */

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Common skill aliases and standardizations
 */
export const normalizeSkillName = (name) => {
  if (!name) return '';
  const lower = name.trim().toLowerCase();
  const aliasMap = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'py': 'Python',
    'python': 'Python',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'react': 'React',
    'reactjs': 'React',
    'react.js': 'React',
    'react native': 'React Native',
    'react-native': 'React Native',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'vue.js': 'Vue.js',
    'next': 'Next.js',
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'angular': 'Angular',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'express.js': 'Express.js',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'docker': 'Docker',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'graphql': 'GraphQL',
    'fastapi': 'FastAPI',
    'flask': 'Flask',
    'django': 'Django',
    'spring': 'Spring Boot',
    'springboot': 'Spring Boot',
    'spring-boot': 'Spring Boot',
    'pytorch': 'PyTorch',
    'tensorflow': 'TensorFlow',
    'tf': 'TensorFlow',
    'golang': 'Go',
    'go': 'Go',
    'rust': 'Rust',
    'cpp': 'C++',
    'c++': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'aws': 'AWS',
    'redis': 'Redis',
  };

  return aliasMap[lower] || (name.charAt(0).toUpperCase() + name.slice(1));
};

/**
 * Calculate recency multiplier based on last push date
 */
export const getRecencyMultiplier = (pushedAt) => {
  if (!pushedAt) return 0.4;
  const pushTime = new Date(pushedAt).getTime();
  const now = Date.now();
  const diff = now - pushTime;

  if (diff <= SIX_MONTHS_MS) {
    return 1.0;
  } else if (diff <= ONE_YEAR_MS) {
    return 0.7;
  }
  return 0.4;
};

/**
 * Extract weighted skills from an array of repository objects
 * @param {Array} repos - list of Repo documents/objects
 * @param {Array} existingSkills - existing skill objects (for manual preservation/boosts)
 * @returns {Array} normalized skill objects [{ name, weight, source }]
 */
export const extractSkillsFromRepos = (repos = [], existingSkills = []) => {
  const rawScores = new Map(); // skillName -> totalRawScore
  const skillSources = new Map(); // skillName -> 'auto' | 'manual'

  for (const repo of repos) {
    if (repo.isHidden) continue;

    const recency = getRecencyMultiplier(repo.pushedAt);
    const starMultiplier = 1 + Math.log(1 + (repo.stars || 0));

    // 1. Languages
    const totalBytes = (repo.languages || []).reduce((acc, l) => acc + (l.bytes || 0), 0);
    for (const lang of repo.languages || []) {
      if (!lang.name || !lang.bytes) continue;
      const normName = normalizeSkillName(lang.name);
      const usage = totalBytes > 0 ? lang.bytes / totalBytes : 0.5;
      const repoScore = usage * recency * starMultiplier;

      const current = rawScores.get(normName) || 0;
      rawScores.set(normName, current + repoScore);
      skillSources.set(normName, 'auto');
    }

    // 2. Topics
    for (const topic of repo.topics || []) {
      const normName = normalizeSkillName(topic);
      const usage = 1.0; // full usage indicator for topics
      const repoScore = usage * recency * starMultiplier * 0.8; // topic weight factor

      const current = rawScores.get(normName) || 0;
      rawScores.set(normName, current + repoScore);
      if (!skillSources.has(normName)) {
        skillSources.set(normName, 'auto');
      }
    }

    // 3. Frameworks
    for (const framework of repo.frameworks || []) {
      const normName = normalizeSkillName(framework);
      const usage = 1.0; // full usage indicator for framework presence
      const repoScore = usage * recency * starMultiplier * 0.9; // framework weight factor

      const current = rawScores.get(normName) || 0;
      rawScores.set(normName, current + repoScore);
      if (!skillSources.has(normName)) {
        skillSources.set(normName, 'auto');
      }
    }
  }

  // Find max raw score for normalization
  let maxRaw = 0;
  for (const score of rawScores.values()) {
    if (score > maxRaw) maxRaw = score;
  }

  const results = [];

  // Normalize raw scores into weights (0.0 to 1.0)
  for (const [name, raw] of rawScores.entries()) {
    let weight = maxRaw > 0 ? raw / maxRaw : 0;
    // Round to 2 decimal places
    weight = Math.min(1.0, Math.max(0.05, Math.round(weight * 100) / 100));

    // Check if user previously confirmed or manually adjusted this skill
    const existing = (existingSkills || []).find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    let source = skillSources.get(name) || 'auto';
    if (existing && existing.source === 'manual') {
      // Manually confirmed skill receives a boost (+10%)
      weight = Math.min(1.0, Math.round((weight + 0.10) * 100) / 100);
      source = 'manual';
    }

    results.push({
      name,
      weight,
      source,
    });
  }

  // Preserve existing purely manual skills (self-declared) that had no code evidence
  for (const existing of existingSkills || []) {
    const alreadyPresent = results.some(
      (r) => r.name.toLowerCase() === existing.name.toLowerCase()
    );
    if (!alreadyPresent) {
      results.push({
        name: normalizeSkillName(existing.name),
        weight: Math.min(0.5, existing.weight || 0.4), // self-declared baseline
        source: 'manual',
      });
    }
  }

  // Sort descending by weight
  results.sort((a, b) => b.weight - a.weight);

  return results;
};
