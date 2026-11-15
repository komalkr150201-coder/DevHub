import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useMatch } from '../hooks/useMatch.js';
import { MatchCard } from '../components/MatchCard.jsx';
import { CollaborateModal } from '../components/CollaborateModal.jsx';
import {
  Users,
  Search,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const PRESET_STACKS = [
  {
    name: 'Full-Stack MERN (Sec. 11.3)',
    required: [
      { name: 'React', importance: 3 },
      { name: 'Node.js', importance: 2 },
      { name: 'MongoDB', importance: 2 },
    ],
    niceToHave: ['TypeScript'],
  },
  {
    name: 'AI & Python Microservices',
    required: [
      { name: 'Python', importance: 5 },
      { name: 'FastAPI', importance: 4 },
      { name: 'PyTorch', importance: 3 },
    ],
    niceToHave: ['Docker'],
  },
  {
    name: 'Cloud & DevOps Architect',
    required: [
      { name: 'Docker', importance: 4 },
      { name: 'Kubernetes', importance: 4 },
      { name: 'Go', importance: 3 },
    ],
    niceToHave: ['AWS'],
  },
];

export const Discover = () => {
  const { user, skills: userSkills } = useAuth();
  const { results, loading, error, findMatches } = useMatch();

  const [requiredSkills, setRequiredSkills] = useState([
    { name: 'React', importance: 3 },
    { name: 'Node.js', importance: 2 },
    { name: 'MongoDB', importance: 2 },
  ]);
  const [niceToHave, setNiceToHave] = useState(['TypeScript']);

  const [newSkill, setNewSkill] = useState('');
  const [newImportance, setNewImportance] = useState(3);
  const [newNiceToHave, setNewNiceToHave] = useState('');

  // Collaborate modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Initial run on mount with default requirement
    findMatches(requiredSkills, niceToHave);
  }, []);

  const handleAddRequired = () => {
    if (!newSkill.trim()) return;
    if (!requiredSkills.some((s) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      const updated = [
        ...requiredSkills,
        { name: newSkill.trim(), importance: parseInt(newImportance, 10) || 3 },
      ];
      setRequiredSkills(updated);
      setNewSkill('');
      findMatches(updated, niceToHave);
    }
  };

  const handleRemoveRequired = (index) => {
    const updated = requiredSkills.filter((_, idx) => idx !== index);
    setRequiredSkills(updated);
    if (updated.length > 0) {
      findMatches(updated, niceToHave);
    }
  };

  const handleImportanceChange = (index, val) => {
    const updated = [...requiredSkills];
    updated[index].importance = parseInt(val, 10);
    setRequiredSkills(updated);
    findMatches(updated, niceToHave);
  };

  const handleAddNiceToHave = () => {
    if (!newNiceToHave.trim()) return;
    if (!niceToHave.some((s) => s.toLowerCase() === newNiceToHave.trim().toLowerCase())) {
      const updated = [...niceToHave, newNiceToHave.trim()];
      setNiceToHave(updated);
      setNewNiceToHave('');
      findMatches(requiredSkills, updated);
    }
  };

  const handleRemoveNiceToHave = (index) => {
    const updated = niceToHave.filter((_, idx) => idx !== index);
    setNiceToHave(updated);
    findMatches(requiredSkills, updated);
  };

  const applyPreset = (preset) => {
    setRequiredSkills(preset.required);
    setNiceToHave(preset.niceToHave);
    findMatches(preset.required, preset.niceToHave);
  };

  // Section 11.4: Complementary matching (find skills the searcher lacks!)
  const handleFindComplementary = () => {
    if (!userSkills || userSkills.length === 0) {
      alert('Sync your GitHub profile first to generate your skill baseline.');
      return;
    }

    // Identify user's strong skills
    const strongSkills = userSkills.filter((s) => s.weight >= 0.6).map((s) => s.name.toLowerCase());

    // If user is strong in frontend, recommend backend/devops, etc.
    let compReq = [];
    if (strongSkills.includes('react') || strongSkills.includes('javascript') || strongSkills.includes('html')) {
      compReq = [
        { name: 'Python', importance: 4 },
        { name: 'Docker', importance: 3 },
        { name: 'PostgreSQL', importance: 3 },
      ];
    } else {
      compReq = [
        { name: 'React', importance: 4 },
        { name: 'TypeScript', importance: 3 },
        { name: 'Tailwind CSS', importance: 3 },
      ];
    }

    setRequiredSkills(compReq);
    setNiceToHave(['Node.js']);
    findMatches(compReq, ['Node.js']);
  };

  const openCollaborate = (candidate) => {
    setTargetCandidate(candidate);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#30363d]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <Users className="w-4 h-4" />
            <span>INTELLIGENT TEAMMATE DISCOVERY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Find Ideal Collaborators</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Rank developers by weighted skill coverage, code similarity, and commit recency.
          </p>
        </div>

        {/* Complementary matching button */}
        {user && (
          <button
            onClick={handleFindComplementary}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 transition-all flex items-center space-x-2 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Find Complementary Teammates</span>
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Preset Stacks Pills */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        <span className="text-gray-400 font-semibold mr-1">Popular Stacks:</span>
        {PRESET_STACKS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d] transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Interactive Requirement Builder */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#21262d]">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Requirement Weights (1 - 5)</h2>
          </div>
          <span className="text-xs text-gray-400">
            Higher importance multiplies coverage weight in scoring
          </span>
        </div>

        {/* Required skills chips with importance selector */}
        <div className="flex flex-wrap gap-3">
          {requiredSkills.map((req, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0d1117] border border-emerald-500/40 text-xs"
            >
              <span className="font-bold text-white">{req.name}</span>
              <span className="text-gray-500 font-mono">|</span>
              <span className="text-[10px] text-gray-400">Imp:</span>
              <select
                value={req.importance}
                onChange={(e) => handleImportanceChange(idx, e.target.value)}
                className="bg-[#161b22] border border-[#30363d] rounded text-emerald-400 font-mono px-1.5 py-0.5 text-xs focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveRequired(idx)}
                className="text-gray-500 hover:text-red-400 ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Required Skill Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRequired()}
            placeholder="Add required skill (e.g. Docker, TypeScript, PyTorch)..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-gray-400">Importance:</span>
            <select
              value={newImportance}
              onChange={(e) => setNewImportance(e.target.value)}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  Level {v}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddRequired}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Nice to have skills row */}
        <div className="pt-4 border-t border-[#21262d] space-y-3">
          <span className="text-xs font-semibold text-blue-400">
            Nice-to-Have Skills (+10% Bonus):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {niceToHave.map((nth, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30"
              >
                <span>{nth}</span>
                <button onClick={() => handleRemoveNiceToHave(idx)} className="hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newNiceToHave}
                onChange={(e) => setNewNiceToHave(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNiceToHave()}
                placeholder="Add nice-to-have..."
                className="bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddNiceToHave}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Ranked Teammates</span>
          <span className="text-xs font-mono font-normal text-gray-400">
            ({results.length} matches found)
          </span>
        </h3>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">
            Evaluating candidate skill vectors & commit recency...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {error}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((candidate, idx) => (
            <MatchCard
              key={idx}
              match={candidate}
              onOpenCollaborate={openCollaborate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-gray-400">
          <p className="text-sm">No developers found matching the exact criteria.</p>
          <p className="text-xs text-gray-500 mt-1">Try broadening your required skills.</p>
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
