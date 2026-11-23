import crypto from 'crypto';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Repo } from '../models/Repo.js';
import { Skill } from '../models/Skill.js';
import { config } from '../config/env.js';
import { encryptToken } from '../config/github.js';
import { syncGitHubData } from '../services/githubSync.js';
import {
  fetchRealGitHubData,
  REAL_WORLD_DEVELOPERS
} from '../services/githubService.js';

/**
 * Helper to generate JWT token and set HTTP-only cookie
 */
export const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const isProduction = config.env === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

/**
 * POST /auth/register
 * Real user registration with email, password, and live GitHub username
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, name, githubToken } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'GitHub username is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `@${cleanUsername} is already registered. Please log in instead.`
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.'
        });
      }
    }

    // Fetch real GitHub profile & repos
    const ghData = await fetchRealGitHubData(cleanUsername, githubToken);

    const user = new User({
      githubId: ghData.githubId,
      username: cleanUsername,
      name: name || ghData.name || cleanUsername,
      email: email || ghData.email || `${cleanUsername}@devhub.dev`,
      avatarUrl: ghData.avatarUrl,
      bio: ghData.bio,
      accessToken: githubToken ? encryptToken(githubToken) : '',
      links: {
        github: `https://github.com/${cleanUsername}`,
        website: ghData.website || '',
      },
      stats: ghData.stats,
      lastSyncedAt: new Date(),
    });

    user.setPassword(password);
    await user.save();

    // Save repos
    const savedRepos = [];
    for (const r of ghData.repos) {
      const repoDoc = await Repo.create({
        userId: user._id,
        githubRepoId: r.id || r.githubRepoId || Math.floor(Math.random() * 900000),
        name: r.name,
        description: r.description || '',
        url: r.url || `https://github.com/${cleanUsername}/${r.name}`,
        languages: Object.entries(r.langs || {}).map(([n, bytes]) => ({ name: n, bytes })),
        topics: r.topics || [],
        stars: r.stars || 0,
        forks: r.forks || 0,
        pinned: !!r.pinned,
        pushedAt: new Date(),
      });
      savedRepos.push(repoDoc);
    }

    // Save skills
    await Skill.create({
      userId: user._id,
      skills: (ghData.skills || []).map((s) => ({
        name: s.name,
        category: s.category || 'Other',
        score: s.level || 75,
        normalizedScore: s.level || 75,
        confidence: 0.9,
      })),
    });

    const token = sendTokenCookie(res, user._id);

    return res.status(201).json({
      success: true,
      token,
      message: `Account created for @${user.username}`,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        stats: user.stats,
        links: user.links,
      },
      repos: ghData.repos,
      skills: ghData.skills,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /auth/login
 * Real authentication via email or username + password
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password',
      });
    }

    const clean = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: clean }, { email: clean }],
    }).select('+password +salt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isValid = user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    let repos = await Repo.find({ userId: user._id });
    let skillDoc = await Skill.findOne({ userId: user._id });

    // If repos is empty or has synthesized placeholder repos, auto-sync live GitHub data
    const isPlaceholder = repos.some((r) => r.name.includes('-portfolio') && r.name.includes(user.username));
    if ((repos.length === 0 || isPlaceholder) && user.username !== 'asha' && user.username !== 'ravi') {
      try {
        console.log(`[AuthLogin] Auto-syncing real GitHub repos for @${user.username}...`);
        const syncResult = await syncGitHubData(user, true);
        if (syncResult?.repos?.length) {
          repos = syncResult.repos;
          skillDoc = { skills: syncResult.skills };
        }
      } catch (syncErr) {
        console.warn(`[AuthLogin] Auto-sync failed: ${syncErr.message}`);
      }
    }

    const token = sendTokenCookie(res, user._id);

    return res.json({
      success: true,
      token,
      message: `Welcome back, @${user.username}!`,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        stats: user.stats,
        links: user.links,
        privacy: user.privacy,
      },
      repos,
      skills: skillDoc?.skills || [],
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /auth/me
 * Returns current authenticated user and real database repos
 */
