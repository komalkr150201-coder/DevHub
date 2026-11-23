import { normalizeSkillName } from './skillExtractor.js';

export { normalizeSkillName };

/**
 * Matching Service
 *
 * Implements Section 11.2 & 11.3 of the DevHub specification:
 * Coverage(d) = SUM over required r of ( imp(r) * weight_d(r) ) / SUM of imp(r)
 * Cosine(d)   = cosine similarity between candidate skill vector and requirement vector
 * Bonus(d)    = (matched_nice_to_have / total_nice_to_have) * 0.1
 * Activity(d) = normalised recent commit activity (last 90 days, 0.0 to 1.0)
 *
 * Score(d) = 100 * ( 0.60 * Coverage + 0.20 * Cosine + 0.10 * Activity ) + 100 * 0.10 * Bonus
 */

/**
 * Compute cosine similarity between two vectors represented as key-value objects
 */
export const computeCosineSimilarity = (vecA, vecB, allKeys) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of allKeys) {
    const valA = vecA[key] || 0;
    const valB = vecB[key] || 0;

    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Score a single candidate against a skill requirement
 * @param {Object} candidate - { user, skills }
 * @param {Array} required - [{ name: 'React', importance: 3 }, ...]
 * @param {Array} niceToHave - ['TypeScript', 'Docker', ...]
 * @returns {Object} { score, coverage, cosine, bonus, activity, matched, missing }
 */
export const scoreCandidate = (candidate, required = [], niceToHave = []) => {
  const candidateSkillsMap = new Map();
  for (const item of candidate.skills || []) {
    candidateSkillsMap.set(normalizeSkillName(item.name).toLowerCase(), item.weight);
  }

  // 1. Calculate Coverage and partition matched / missing
  let totalImp = 0;
  let weightedSkillSum = 0;
  const matched = [];
  const missing = [];

  const reqVector = {};
  const candVector = {};
  const allVectorKeys = new Set();

  for (const req of required) {
    const normName = normalizeSkillName(req.name);
    const key = normName.toLowerCase();
    const imp = Number(req.importance) || 1;
    totalImp += imp;

    const candWeight = candidateSkillsMap.get(key) || 0;
    weightedSkillSum += imp * candWeight;

    reqVector[key] = imp;
    candVector[key] = candWeight;
    allVectorKeys.add(key);

    if (candWeight > 0.15) {
      matched.push(normName);
    } else {
      missing.push(normName);
    }
  }

  const coverage = totalImp > 0 ? weightedSkillSum / totalImp : 0;

  // 2. Cosine similarity over required skills space
  const cosine = computeCosineSimilarity(candVector, reqVector, allVectorKeys);

  // 3. Nice to have bonus
  let bonus = 0;
  const matchedNiceToHave = [];
  if (niceToHave && niceToHave.length > 0) {
    let count = 0;
    for (const nth of niceToHave) {
      const normNth = normalizeSkillName(nth);
      const key = normNth.toLowerCase();
      const weight = candidateSkillsMap.get(key) || 0;
      if (weight > 0.15) {
        count++;
        matchedNiceToHave.push(normNth);
      }
    }
    bonus = (count / niceToHave.length) * 0.1;
  }

  // 4. Activity score (normalized based on recent commits or streak)
  // Max scale assumed around 100 recent commits or 30-day streak
  const recentCommits = candidate.user?.stats?.recentCommits || 0;
  const streak = candidate.user?.stats?.contributionStreak || 0;
  const activityMetric = Math.max(recentCommits / 100, streak / 30);
  const activity = Math.min(1.0, Math.max(0.1, activityMetric));

  // 5. Final weighted score
  // Score = 100 * (0.60 * Coverage + 0.20 * Cosine + 0.10 * Activity) + 100 * 0.10 * Bonus
  const rawScore = 100 * (0.60 * coverage + 0.20 * cosine + 0.10 * activity) + (100 * bonus);
  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score: finalScore,
    coverage: Math.round(coverage * 100) / 100,
    cosine: Math.round(cosine * 100) / 100,
    bonus: Math.round(bonus * 100) / 100,
    activity: Math.round(activity * 100) / 100,
    matched,
    missing,
    matchedNiceToHave,
  };
};

/**
 * Rank an array of candidate developers against requirements
 */
export const rankCandidates = (candidates = [], required = [], niceToHave = [], limit = 20) => {
  const scored = candidates.map((cand) => {
    const scoreDetails = scoreCandidate(cand, required, niceToHave);
    return {
      user: cand.user,
      skills: cand.skills,
      ...scoreDetails,
    };
  });

  // Filter out developers with 0 score (no relevance whatsoever)
  const filtered = scored.filter((item) => item.score > 0);

  // Sort descending by score
  filtered.sort((a, b) => b.score - a.score);

  return filtered.slice(0, limit);
};

/**
 * Complementary matching for team formation (Section 11.4)
 * Calculates the skill gap between target team requirements and the current user's profile
 */
export const calculateTeamGap = (targetSkills = [], userSkills = []) => {
  const userMap = new Map();
  for (const s of userSkills) {
    userMap.set(normalizeSkillName(s.name).toLowerCase(), s.weight || 0);
  }

  // Identify where user is weak (< 0.4) or missing (0.0)
  const gapSkills = [];
  for (const req of targetSkills) {
    const key = normalizeSkillName(req.name).toLowerCase();
    const userWeight = userMap.get(key) || 0;
    if (userWeight < 0.4) {
      gapSkills.push({
        name: req.name,
        importance: Math.min(5, (req.importance || 3) + (userWeight === 0 ? 1 : 0)),
      });
    }
  }

  return gapSkills;
};
