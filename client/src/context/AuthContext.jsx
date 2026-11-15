import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('devhub_theme') || 'dark');

  // Load current session on initial render
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setRepos(res.data.repos || []);
        setSkills(res.data.skills || []);
        if (res.data.user.theme) {
          setTheme(res.data.user.theme);
        }
      }
    } catch (err) {
      // Not logged in or expired cookie
      setUser(null);
      setRepos([]);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Sync theme changes to html class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('devhub_theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      try {
        await userAPI.updateMe({ theme: nextTheme });
      } catch (err) {
        console.error('Failed to save theme preference', err);
      }
    }
  };

  const loginWithGitHub = () => {
    window.location.href = '/auth/github';
  };

  const loginAsDemo = async (username = 'asha') => {
    setLoading(true);
    try {
      const res = await authAPI.demoLogin(username);
      if (res.data.success) {
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setRepos([]);
      setSkills([]);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        repos,
        skills,
        loading,
        theme,
        toggleTheme,
        loginWithGitHub,
        loginAsDemo,
        logout,
        refreshUser: fetchCurrentUser,
        setRepos,
        setSkills,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
