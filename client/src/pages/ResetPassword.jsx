import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { ToastHost } from '../components/ToastHost';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithCredentials, toasts, toast, dismissToast } = useAuth();

  const initialToken = searchParams.get('token') || '';
  const initialIdentifier = searchParams.get('identifier') || '';

  const [step, setStep] = useState(initialToken ? 2 : 1);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    const clean = identifier.trim().replace(/^@/, '');
    if (!clean) {
      toast('Please enter your GitHub username or registered email', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(clean);
      if (res.data?.success) {
        setToken(res.data.resetToken);
        setSuccessMsg(`Account verified for @${res.data.username || clean}! Enter your new password below.`);
        setStep(2);
        toast('Reset code verified. Please set your new password.', 'success');
      }
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast('Reset token is required', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        token: token.trim(),
        password: newPassword,
        identifier: identifier.trim()
      });

      if (res.data?.success) {
        toast('Password has been reset successfully!', 'success');
        await loginWithCredentials({ identifier: identifier.trim(), password: newPassword });
        navigate('/app');
      }
    } catch (err) {
      toast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
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
          <Mascot pose="nod" />
        </div>

        <blockquote>
          <p>
            "Security and developer experience go hand in hand on DevHub."
          </p>
          <cite>DevHub Platform Security</cite>
        </blockquote>
      </aside>

      {/* Right Form Column */}
      <main className="login-panel">
        <div className="login-card" style={{ maxWidth: 440 }}>
          <button
            type="button"
            className="back"
            onClick={() => navigate('/login')}
          >
            <Icon name="arrow" size={14} className="flip" /> Back to login
          </button>

          <h1>{step === 1 ? 'Forgot Password' : 'Set New Password'}</h1>
          <p className="muted">
            {step === 1
              ? 'Enter your GitHub username or email to reset your account password.'
              : 'Choose a secure new password for your DevHub account.'}
          </p>

          {step === 1 ? (
            <form className="form" onSubmit={handleRequestToken}>
              <div className="field">
                <label htmlFor="rst-id">GitHub Username or Email</label>
                <input
                  id="rst-id"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. komalkr150201-coder or you@domain.com"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                style={{ width: '100%', marginTop: 8 }}
              >
                Continue to Reset Password
              </Button>
            </form>
          ) : (
            <form className="form" onSubmit={handleResetPassword}>
              {successMsg && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 'var(--r)',
                    color: 'var(--sky)',
                    fontSize: '0.86rem'
                  }}
                >
                  {successMsg}
                </div>
              )}

              <div className="field">
                <label htmlFor="rst-npw">New Password</label>
                <input
                  id="rst-npw"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoFocus
                />
              </div>

              <div className="field">
                <label htmlFor="rst-cpw">Confirm New Password</label>
                <input
                  id="rst-cpw"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                style={{ width: '100%', marginTop: 8 }}
              >
                Reset Password & Log In
              </Button>

              <button
                type="button"
                className="link small center"
                style={{ marginTop: 8 }}
                onClick={() => setStep(1)}
              >
                Use a different username or email
              </button>
            </form>
          )}

          <p className="muted small center" style={{ marginTop: 24 }}>
            Remember your password?{' '}
            <Link to="/login" className="link">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default ResetPassword;
