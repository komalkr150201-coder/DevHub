import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../services/api.js';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Pin,
  EyeOff,
  Check,
  Shield,
  Briefcase,
  User,
  Sliders,
} from 'lucide-react';

export const EditPortfolio = () => {
  const { user, repos, skills, refreshUser, setSkills, setRepos } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkedin, setLinkedin] = useState(user?.links?.linkedin || '');
  const [website, setWebsite] = useState(user?.links?.website || '');
  const [twitter, setTwitter] = useState(user?.links?.twitter || '');
  const [availability, setAvailability] = useState(user?.availability || []);
  const [isPublic, setIsPublic] = useState(user?.privacy?.isPublic ?? true);
  const [showEmail, setShowEmail] = useState(user?.privacy?.showEmail ?? false);

  // Skill management state
  const [editableSkills, setEditableSkills] = useState(skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillWeight, setNewSkillWeight] = useState(0.5);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);

  const toggleAvailability = (opt) => {
    if (availability.includes(opt)) {
      setAvailability(availability.filter((a) => a !== opt));
    } else {
      setAvailability([...availability, opt]);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = editableSkills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (!exists) {
      setEditableSkills([
        ...editableSkills,
        {
          name: newSkillName.trim(),
          weight: parseFloat(newSkillWeight) || 0.5,
          source: 'manual',
        },
      ]);
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (index) => {
    setEditableSkills(editableSkills.filter((_, idx) => idx !== index));
  };

  const handleWeightChange = (index, weight) => {
    const updated = [...editableSkills];
    updated[index].weight = parseFloat(weight);
    setEditableSkills(updated);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);

    try {
      // 1. Update basic profile info
      await userAPI.updateMe({
        name,
        bio,
        links: { linkedin, website, twitter },
        availability,
        privacy: { isPublic, showEmail },
      });

      // 2. Update skills
      await userAPI.updateSkills(editableSkills);

      await refreshUser();
      setSavedMessage('Profile and skills updated successfully!');
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRepoPin = async (repoId, isPinned) => {
    try {
      await userAPI.updateRepo(repoId, { isPinned });
      setRepos((prev) =>
        prev.map((r) => (r._id === repoId ? { ...r, isPinned } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRepoHide = async (repoId, isHidden) => {
    try {
      await userAPI.updateRepo(repoId, { isHidden });
      setRepos((prev) =>
        prev.map((r) => (r._id === repoId ? { ...r, isHidden } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-md shadow-emerald-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Basic Profile & Bio */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-[#21262d]">
          <User className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Basic Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              GitHub Username (Read-only)
            </label>
            <input
              type="text"
              value={user?.username}
              disabled
              className="w-full bg-[#0d1117] border border-[#21262d] rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Developer Bio
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell developers what you love building..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Portfolio / Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourdomain.dev"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Twitter / X URL
            </label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Availability & Privacy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#21262d]">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Availability Settings</h3>
          </div>

          <p className="text-xs text-gray-400">
            Select what types of collaboration you are open to:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'hackathon', label: 'Hackathons' },
              { id: 'open-source', label: 'Open-Source' },
              { id: 'freelance', label: 'Freelance' },
              { id: 'full-time', label: 'Full-Time' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleAvailability(item.id)}
                className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                  availability.includes(item.id)
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                    : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Controls (Section 13) */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#21262d]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Privacy Controls</h3>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#0d1117] border border-[#30363d] cursor-pointer">
              <div>
                <div className="font-semibold text-white">Public Profile</div>
                <div className="text-gray-400 text-[11px]">Allow others to view your public devhub.app link</div>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#0d1117] border border-[#30363d] cursor-pointer">
              <div>
                <div className="font-semibold text-white">Show Public Email</div>
                <div className="text-gray-400 text-[11px]">Reveal email on public profile without requiring connection</div>
              </div>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Manage Skills */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-[#21262d]">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Skill Management & Weights</h2>
        </div>

        <p className="text-xs text-gray-400">
          Skills are extracted automatically from your GitHub repositories. You can adjust weights or add custom self-declared skills.
        </p>

        {/* Add Skill Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-[#0d1117] border border-[#30363d]">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add new skill (e.g. GraphQL, Next.js, Redis)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400 font-mono">Weight:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={newSkillWeight}
              onChange={(e) => setNewSkillWeight(e.target.value)}
              className="w-24 accent-emerald-500"
            />
            <span className="text-xs font-mono text-emerald-400 w-10">
              {Math.round(newSkillWeight * 100)}%
            </span>

            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Skills list table/chips */}
        <div className="space-y-2">
          {editableSkills.map((skill, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-xs"
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{skill.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    skill.source === 'auto'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {skill.source}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={skill.weight}
                  onChange={(e) => handleWeightChange(idx, e.target.value)}
                  className="w-24 sm:w-32 accent-emerald-500"
                />
                <span className="font-mono text-emerald-400 w-10 text-right">
                  {Math.round(skill.weight * 100)}%
                </span>
                <button
                  onClick={() => handleRemoveSkill(idx)}
                  className="p-1 text-gray-400 hover:text-red-400"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Repositories (Pin / Hide) */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-[#21262d]">
          <Pin className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Repository Customization</h2>
        </div>

        <p className="text-xs text-gray-400">
          Pin your top projects to show them first on your portfolio, or hide repos you prefer not to display publicly.
        </p>

        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo._id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                repo.isHidden
                  ? 'bg-[#0d1117] border-[#21262d] opacity-50'
                  : repo.isPinned
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <div>
                <h4 className="font-bold text-white text-sm">{repo.name}</h4>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{repo.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleRepoPin(repo._id, !repo.isPinned)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                    repo.isPinned
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-[#21262d] text-gray-300 hover:text-white'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  <span>{repo.isPinned ? 'Pinned' : 'Pin'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleRepoHide(repo._id, !repo.isHidden)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                    repo.isHidden
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#21262d] text-gray-300 hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3 h-3" />
                  <span>{repo.isHidden ? 'Hidden' : 'Hide'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
