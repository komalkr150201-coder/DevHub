import crypto from 'crypto';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { encryptToken } from '../config/github.js';
import { syncGitHubData } from '../services/githubSync.js';

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
 * GET /auth/github
 * Redirects to GitHub authorization page with state parameter
 */
export const initiateGitHubAuth = (req, res) => {
  // If GitHub client ID is not configured, redirect to login page with notice or demo login
  if (!config.github.clientId || config.github.clientId === 'mock_client_id') {
    return res.redirect(`${config.clientUrl}/?auth_notice=demo_mode`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutes
    sameSite: 'lax',
  });

  const scope = config.github.scopes.join(' ');
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${encodeURIComponent(config.github.callbackUrl)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  res.redirect(authUrl);
};

/**
 * GET /auth/github/callback
 * Handles OAuth callback, exchanges code, creates user, issues JWT
 */
export const handleGitHubCallback = async (req, res) => {
  const { code, state } = req.query;
  const savedState = req.cookies?.oauth_state;

  res.clearCookie('oauth_state');

  if (!code) {
    return res.redirect(`${config.clientUrl}/?error=missing_code`);
  }

  if (state && savedState && state !== savedState) {
    return res.redirect(`${config.clientUrl}/?error=invalid_state`);
  }

  try {
    // 1. Exchange code for access token
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
      console.error('GitHub token exchange error:', error, error_description);
      return res.redirect(`${config.clientUrl}/?error=token_exchange_failed`);
    }

    // 2. Fetch user profile from GitHub
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'User-Agent': 'DevHub-App',
      },
    });

    const gh = profileResponse.data;

    // 3. Upsert user in database
    let user = await User.findOne({ githubId: gh.id });
    const encryptedToken = encryptToken(access_token);

    if (!user) {
      user = new User({
        githubId: gh.id,
        username: gh.login.toLowerCase(),
        name: gh.name || gh.login,
        email: gh.email || '',
        avatarUrl: gh.avatar_url || '',
        bio: gh.bio || '',
        accessToken: encryptedToken,
        links: {
          github: gh.html_url || `https://github.com/${gh.login}`,
          website: gh.blog || '',
        },
        stats: {
          totalRepos: gh.public_repos || 0,
          followers: gh.followers || 0,
          following: gh.following || 0,
        },
      });
      await user.save();
    } else {
      user.accessToken = encryptedToken;
      user.avatarUrl = gh.avatar_url || user.avatarUrl;
      user.name = gh.name || user.name;
      user.bio = gh.bio || user.bio;
      await user.save();
    }

    // 4. Issue JWT cookie
    sendTokenCookie(res, user._id);

    // 5. Trigger sync in background (non-blocking)
    syncGitHubData(user, true).catch((syncErr) => {
      console.error('Initial sync error for user:', user.username, syncErr.message);
    });

    // 6. Redirect to frontend dashboard
    res.redirect(`${config.clientUrl}/dashboard`);
  } catch (err) {
    console.error('GitHub OAuth callback failed:', err.message);
    res.redirect(`${config.clientUrl}/?error=oauth_failed`);
  }
};

/**
 * POST /auth/demo-login
 * Seamless login as a demo/seed developer for testing without GitHub credentials
 */
export const demoLogin = async (req, res) => {
  try {
    const { username = 'asha' } = req.body;
    let user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      // Create a demo user if not found
      user = new User({
        githubId: Math.floor(Math.random() * 900000) + 100000,
        username: username.toLowerCase(),
        name: username.charAt(0).toUpperCase() + username.slice(1) + ' (Demo)',
        avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 800000)}?v=4`,
        bio: 'Full-Stack Developer passionate about scalable web architectures and developer tooling.',
        accessToken: encryptToken('demo_token_mock'),
        availability: ['hackathon', 'open-source'],
        stats: {
          totalRepos: 18,
          totalStars: 142,
          totalForks: 38,
          followers: 86,
          following: 42,
          contributionStreak: 14,
          recentCommits: 48,
        },
      });
      await user.save();
    }

    sendTokenCookie(res, user._id);

    res.json({
      success: true,
      message: `Signed in as @${user.username}`,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        links: user.links,
        availability: user.availability,
        stats: user.stats,
        privacy: user.privacy,
        theme: user.theme,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /auth/logout
 * Clears JWT cookie
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};
