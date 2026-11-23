import React, { useState, useEffect } from 'react';
import { requestAPI } from '../services/api.js';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  Mail,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const Requests = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await requestAPI.getRequests();
      if (res.data.success) {
        setIncoming(res.data.incoming || []);
        setOutgoing(res.data.outgoing || []);
      }
    } catch (err) {
      console.error('Failed to load collaboration requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    setActionLoading(requestId);
    try {
      const res = await requestAPI.updateRequestStatus(requestId, status);
      if (res.data.success) {
        await fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating request');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'accepted') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>Connected</span>
        </span>
      );
    }
    if (status === 'declined') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center space-x-1">
          <X className="w-3 h-3" />
          <span>Declined</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
        <Clock className="w-3 h-3" />
        <span>Pending</span>
      </span>
    );
  };

  const displayedList = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="pb-6 border-b border-[#30363d]">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
          <Inbox className="w-4 h-4" />
          <span>COLLABORATION INBOX</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Collaboration Requests</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage invitations to team up for projects, hackathons, and open source.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#21262d]">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'incoming'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Requests</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-[#21262d] text-gray-300 font-mono">
            {incoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'outgoing'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent Invitations</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-[#21262d] text-gray-300 font-mono">
            {outgoing.length}
          </span>
        </button>
      </div>

      {/* Request list */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading requests...</span>
        </div>
      ) : displayedList.length > 0 ? (
        <div className="space-y-4">
          {displayedList.map((req) => {
            const partner = activeTab === 'incoming' ? req.senderId : req.receiverId;
            if (!partner) return null;

            return (
              <div
                key={req._id}
                className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 transition-all hover:border-gray-500 space-y-4 shadow-lg"
              >
                {/* Header: Partner info and status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={partner.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                      alt={partner.username}
                      className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">
                          {partner.name || partner.username}
                        </span>
                        <a
                          href={`/${partner.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 font-mono hover:underline flex items-center space-x-0.5"
                        >
                          <span>@{partner.username}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {partner.bio || 'Developer on DevHub'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-gray-500 font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Optional Attached Project */}
                {req.projectId && (
                  <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-xs">
                    <span className="text-gray-400 font-semibold mr-1.5">Project:</span>
                    <span className="text-emerald-400 font-bold">{req.projectId.title}</span>
                  </div>
                )}

                {/* Message */}
                <div className="p-4 rounded-xl bg-[#0d1117] border border-[#21262d] text-sm text-gray-200 leading-relaxed font-sans">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 mb-1 font-mono">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Personal note:</span>
                  </div>
                  "{req.message}"
                </div>

                {/* Revealed Contact Details on Acceptance (Section 8.6) */}
                {req.status === 'accepted' && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2 animate-fade-in">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Collaboration Accepted! Contact Details Unlocked:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                      {partner.email && (
                        <a
                          href={`mailto:${partner.email}`}
                          className="flex items-center space-x-1.5 hover:text-white"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{partner.email}</span>
                        </a>
                      )}
                      {partner.links?.linkedin && (
                        <a
                          href={partner.links.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 hover:text-blue-400"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {partner.links?.github && (
                        <a
                          href={partner.links.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 hover:text-white"
                        >
                          <Github className="w-3.5 h-3.5 text-gray-300" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {partner.links?.website && (
                        <a
                          href={partner.links.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 hover:text-emerald-400"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Portfolio</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Incoming actions: Accept / Decline */}
                {activeTab === 'incoming' && req.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'declined')}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-red-400 hover:bg-[#21262d] transition-colors"
                    >
                      Decline
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(req._id, 'accepted')}
                      disabled={actionLoading === req._id}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-600/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Invitation</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-gray-400">
          No {activeTab} collaboration requests at the moment.
        </div>
      )}
    </div>
  );
};
