import { Portfolio } from '../models/Portfolio.js';
import { User } from '../models/User.js';
import { Repo } from '../models/Repo.js';
import { config } from '../config/env.js';
import { buildEvidence } from '../services/portfolioEvidence.js';
import { generateWithGemini } from '../services/gemini.js';
import { renderHtml, renderCss, renderJs } from '../services/portfolioRenderer.js';
import { buildPortfolioZip } from '../services/zip.js';
import { sanitizePortfolioInput, normalizeSlug, validateSlug } from '../services/portfolioValidate.js';
import { extractGitHubBackground } from '../services/githubBackground.js';
import os from 'os';

const MAX_VERSIONS = 20;
const SNAP_FIELDS = ['template', 'theme', 'sections', 'profile', 'skills', 'projects', 'education', 'experience'];

export const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const snapshot = (p) => JSON.parse(JSON.stringify(Object.fromEntries(SNAP_FIELDS.map((k) => [k, p[k]]))));
const pushVersion = (p, reason) => {
  p.versions.push({ reason, snapshot: snapshot(p) });
  if (p.versions.length > MAX_VERSIONS) p.versions.splice(0, p.versions.length - MAX_VERSIONS);
};
export const publicBase = (req) => {
  if (config.publicBaseUrl) return config.publicBaseUrl;
  const host = req.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const localIp = getLocalIp();
    if (localIp && localIp !== '127.0.0.1') {
      return `${req.protocol}://${localIp}:5173`;
    }
  }
  return `${req.protocol}://${host}`;
};

export const getNetworkInfo = (req, res) => {
  const localIp = getLocalIp();
  res.json({
    success: true,
    localIp,
    publicBaseUrl: config.publicBaseUrl || '',
    networkUrl: localIp !== '127.0.0.1' ? `http://${localIp}:5173` : '',
  });
};
const view = (p, req) => {
  const o = p.toObject();
  delete o.versions;
  o.versionCount = p.versions.length;
  o.publicUrl = p.status === 'published' && p.slug ? `${publicBase(req)}/u/${p.slug}` : null;
  return o;
};
const fail = (res, err) => res.status(err.status || 400).json({ success: false, message: err.message });

const getOrCreate = async (user) => {
  let p = await Portfolio.findOne({ owner: user._id });
  const defaultEmail = user.email || '';
  const defaultGithub = user.links?.github || (user.username ? `https://github.com/${user.username}` : '');
  const defaultLinkedin = user.links?.linkedin || (user.username ? `https://www.linkedin.com/in/${user.username}` : '');

  if (!p) {
    p = await Portfolio.create({
      owner: user._id,
      profile: {
        name: user.name || user.username,
        headline: user.headline || '',
        bio: user.bio || '',
        email: defaultEmail,
        avatarUrl: user.avatarUrl,
        links: {
          github: defaultGithub,
          linkedin: defaultLinkedin,
          twitter: user.links?.twitter || '',
          website: user.links?.website || ''
        }
      },
    });
  } else {
    let changed = false;
    if (!p.profile.email && defaultEmail) {
      p.profile.email = defaultEmail;
      changed = true;
    }
    if (!p.profile.links) {
      p.profile.links = {};
      changed = true;
    }
    if (!p.profile.links.github && defaultGithub) {
      p.profile.links.github = defaultGithub;
      changed = true;
    }
    if (!p.profile.links.linkedin && defaultLinkedin) {
      p.profile.links.linkedin = defaultLinkedin;
      changed = true;
    }
    if (changed) {
      await p.save();
    }
  }
  return p;
};

export const getMyPortfolio = async (req, res) => {
  const p = await getOrCreate(req.user);
  res.json({ success: true, portfolio: view(p, req) });
};

export const getGitHubBackground = async (req, res) => {
  try {
    const repoIds = Array.isArray(req.query.repoIds)
      ? req.query.repoIds
      : typeof req.query.repoIds === 'string'
      ? req.query.repoIds.split(',').filter(Boolean)
      : [];
    const bg = await extractGitHubBackground(req.user, repoIds);
    res.json({ success: true, ...bg });
  } catch (err) {
    fail(res, err);
  }
};

