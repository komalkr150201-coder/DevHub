import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../services/api.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { SkillBadge } from '../components/SkillBadge.jsx';
import { LanguageChart } from '../components/LanguageChart.jsx';
import { ContributionHeatmap } from '../components/ContributionHeatmap.jsx';
import {
  RefreshCw,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Globe,
  Linkedin,
  Github,
  Pin,
  Sparkles,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, repos, skills, refreshUser, setRepos } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const publicUrl = `${window.location.origin}/${user?.username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncGitHub = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await userAPI.syncGitHub();
      if (res.data.success) {
        await refreshUser();
        setSyncMessage('Portfolio successfully synchronized with GitHub!');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      setSyncMessage(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePin = async (repoId, isPinned) => {
    try {
      const res = await userAPI.updateRepo(repoId, { isPinned });
      if (res.data.success) {
        setRepos((prev) =>
          prev.map((r) => (r._id === repoId ? { ...r, isPinned } : r))
        );
      }
    } catch (err) {
      console.error('Failed to pin repo', err);
    }
  };

  const handleToggleHide = async (repoId, isHidden) => {
    try {
      const res = await userAPI.updateRepo(repoId, { isHidden });
      if (res.data.success) {
        setRepos((prev) =>
          prev.map((r) => (r._id === repoId ? { ...r, isHidden } : r))
        );
      }
    } catch (err) {
      console.error('Failed to hide repo', err);
    }
  };

  if (!user) return null;

  const pinnedRepos = repos.filter((r) => r.isPinned && !r.isHidden);
  const visibleRepos = repos.filter((r) => !r.isHidden);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Profile Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <img
                src={user.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                alt={user.name || user.username}
                className="w-20 h-20 rounded-2xl border-2 border-emerald-500/60 object-cover shadow-md"
              />
              {user.stats?.contributionStreak > 0 && (
                <span
                  title={`${user.stats.contributionStreak} day streak`}
                  className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-md"
                >
                  <Flame className="w-3 h-3 fill-black" />
                  <span>{user.stats.contributionStreak}d</span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user.name || user.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Verified GitHub Developer
                </span>
              </div>
              <div className="text-sm text-gray-400 font-mono mt-0.5">@{user.username}</div>

              {/* Bio */}
              <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                {user.bio || 'Add a bio to tell potential teammates about your interests and vision.'}
              </p>

              {/* External Links */}
              <div className="flex items-center space-x-3 mt-3 text-xs text-gray-400">
                {user.links?.github && (
                  <a
                    href={user.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white flex items-center space-x-1"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {user.links?.linkedin && (
                  <a
                    href={user.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-400 flex items-center space-x-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {user.links?.website && (
                  <a
                    href={user.links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 flex items-center space-x-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleSyncGitHub}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-200 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>

            <Link
              to="/dashboard/edit"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Portfolio</span>
            </Link>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Shareable Public URL Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#161b22] to-[#161b22] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Your Public Portfolio URL</h4>
            <p className="text-xs text-gray-400 font-mono">{publicUrl}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 transition-all flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
          </button>

          <Link
            to={`/${user.username}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#21262d] transition-colors"
            title="Preview Live Page"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats and Heatmap */}
      <ContributionHeatmap stats={user.stats} />

      {/* Languages Breakdown */}
      <LanguageChart repos={repos} />

      {/* Verified Skills Profile */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Verified Skill Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Inferred from code bytes, repo stars, and recency in your public repositories.
            </p>
          </div>
          <Link
            to="/dashboard/edit"
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Manage Skills
          </Link>
        </div>

        {skills && skills.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {skills.map((skill, idx) => (
              <SkillBadge
                key={idx}
                name={skill.name}
                weight={skill.weight}
                source={skill.source}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            No skills detected yet. Click "Sync GitHub" above to analyze your repositories.
          </div>
        )}
      </div>

      {/* Pinned / Top Repositories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pin className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Featured Repositories</h2>
          </div>
          <span className="text-xs text-gray-400">
            {pinnedRepos.length > 0 ? `${pinnedRepos.length} pinned` : `${visibleRepos.length} total repositories`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(pinnedRepos.length > 0 ? pinnedRepos : visibleRepos.slice(0, 6)).map((repo) => (
            <ProjectCard
              key={repo._id}
              repo={repo}
              isOwner={true}
              onTogglePin={handleTogglePin}
              onToggleHide={handleToggleHide}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
