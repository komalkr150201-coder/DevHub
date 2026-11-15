import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Github,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Code2,
  Share2,
  Zap,
  Star,
  ExternalLink,
} from 'lucide-react';

export const Landing = () => {
  const { user, loginWithGitHub, loginAsDemo } = useAuth();

  // Interactive Live Matching Playground Simulator (Section 11.3)
  const [selectedSkills, setSelectedSkills] = useState(['React', 'Node.js', 'MongoDB']);
  const [activeTab, setActiveTab] = useState('demo');

  const sampleCandidates = [
    {
      name: 'Asha Sharma',
      username: 'asha',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Full-stack MERN & TypeScript engineer. Verified GitHub code author.',
      score: 87,
      coverage: 0.85,
      matched: ['React', 'Node.js', 'MongoDB'],
      missing: [],
      skills: ['React (95%)', 'Node.js (80%)', 'MongoDB (75%)', 'TypeScript (70%)'],
    },
    {
      name: 'Ravi Patel',
      username: 'ravi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Frontend architecture specialist. Strong React & Node.js, no MongoDB.',
      score: 71,
      coverage: 0.59,
      matched: ['React', 'Node.js'],
      missing: ['MongoDB'],
      skills: ['React (90%)', 'TypeScript (80%)', 'Node.js (70%)'],
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MERN Architecture & Intelligent Skill-Matching Engine</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto">
          Your GitHub is your résumé. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 bg-clip-text text-transparent">
            DevHub makes it look like one.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          DevHub automatically transforms raw GitHub activity into a verified, living portfolio and connects you with teammates whose code and skills complement yours.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 text-base"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={loginWithGitHub}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-[#238636] hover:bg-[#2ea043] transition-all flex items-center justify-center space-x-2.5 shadow-lg shadow-green-900/40 text-sm"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </button>

              <button
                onClick={() => loginAsDemo('asha')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-emerald-300 bg-[#161b22] hover:bg-[#21262d] border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-center space-x-2 text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Instant Demo Login</span>
              </button>
            </>
          )}
        </div>

        {/* Key Features Quick Bullets */}
        <div className="mt-14 flex items-center justify-center flex-wrap gap-6 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero manual typing</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Inferred from real code bytes</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Intelligent skill-matching</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Shareable devhub.app/:username</span>
          </div>
        </div>
      </div>

      {/* Interactive Match Algorithm Simulator (Section 11.3) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#21262d]">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>ALGORITHM SHOWCASE: SECTION 11.3</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                How DevHub Matches Developers
              </h2>
              <p className="text-sm text-gray-400 mt-1 max-w-xl">
                Unlike simple keyword searches, DevHub calculates skill coverage, cosine similarity, and recent activity directly from GitHub commits.
              </p>
            </div>

            {/* Requirement Pills */}
            <div className="flex flex-col items-start lg:items-end">
              <span className="text-xs text-gray-400 mb-1.5">Tested Requirement:</span>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  React (imp: 3)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Node.js (imp: 2)
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  MongoDB (imp: 2)
                </span>
              </div>
            </div>
          </div>

          {/* Worked Example Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleCandidates.map((cand, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 border transition-all ${
                  cand.score >= 80
                    ? 'bg-gradient-to-b from-[#1b222c] to-[#12161f] border-emerald-500/50 shadow-xl shadow-emerald-500/5'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={cand.avatar}
                      alt={cand.name}
                      className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base">{cand.name}</h4>
                      <span className="text-xs text-gray-400 font-mono">@{cand.username}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl font-mono text-sm font-extrabold border ${
                        cand.score >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {cand.score}% FIT
                    </span>
                    <div className="text-[10px] font-mono text-gray-400 mt-1">
                      Coverage: {(cand.coverage * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mb-4">{cand.bio}</p>

                {/* Verified Skills */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                    Verified GitHub Code Usage:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#21262d] text-gray-300 border border-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match / Missing breakdown */}
                <div className="pt-3 border-t border-[#21262d] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-400 font-semibold mr-1">Matched:</span>
                    <span className="text-gray-300">{cand.matched.join(', ')}</span>
                  </div>
                  {cand.missing.length > 0 ? (
                    <div>
                      <span className="text-red-400 font-semibold mr-1">Missing:</span>
                      <span className="text-gray-400">{cand.missing.join(', ')}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Full Coverage</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#21262d] text-center">
            <Link
              to="/discover"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Explore Live Candidate Discovery with Your Custom Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Pillars of DevHub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Passwordless GitHub OAuth</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Authenticate securely with GitHub in one click. No manual password creation or storage. Your profile stays verified.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Automated Live Portfolio</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Languages, stars, forks, streaks, and top projects stay in sync automatically. Pin your best repos and hide old school projects.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Weighted Skill Extraction</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Formula computes skill weights from code bytes, dependency manifests, repo stars, and recency. No exaggerated claims.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Clean Shareable Profile</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every user receives a shareable URL like devhub.app/username with rich Open Graph preview cards for LinkedIn and Twitter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
