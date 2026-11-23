import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FolderGit2,
  Plus,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
} from 'lucide-react';

export const ProjectsList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getProjects({ status: filterStatus });
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#30363d]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>COMMUNITY REQUIREMENTS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Project & Hackathon Boards</h1>
          <p className="text-sm text-gray-400 mt-1">
            Discover projects seeking teammates with verified skills.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Post Requirement</span>
        </Link>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading projects...</span>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-gray-500 hover:shadow-xl"
            >
              <div>
                {/* Project Owner Row */}
                <div className="flex items-center space-x-2.5 mb-3">
                  <img
                    src={project.ownerId?.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
                    alt={project.ownerId?.username}
                    className="w-7 h-7 rounded-full border border-emerald-500 object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-white">
                      {project.ownerId?.name || project.ownerId?.username}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono ml-1.5">
                      @{project.ownerId?.username}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base mb-2 hover:text-emerald-400 transition-colors">
                  <Link to={`/projects/${project._id}`}>{project.title}</Link>
                </h3>

                <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Required Skills Chips */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1.5">
                    Looking For:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.requiredSkills?.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        {req.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action & Date */}
              <div className="pt-4 border-t border-[#21262d] flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px] flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </span>

                <Link
                  to={`/projects/${project._id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center space-x-1"
                >
                  <span>View Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-gray-400">
          <p className="text-sm">No open projects posted yet.</p>
          <Link
            to="/projects/new"
            className="mt-3 inline-block text-xs font-semibold text-emerald-400 hover:underline"
          >
            Be the first to post a team requirement!
          </Link>
        </div>
      )}
    </div>
  );
};
