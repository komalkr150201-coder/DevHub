import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth,
  calculateSkillOverlap
} from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Icon } from '../components/Icons';
import { MatchRing } from '../components/MatchRing';
import { SkillChip } from '../components/SkillChip';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';

export function FindDevelopers() {
  const {
    mySkillNames,
    requests,
    sendRequest,
    skills,
    developersList,
    fetchRealDeveloper,
    toast
  } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortOrder, setSortOrder] = useState('match');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Live GitHub import search
  const [importHandle, setImportHandle] = useState('');
  const [fetchingUser, setFetchingUser] = useState(false);

  // Collaboration modal state
  const [targetDev, setTargetDev] = useState(null);
  const [collabProject, setCollabProject] = useState('');
  const [collabMessage, setCollabMessage] = useState('');

  // All unique skills from all developers
  const allSkills = useMemo(() => {
    return Array.from(new Set(developersList.flatMap((d) => d.skills))).sort();
  }, [developersList]);

  // Set of usernames where user already sent a pending/accepted request
  const activeSentUsernames = useMemo(() => {
    return new Set(
      requests
        .filter((r) => r.direction === 'sent' && r.status !== 'rejected')
        .map((r) => r.username.toLowerCase())
    );
  }, [requests]);

  // Filter & calculate overlap
  const filteredDevs = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, '');
    return developersList.map((dev) => ({
      ...dev,
      ...calculateSkillOverlap(mySkillNames, dev.skills)
    }))
      .filter((dev) => {
        if (!q) return true;
        return (
          dev.name.toLowerCase().includes(q) ||
          dev.role.toLowerCase().includes(q) ||
          dev.username.toLowerCase().includes(q) ||
          dev.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .filter((dev) => {
        if (!selectedSkills.length) return true;
        return selectedSkills.every((s) => dev.skills.includes(s));
      })
      .filter((dev) => {
        if (!onlyOpen) return true;
        return dev.open;
      })
      .sort((a, b) => {
        if (sortOrder === 'match') return b.percent - a.percent;
        if (sortOrder === 'stars') return (b.stars || 0) - (a.stars || 0);
        return a.name.localeCompare(b.name);
      });
  }, [query, selectedSkills, sortOrder, onlyOpen, mySkillNames, developersList]);

  const toggleSkillFilter = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFetchRealUser = async (e) => {
    e.preventDefault();
    if (!importHandle.trim()) return;

    setFetchingUser(true);
    const clean = importHandle.trim().replace(/^@/, '');
    const result = await fetchRealDeveloper(clean);
    setFetchingUser(false);

    if (result) {
      toast(`Fetched real GitHub developer @${result.username}!`, 'success');
      setImportHandle('');
    } else {
      toast(`Could not find developer @${importHandle}`, 'error');
    }
  };

  const handleLookupQuery = async () => {
    const clean = query.trim().replace(/^@/, '');
    if (!clean) return;
    setFetchingUser(true);
    const result = await fetchRealDeveloper(clean);
    setFetchingUser(false);
    if (result) {
      toast(`Fetched real GitHub developer @${result.username}!`, 'success');
    } else {
      toast(`Could not find developer @${clean} on GitHub`, 'error');
    }
  };

  const openCollabModal = (dev) => {
    setTargetDev(dev);
    setCollabProject('');
    setCollabMessage(
      `Hi ${dev.name.split(' ')[0]}, I came across your profile on DevHub and our skills fit well. Would you like to collaborate on an open-source project?`
    );
  };

  const handleSendRequest = () => {
    if (targetDev && collabMessage.trim()) {
      sendRequest(targetDev, collabMessage.trim(), collabProject.trim());
      setTargetDev(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Find Real-World Developers"
        text={`Matches are based on your ${skills.length} verified skills. Discover teammates building on GitHub.`}
      />

      {/* Real-time GitHub User Importer Card */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(56, 189, 248, 0.08))',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}
      >
        <div className="between wrap gap">
          <div>
            <h4 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="github" size={18} /> Fetch ANY Real GitHub Developer
            </h4>
            <p className="muted small" style={{ margin: 0 }}>
              Type any public GitHub username (e.g. <code>gaearon</code>, <code>sindresorhus</code>, <code>shadcn</code>, <code>torvalds</code>) to import their real profile and repos.
            </p>
          </div>

          <form onSubmit={handleFetchRealUser} style={{ display: 'flex', gap: 8 }}>
            <div className="input-group" style={{ width: 280 }}>
              <input
                value={importHandle}
                onChange={(e) => setImportHandle(e.target.value)}
                placeholder="Enter GitHub username..."
              />
              <Button type="submit" size="sm" loading={fetchingUser}>
                Fetch
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role or skill"
            aria-label="Search developers"
          />
        </label>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="Sort developers"
        >
          <option value="match">Best match</option>
          <option value="stars">Most stars</option>
          <option value="name">Name A-Z</option>
        </select>

        <label className="check">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />{' '}
          Open to collaborate
        </label>
      </div>

      {/* Skill Filters */}
      <div className="filter-box">
        <div className="between">
          <strong className="small">
            Filter by skills{' '}
            {selectedSkills.length > 0 && (
              <span className="muted">({selectedSkills.length} selected)</span>
            )}
          </strong>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              className="link"
              onClick={() => setSelectedSkills([])}
            >
              Clear
            </button>
          )}
        </div>
        <div className="chips">
          {allSkills.map((s) => (
            <SkillChip
              key={s}
              active={selectedSkills.includes(s)}
              onClick={() => toggleSkillFilter(s)}
            >
              {s}
            </SkillChip>
          ))}
        </div>
      </div>

      <p className="muted small">
        {filteredDevs.length} verified developer{filteredDevs.length === 1 ? '' : 's'} found
      </p>

      {/* Developer Grid */}
      {filteredDevs.length === 0 ? (
        <EmptyState
          title={query.trim() ? `No developer found for "${query}"` : "No developers match"}
          text={
            query.trim()
              ? `Would you like to fetch @${query.trim().replace(/^@/, '')} directly from GitHub?`
              : "Remove a skill filter or fetch a new GitHub username above."
          }
          action={
            query.trim() ? (
              <Button
                loading={fetchingUser}
                icon="github"
                onClick={handleLookupQuery}
              >
                Fetch @{query.trim().replace(/^@/, '')} from GitHub
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setSelectedSkills([]);
                  setOnlyOpen(false);
                }}
              >
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className="dev-grid">
          {filteredDevs.map((dev) => {
            const hasSent = activeSentUsernames.has(dev.username.toLowerCase());

            return (
              <article key={dev.id || dev.username} className="card dev-card">
                <div className="row gap">
                  {dev.avatarUrl ? (
                    <img
                      src={dev.avatarUrl}
                      alt={dev.name}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--line)'
                      }}
                    />
                  ) : (
                    <Avatar name={dev.name} size={52} />
                  )}
                  <div className="grow">
                    <strong>{dev.name}</strong>
                    <p className="muted small">{dev.role}</p>
                    <p className="muted small">
                      <Icon name="map" size={12} /> {dev.location} &nbsp;·&nbsp;{' '}
                      <a
                        href={`https://github.com/${dev.username}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="link small"
                        style={{ color: 'var(--mut)' }}
                      >
                        @{dev.username} <Icon name="external" size={10} />
                      </a>
                    </p>
                  </div>
                  <MatchRing percent={dev.percent} />
                </div>

                <div>
                  <p className="small muted">
                    Shared skills ({dev.shared.length})
                  </p>
                  <div className="chips">
                    {dev.skills.slice(0, 6).map((s) => (
                      <SkillChip
                        key={s}
                        tone={dev.shared.includes(s) ? 'match' : undefined}
                      >
                        {s}
                      </SkillChip>
                    ))}
                    {dev.skills.length > 6 && (
                      <span className="muted small">
                        +{dev.skills.length - 6}
                      </span>
                    )}
                  </div>
                </div>

                <div className="between small">
                  {dev.open ? (
                    <Badge tone="green">Open to collaborate</Badge>
                  ) : (
                    <span className="muted">Not looking</span>
                  )}
                  <span className="muted">
                    <Icon name="star" size={12} /> {(dev.stars || 0).toLocaleString()} &nbsp;·&nbsp;{' '}
                    <Icon name="github" size={12} /> {dev.repos} repos
                  </span>
                </div>

                <p className="muted small clamp2">{dev.bio}</p>

                <div className="row gap">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/u/${dev.username}`)}
                  >
                    View profile
                  </Button>
                  <Button
                    size="sm"
                    icon="mail"
                    disabled={hasSent}
                    onClick={() => openCollabModal(dev)}
                  >
                    {hasSent ? 'Request sent' : 'Collaborate'}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Collaboration Request Modal */}
      {targetDev && (
        <Modal
          title={`Collaborate with ${targetDev.name}`}
          onClose={() => setTargetDev(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setTargetDev(null)}>
                Cancel
              </Button>
              <Button icon="mail" onClick={handleSendRequest}>
                Send request
              </Button>
            </>
          }
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendRequest();
            }}
          >
            <FormField
              label="Project or topic"
              id="req-p"
              hint="e.g. Open-source design system, Hackathon team"
            >
              <input
                id="req-p"
                value={collabProject}
                onChange={(e) => setCollabProject(e.target.value)}
                placeholder="What do you want to build together?"
                autoFocus
              />
            </FormField>

            <FormField label="Message" id="req-m">
              <textarea
                id="req-m"
                rows={4}
                required
                value={collabMessage}
                onChange={(e) => setCollabMessage(e.target.value)}
              />
            </FormField>
          </form>
        </Modal>
      )}
    </>
  );
}

export default FindDevelopers;
