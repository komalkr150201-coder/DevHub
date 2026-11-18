import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth,
  copyToClipboard,
  getPublicProfileUrl
} from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';

/**
 * Client-side image resizing and encoding
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
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export function Settings() {
  const {
    settings,
    saveSettings,
    profile,
    updateProfile,
    github,
    setGithubConnected,
    logout,
    toast
  } = useAuth();
  const navigate = useNavigate();

  const [formSettings, setFormSettings] = useState(settings);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please choose a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      const dataUrl = await resizeAndEncodeImage(file, 400);
      await updateProfile({ avatarUrl: dataUrl });
      toast('Profile photo updated successfully!', 'success');
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetToGitHub = async () => {
    const ghUrl = `https://avatars.githubusercontent.com/${profile.username}`;
    await updateProfile({ avatarUrl: ghUrl });
    toast('Reset to official GitHub profile picture', 'info');
  };

  const handleRemovePhoto = async () => {
    await updateProfile({ avatarUrl: '' });
    toast('Profile photo removed', 'info');
  };

  const isDirty = JSON.stringify(formSettings) !== JSON.stringify(settings);

  const handleToggle = (key) => (val) => {
    setFormSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    saveSettings(formSettings);
  };

  const handleReset = () => {
    setFormSettings(settings);
  };

  const profileUrl = getPublicProfileUrl(profile.username);

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(profileUrl);
    toast(ok ? 'Link copied' : 'Copy failed', ok ? 'success' : 'error');
  };

  const handleDeleteAccount = () => {
    logout();
    toast('Account deleted (demo)', 'info');
    navigate('/');
  };

  return (
    <>
      <PageHeader
        title="Settings"
        text="Manage profile visibility and account preferences."
        actions={
          <>
            <Button
              variant="ghost"
              disabled={!isDirty}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              disabled={!isDirty}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </>
        }
      />

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* Profile Picture & Avatar */}
      <Card
        title="Profile picture"
        subtitle="Upload a custom avatar or sync with GitHub"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div
            className="avatar-uploader"
            title="Click to choose a photo"
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
              <span>Change</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <strong style={{ fontSize: '1rem', display: 'block', marginBottom: 4 }}>
              {profile.name} (@{profile.username})
            </strong>
            <p className="muted small" style={{ marginBottom: 12 }}>
              Choose a PNG, JPG, or WebP photo up to 8MB. Images are automatically cropped and optimized for crisp display.
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
                Upload Photo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleResetToGitHub}
              >
                Use GitHub Photo
              </Button>
              {profile.avatarUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleRemovePhoto}
                  style={{ color: 'var(--red)' }}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Visibility */}
      <Card
        title="Profile visibility"
        subtitle="Control who can see your public portfolio"
      >
        <div
          className="radio-cards"
          role="radiogroup"
          aria-label="Profile visibility"
        >
          {[
            [
              'public',
              'globe',
              'Public',
              'Anyone with the link can view. Appears in search.'
            ],
            [
              'private',
              'lock',
              'Private',
              'Only you can see your profile.'
            ]
          ].map(([mode, iconName, label, desc]) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={formSettings.visibility === mode}
              className={`radio-card ${formSettings.visibility === mode ? 'on' : ''}`}
              onClick={() =>
                setFormSettings((prev) => ({
                  ...prev,
                  visibility: mode,
                  listInSearch: mode === 'public' ? prev.listInSearch : false
                }))
              }
            >
              <Icon name={iconName} size={20} />
              <strong>{label}</strong>
              <span className="muted small">{desc}</span>
            </button>
          ))}
        </div>

        <div className="toggles">
          <ToggleSwitch
            id="t-email"
            label="Show email on public profile"
            description="Visitors can see and copy your email."
            checked={formSettings.showEmail}
            onChange={handleToggle('showEmail')}
          />
          <ToggleSwitch
            id="t-repos"
            label="Show repositories"
            description="Display pinned GitHub repositories."
            checked={formSettings.showRepos}
            onChange={handleToggle('showRepos')}
          />
          <ToggleSwitch
            id="t-levels"
            label="Show skill levels"
            description="Show proficiency bars, not just skill names."
            checked={formSettings.showSkillLevels}
            onChange={handleToggle('showSkillLevels')}
          />
          <ToggleSwitch
            id="t-search"
            label="Appear in Find Developers"
            description="Let others discover you by skills."
            checked={formSettings.listInSearch && formSettings.visibility === 'public'}
            onChange={(val) => {
              if (formSettings.visibility === 'public') {
                handleToggle('listInSearch')(val);
              } else {
                toast('Make your profile public first', 'error');
              }
            }}
          />
        </div>
      </Card>

      {/* Collaboration Preferences */}
      <Card
        title="Collaboration"
        subtitle="How others can reach you"
      >
        <div className="toggles">
          <ToggleSwitch
            id="t-open"
            label="Open to collaborate"
            description="Show the green badge and accept new requests."
            checked={formSettings.openToCollab}
            onChange={handleToggle('openToCollab')}
          />
          <ToggleSwitch
            id="t-mail"
            label="Email me about new requests"
            checked={formSettings.emailRequests}
            onChange={handleToggle('emailRequests')}
          />
          <ToggleSwitch
            id="t-digest"
            label="Weekly digest"
            description="A summary of matches and profile views."
            checked={formSettings.weeklyDigest}
            onChange={handleToggle('weeklyDigest')}
          />
        </div>
      </Card>

      {/* Account Settings */}
      <Card
        title="Account"
        subtitle="Your profile link and connected services"
      >
        <FormField
          label="Profile URL"
          id="st-url"
          hint="Share this link on your CV or LinkedIn."
        >
          <div className="input-group">
            <input
              id="st-url"
              readOnly
              value={profileUrl}
              onFocus={(e) => e.target.select()}
            />
            <Button
              variant="secondary"
              icon="copy"
              onClick={handleCopyLink}
            >
              Copy
            </Button>
          </div>
        </FormField>

        <div className="gh-row">
          <Icon name="github" size={22} />
          <div className="grow">
            <strong>GitHub</strong>
            <p className="muted small">
              {github.connected
                ? `Connected as @${profile.username} · synced ${github.lastSync}`
                : 'Not connected'}
            </p>
          </div>
          <Badge tone={github.connected ? 'green' : 'default'}>
            {github.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGithubConnected(!github.connected)}
          >
            {github.connected ? 'Disconnect' : 'Reconnect'}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card title="Danger zone" className="danger">
        <div className="between wrap gap">
          <div>
            <strong>Delete account</strong>
            <p className="muted small">
              Removes your portfolio and requests. This cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            icon="trash"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete your account?"
          width={440}
          onClose={() => setShowDeleteModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount}>
                Yes, delete
              </Button>
            </>
          }
        >
          <p>
            This is a demo, so no real data is removed. In a live app this would permanently delete your DevHub portfolio and collaboration history.
          </p>
        </Modal>
      )}
    </>
  );
}

export default Settings;
