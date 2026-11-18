import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Mascot } from '../components/Mascot';
import { ToastHost } from '../components/ToastHost';

const PERMISSIONS = [
  "Read your public profile and avatar",
  "Import your real public repositories",
  "Extract verified skills from real code & languages"
];

export function Signup() {
  const {
    authed,
    registerWithBackend,
    fetchRealDeveloper,
    toasts,
    toast,
    dismissToast
  } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);

  // Parse OAuth query feedback
  const [oauthError, setOauthError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const desc = params.get('error_description');
    if (err === 'access_denied') return 'GitHub authorization was canceled or denied.';
    if (err === 'invalid_state') return 'Security verification failed (CSRF state mismatch). Please try again.';
    if (err) return desc ? decodeURIComponent(desc) : `GitHub OAuth error: ${err}`;
    return null;
  });

  const [oauthNotice, setOauthNotice] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('auth_notice') === 'demo_mode'
      ? 'To use real GitHub OAuth, please set your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env.'
      : null;
  });

  if (authed) {
    return <Navigate to="/app" replace />;
  }

  const handleVerifyGitHub = async () => {
    if (!username.trim()) {
      toast("Please enter a GitHub username", "error");
      return;
    }
    setVerifying(true);
    const data = await fetchRealDeveloper(username.trim(), githubToken.trim());
    setVerifying(false);
    if (data) {
      setPreviewUser(data);
      if (!name && data.name) setName(data.name);
      if (!email && data.email && !data.email.includes('example.com')) setEmail(data.email);
      toast(`Verified @${data.username} on GitHub (${data.repos} public repos)!`, "success");
    } else {
      toast(`Could not find GitHub user @${username}`, "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast("GitHub username is required", "error");
      return;
    }
    if (!password || password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    const res = await registerWithBackend({
      username: username.trim(),
      name: name.trim() || username.trim(),
      email: email.trim(),
      password,
      githubToken: githubToken.trim()
    });
    setLoading(false);

    if (res?.success) {
      navigate('/app');
    }
  };

  const handleOAuth = () => {
    window.location.href = '/auth/github';
  };

  return (
    <div className="login">
      {/* Left Artwork Column */}
      <aside className="login-art">
        <i className="blob b1" aria-hidden="true" />
        <i className="blob b2" aria-hidden="true" />
        <i className="dots" aria-hidden="true" />

        <Logo onClick={() => navigate('/')} />

        <div className="login-mascot">
          <Mascot pose="wave" />
        </div>

        <blockquote>
          <p>
            "DevHub turned my real GitHub projects into a showcase and connected me with great open-source collaborators."
          </p>
          <cite>Shadcn, Creator of shadcn/ui</cite>
        </blockquote>
      </aside>

      {/* Right Form Column */}
      <main className="login-panel">
        <div className="login-card" style={{ maxWidth: 480 }}>
          <button
            type="button"
            className="back"
            onClick={() => navigate('/')}
          >
            <Icon name="arrow" size={14} className="flip" /> Back to home
          </button>

          {/* Tab Selector */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className="tab active"
            >
              Sign Up
            </button>
            <button
              type="button"
              className="tab"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </div>

          <h1>Create your DevHub Account</h1>
          <p className="muted">
            Join with your real GitHub profile to showcase real repositories and find collaborators.
          </p>

          {oauthError && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--r)',
                color: '#f87171',
                fontSize: '0.88rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon name="x" size={16} />
              <span>{oauthError}</span>
            </div>
          )}

          {oauthNotice && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--r)',
                color: 'var(--sky)',
                fontSize: '0.85rem',
                marginBottom: 16,
              }}
            >
              ℹ️ {oauthNotice}
            </div>
          )}

          <Button
            size="lg"
            className="gh-btn"
            icon="github"
            onClick={handleOAuth}
          >
            Login with GitHub
          </Button>

          <div className="divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--mut)', fontSize: '0.85rem' }}>
            <span>— OR REGISTER WITH GITHUB USERNAME —</span>
          </div>

          <form className="form" onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="su-gh">Real GitHub Username *</label>
              <div className="input-group">
                <input
                  id="su-gh"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setPreviewUser(null);
                  }}
                  placeholder="e.g. gaearon, sindresorhus, komal"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={verifying}
                  onClick={handleVerifyGitHub}
                >
                  Verify
                </Button>
              </div>
            </div>

            {/* GitHub Preview Card if verified */}
            {previewUser && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'var(--card2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r)',
                  marginBottom: 12
                }}
              >
                <img
                  src={previewUser.avatarUrl}
                  alt={previewUser.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '0.95rem' }}>{previewUser.name}</strong>
                  <p className="muted small" style={{ margin: 0 }}>
                    @{previewUser.username} &nbsp;·&nbsp; {previewUser.repos} repos &nbsp;·&nbsp; {previewUser.stars} stars
                  </p>
                </div>
                <Icon name="check" size={18} style={{ color: 'var(--green)' }} />
              </div>
            )}

            <div className="field">
              <label htmlFor="su-name">Full Name</label>
              <input
                id="su-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="field">
              <label htmlFor="su-email">Email Address</label>
              <input
                id="su-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
              />
            </div>

            <div className="field">
              <label htmlFor="su-pw">Password *</label>
              <input
                id="su-pw"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Setting up account & syncing repos...' : 'Create Account & Import Repos'}
            </Button>
          </form>

          <div className="perm-box" style={{ marginTop: 20 }}>
            <p className="small">
              <strong>What happens next:</strong>
            </p>
            <ul>
              {PERMISSIONS.map((perm) => (
                <li key={perm}>
                  <Icon name="check" size={14} />
                  {perm}
                </li>
              ))}
            </ul>
          </div>

          <p className="muted small center" style={{ marginTop: 16 }}>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Log in here
            </Link>
          </p>
        </div>
      </main>

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default Signup;
