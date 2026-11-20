import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth, REAL_WORLD_DEVELOPERS } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Mascot } from '../components/Mascot';
import { ToastHost } from '../components/ToastHost';

export function Login() {
  const {
    authed,
    loginWithCredentials,
    switchUser,
    importGitHubUser,
    toasts,
    toast,
    dismissToast
  } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Instant GitHub import explore
  const [anyUser, setAnyUser] = useState('');
  const [importing, setImporting] = useState(false);

  // Parse OAuth query feedback
  const [oauthError, setOauthError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const desc = params.get('error_description');
    if (err === 'access_denied') {
      return 'GitHub authorization was canceled or denied.';
    }
    if (err === 'invalid_state') {
      return 'Security verification failed (CSRF state mismatch). Please try again.';
    }
    if (err) {
      return desc ? decodeURIComponent(desc) : `GitHub OAuth error: ${err}`;
    }
    return null;
  });

  const [oauthNotice, setOauthNotice] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('auth_notice') === 'demo_mode'
      ? 'To use real GitHub OAuth, please set your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env. You can also sign in with any account below.'
      : null;
  });

  if (authed) {
    return <Navigate to="/app" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast("Please enter your username/email and password", "error");
      return;
    }
    setLoading(true);
    const res = await loginWithCredentials({ identifier: identifier.trim(), password });
    setLoading(false);
    if (res?.success) {
      navigate('/app');
    }
  };

  const handleOAuth = () => {
    window.location.href = '/auth/github';
  };

  const handleQuickDeveloper = (username) => {
    switchUser(username);
    navigate('/app');
  };

  const handleInstantImport = async (e) => {
    e.preventDefault();
    const clean = anyUser.trim().replace(/^@/, '');
    if (!clean) return;
    setImporting(true);
    const ok = await importGitHubUser(clean);
    setImporting(false);
    if (ok) {
      navigate('/app');
    }
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
            "DevHub turned my scattered repos into a real living portfolio, and I found my co-founder in a week."
          </p>
          <cite>Dan Abramov, Creator of Redux</cite>
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
              className="tab"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
            <button
              type="button"
              className="tab active"
            >
              Log In
            </button>
          </div>

          <h1>Welcome Back</h1>
          <p className="muted">
            Log in to manage your developer portfolio and review collaboration requests.
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
            <span>— OR SIGN IN WITH CREDENTIALS —</span>
          </div>

          <form className="form" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="lg-id">GitHub Username or Email</label>
              <input
                id="lg-id"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. gaearon or you@domain.com"
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="lg-pw">Password</label>
              <input
                id="lg-pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Login with Verified Real-World Developers */}
          <div style={{ marginTop: 24, padding: '16px', background: 'var(--card2)', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}>
            <p className="small" style={{ margin: '0 0 10px', color: 'var(--sky)', fontWeight: 600 }}>
              🚀 Quick 1-Click Test as a Verified Real-World Developer:
            </p>
            <div className="chips">
              {REAL_WORLD_DEVELOPERS.slice(0, 4).map((d) => (
                <button
                  key={d.username}
                  type="button"
                  className="skill-chip"
                  onClick={() => handleQuickDeveloper(d.username)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <img
                    src={d.avatarUrl}
                    alt={d.name}
                    style={{ width: 18, height: 18, borderRadius: '50%' }}
                  />
                  {d.name.split(' ')[0]} (@{d.username})
                </button>
              ))}
            </div>

            {/* Instant GitHub Username Import */}
            <form onSubmit={handleInstantImport} style={{ marginTop: 14 }}>
              <p className="muted small" style={{ margin: '0 0 6px' }}>
                Or enter <b>ANY</b> real GitHub username to import real repos:
              </p>
              <div className="input-group">
                <input
                  value={anyUser}
                  onChange={(e) => setAnyUser(e.target.value)}
                  placeholder="e.g. torvalds, komal, octocat"
                  style={{ fontSize: '0.85rem' }}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  loading={importing}
                >
                  Import
                </Button>
              </div>
            </form>
          </div>

          <p className="muted small center" style={{ marginTop: 20 }}>
            Don't have an account yet?{' '}
            <Link to="/signup" className="link">
              Sign up free
            </Link>
          </p>
        </div>
      </main>

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default Login;