export const getCurrentUser = async (req, res) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let repos = await Repo.find({ userId: user._id });
    let skillDoc = await Skill.findOne({ userId: user._id });

    // Auto-sync real repos if placeholder or empty
    const isPlaceholder = repos.some((r) => r.name.includes('-portfolio') && r.name.includes(user.username));
    if ((repos.length === 0 || isPlaceholder) && user.username !== 'asha' && user.username !== 'ravi') {
      try {
        const syncResult = await syncGitHubData(user, true);
        if (syncResult?.repos?.length) {
          repos = syncResult.repos;
          skillDoc = { skills: syncResult.skills };
        }
      } catch (syncErr) {
        // Fall back to current data
      }
    }

    res.json({
      success: true,
      user,
      repos,
      skills: skillDoc?.skills || [],
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

/**
 * POST /auth/fetch-github-user
 * Fetch real world developer profile & real repos dynamically
 */
export const fetchGitHubUser = async (req, res) => {
  try {
    const { username, token } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const data = await fetchRealGitHubData(username, token);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /auth/real-developers
 * Returns verified real-world developers list
 */
export const getRealDevelopers = (req, res) => {
  res.json({ success: true, developers: REAL_WORLD_DEVELOPERS });
};

/**
 * GET /auth/github
 * Redirects to GitHub authorization page with secure state parameter
 */
export const initiateGitHubAuth = (req, res) => {
  if (!config.github.clientId || config.github.clientId === 'mock_client_id') {
    return res.redirect(`${config.clientUrl}/login?auth_notice=demo_mode`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const isProduction = config.env === 'production';
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 10 * 60 * 1000, // 10 minutes
    sameSite: 'lax',
  });

  const scope = config.github.scopes.join(' ');
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${encodeURIComponent(config.github.callbackUrl)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authUrl);
};

/**
 * GET /auth/github/callback
 * Secure OAuth callback handler with state validation, access token exchange,
 * profile & private email retrieval, and user upsertion
 */
export const handleGitHubCallback = async (req, res) => {
  const { code, state, error: ghError, error_description: ghErrorDesc } = req.query;
  const savedState = req.cookies?.oauth_state;

  // Clear oauth state cookie immediately
  res.clearCookie('oauth_state');

  // 1. Handle user denied or canceled permission
  if (ghError) {
    console.warn(`[GitHub OAuth] Authorization error: ${ghError} - ${ghErrorDesc}`);
    return res.redirect(
      `${config.clientUrl}/login?error=${encodeURIComponent(ghError)}&error_description=${encodeURIComponent(ghErrorDesc || 'GitHub authorization was canceled or denied')}`
    );
  }

  // 2. Validate authorization code
  if (!code) {
    return res.redirect(`${config.clientUrl}/login?error=missing_code&error_description=No+authorization+code+received`);
  }

  // 3. Validate CSRF state parameter
  if (state && savedState && state !== savedState) {
    return res.redirect(`${config.clientUrl}/login?error=invalid_state&error_description=CSRF+state+validation+failed`);
  }

  try {
    // 4. Exchange authorization code for GitHub access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;
    if (error || !access_token) {
      console.error('[GitHub OAuth] Token exchange error:', error, error_description);
      return res.redirect(
        `${config.clientUrl}/login?error=token_exchange_failed&error_description=${encodeURIComponent(error_description || 'Failed to exchange authorization code')}`
      );
    }

    // 5. Fetch authenticated user profile
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'DevHub-App',
      },
    });

    const gh = profileResponse.data;

    // 6. Retrieve primary/verified email (in case user email is private)
    let userEmail = gh.email || '';
    if (!userEmail) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'User-Agent': 'DevHub-App',
          },
        });
        if (Array.isArray(emailsResponse.data)) {
          const primaryVerified = emailsResponse.data.find((e) => e.primary && e.verified);
          const anyVerified = emailsResponse.data.find((e) => e.verified);
          const first = emailsResponse.data[0];
          userEmail = (primaryVerified || anyVerified || first)?.email || '';
        }
      } catch (emailErr) {
        console.warn('[GitHub OAuth] Could not fetch private emails:', emailErr.message);
      }
    }

    const cleanUsername = gh.login.toLowerCase();
    const encryptedToken = encryptToken(access_token);

    // 7. Store or update user profile in MongoDB (prevent duplicate accounts)
    let user = await User.findOne({
      $or: [
        { githubId: gh.id },
        { username: cleanUsername },
        ...(userEmail ? [{ email: userEmail.toLowerCase() }] : []),
      ],
    });

    if (!user) {
      user = new User({
        githubId: gh.id,
        username: cleanUsername,
        name: gh.name || gh.login,
        email: userEmail || `${cleanUsername}@devhub.dev`,
        avatarUrl: gh.avatar_url || '',
        bio: gh.bio || '',
        accessToken: encryptedToken,
        links: {
          github: gh.html_url || `https://github.com/${cleanUsername}`,
          website: gh.blog ? (gh.blog.startsWith('http') ? gh.blog : `https://${gh.blog}`) : '',
        },
        stats: {
          totalRepos: gh.public_repos || 0,
          followers: gh.followers || 0,
          following: gh.following || 0,
        },
        lastSyncedAt: new Date(),
      });
      await user.save();
    } else {
      user.githubId = gh.id;
      user.username = cleanUsername;
      user.accessToken = encryptedToken;
      if (gh.avatar_url) user.avatarUrl = gh.avatar_url;
      if (gh.name) user.name = gh.name;
      if (gh.bio) user.bio = gh.bio;
      if (userEmail && (!user.email || user.email.endsWith('@devhub.dev'))) {
        user.email = userEmail;
      }
      if (!user.links) user.links = {};
      user.links.github = gh.html_url || `https://github.com/${cleanUsername}`;
      if (gh.blog) user.links.website = gh.blog.startsWith('http') ? gh.blog : `https://${gh.blog}`;
      if (!user.stats) user.stats = {};
      user.stats.totalRepos = gh.public_repos || user.stats.totalRepos || 0;
      user.stats.followers = gh.followers || user.stats.followers || 0;
      user.stats.following = gh.following || user.stats.following || 0;
      await user.save();
    }

    // 8. Create secure session (JWT stored in HTTP-only cookie)
    const token = sendTokenCookie(res, user._id);

    // 9. Sync user repositories, languages, and calculate skills
    try {
      await syncGitHubData(user, true);
    } catch (syncErr) {
      console.error('[GitHub OAuth] Initial repository sync error:', syncErr.message);
    }

    // 10. Redirect user to DevHub dashboard (with cookie + token fallback for cross-domain deployments)
    return res.redirect(`${config.clientUrl}/app?auth_success=1&token=${token}`);
  } catch (err) {
    console.error('[GitHub OAuth] Callback processing failed:', err.message);
    return res.redirect(`${config.clientUrl}/login?error=oauth_failed&error_description=${encodeURIComponent(err.message)}`);
  }
};

