import React, { useState, useEffect } from 'react';
import { requestAPI, projectAPI } from '../services/api.js';
import { X, Send, Sparkles } from 'lucide-react';

export const CollaborateModal = ({ isOpen, onClose, targetUser, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMessage(`Hey @${targetUser?.username || 'developer'}, I saw your verified skills on DevHub and would love to collaborate on a project!`);
      // Load user's open projects
      projectAPI
        .getProjects({ myProjects: true, status: 'open' })
        .then((res) => {
          if (res.data.success) {
            setMyProjects(res.data.projects || []);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await requestAPI.sendRequest({
        receiverId: targetUser.user?._id || targetUser._id,
        projectId: projectId || null,
        message: message.trim(),
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={targetUser.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
              alt={targetUser.username}
              className="w-8 h-8 rounded-full border border-emerald-500"
            />
            <div>
              <h3 className="font-bold text-white text-sm">
                Collaborate with @{targetUser.username}
              </h3>
              <p className="text-xs text-gray-400">Send an invitation to connect & team up</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Optional Project Attachment */}
          {myProjects.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Attach Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- No project attached (General connect) --</option>
                {myProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message textarea */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Personalized Note
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself, your idea, and why their skills are a great fit..."
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="bg-[#0d1117] p-3 rounded-xl border border-[#21262d] flex items-center space-x-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Once accepted, contact details (verified email & social links) will be unlocked for both developers!
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#21262d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
