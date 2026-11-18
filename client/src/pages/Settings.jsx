import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth,
  copyToClipboard,
  getPublicProfileUrl
} from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { FormField } from '../components/FormField';
import { Modal } from '../components/Modal';

export function Settings() {
  const {
    settings,
    saveSettings,
    profile,
    github,
    setGithubConnected,
    logout,
    toast
  } = useAuth();
  const navigate = useNavigate();

  const [formSettings, setFormSettings] = useState(settings);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
