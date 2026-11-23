import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api.js';
import { FolderPlus, ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react';

export const PostProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([
    { name: 'React', importance: 3 },
    { name: 'Node.js', importance: 3 },
  ]);
  const [niceToHave, setNiceToHave] = useState(['TypeScript']);

  const [newSkill, setNewSkill] = useState('');
  const [newImportance, setNewImportance] = useState(3);
  const [newNiceToHave, setNewNiceToHave] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddRequired = () => {
    if (!newSkill.trim()) return;
    if (!requiredSkills.some((s) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      setRequiredSkills([
        ...requiredSkills,
        { name: newSkill.trim(), importance: parseInt(newImportance, 10) || 3 },
      ]);
      setNewSkill('');
    }
  };

  const handleRemoveRequired = (index) => {
    setRequiredSkills(requiredSkills.filter((_, idx) => idx !== index));
  };

  const handleAddNiceToHave = () => {
    if (!newNiceToHave.trim()) return;
    if (!niceToHave.some((s) => s.toLowerCase() === newNiceToHave.trim().toLowerCase())) {
      setNiceToHave([...niceToHave, newNiceToHave.trim()]);
      setNewNiceToHave('');
    }
  };

  const handleRemoveNiceToHave = (index) => {
    setNiceToHave(niceToHave.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || requiredSkills.length === 0) {
      setError('Please provide a title, description, and at least one required skill');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await projectAPI.createProject({
        title: title.trim(),
        description: description.trim(),
        requiredSkills,
        niceToHave,
      });

      if (res.data.success) {
        // Redirect to project matches page
        navigate(`/projects/${res.data.project._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex items-center space-x-3 pb-6 border-b border-[#21262d] mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Post a Team Requirement</h1>
            <p className="text-xs text-gray-400">
              DevHub will automatically rank developers in the network to match your project needs.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Project Title or Hackathon Need
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Collaboration Canvas for Hackathon 2026"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Description & Teammate Responsibilities
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your architecture, goals, and what you're looking for in a collaborator..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Required Skills */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300">
              Required Skills (Importance 1 to 5)
            </label>

            <div className="flex flex-wrap gap-2.5">
              {requiredSkills.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-emerald-500/40 text-xs"
                >
                  <span className="font-bold text-white">{req.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    (Imp: {req.importance})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequired(idx)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequired())}
                placeholder="Add skill (e.g. React, Go, Docker)..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value)}
                className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    Imp {v}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddRequired}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Nice to have */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-blue-400">
              Nice-to-Have Skills
            </label>

            <div className="flex flex-wrap gap-2">
              {niceToHave.map((nth, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs"
                >
                  <span>{nth}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNiceToHave(idx)}
                    className="hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newNiceToHave}
                onChange={(e) => setNewNiceToHave(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNiceToHave())}
                placeholder="Add nice-to-have skill..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddNiceToHave}
                className="px-4 py-2 rounded-xl text-xs font-medium text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-[#21262d] flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Posting...' : 'Post Project & Match Teammates'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
