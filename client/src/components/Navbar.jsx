import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Code2,
  Users,
  FolderGit2,
  Inbox,
  LogOut,
  Sun,
  Moon,
  Github,
  Sparkles,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, loginWithGitHub, loginAsDemo, theme, toggleTheme } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-[#30363d] bg-[#0d1117]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/30 transition-all">
                <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">
                  Dev<span className="text-green-400">Hub</span>
                </span>
                <span className="text-[10px] font-mono text-gray-400 tracking-wider -mt-1">
                  PORTFOLIO & MATCH
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-[#21262d] text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discover"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/discover')
                      ? 'bg-[#21262d] text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Find Teammates</span>
                </Link>
                <Link
                  to="/projects"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/projects')
                      ? 'bg-[#21262d] text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/requests')
                      ? 'bg-[#21262d] text-green-400 border border-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Requests</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#21262d] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/${user.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden lg:flex items-center space-x-1 text-xs text-gray-400 hover:text-green-400 transition-colors"
                  title="View Public Profile"
                >
                  <span>devhub.app/{user.username}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <Link to="/dashboard" className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-[#21262d] transition-colors">
                  <img
                    src={user.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                    alt={user.name || user.username}
                    className="w-8 h-8 rounded-full border border-green-500/40 object-cover"
                  />
                  <span className="text-sm font-medium text-gray-200">@{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loginAsDemo('asha')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Try Demo Account</span>
                </button>

                <button
                  onClick={loginWithGitHub}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>Sign in with GitHub</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#30363d] bg-[#161b22] px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-2 border-b border-[#30363d]">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-green-500"
                />
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-gray-400">@{user.username}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-[#21262d]"
              >
                Dashboard
              </Link>
              <Link
                to="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-[#21262d]"
              >
                Find Teammates
              </Link>
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-[#21262d]"
              >
                Projects
              </Link>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-[#21262d]"
              >
                Requests
              </Link>
              <Link
                to={`/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-green-400 hover:bg-[#21262d]"
              >
                View Public Profile
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-[#21262d]"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  loginAsDemo('asha');
                }}
                className="w-full py-2 rounded-md text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
              >
                Try Demo Account
              </button>
              <button
                onClick={loginWithGitHub}
                className="w-full py-2 rounded-md text-xs font-semibold text-white bg-[#238636]"
              >
                Sign in with GitHub
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
