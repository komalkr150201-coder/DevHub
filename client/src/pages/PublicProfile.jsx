import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAuth,
  findDeveloperByUsername,
  calculateSkillOverlap,
  copyToClipboard,
  getPublicProfileUrl
} from '../context/AuthContext';
import { api } from '../services/api';
import { PublicNav } from '../components/PublicNav';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Icon } from '../components/Icons';
import { MatchRing } from '../components/MatchRing';
import { SkillChip } from '../components/SkillChip';
import { ProgressBar } from '../components/ProgressBar';
import { LangDot } from '../components/LangDot';
import { EmptyState } from '../components/EmptyState';

export function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const {
    authed,
    profile,
    skills,
    repos,
    projects,
    settings,
    mySkillNames,
    fetchRealDeveloper,
    toast
  } = useAuth();

  const isSelf = username?.toLowerCase() === profile.username?.toLowerCase();
  const localOtherDev = isSelf ? null : findDeveloperByUsername(username);

  const [remoteDev, setRemoteDev] = useState(null);
  const [loading, setLoading] = useState(!isSelf && !localOtherDev);

  useEffect(() => {
    if (isSelf || localOtherDev) return;

    let mounted = true;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/users/${username}`);
        if (res.data?.success && res.data.user && mounted) {
          const u = res.data.user;
          const uRepos = (res.data.repos || []).map((r, i) => ({
            id: r.githubRepoId || r.id || i + 1,
            name: r.name,
            description: r.description || '',
            language: r.language || r.languages?.[0]?.name || 'Code',
            stars: r.stars || 0,
            forks: r.forks || 0,
            pinned: !!r.isPinned || !!r.pinned
          }));
          const uSkills = (res.data.skills || []).map((s) => s.name || s);

          setRemoteDev({
            name: u.name || u.username,
            username: u.username,
            role: u.headline || u.bio?.slice(0, 50) || 'Developer on DevHub',
            location: u.location || 'Remote',
            email: u.email || `${u.username}@devhub.dev`,
            avatarUrl: u.avatarUrl || `https://avatars.githubusercontent.com/${u.username}`,
            open: u.availability?.length > 0,
            skills: uSkills.length ? uSkills : ['JavaScript', 'React', 'Node.js', 'Git'],
            levels: Object.fromEntries(uSkills.map((s) => [s, 85])),
            repos: u.stats?.totalRepos || uRepos.length,
            stars: u.stats?.totalStars || uRepos.reduce((acc, r) => acc + (r.stars || 0), 0),
            followers: u.stats?.followers || 0,
            bio: u.bio || `Developer profile on DevHub (@${u.username}).`,
            website: u.links?.website,
            realRepos: uRepos,
            projects: []
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fall back to fetchRealDeveloper
      }

      try {
        const fallback = await fetchRealDeveloper(username);
        if (fallback && mounted) {
          setRemoteDev({
            ...fallback,
            levels: Object.fromEntries((fallback.skills || []).map((s) => [s, 85]))
          });
        }
      } catch (err) {
        // Unable to fetch
      }
      if (mounted) setLoading(false);
    };

    fetchUser();
    return () => {
      mounted = false;
    };
  }, [username, isSelf, localOtherDev, fetchRealDeveloper]);

  const targetDev = isSelf ? null : (localOtherDev || remoteDev);

  const handleShare = async () => {
    const url = getPublicProfileUrl(username);
    const ok = await copyToClipboard(url);
    toast(ok ? 'Profile link copied' : 'Copy failed', ok ? 'success' : 'error');
  };

  if (loading) {
    return (
      <div className="pub">
        <PublicNav />
        <div className="pub-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
          <p className="muted">Loading developer profile for @{username}...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!isSelf && !targetDev) {
    return (
      <div className="pub">
        <PublicNav />
        <div className="pub-in">
          <EmptyState
            title="Profile not found"
            text={`There is no developer named @${username}.`}
            action={<Button onClick={() => navigate('/')}>Back to home</Button>}
          />
        </div>
      </div>
    );
  }

  // Private profile check
  if (isSelf && settings.visibility === 'private') {
    return (
      <div className="pub">
        <PublicNav />
        <div className="pub-in">
          <EmptyState
            icon="lock"
            title="This profile is private"
            text="Switch it to public in Settings to share it."
            action={
              <Button onClick={() => navigate(authed ? '/app/settings' : '/login')}>
                {authed ? 'Open settings' : 'Log in'}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const devData = isSelf
    ? {
        name: profile.name,
        role: profile.headline,
        bio: profile.bio,
        location: profile.location,
        email: profile.email,
        website: profile.website,
        open: settings.openToCollab,
        followers: profile.followers,
        repos: repos.length,
        stars: repos.reduce((acc, r) => acc + (r.stars || 0), 0),
        skills: skills.map((s) => s.name),
        levels: Object.fromEntries(skills.map((s) => [s.name, s.level])),
        realRepos: repos
      }
    : {
        ...targetDev,
        levels: targetDev.levels || Object.fromEntries((targetDev.skills || []).map((s) => [s, 85]))
      };

  const match = !isSelf && authed ? calculateSkillOverlap(mySkillNames, devData.skills) : null;
  const showLevels = isSelf && settings.showSkillLevels;
  const showRepos = !isSelf || settings.showRepos;
  const displayRepos = isSelf ? (repos.filter((r) => r.pinned).length ? repos.filter((r) => r.pinned) : repos) : (devData.realRepos || devData.repos || []);
  const showEmail = isSelf ? settings.showEmail : false;

  return (
    <div className="pub">
      <PublicNav>
        <Button
          variant="secondary"
          size="sm"
          icon="share"
          onClick={handleShare}
        >
          Share
        </Button>
      </PublicNav>

      <div className="pub-in">
        {/* Hero Card */}
        <section className="card pub-hero">
          <div className="pub-cover" aria-hidden="true" />

          <div className="pub-head">
            {devData.avatarUrl ? (
              <img
                src={devData.avatarUrl}
                alt={devData.name}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--card)'
                }}
              />
            ) : (
              <Avatar name={devData.name} size={104} ring />
            )}

            <div className="grow">
              <h1>
                {devData.name}{' '}
                {devData.open && <Badge tone="green">Open to collaborate</Badge>}
              </h1>
              <p className="muted">{devData.role}</p>
              <p className="small muted">
                <Icon name="map" size={13} /> {devData.location} &nbsp;·&nbsp;{' '}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link small"
                  style={{ color: 'var(--mut)' }}
                >
                  <Icon name="github" size={13} /> @{username}
                </a>
                {devData.website && (
                  <>
                    &nbsp;·&nbsp; <Icon name="globe" size={13} /> {devData.website}
                  </>
                )}
              </p>
            </div>

            <div className="pub-cta">
              {match && <MatchRing percent={match.percent} size={64} />}

              {isSelf ? (
                <Button
                  variant="secondary"
                  icon="edit"
                  onClick={() => navigate(authed ? '/app/portfolio' : '/login')}
                >
                  Edit profile
                </Button>
              ) : (
                <Button
                  icon="mail"
                  onClick={() => navigate(authed ? '/app/developers' : '/login')}
                >
                  {authed ? 'Collaborate' : 'Log in to collaborate'}
                </Button>
              )}

              {showEmail && (
                <Button
                  variant="secondary"
                  icon="mail"
                  onClick={() => {
                    window.location.href = `mailto:${devData.email}`;
                  }}
                >
                  Email
                </Button>
              )}
            </div>
          </div>

          <p className="pub-bio">{devData.bio}</p>

          <ul className="hero-stats compact">
            <li>
              <b>{devData.repos}</b>
              <span>Repositories</span>
            </li>
            <li>
              <b>{devData.stars}</b>
              <span>Stars</span>
            </li>
            <li>
              <b>{devData.followers}</b>
              <span>Followers</span>
            </li>
          </ul>
        </section>

        {/* 2-Column: Skills & Projects */}
        <div className="pub-grid">
          {/* Skills */}
          <section className="card">
            <h3 className="card-title">Skills</h3>
            {match && (
              <p className="small muted">{match.shared.length} shared with you</p>
            )}

            {showLevels ? (
              <div className="skill-bars">
                {devData.skills.map((s) => (
                  <div key={s} className="skill-bar-row">
                    <span>{s}</span>
                    <ProgressBar value={devData.levels[s]} />
                    <b className="small">{devData.levels[s]}%</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chips">
                {devData.skills.map((s) => (
                  <SkillChip
                    key={s}
                    tone={match && match.shared.includes(s) ? 'match' : undefined}
                  >
                    {s}
                  </SkillChip>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="card">
            <h3 className="card-title">Projects</h3>
            <div className="stack">
              {(isSelf ? projects : devData.projects || []).map((p) => (
                <article key={p.title} className="repo-mini">
                  <h4>{p.title}</h4>
                  <p className="muted small">{p.description}</p>
                  <div className="chips">
                    {(p.tech || []).map((t) => (
                      <SkillChip key={t}>{t}</SkillChip>
                    ))}
                  </div>
                </article>
              ))}

              {isSelf && projects.length === 0 && (
                <p className="muted">No custom projects yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Featured Repositories */}
        {showRepos && displayRepos.length > 0 && (
          <section className="card">
            <h3 className="card-title">Featured repositories</h3>
            <div className="repo-grid">
              {displayRepos.slice(0, 6).map((repo) => (
                <article key={repo.id || repo.name} className="repo-mini">
                  <h4>
                    <Icon name="github" size={14} /> {repo.name}
                  </h4>
                  <p className="muted small clamp2">{repo.description || 'Public repository'}</p>
                  <div className="between small">
                    <LangDot language={repo.language} />
                    <span className="muted">
                      <Icon name="star" size={12} /> {repo.stars || 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <p className="center muted small">Portfolio built with DevHub</p>
      </div>
    </div>
  );
}

export default PublicProfile;
