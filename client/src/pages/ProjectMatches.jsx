import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../services/api.js';
import { MatchCard } from '../components/MatchCard.jsx';
import { CollaborateModal } from '../components/CollaborateModal.jsx';
import {
  FolderGit2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';

export const ProjectMatches = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collaborate modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchProjectAndMatches();
  }, [id]);

  const fetchProjectAndMatches = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getProjectMatches(id);
      if (res.data.success) {
        setProject(res.data.project);
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCollaborate = (candidate) => {
    setTargetCandidate(candidate);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Ranking candidate teammates for this project...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-400 text-sm">{error || 'Project not found'}</p>
        <Link to="/projects" className="text-xs text-emerald-400 hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <Link
        to="/projects"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Project Overview Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#21262d]">
          <div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono mb-1">
              <FolderGit2 className="w-4 h-4" />
              <span>PROJECT REQUIREMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{project.title}</h1>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-sm text-gray-300 my-5 leading-relaxed">{project.description}</p>

        {/* Required Skills & Nice to Have */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-400">Target Stack:</span>
            {project.requiredSkills.map((req, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
              >
                {req.name} (Imp: {req.importance})
              </span>
            ))}
          </div>

          {project.niceToHave && project.niceToHave.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-400">Nice to Have:</span>
              {project.niceToHave.map((nth, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30"
                >
                  {nth}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ranked Matches Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Recommended Teammates</h2>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          Ranked by skill fit percentage
        </span>
      </div>

      {/* Match Cards Grid */}
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((cand, idx) => (
            <MatchCard
              key={idx}
              match={cand}
              onOpenCollaborate={openCollaborate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-gray-400">
          No candidates found matching this project's required skills.
        </div>
      )}

      {/* Collaborate Modal */}
      <CollaborateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetUser={targetCandidate}
        onSuccess={(msg) => setToastMessage(msg)}
      />
    </div>
  );
};
