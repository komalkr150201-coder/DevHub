import { useState } from 'react';
import { matchAPI } from '../services/api.js';

export const useMatch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findMatches = async (requiredSkills = [], niceToHave = [], limit = 15) => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.rankDevelopers(requiredSkills, niceToHave, limit);
      if (res.data.success) {
        setResults(res.data.results || []);
        return res.data.results;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    findMatches,
    setResults,
  };
};
