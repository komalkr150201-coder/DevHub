import React, { useState, useRef } from 'react';
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

/**
 * Client-side image resizing and WebP/JPEG encoding
 * Keeps images lightweight (max 400x400) for instant loading and MongoDB efficiency
 */
const resizeAndEncodeImage = (file, maxSize = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

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
    togglePin,
    toast
  } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [showAddProject, setShowAddProject] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef(null);
  const pinnedRepos = repos.filter((r) => r.pinned);

  const handleFieldChange = (field) => (e) =>
    setEditForm({ ...editForm, [field]: e.target.value });

  // Handle local image file upload & compression
  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file (PNG, JPG, WebP, GIF)', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast('Image file size must be less than 8MB', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      const dataUrl = await resizeAndEncodeImage(file, 400);
      setEditForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
      await updateProfile({ avatarUrl: dataUrl });
      toast('Profile photo updated successfully!', 'success');
    } catch (err) {
      toast('Failed to process image: ' + err.message, 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToGitHub = async () => {
    const ghUrl = `https://avatars.githubusercontent.com/${profile.username}`;
    setEditForm((prev) => ({ ...prev, avatarUrl: ghUrl }));
    await updateProfile({ avatarUrl: ghUrl });
    toast('Reset to official GitHub profile picture', 'info');
  };

  const handleRemoveAvatar = async () => {
    setEditForm((prev) => ({ ...prev, avatarUrl: '' }));
    await updateProfile({ avatarUrl: '' });
    toast('Profile photo removed', 'info');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (editForm.name.trim()) {
      updateProfile({
        name: editForm.name.trim(),
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        email: editForm.email,
        avatarUrl: editForm.avatarUrl || profile.avatarUrl
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

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleAvatarFileUpload}
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
            {/* Avatar section in edit mode */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px',
                background: 'var(--card2)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--line)',
                marginBottom: 16
              }}
            >
              <div
                className="avatar-uploader"
                title="Click to choose a photo"
                onClick={() => fileInputRef.current?.click()}
              >
                {editForm.avatarUrl ? (
                  <img
                    src={editForm.avatarUrl}
                    alt={editForm.name}
                    className="avatar-uploader-img"
                  />
                ) : (
                  <Avatar name={editForm.name} size={84} ring />
                )}
                <div className="avatar-uploader-overlay">
                  <Icon name="camera" size={20} />
                  <span>Change</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: 4 }}>
                  Profile Picture
                </strong>
                <p className="muted small" style={{ marginBottom: 10 }}>
                  Upload a custom photo (PNG, JPG, WebP) or keep your GitHub picture.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    icon="upload"
                    loading={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload New Image
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleResetToGitHub}
                  >
                    Use GitHub Photo
                  </Button>
                  {editForm.avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveAvatar}
                      style={{ color: 'var(--red)' }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

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
              <FormField label="Avatar Image URL (optional)" id="pf-avatar">
                <input
                  id="pf-avatar"
                  value={editForm.avatarUrl || ''}
                  onChange={handleFieldChange('avatarUrl')}
                  placeholder="https://... or upload above"
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
            <div
              className="avatar-uploader"
              title="Click to upload/change photo"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="avatar-uploader-img"
                />
              ) : (
                <Avatar name={profile.name} size={84} ring />
              )}
              <div className="avatar-uploader-overlay">
                <Icon name="camera" size={20} />
                <span>Upload</span>
              </div>
            </div>

            <div className="grow">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <h2>{profile.name}</h2>
                  <p className="muted">{profile.headline}</p>
                </div>
              </div>

              <div className="avatar-actions">
                <Button
                  size="sm"
                  variant="secondary"
                  icon="upload"
                  loading={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetToGitHub}
                >
                  Reset to GitHub
                </Button>
              </div>

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
