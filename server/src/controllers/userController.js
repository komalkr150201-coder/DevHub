import { User } from '../models/User.js';
import { Repo } from '../models/Repo.js';
import { Skill } from '../models/Skill.js';
import { syncGitHubData } from '../services/githubSync.js';
import { normalizeSkillName } from '../services/skillExtractor.js';
import { fetchRealGitHubData } from '../services/githubService.js';
import { config } from '../config/env.js';

/**
 * GET /api/me
 * Get currently authenticated user, repos, and skill profile
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    const repos = await Repo.find({ userId: user._id }).sort({ isPinned: -1, stars: -1 });
    const skillDoc = await Skill.findOne({ userId: user._id });

    res.json({
      success: true,
      user,
      repos,
      skills: skillDoc ? skillDoc.skills : [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/me
 * Update user bio, links, availability, privacy, and theme
 */
export const updateCurrentUser = async (req, res) => {
  try {
    const { name, bio, avatarUrl, headline, links, availability, privacy, theme } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (headline !== undefined) user.headline = headline;
    if (links !== undefined) user.links = { ...user.links, ...links };
    if (availability !== undefined) user.availability = availability;
    if (privacy !== undefined) user.privacy = { ...user.privacy, ...privacy };
    if (theme !== undefined) user.theme = theme;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/sync
 * Manually refresh GitHub repositories and recalculate skills
 */
export const syncUserData = async (req, res) => {
  try {
    const user = req.user;
    const result = await syncGitHubData(user, true);

    res.json({
      success: true,
      message: 'GitHub data synced successfully',
      user: result.user,
      repos: result.repos,
      skills: result.skills,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to sync with GitHub: ${err.message}`,
    });
  }
};

/**
 * PATCH /api/repos/:id
 * Toggle pinned status or hide/unhide a repository
 */
export const updateRepoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned, isHidden } = req.body;

    const repo = await Repo.findOne({ _id: id, userId: req.user._id });
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    if (isPinned !== undefined) repo.isPinned = Boolean(isPinned);
    if (isHidden !== undefined) repo.isHidden = Boolean(isHidden);

    await repo.save();

    res.json({
      success: true,
      message: 'Repository updated',
      repo,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/skills
 * Manually add, remove, or confirm skills
 */
export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'skills must be an array' });
    }

    // Sanitize and normalize skill names
    const cleaned = skills.map((s) => ({
      name: normalizeSkillName(s.name),
      weight: Math.min(1.0, Math.max(0.1, Number(s.weight) || 0.5)),
      source: s.source === 'manual' ? 'manual' : 'auto',
    }));

    const skillDoc = await Skill.findOneAndUpdate(
      { userId: req.user._id },
      { skills: cleaned, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills: skillDoc.skills,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/users/:username
 * Public profile data for shareable public profile page
 */
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      try {
        const ghData = await fetchRealGitHubData(username);
        if (ghData) {
          return res.json({
            success: true,
            user: {
              username: ghData.username,
              name: ghData.name,
              avatarUrl: ghData.avatarUrl,
              bio: ghData.bio,
              location: ghData.location,
              email: ghData.email,
              links: {
                github: `https://github.com/${ghData.username}`,
                website: ghData.website || '',
              },
              stats: ghData.stats,
              privacy: { isPublic: true, showEmail: false },
              availability: ['open-source'],
            },
            repos: ghData.repos,
            skills: ghData.skills,
          });
        }
      } catch (ghErr) {
        // Fall through to 404
      }

      return res.status(404).json({ success: false, message: 'Developer profile not found' });
    }

    if (!user.privacy.isPublic) {
      return res.status(403).json({ success: false, message: 'This developer profile is private' });
    }

    // Load visible repos (not hidden)
    const repos = await Repo.find({ userId: user._id, isHidden: false })
      .sort({ isPinned: -1, stars: -1, pushedAt: -1 })
      .limit(30);

    // Load skills
    const skillDoc = await Skill.findOne({ userId: user._id });

    // Filter email based on privacy
    const publicUserData = user.toObject();
    if (!publicUserData.privacy?.showEmail) {
      delete publicUserData.email;
    }

    res.json({
      success: true,
      user: publicUserData,
      repos,
      skills: skillDoc ? skillDoc.skills : [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /:username
 * Server-rendered Open Graph HTML preview for social sharing (Section 8.5 & 10)
 */
export const renderPublicProfileOg = async (req, res) => {
  try {
    const { username } = req.params;
    // Don't intercept API or assets
    if (['api', 'auth', 'assets', 'favicon.ico'].includes(username)) {
      return res.status(404).end();
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.redirect(`${config.clientUrl}/profile/${username}`);
    }

    const skillDoc = await Skill.findOne({ userId: user._id });
    const topSkills = (skillDoc?.skills || []).slice(0, 5).map(s => s.name).join(', ');

    // Return HTML with Open Graph meta tags and immediate redirect/client hydration
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${user.name || user.username} - DevHub Verified Portfolio</title>
  <meta name="description" content="${user.bio || `Developer portfolio of ${user.username} with verified GitHub skills: ${topSkills}`}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${user.name || user.username} | DevHub Portfolio">
  <meta property="og:description" content="Verified GitHub skills: ${topSkills}. Availability: ${user.availability.join(', ')}">
  <meta property="og:image" content="${user.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}">
  <meta property="og:url" content="${config.clientUrl}/profile/${user.username}">
  <meta property="og:type" content="profile">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${user.name || user.username} | DevHub">
  <meta name="twitter:description" content="Verified GitHub skills: ${topSkills}">
  <meta name="twitter:image" content="${user.avatarUrl}">

  <meta http-equiv="refresh" content="0; url=${config.clientUrl}/profile/${user.username}">
</head>
<body style="font-family: sans-serif; background: #0d1117; color: #fff; padding: 2rem;">
  <h2>Redirecting to @${user.username}'s DevHub Profile...</h2>
  <p><a href="${config.clientUrl}/profile/${user.username}" style="color: #22c55e;">Click here if not redirected automatically</a></p>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    res.redirect(`${config.clientUrl}/profile/${req.params.username}`);
  }
};