export const updateMyPortfolio = async (req, res) => {
  try {
    const patch = sanitizePortfolioInput(req.body);
    const p = await getOrCreate(req.user);
    pushVersion(p, 'edit');
    for (const [k, v] of Object.entries(patch)) {
      if (['theme', 'sections'].includes(k)) Object.assign(p[k], v);
      else p[k] = v;
    }
    await p.save();

    // Keep user document email and linkedin in sync
    let userChanged = false;
    if (patch.profile?.email && patch.profile.email !== req.user.email) {
      req.user.email = patch.profile.email;
      userChanged = true;
    }
    if (patch.profile?.links?.linkedin && patch.profile.links.linkedin !== req.user.links?.linkedin) {
      req.user.links = { ...req.user.links, linkedin: patch.profile.links.linkedin };
      userChanged = true;
    }
    if (userChanged) {
      await req.user.save();
    }

    res.json({ success: true, portfolio: view(p, req) });
  } catch (err) {
    fail(res, err);
  }
};

const userInfo = (b = {}) => {
  const c = sanitizePortfolioInput({ education: b.education, experience: b.experience, skills: b.skills });
  return { education: c.education || [], experience: c.experience || [], skills: c.skills || [] };
};

export const generatePortfolio = async (req, res) => {
  try {
    const repoIds = Array.isArray(req.body.repoIds) ? req.body.repoIds.filter((x) => /^[a-f0-9]{24}$/.test(String(x))).slice(0, 8) : [];
    if (!repoIds.length) return res.status(400).json({ success: false, message: 'Select 1-8 repositories.' });
    const extra = userInfo(req.body.userInfo);
    let bg = null;
    try {
      bg = await extractGitHubBackground(req.user, repoIds);
      if (!extra.education.length && bg?.education?.length) extra.education = bg.education;
      if (!extra.experience.length && bg?.experience?.length) extra.experience = bg.experience;
      if (!extra.skills.length && bg?.skills?.length) extra.skills = bg.skills;
    } catch (bgErr) {
      console.warn('[GeneratePortfolio] Could not auto-extract GitHub background:', bgErr.message);
    }
    const evidence = await buildEvidence(req.user, repoIds, extra);
    const ai = await generateWithGemini({ section: 'all', evidence, instruction: req.body.instruction });

    const p = await getOrCreate(req.user);
    pushVersion(p, 'generate');
    const repos = await Repo.find({ _id: { $in: repoIds }, userId: req.user._id });
    p.profile.headline = ai.headline || p.profile.headline;
    p.profile.bio = ai.bio || p.profile.bio;
    p.skills = (Array.isArray(ai.skills) && ai.skills.length) ? ai.skills : (p.skills.length ? p.skills : evidence.knownSkills.slice(0, 15));
    
    // Robust repo matching: case-insensitive, strip symbols, positional fallback, never throw undefined
    p.projects = (ai.projects || []).map((x, idx) => {
      const r =
        repos.find((q) => q.name.toLowerCase() === (x.name || '').toLowerCase()) ||
        repos.find((q) => q.name.toLowerCase().replace(/[-_]/g, '') === (x.name || '').toLowerCase().replace(/[-_]/g, '')) ||
        repos[idx] ||
        repos[0];
      if (!r) return null;
      const langs = (r.languages || [])
        .map((l) => (typeof l === 'string' ? l : l?.name))
        .filter(Boolean)
        .slice(0, 6);
      return {
        repoId: r.githubRepoId,
        name: r.name,
        description: x.description || r.description || '',
        repoUrl: r.url,
        languages: langs,
        stars: r.stars || 0,
        visible: true,
      };
    }).filter(Boolean);

    // Fallback if projects array was empty
    if (p.projects.length === 0 && repos.length > 0) {
      p.projects = repos.map((r) => ({
        repoId: r.githubRepoId,
        name: r.name,
        description: r.description || `Engineered ${r.name} with modern technologies and clean architecture.`,
        repoUrl: r.url,
        languages: (r.languages || []).map((l) => (typeof l === 'string' ? l : l?.name)).filter(Boolean).slice(0, 6),
        stars: r.stars || 0,
        visible: true,
      }));
    }

    if (extra.education.length) p.education = extra.education;
    if (extra.experience.length) p.experience = extra.experience;
    if (bg?.linkedin && (!p.profile.links?.linkedin || p.profile.links.linkedin.includes('example.com'))) {
      if (!p.profile.links) p.profile.links = {};
      p.profile.links.linkedin = bg.linkedin;
    }
    if (bg?.email && (!p.profile.email || p.profile.email.endsWith('@devhub.dev') || p.profile.email.endsWith('@example.com'))) {
      p.profile.email = bg.email;
    }
    if (['aurora', 'minimal', 'terminal', 'cyberpunk'].includes(req.body.template)) p.template = req.body.template;
    p.generatedFrom = { repoIds: repos.map((r) => r.githubRepoId), at: new Date() };
    await p.save();
    res.json({ success: true, portfolio: view(p, req) });
  } catch (err) {
    fail(res, err);
  }
};

