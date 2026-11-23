import React from 'react';
import { Code2, Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117] text-gray-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-white">DevHub</span> — Living Developer Portfolios & Teammate Discovery
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-gray-400">
            <span>Built on MERN Stack (MongoDB, Express, React, Node.js)</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 inline fill-red-400" />
              <span>for developers</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
