import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { LangDot, LANG_COLORS } from '../components/LangDot';
import { SkillChip } from '../components/SkillChip';

export function Dashboard() {
  const { profile, repos, skills, projects, requests, github, settings } = useAuth();
  const navigate = useNavigate();

  const totalStars = repos.reduce((acc, r) => acc + (r.stars || 0), 0);
  const pendingRequests = requests.filter(
    (r) => r.direction === 'received' && r.status === 'pending'
  );
  const pinnedRepos = repos.filter((r) => r.pinned);

  // Compute top languages
  const langTotals = {};
  repos.forEach((r) => {
    if (r.langs) {
      Object.entries(r.langs).forEach(([lang, val]) => {
        langTotals[lang] = (langTotals[lang] || 0) + val;
      });
    } else if (r.language) {
      langTotals[r.language] = (langTotals[r.language] || 0) + 1;
    }
  });

  const totalLangWeight = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(langTotals)
    .map(([lang, count]) => [lang, Math.round((count / totalLangWeight) * 100)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Portfolio strength calculation
  const strength = Math.min(
    100,
    40 +
      (skills.length >= 5 ? 20 : 0) +
      (pinnedRepos.length >= 3 ? 20 : 0) +
      (projects.length ? 10 : 0) +
      (profile.bio ? 10 : 0)
  );

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile.name.split(' ')[0]}`}
        text="Here is what is happening with your real portfolio and repositories today."
      />

      {/* Hero Profile Card */}
      <Card className="profile-hero">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--vio)'
            }}
          />
        ) : (
          <Avatar name={profile.name} size={72} ring />
        )}

        <div className="grow">
          <h2>
            {profile.name}{' '}
            <Badge tone="green" icon="github">
              {github.connected ? 'GitHub connected' : 'Disconnected'}
            </Badge>
          </h2>
          <p className="muted">{profile.headline}</p>
          <p className="small muted">
            <Icon name="map" size={13} /> {profile.location} &nbsp;·&nbsp;{' '}
            <a
              href={`https://github.com/${profile.username}`}
              target="_blank"
              rel="noreferrer noopener"
              className="link small"
              style={{ color: 'var(--mut)' }}
            >
              @{profile.username} <Icon name="external" size={10} />
            </a>{' '}
            &nbsp;·&nbsp; Profile is <strong>{settings.visibility}</strong>
          </p>
        </div>

        <div className="completeness">
          <div className="between small">
            <span>Portfolio strength</span>
            <strong>{strength}%</strong>
          </div>
          <ProgressBar value={strength} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/portfolio')}
          >
            Improve portfolio
          </Button>
        </div>
      </Card>

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          icon="github"
          label="Repositories"
          value={repos.length}
          hint={`${pinnedRepos.length} pinned`}
          tone="violet"
        />
        <StatCard
          icon="star"
          label="Total stars"
          value={totalStars.toLocaleString()}
          hint="Across all repos"
          tone="amber"
        />
        <StatCard
          icon="users"
          label="Followers"
          value={(profile.followers || 0).toLocaleString()}
          hint={`${profile.following} following`}
          tone="blue"
        />
        <StatCard
          icon="code"
          label="Contributions"
          value={(profile.contributions || 1200).toLocaleString()}
          hint="Last 12 months"
          tone="green"
        />
      </div>

      {/* Grid 2: Languages & Pending Requests */}
      <div className="grid-2">
        <Card title="Top languages" subtitle="Based on your real repositories">
          <div className="lang-rows">
            {topLanguages.map(([lang, pct]) => (
              <div key={lang} className="lang-row">
                <span className="lang">
                  <i style={{ background: LANG_COLORS[lang] || '#94a3b8' }} />
                  {lang}
                </span>
                <div className="bar">
                  <span
                    className="bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: LANG_COLORS[lang] || '#94a3b8'
                    }}
                  />
                </div>
                <b className="small">{pct}%</b>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Pending requests"
          subtitle={`${pendingRequests.length} waiting for your reply`}
          action={
            <Link className="link" to="/app/requests">
              View all
            </Link>
          }
        >
          {pendingRequests.length === 0 && (
            <p className="muted">You are all caught up.</p>
          )}
          <ul className="list">
            {pendingRequests.slice(0, 3).map((req) => (
              <li key={req.id} className="list-row">
                <Avatar name={req.username} avatarUrl={`https://avatars.githubusercontent.com/${req.username}`} size={36} />
                <div className="grow">
                  <strong>@{req.username}</strong>
                  <p className="muted small clamp1">{req.project}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/app/requests')}
                >
                  Review
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Pinned Repositories */}
      <Card
        title="Pinned repositories"
        subtitle="Shown first on your public profile"
        action={
          <Link className="link" to="/app/repositories">
            Manage
          </Link>
        }
      >
        <div className="repo-grid">
          {pinnedRepos.map((repo) => {
            const repoUrl = repo.url || `https://github.com/${profile.username}/${repo.name}`;

            return (
              <article key={repo.id} className="repo-mini">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  <h4>
                    <Icon name="github" size={14} /> {repo.name} <Icon name="external" size={11} style={{ opacity: 0.6 }} />
                  </h4>
                </a>
                <p className="muted small clamp2">{repo.description || 'No description provided.'}</p>
                <div className="between small">
                  <LangDot language={repo.language} />
                  <span className="muted">
                    <Icon name="star" size={12} /> {(repo.stars || 0).toLocaleString()}
                  </span>
                </div>
              </article>
            );
          })}
          {pinnedRepos.length === 0 && (
            <p className="muted">
              Pin repositories from My Repositories to feature them here.
            </p>
          )}
        </div>
      </Card>

      {/* Your Skills */}
      <Card
        title="Your skills"
        action={
          <Link className="link" to="/app/skills">
            Edit skills
          </Link>
        }
      >
        <div className="chips">
          {skills.slice(0, 12).map((skill) => (
            <SkillChip key={skill.id}>{skill.name}</SkillChip>
          ))}
        </div>
      </Card>
    </>
  );
}

export default Dashboard;