export const regenerateSection = async (req, res) => {
  try {
    const { section, projectName, instruction } = req.body;
    if (!['headline', 'bio', 'skills', 'projects'].includes(section)) return res.status(400).json({ success: false, message: 'Unknown section.' });
    const p = await getOrCreate(req.user);
    
    // Discover repos: try generatedFrom first, fall back to any repos owned by user
    let repoDocs = await Repo.find({ userId: req.user._id, githubRepoId: { $in: p.generatedFrom?.repoIds || [] } });
    if (!repoDocs.length) {
      repoDocs = await Repo.find({ userId: req.user._id }).limit(8);
    }
    if (!repoDocs.length) return res.status(400).json({ success: false, message: 'No repositories found to regenerate from.' });

    const evidence = await buildEvidence(req.user, repoDocs.map((r) => r._id), { skills: p.skills });
    if (section === 'projects' && projectName) {
      const filtered = evidence.repos.filter((r) => r.name.toLowerCase() === projectName.toLowerCase());
      if (filtered.length) evidence.repos = filtered;
    }
    if (!evidence.repos.length) return res.status(400).json({ success: false, message: 'Project not found.' });
    
    const ai = await generateWithGemini({ section, evidence, instruction });
    pushVersion(p, `regenerate:${section}`);
    if (section === 'headline' && ai.headline) p.profile.headline = ai.headline;
    if (section === 'bio' && ai.bio) p.profile.bio = ai.bio;
    if (section === 'skills' && Array.isArray(ai.skills) && ai.skills.length) p.skills = ai.skills;
    if (section === 'projects' && Array.isArray(ai.projects)) {
      for (const x of ai.projects) {
        const target =
          p.projects.find((q) => q.name.toLowerCase() === (x.name || '').toLowerCase()) ||
          (projectName ? p.projects.find((q) => q.name.toLowerCase() === projectName.toLowerCase()) : null);
        if (target && x.description) target.description = x.description;
      }
    }
    await p.save();
    res.json({ success: true, portfolio: view(p, req) });
  } catch (err) {
    fail(res, err);
  }
};

/** Renders unsaved edits for the live preview. Client shows it in <iframe sandbox="allow-scripts">. */
export const previewPortfolio = async (req, res) => {
  try {
    const p = await getOrCreate(req.user);
    const draft = { ...p.toObject(), ...sanitizePortfolioInput(req.body || {}) };
    draft.theme = { ...p.theme, ...(req.body?.theme ? sanitizePortfolioInput({ theme: req.body.theme }).theme : {}) };
    draft.publicBaseUrl = publicBase(req);
    draft.networkIp = getLocalIp();
    res.json({ success: true, html: renderHtml(draft, { inline: true }) });
  } catch (err) {
    fail(res, err);
  }
};

export const exportFiles = (p) => [
  { name: 'index.html', data: renderHtml(p) },
  { name: 'css/style.css', data: renderCss(p) },
  { name: 'js/main.js', data: renderJs() },
  { name: 'assets/.gitkeep', data: '' },
  {
    name: 'README.md',
    data: `# ${p.profile?.name || 'Portfolio'} - Portfolio site\n\nStatic site (HTML/CSS/JS). No build step or dependencies.\n\n## Run locally\n\n    npx serve .\n\nor open index.html in a browser.\n\n## Deploy\n\n- **GitHub Pages:** push these files to a repo, then Settings > Pages > Deploy from branch.\n- **Netlify:** drag this folder onto https://app.netlify.com/drop\n- **Vercel:** \`npx vercel --prod\` inside this folder.\n\n## Edit\n\nText lives in index.html, colours in css/style.css (variables at the top).\n`,
  },
];