/**
 * POST /auth/demo-login
 */
export const demoLogin = async (req, res) => {
  try {
    const { username = 'gaearon' } = req.body;
    let user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      const ghData = await fetchRealGitHubData(username);
      user = new User({
        githubId: ghData.githubId,
        username: ghData.username,
        name: ghData.name,
        avatarUrl: ghData.avatarUrl,
        bio: ghData.bio,
        links: {
          github: `https://github.com/${ghData.username}`,
          website: ghData.website || '',
        },
        stats: ghData.stats,
      });
      await user.save();

      for (const r of ghData.repos) {
        await Repo.create({
          userId: user._id,
          githubRepoId: r.id || Math.floor(Math.random() * 900000),
          name: r.name,
          description: r.description || '',
          url: r.url || `https://github.com/${user.username}/${r.name}`,
          languages: Object.entries(r.langs || {}).map(([n, bytes]) => ({ name: n, bytes })),
          topics: r.topics || [],
          stars: r.stars || 0,
          forks: r.forks || 0,
          isPinned: r.pinned || false,
          pushedAt: new Date(),
        });
      }

      await Skill.create({
        userId: user._id,
        skills: (ghData.skills || []).map((s) => ({
          name: s.name,
          category: s.category || 'Other',
          score: s.level || 75,
          normalizedScore: s.level || 75,
        })),
      });
    }

    let repos = await Repo.find({ userId: user._id });
    let skillDoc = await Skill.findOne({ userId: user._id });

    // If repos is empty or has synthesized placeholder repos, auto-sync live GitHub data
    const isPlaceholder = repos.some((r) => r.name.includes('-portfolio') && r.name.includes(user.username));
    if ((repos.length === 0 || isPlaceholder) && user.username !== 'asha' && user.username !== 'ravi') {
      try {
        console.log(`[AuthLogin] Auto-syncing real GitHub repos for @${user.username}...`);
        const syncResult = await syncGitHubData(user, true);
        if (syncResult?.repos?.length) {
          repos = syncResult.repos;
          skillDoc = { skills: syncResult.skills };
        }
      } catch (syncErr) {
        console.warn(`[AuthLogin] Auto-sync failed: ${syncErr.message}`);
      }
    }

    const token = sendTokenCookie(res, user._id);

    res.json({
      success: true,
      token,
      message: `Signed in as @${user.username}`,
      user,
      repos,
      skills: skillDoc?.skills || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /auth/logout
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * POST /auth/forgot-password
 * Generates a password reset token for the given username or email
 */
export const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your GitHub username or registered email',
      });
    }

    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    const user = await User.findOne({
      $or: [{ username: clean }, { email: clean }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account found for "${clean}". Please check the username/email or sign up.`,
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}&identifier=${encodeURIComponent(user.username)}`;

    console.log(`[Auth] Password reset requested for @${user.username}: ${resetUrl}`);

    return res.json({
      success: true,
      message: `Password reset link generated for @${user.username}`,
      resetToken,
      resetUrl,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /auth/reset-password
 * Verifies the token and updates the user's password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password, identifier } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    let user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user && identifier) {
      const clean = identifier.trim().toLowerCase().replace(/^@/, '');
      user = await User.findOne({
        $or: [{ username: clean }, { email: clean }],
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenCookie(res, user._id);

    return res.json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
