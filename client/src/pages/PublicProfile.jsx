import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { SkillBadge } from '../components/SkillBadge.jsx';
import { LanguageChart } from '../components/LanguageChart.jsx';
import { ContributionHeatmap } from '../components/ContributionHeatmap.jsx';
import { CollaborateModal } from '../components/CollaborateModal.jsx';
import {
  MessageSquarePlus,
  Github,
  Linkedin,
  Globe,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

export const PublicProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal and toast state
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userAPI.getPublicProfile(username);
      if (res.data.success) {
        setProfileUser(res.data.user);
        setRepos(res.data.repos || []);
        setSkills(res.data.skills || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Developer profile not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Loading @{username}'s living portfolio...</span>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <p className="text-sm text-gray-400">{error || 'This user does not exist or has set their profile to private.'}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
        >
          Explore DevHub
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.username === profileUser.username;
  const pinnedRepos = repos.filter((r) => r.isPinned && !r.isHidden);
  const visibleRepos = repos.filter((r) => !r.isHidden);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profileUser.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                alt={profileUser.name || profileUser.username}
                className="w-24 h-24 rounded-2xl border-2 border-emerald-500 object-cover shadow-xl"
              />
              {profileUser.stats?.contributionStreak > 0 && (
                <span
                  title={`${profileUser.stats.contributionStreak} day streak`}
                  className="absolute -bottom-2 -right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-md"
                >
                  <Flame className="w-3 h-3 fill-black" />
                  <span>{profileUser.stats.contributionStreak}d</span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profileUser.name || profileUser.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Verified Developer
                </span>
              </div>
              <div className="text-sm text-gray-400 font-mono mt-0.5">@{profileUser.username}</div>

              {/* Bio */}
              <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                {profileUser.bio || 'Developer on DevHub.'}
              </p>

              {/* Social / External links */}
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                {profileUser.links?.github && (
                  <a
                    href={profileUser.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white flex items-center space-x-1"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profileUser.links?.linkedin && (
                  <a
                    href={profileUser.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-400 flex items-center space-x-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profileUser.links?.website && (
                  <a
                    href={profileUser.links.website}
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
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] transition-all flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            {!isSelf && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Collaborate</span>
              </button>
            )}
          </div>
        </div>

        {/* Availability Badges */}
        {profileUser.availability && profileUser.availability.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#21262d] flex items-center flex-wrap gap-2 text-xs">
            <span className="text-gray-400 font-semibold mr-1">Open to:</span>
            {profileUser.availability.map((av, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg font-medium capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              >
                {av}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats and Heatmap */}
      <ContributionHeatmap stats={profileUser.stats} />

      {/* Languages breakdown */}
      <LanguageChart repos={repos} />

      {/* Verified Skills Profile */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Verified Skill Profile</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Skill weights inferred from GitHub repositories and code analysis.
          </p>
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
          <div className="text-center py-6 text-xs text-gray-400">
            No verified skills listed.
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          {pinnedRepos.length > 0 ? 'Featured Projects' : 'Repositories'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(pinnedRepos.length > 0 ? pinnedRepos : visibleRepos).map((repo) => (
            <ProjectCard
              key={repo._id}
              repo={repo}
              isOwner={false}
            />
          ))}
        </div>
      </div>

      {/* Collaborate Modal */}
      <CollaborateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetUser={profileUser}
        onSuccess={(msg) => setToastMessage(msg)}
      />
    </div>
  );
};
