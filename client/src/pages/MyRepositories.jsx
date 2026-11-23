import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Icon } from '../components/Icons';
import { LangDot } from '../components/LangDot';
import { LangBar } from '../components/LangBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';

export function MyRepositories() {
  const { repos, togglePin, syncRepos, github, profile, importGitHubUser } = useAuth();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [sortKey, setSortKey] = useState('stars');
  const [syncing, setSyncing] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  // Quick GitHub username importer
  const [importHandle, setImportHandle] = useState('');
  const [importing, setImporting] = useState(false);

  const languages = useMemo(() => {
    return ['All', ...Array.from(new Set(repos.map((r) => r.language).filter(Boolean)))];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return repos
      .filter((r) => {
        const matchesLang = langFilter === 'All' || r.language === langFilter;
        const matchesSearch =
          !q ||
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)));
        return matchesLang && matchesSearch;
      })
      .sort((a, b) => {
        if (sortKey === 'stars') return (b.stars || 0) - (a.stars || 0);
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        return (b.forks || 0) - (a.forks || 0);
      });
  }, [repos, search, langFilter, sortKey]);

  const handleSync = async () => {
    setSyncing(true);
    await syncRepos();
    setSyncing(false);
  };

  const handleImportUser = async (e) => {
    e.preventDefault();
    if (!importHandle.trim()) return;
    setImporting(true);
    await importGitHubUser(importHandle.trim());
    setImporting(false);
    setImportHandle('');
  };

  const selectedRepo = selectedRepoId
    ? repos.find((r) => r.id === selectedRepoId)
    : null;

  return (
    <>
      <PageHeader
        title="My Repositories"
        text={`Real repositories from @${profile.username} · last synced ${github.lastSync}`}
        actions={
          <Button
            icon="sync"
            loading={syncing}
            onClick={handleSync}
          >
            {syncing ? 'Syncing...' : 'Sync from GitHub'}
          </Button>
        }
      />

      {/* Real GitHub Account Importer Bar */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(124, 58, 237, 0.08))',
          border: '1px solid var(--line)'
        }}
      >
        <div className="between wrap gap">
          <div>
            <h4 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="github" size={18} /> Switch or Import Your Real GitHub Repositories
            </h4>
            <p className="muted small" style={{ margin: 0 }}>
              Currently showing repos for <b>@{profile.username}</b>. Enter any other real GitHub username to pull their real repositories:
            </p>
          </div>

          <form onSubmit={handleImportUser} style={{ display: 'flex', gap: 8 }}>
            <div className="input-group" style={{ width: 260 }}>
              <input
                value={importHandle}
                onChange={(e) => setImportHandle(e.target.value)}
                placeholder="Enter GitHub handle..."
              />
              <Button type="submit" size="sm" loading={importing}>
                Import
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          icon="github"
          label="Repositories"
          value={repos.length}
          tone="violet"
        />
        <StatCard
          icon="star"
          label="Stars"
          value={repos.reduce((acc, r) => acc + (r.stars || 0), 0).toLocaleString()}
          tone="amber"
        />
        <StatCard
          icon="fork"
          label="Forks"
          value={repos.reduce((acc, r) => acc + (r.forks || 0), 0).toLocaleString()}
          tone="blue"
        />
        <StatCard
          icon="pin"
          label="Pinned"
          value={repos.filter((r) => r.pinned).length}
          tone="green"
        />
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories or topics"
            aria-label="Search repositories"
          />
        </label>

        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          aria-label="Filter by language"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          aria-label="Sort repositories"
        >
          <option value="stars">Most stars</option>
          <option value="forks">Most forks</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Repositories List */}
      {filteredRepos.length === 0 ? (
        <EmptyState
          title="No repositories found"
          text="Try another search, change language filter, or import a GitHub handle above."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setLangFilter('All');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="repo-list">
          {filteredRepos.map((repo) => {
            const repoUrl = repo.url || `https://github.com/${profile.username}/${repo.name}`;

            return (
              <article key={repo.id} className="card repo">
                <div className="between">
                  <h3 className="repo-name">
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name="github" size={16} /> {repo.name} <Icon name="external" size={12} style={{ opacity: 0.6 }} />
                    </a>
                  </h3>
                  {repo.pinned && (
                    <Badge tone="violet" icon="pin">
                      Pinned
                    </Badge>
                  )}
                </div>

                <p className="muted">{repo.description || 'No description provided.'}</p>

                {repo.topics && repo.topics.length > 0 && (
                  <div className="chips">
                    {repo.topics.map((topic) => (
                      <span key={topic} className="topic">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="repo-meta small">
                  <LangDot language={repo.language} />
                  <span>
                    <Icon name="star" size={13} /> {(repo.stars || 0).toLocaleString()}
                  </span>
                  <span>
                    <Icon name="fork" size={13} /> {(repo.forks || 0).toLocaleString()}
                  </span>
                  <span className="muted">Updated {repo.updated}</span>
                </div>

                <div className="row gap wrap">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedRepoId(repo.id)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant={repo.pinned ? 'ghost' : 'primary'}
                    icon="pin"
                    onClick={() => togglePin(repo.id)}
                  >
                    {repo.pinned ? 'Unpin' : 'Add to portfolio'}
                  </Button>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    GitHub <Icon name="external" size={12} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedRepo && (
        <Modal
          title={selectedRepo.name}
          onClose={() => setSelectedRepoId(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelectedRepoId(null)}>
                Close
              </Button>
              <Button
                icon="external"
                onClick={() =>
                  window.open(
                    selectedRepo.url || `https://github.com/${profile.username}/${selectedRepo.name}`,
                    '_blank',
                    'noopener'
                  )
                }
              >
                Open on GitHub
              </Button>
            </>
          }
        >
          <p>{selectedRepo.description || 'No description provided on GitHub.'}</p>

          {selectedRepo.langs && Object.keys(selectedRepo.langs).length > 0 && (
            <>
              <h4 className="mt">Languages</h4>
              <LangBar langs={selectedRepo.langs} />
            </>
          )}

          <div className="detail-stats">
            <div>
              <b>{(selectedRepo.stars || 0).toLocaleString()}</b>
              <span>Stars</span>
            </div>
            <div>
              <b>{(selectedRepo.forks || 0).toLocaleString()}</b>
              <span>Forks</span>
            </div>
            <div>
              <b>{selectedRepo.updated}</b>
              <span>Last update</span>
            </div>
          </div>

          {selectedRepo.topics && selectedRepo.topics.length > 0 && (
            <div className="chips mt">
              {selectedRepo.topics.map((t) => (
                <span key={t} className="topic">
                  {t}
                </span>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export default MyRepositories;
