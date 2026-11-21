const RESERVED_SLUGS = new Set([
  'app', 'api', 'auth', 'login', 'signup', 'settings', 'admin', 'health',
  'u', 'p', 'portfolio', 'dashboard', 'developers', 'skills', 'repositories',
  'requests', 'reset-password', 'forgot-password', 'generator', 'public',
  'static', 'assets', 'favicon', 'robots', 'sitemap'
]);

export function normalizeSlug(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateSlug(slug) {
  if (!slug) return 'Slug is required.';
  if (slug.length < 3) return 'Slug must be at least 3 characters.';
  if (slug.length > 40) return 'Slug must be 40 characters or fewer.';
  if (!/^[a-z0-9][a-z0-9-_]*[a-z0-9]$/.test(slug) && !/^[a-z0-9]{3,}$/.test(slug)) {
    return 'Slug must start and end with an alphanumeric character and contain only letters, numbers, hyphens, and underscores.';
  }
  if (RESERVED_SLUGS.has(slug)) {
    return 'This URL slug is reserved. Please choose another.';
  }
  return null;
}

const cleanStr = (s, max = 500) => (typeof s === 'string' ? s.trim().slice(0, max) : '');

export function sanitizePortfolioInput(input = {}) {
  if (!input || typeof input !== 'object') return {};
  const out = {};

  if (['aurora', 'minimal', 'terminal'].includes(input.template)) {
    out.template = input.template;
  }

  if (input.theme && typeof input.theme === 'object') {
    out.theme = {};
    if (typeof input.theme.accent === 'string') {
      out.theme.accent = cleanStr(input.theme.accent, 20);
    }
    if (typeof input.theme.accent2 === 'string') {
      out.theme.accent2 = cleanStr(input.theme.accent2, 20);
    }
  }

  if (input.sections && typeof input.sections === 'object') {
    out.sections = {};
    for (const key of ['about', 'skills', 'projects', 'experience', 'education', 'contact']) {
      if (typeof input.sections[key] === 'boolean') {
        out.sections[key] = input.sections[key];
      }
    }
  }

  if (input.profile && typeof input.profile === 'object') {
    out.profile = {};
    if (input.profile.name !== undefined) out.profile.name = cleanStr(input.profile.name, 100);
    if (input.profile.headline !== undefined) out.profile.headline = cleanStr(input.profile.headline, 160);
    if (input.profile.bio !== undefined) out.profile.bio = cleanStr(input.profile.bio, 1200);
    if (input.profile.email !== undefined) out.profile.email = cleanStr(input.profile.email, 160);
    if (input.profile.location !== undefined) out.profile.location = cleanStr(input.profile.location, 100);
    if (input.profile.avatarUrl !== undefined) out.profile.avatarUrl = cleanStr(input.profile.avatarUrl, 500);
    if (input.profile.links && typeof input.profile.links === 'object') {
      out.profile.links = {
        github: cleanStr(input.profile.links.github, 200),
        linkedin: cleanStr(input.profile.links.linkedin, 200),
        twitter: cleanStr(input.profile.links.twitter, 200),
        website: cleanStr(input.profile.links.website, 200),
      };
    }
  }

  if (Array.isArray(input.skills)) {
    out.skills = input.skills
      .map((s) => cleanStr(s, 50))
      .filter(Boolean)
      .slice(0, 50);
  }

  if (Array.isArray(input.projects)) {
    out.projects = input.projects.slice(0, 15).map((p) => ({
      repoId: typeof p.repoId === 'number' ? p.repoId : undefined,
      name: cleanStr(p.name, 100),
      description: cleanStr(p.description, 600),
      repoUrl: cleanStr(p.repoUrl, 300),
      liveUrl: cleanStr(p.liveUrl, 300),
      languages: Array.isArray(p.languages) ? p.languages.map((l) => cleanStr(l, 40)).filter(Boolean).slice(0, 8) : [],
      stars: typeof p.stars === 'number' ? p.stars : 0,
      visible: p.visible !== false,
    }));
  }

  if (Array.isArray(input.education)) {
    out.education = input.education.slice(0, 10).map((e) => ({
      school: cleanStr(e.school, 120),
      degree: cleanStr(e.degree, 120),
      period: cleanStr(e.period, 60),
      details: cleanStr(e.details, 300),
    }));
  }

  if (Array.isArray(input.experience)) {
    out.experience = input.experience.slice(0, 10).map((e) => ({
      company: cleanStr(e.company, 120),
      role: cleanStr(e.role, 120),
      period: cleanStr(e.period, 60),
      summary: cleanStr(e.summary, 600),
    }));
  }

  return out;
}
