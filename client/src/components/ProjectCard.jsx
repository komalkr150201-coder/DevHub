import React from 'react';
import { Star, GitFork, Pin, EyeOff, ExternalLink, Calendar } from 'lucide-react';

export const ProjectCard = ({ repo, isOwner = false, onTogglePin, onToggleHide }) => {
  const formattedDate = repo.pushedAt
    ? new Date(repo.pushedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`group relative rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        repo.isPinned
          ? 'bg-gradient-to-b from-[#161b22] to-[#12161f] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
          : 'bg-[#161b22] border-[#30363d] hover:border-gray-500'
      } ${repo.isHidden ? 'opacity-50' : ''}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-base text-white group-hover:text-emerald-400 transition-colors">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center space-x-1"
              >
                <span>{repo.name}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </h3>
            {repo.isPinned && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Pin className="w-2.5 h-2.5" />
                <span>Pinned</span>
              </span>
            )}
          </div>

          {/* Owner Quick Actions */}
          {isOwner && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onTogglePin(repo._id, !repo.isPinned)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  repo.isPinned
                    ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                }`}
                title={repo.isPinned ? 'Unpin project' : 'Pin to top of portfolio'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleHide(repo._id, !repo.isHidden)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  repo.isHidden
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                }`}
                title={repo.isHidden ? 'Unhide project' : 'Hide from public portfolio'}
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 line-clamp-2 mb-4">
          {repo.description || 'No description provided.'}
        </p>

        {/* Framework & Topic Chips */}
        {((repo.frameworks && repo.frameworks.length > 0) || (repo.topics && repo.topics.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(repo.frameworks || []).slice(0, 3).map((fw, idx) => (
              <span
                key={`fw-${idx}`}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                {fw}
              </span>
            ))}
            {(repo.topics || []).slice(0, 3).map((tp, idx) => (
              <span
                key={`tp-${idx}`}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-800 text-gray-400 border border-gray-700"
              >
                #{tp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Languages, Stars, Forks, Date */}
      <div className="pt-3 border-t border-[#21262d] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          {repo.languages && repo.languages.length > 0 && (
            <div className="flex items-center space-x-1.5 font-medium text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>{repo.languages[0].name}</span>
            </div>
          )}

          <div className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
            <Star className="w-3.5 h-3.5" />
            <span>{repo.stars || 0}</span>
          </div>

          <div className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
            <GitFork className="w-3.5 h-3.5" />
            <span>{repo.forks || 0}</span>
          </div>
        </div>

        {formattedDate && (
          <div className="flex items-center space-x-1 text-[11px]">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
