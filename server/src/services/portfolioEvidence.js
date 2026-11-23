import { Octokit } from '@octokit/rest';
import { Repo } from '../models/Repo.js';
import { Skill } from '../models/Skill.js';
import { User } from '../models/User.js';
import { decryptToken } from '../config/github.js';

const README_LIMIT = 4000;

const octokitFor = async (userId) => {
  const u = await User.findById(userId).select('+accessToken');
  const token = u?.accessToken ? decryptToken(u.accessToken) : null;
  return new Octokit(token ? { auth: token } : {});
};

const fetchReadme = async (octokit, owner, repo) => {
  try {
    const r = await octokit.repos.getReadme({ owner, repo, mediaType: { format: 'raw' } });
    return String(r.data || '').slice(0, README_LIMIT);
  } catch (err) {
    // Non-fatal: do not throw on 404, 403, 429, or network errors.
    // Missing README or rate limit should never break portfolio generation.
    return '';
  }
};

/**
 * Builds the ONLY data the AI may use. Selected repos must belong to the user.
 * @param {Document} user
 * @param {string[]} repoIds  Mongo _ids of Repo docs
 * @param {object} extra user-provided info (skills, education, experience)
 */
export const buildEvidence = async (user, repoIds, extra = {}) => {
  const repos = await Repo.find({ _id: { $in: repoIds }, userId: user._id }); // ownership enforced here
  if (repos.length === 0) {
    const e = new Error('No valid repositories selected.');
    e.status = 400;
    throw e;
  }
  const octokit = await octokitFor(user._id);
  const withReadme = [];
  for (const r of repos) {
    let owner = user.username;
    if (r.url) {
      try {
        const parts = new URL(r.url).pathname.split('/').filter(Boolean);
        if (parts.length >= 2) owner = parts[0];
      } catch {}
    }
    const langs = (r.languages || []).map((l) => (typeof l === 'string' ? l : l?.name || '')).filter(Boolean);
    withReadme.push({
      name: r.name,
      description: r.description || '',
      url: r.url,
      stars: r.stars || 0,
      topics: r.topics || [],
      frameworks: r.frameworks || [],
      languages: langs,
      readme: await fetchReadme(octokit, owner, r.name),
    });
  }
  const skillDoc = await Skill.findOne({ userId: user._id });
  const detected = (skillDoc?.skills || []).map((s) => s.name || s);
  const userSkills = (extra.skills || []).map(String);
  const knownSkills = [
    ...new Set([
      ...detected,
      ...userSkills,
      ...withReadme.flatMap((r) => [...(r.languages || []), ...(r.topics || []), ...(r.frameworks || [])]),
    ]),
  ].filter(Boolean);
  return {
    github: { username: user.username, name: user.name, bio: user.bio, publicRepos: user.stats?.totalRepos },
    repos: withReadme,
    knownSkills,
    userProvided: { education: extra.education || [], experience: extra.experience || [], skills: userSkills },
  };
};
