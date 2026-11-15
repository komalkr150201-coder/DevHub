import React, { useState } from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'Node.js',
  'MongoDB',
  'TypeScript',
  'Python',
  'FastAPI',
  'Docker',
  'Kubernetes',
  'Go',
  'Tailwind CSS',
  'PyTorch',
  'PostgreSQL',
];

export const SearchBar = ({ onSearch, initialSkills = [] }) => {
  const [skillTags, setSkillTags] = useState(initialSkills);
  const [inputValue, setInputValue] = useState('');
  const [availability, setAvailability] = useState('');

  const handleAddTag = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!skillTags.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const nextTags = [...skillTags, trimmed];
      setSkillTags(nextTags);
      setInputValue('');
      onSearch({ skills: nextTags, availability });
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const nextTags = skillTags.filter((_, idx) => idx !== indexToRemove);
    setSkillTags(nextTags);
    onSearch({ skills: nextTags, availability });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleAvailabilityChange = (val) => {
    const next = availability === val ? '' : val;
    setAvailability(next);
    onSearch({ skills: skillTags, availability: next });
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Skill Tag Input Box */}
        <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 flex flex-wrap items-center gap-1.5 focus-within:border-emerald-500 transition-colors">
          <Search className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />

          {skillTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(idx)}
                className="hover:text-red-400 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              skillTags.length === 0
                ? 'Type required skill and hit Enter (e.g. React, Node.js, MongoDB)...'
                : 'Add more skills...'
            }
            className="flex-1 min-w-[140px] bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none py-1"
          />

          {inputValue.trim() && (
            <button
              onClick={() => handleAddTag(inputValue)}
              className="px-2 py-0.5 rounded text-xs bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Add
            </button>
          )}
        </div>

        {/* Search trigger button */}
        <button
          onClick={() => onSearch({ skills: skillTags, availability })}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
        >
          <Search className="w-4 h-4" />
          <span>Match Candidates</span>
        </button>
      </div>

      {/* Suggested skill chips */}
      <div className="mt-3 flex items-center flex-wrap gap-1.5 text-xs">
        <span className="text-gray-400 text-[11px] font-medium mr-1">Suggested:</span>
        {COMMON_SKILLS.filter(
          (cs) => !skillTags.some((st) => st.toLowerCase() === cs.toLowerCase())
        )
          .slice(0, 7)
          .map((cs) => (
            <button
              key={cs}
              type="button"
              onClick={() => handleAddTag(cs)}
              className="px-2 py-0.5 rounded-md bg-[#21262d] text-gray-300 hover:text-emerald-400 hover:bg-[#30363d] transition-colors border border-transparent hover:border-emerald-500/30 flex items-center space-x-1"
            >
              <Plus className="w-2.5 h-2.5 text-gray-500" />
              <span>{cs}</span>
            </button>
          ))}
      </div>

      {/* Availability Filter Toggles */}
      <div className="mt-3 pt-3 border-t border-[#21262d] flex items-center flex-wrap gap-2 text-xs">
        <span className="text-gray-400 flex items-center space-x-1 text-[11px]">
          <Filter className="w-3 h-3" />
          <span>Availability:</span>
        </span>
        {['hackathon', 'open-source', 'freelance', 'full-time'].map((av) => (
          <button
            key={av}
            type="button"
            onClick={() => handleAvailabilityChange(av)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
              availability === av
                ? 'bg-emerald-500 text-black font-semibold'
                : 'bg-[#0d1117] text-gray-400 hover:text-gray-200 border border-[#21262d]'
            }`}
          >
            {av}
          </button>
        ))}
      </div>
    </div>
  );
};
