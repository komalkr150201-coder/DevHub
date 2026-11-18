import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { LangDot } from '../components/LangDot';
import { SkillChip } from '../components/SkillChip';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';

function AddProjectModalContent({ onSave, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tech: '',
    link: ''
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title.trim()) {
      onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        link: form.link.trim(),
        tech: form.tech
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <FormField label="Project title" id="pj-t">
        <input
          id="pj-t"
          required
          value={form.title}
          onChange={handleChange('title')}
          autoFocus
        />
      </FormField>

      <FormField label="Description" id="pj-d">
        <textarea
          id="pj-d"
          rows={3}
          value={form.description}
          onChange={handleChange('description')}
        />
      </FormField>

      <FormField
        label="Technologies"
        id="pj-k"
        hint="Separate with commas, e.g. React, Node.js"
      >
        <input
          id="pj-k"
          value={form.tech}
          onChange={handleChange('tech')}
        />
      </FormField>

      <FormField label="Link" id="pj-l">
        <input
          id="pj-l"
          type="url"
          placeholder="https://"
          value={form.link}
          onChange={handleChange('link')}
        />
      </FormField>

      <div className="row gap end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add project</Button>
      </div>
    </form>
  );
}

export function MyPortfolio() {
  const {
    profile,
    updateProfile,
    skills,
    repos,
    projects,
    addProject,
    removeProject,
    togglePin
  } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [showAddProject, setShowAddProject] = useState(false);

  const pinnedRepos = repos.filter((r) => r.pinned);

  const handleFieldChange = (field) => (e) =>
    setEditForm({ ...editForm, [field]: e.target.value });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (editForm.name.trim()) {
      updateProfile({
        name: editForm.name.trim(),
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        email: editForm.email
      });
      setIsEditing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My Portfolio"
        text="Edit what visitors see on your public profile."
        actions={
          <Button
            variant="secondary"
            icon="eye"
            onClick={() => navigate(`/u/${profile.username}`)}
          >
            Preview public page
          </Button>
        }
      />

      {/* Personal Information */}
      <Card
        title="Personal information"
        action={
          !isEditing && (
            <Button
              size="sm"
              variant="secondary"
              icon="edit"
              onClick={() => {
                setEditForm(profile);
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )
        }
      >
        {isEditing ? (
          <form className="form" onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <FormField label="Full name" id="pf-n">
                <input
                  id="pf-n"
                  required
                  value={editForm.name}
                  onChange={handleFieldChange('name')}
                />
              </FormField>
              <FormField label="Headline" id="pf-h">
                <input
                  id="pf-h"
                  value={editForm.headline}
                  onChange={handleFieldChange('headline')}
                />
              </FormField>
              <FormField label="Location" id="pf-l">
                <input
                  id="pf-l"
                  value={editForm.location}
                  onChange={handleFieldChange('location')}
                />
              </FormField>
              <FormField label="Website" id="pf-w">
                <input
                  id="pf-w"
                  value={editForm.website}
                  onChange={handleFieldChange('website')}
                />
              </FormField>
              <FormField label="Contact email" id="pf-e">
                <input
                  id="pf-e"
                  type="email"
                  value={editForm.email}
                  onChange={handleFieldChange('email')}
                />
              </FormField>
            </div>

            <FormField
              label="Bio"
              id="pf-b"
              hint={`${(editForm.bio || '').length}/400 characters`}
            >
              <textarea
                id="pf-b"
                rows={4}
                maxLength={400}
                value={editForm.bio}
                onChange={handleFieldChange('bio')}
              />
            </FormField>

            <div className="row gap end">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        ) : (
          <div className="row gap top">
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
              <h2>{profile.name}</h2>
              <p className="muted">{profile.headline}</p>
              <p className="mt">{profile.bio}</p>
              <p className="small muted mt">
                <Icon name="map" size={13} /> {profile.location} &nbsp;·&nbsp;{' '}
                <a
                  href={`https://github.com/${profile.username}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link small"
                  style={{ color: 'var(--mut)' }}
                >
                  <Icon name="github" size={13} /> @{profile.username}
                </a>{' '}
                &nbsp;·&nbsp; <Icon name="mail" size={13} /> {profile.email}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Skills */}
      <Card
        title="Skills"
        subtitle="Managed in My Skills"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/app/skills')}
          >
            Manage skills
          </Button>
        }
      >
        <div className="skill-bars">
          {skills.slice(0, 8).map((skill) => (
            <div key={skill.id} className="skill-bar-row">
              <span>{skill.name}</span>
              <ProgressBar value={skill.level} />
              <b className="small">{skill.level}%</b>
            </div>
          ))}
        </div>
      </Card>

      {/* Featured Repositories */}
      <Card
        title="Featured repositories"
        subtitle="Pinned from GitHub"
        action={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/app/repositories')}
          >
            Choose repos
          </Button>
        }
      >
        <div className="repo-grid">
          {pinnedRepos.map((repo) => (
            <article key={repo.id} className="repo-mini">
              <div className="between">
                <h4>
                  <Icon name="github" size={14} /> {repo.name}
                </h4>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Unpin ${repo.name}`}
                  onClick={() => togglePin(repo.id)}
                >
                  <Icon name="x" size={14} />
                </button>
              </div>
              <p className="muted small clamp2">{repo.description}</p>
              <div className="between small">
                <LangDot language={repo.language} />
                <span className="muted">
                  <Icon name="star" size={12} /> {repo.stars}
                </span>
              </div>
            </article>
          ))}
          {pinnedRepos.length === 0 && (
            <p className="muted">No repositories pinned yet.</p>
          )}
        </div>
      </Card>

      {/* Custom Projects */}
      <Card
        title="Custom projects"
        subtitle="Work that is not on GitHub"
        action={
          <Button
            size="sm"
            icon="plus"
            onClick={() => setShowAddProject(true)}
          >
            Add project
          </Button>
        }
      >
        {projects.length === 0 && (
          <p className="muted">No custom projects yet.</p>
        )}
        <div className="repo-grid">
          {projects.map((proj) => (
            <article key={proj.id} className="repo-mini">
              <div className="between">
                <h4>{proj.title}</h4>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${proj.title}`}
                  onClick={() => removeProject(proj.id)}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <p className="muted small">{proj.description}</p>
              <div className="chips">
                {(proj.tech || []).map((t) => (
                  <SkillChip key={t}>{t}</SkillChip>
                ))}
              </div>
              {proj.link && (
                <a
                  className="link small"
                  href={proj.link}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open project <Icon name="external" size={12} />
                </a>
              )}
            </article>
          ))}
        </div>
      </Card>

      {/* Add Project Modal */}
      {showAddProject && (
        <Modal
          title="Add a custom project"
          onClose={() => setShowAddProject(false)}
        >
          <AddProjectModalContent
            onCancel={() => setShowAddProject(false)}
            onSave={(proj) => {
              addProject(proj);
              setShowAddProject(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}

export default MyPortfolio;
