import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Flame, Sparkles, MessageSquarePlus, ExternalLink } from 'lucide-react';

export const MatchCard = ({ match, onOpenCollaborate }) => {
  const {
    username,
    name,
    avatarUrl,
    bio,
    availability = [],
    stats = {},
    score = 0,
    matched = [],
    missing = [],
    matchedNiceToHave = [],
    skills = [],
  } = match;

  // Score badge theme
  const getScoreTheme = (s) => {
    if (s >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40 ring-emerald-500/20';
    if (s >= 65) return 'text-teal-400 bg-teal-500/10 border-teal-500/40 ring-teal-500/20';
    if (s >= 50) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40 ring-cyan-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/40 ring-amber-500/20';
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 transition-all duration-200 hover:border-gray-500 hover:shadow-xl hover:shadow-black/30 flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar, Name, Score Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3.5">
            <Link to={`/${username}`} target="_blank" rel="noreferrer" className="relative group">
              <img
                src={avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                alt={name || username}
                className="w-13 h-13 rounded-full border-2 border-emerald-500/40 object-cover group-hover:scale-105 transition-transform"
              />
              {stats?.contributionStreak > 10 && (
                <span
                  title={`${stats.contributionStreak} day streak!`}
                  className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow"
                >
                  <Flame className="w-2.5 h-2.5 fill-black" />
                </span>
              )}
            </Link>

            <div>
              <Link
                to={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-white hover:text-emerald-400 transition-colors flex items-center space-x-1.5"
              >
                <span>{name || username}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </Link>
              <div className="text-xs text-gray-400 font-mono">@{username}</div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1.5 rounded-xl border font-mono font-extrabold text-sm flex items-center space-x-1.5 shadow-sm ring-2 ${getScoreTheme(
                score
              )}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{score}% MATCH</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
          {bio || 'Developer on DevHub with verified GitHub activity.'}
        </p>

        {/* Availability tags */}
        {availability.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {availability.map((av, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                Open to {av}
              </span>
            ))}
          </div>
        )}

        {/* Matched vs Missing Skills breakdown */}
        <div className="space-y-2 mb-4 pt-3 border-t border-[#21262d]">
          {matched.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 mr-1">Matched:</span>
              {matched.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 mr-1">Missing:</span>
              {missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#21262d] text-gray-400 border border-dashed border-gray-600"
                >
                  <X className="w-3 h-3 text-gray-500" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}

          {matchedNiceToHave.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-blue-400 mr-1">Bonus (+10%):</span>
              {matchedNiceToHave.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30"
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#21262d] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs text-gray-400">
          <span className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            <span>{stats?.totalStars || 0}</span>
          </span>
          <span>•</span>
          <span>{stats?.totalRepos || 0} repos</span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#21262d] hover:bg-[#30363d] hover:text-white transition-colors"
          >
            Profile
          </Link>

          <button
            onClick={() => onOpenCollaborate(match)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-1.5 shadow-sm shadow-emerald-600/30"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Collaborate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