export const downloadZip = async (req, res) => {
  const p = await getOrCreate(req.user);
  const zip = buildPortfolioZip(exportFiles(p));
  res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${p.slug || req.user.username}-portfolio.zip"`, 'Content-Length': zip.length });
  res.send(zip);
};

export const checkSlug = async (req, res) => {
  const slug = normalizeSlug(req.query.slug);
  const bad = validateSlug(slug);
  if (bad) return res.json({ success: true, slug, available: false, reason: bad });
  const taken = await Portfolio.exists({ slug, owner: { $ne: req.user._id } });
  const userClash = await User.exists({ username: slug, _id: { $ne: req.user._id } });
  res.json({ success: true, slug, available: !taken && !userClash, reason: taken || userClash ? 'Already taken.' : null });
};

export const publishPortfolio = async (req, res) => {
  try {
    const p = await getOrCreate(req.user);
    const slug = normalizeSlug(req.body.slug) || normalizeSlug(p.slug) || normalizeSlug(req.user.username);
    const bad = validateSlug(slug);
    if (bad) return res.status(400).json({ success: false, message: bad });
    if ((await Portfolio.exists({ slug, owner: { $ne: req.user._id } })) || (await User.exists({ username: slug, _id: { $ne: req.user._id } })))
      return res.status(409).json({ success: false, message: 'That URL is already taken.' });
    if (!p.profile.name || !p.profile.bio) return res.status(400).json({ success: false, message: 'Add a name and bio before publishing.' });
    p.slug = slug;
    p.status = 'published';
    p.publishedAt = new Date();
    await p.save();
    res.json({ success: true, portfolio: view(p, req) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'That URL is already taken.' });
    fail(res, err);
  }
};

export const unpublishPortfolio = async (req, res) => {
  const p = await getOrCreate(req.user);
  p.status = 'draft';
  await p.save();
  res.json({ success: true, portfolio: view(p, req) });
};

export const listVersions = async (req, res) => {
  const p = await getOrCreate(req.user);
  res.json({ success: true, versions: p.versions.map((v) => ({ id: v._id, at: v.at, reason: v.reason })).reverse() });
};

export const restoreVersion = async (req, res) => {
  const p = await getOrCreate(req.user);
  const v = p.versions.id(req.params.versionId);
  if (!v) return res.status(404).json({ success: false, message: 'Version not found.' });
  pushVersion(p, 'restore');
  Object.assign(p, sanitizePortfolioInput(v.snapshot));
  await p.save();
  res.json({ success: true, portfolio: view(p, req) });
};

/** Public page. Falls through (next) when nothing is published so the SPA profile at /u/:username still works. */
export const servePublicPortfolio = async (req, res, next) => {
  try {
    const slug = String(req.params.username || '').toLowerCase();
    const p = await Portfolio.findOne({ slug, status: 'published' }).select('-versions');
    if (!p) return next();
    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https: data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=60',
    });
    const draft = p.toObject();
    draft.publicBaseUrl = publicBase(req);
    draft.networkIp = getLocalIp();
    res.send(renderHtml(draft, { inline: true }));
  } catch (err) {
    next(err);
  }
};

/** Public endpoint to download published portfolio zip */
export const downloadPublicPortfolioZip = async (req, res) => {
  try {
    const slug = String(req.params.username || '').toLowerCase();
    let p = await Portfolio.findOne({ slug });
    if (!p) {
      const user = await User.findOne({ username: slug });
      if (user) {
        p = await Portfolio.findOne({ owner: user._id });
      }
    }
    if (!p) {
      return res.status(404).send('Portfolio not found.');
    }
    const zip = buildPortfolioZip(exportFiles(p));
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${p.slug || slug}-portfolio.zip"`,
      'Content-Length': zip.length,
    });
    res.send(zip);
  } catch (err) {
    res.status(500).send('Error generating zip: ' + err.message);
  }
};
