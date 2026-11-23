import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
        <Code2 className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-sm text-gray-400 max-w-sm">
        The developer profile or route you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-4 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors inline-flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
