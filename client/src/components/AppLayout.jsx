import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, copyToClipboard, getPublicProfileUrl } from '../context/AuthContext';
import { Logo } from './Logo';
import { Icon } from './Icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ToastHost } from './ToastHost';

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: "grid", end: true },
  { to: "/app/portfolio", label: "My Portfolio", icon: "briefcase" },
  { to: "/app/generator", label: "AI Portfolio Studio", icon: "zap" },
  { to: "/app/repositories", label: "My Repositories", icon: "github" },
  { to: "/app/skills", label: "My Skills", icon: "code" },
  { to: "/app/developers", label: "Find Developers", icon: "users" },
  { to: "/app/requests", label: "Collaboration Requests", icon: "mail", badge: true },
  { to: "/app/settings", label: "Settings", icon: "settings" }
];

const ROUTE_TITLES = {
  "/app": "Dashboard",
  "/app/portfolio": "My Portfolio",
  "/app/generator": "AI Portfolio Studio",
  "/app/templates": "Portfolio Templates",
  "/app/repositories": "My Repositories",
  "/app/skills": "My Skills",
  "/app/developers": "Find Developers",
  "/app/requests": "Collaboration Requests",
  "/app/settings": "Settings"
};

export function AppLayout() {
  const { profile, requests, toasts, dismissToast, logout, toast } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const pendingReceivedCount = requests.filter(
    (r) => r.direction === 'received' && r.status === 'pending'
  ).length;

  const handleLogout = () => {
    logout();
    toast("You have been logged out", "info");
    navigate('/');
  };

  const handleShareProfile = async () => {
    const url = getPublicProfileUrl(profile.username);
    const success = await copyToClipboard(url);
    toast(
      success ? "Public profile link copied" : "Copy failed. Select the link manually.",
      success ? "success" : "error"
    );
  };

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} aria-label="Primary">
        <div className="sidebar-top">
          <Logo onClick={() => navigate('/')} />
          <button
            type="button"
            className="icon-btn only-mobile"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="x" />
          </button>
        </div>

        <nav className="side-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.badge && pendingReceivedCount > 0 && (
                <em className="nav-badge">{pendingReceivedCount}</em>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="side-user">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--line)'
              }}
            />
          ) : (
            <Avatar name={profile.name} size={40} />
          )}
          <div className="side-user-text">
            <strong>{profile.name}</strong>
            <span>@{profile.username}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Log out"
            title="Log out"
            onClick={handleLogout}
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="scrim" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn only-mobile"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Icon name="menu" />
          </button>

          <span className="topbar-title">
            {ROUTE_TITLES[pathname] || 'DevHub'}
          </span>

          <div className="topbar-actions">
            <Button
              variant="secondary"
              size="sm"
              icon="share"
              onClick={handleShareProfile}
            >
              <span className="hide-sm">Share profile</span>
            </Button>

            <button
              type="button"
              className="icon-btn bell"
              aria-label={`${pendingReceivedCount} pending requests`}
              onClick={() => navigate('/app/requests')}
            >
              <Icon name="bell" />
              {pendingReceivedCount > 0 && <i />}
            </button>

            <Button
              size="sm"
              iconRight="arrow"
              onClick={() => navigate(`/u/${profile.username}`)}
            >
              <span className="hide-sm">Public profile</span>
              <span className="show-sm">View</span>
            </Button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default AppLayout;
