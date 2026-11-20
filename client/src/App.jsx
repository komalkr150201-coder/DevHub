import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { MyPortfolio } from './pages/MyPortfolio';
import { MyRepositories } from './pages/MyRepositories';
import { MySkills } from './pages/MySkills';
import { FindDevelopers } from './pages/FindDevelopers';
import { CollaborationRequests } from './pages/CollaborationRequests';
import { Settings } from './pages/Settings';
import { PublicProfile } from './pages/PublicProfile';
import { ResetPassword } from './pages/ResetPassword';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ResetPassword />} />

          {/* Public Profiles */}
          <Route path="/u/:username" element={<PublicProfile />} />

          {/* Protected Application Suite */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="portfolio" element={<MyPortfolio />} />
            <Route path="repositories" element={<MyRepositories />} />
            <Route path="skills" element={<MySkills />} />
            <Route path="developers" element={<FindDevelopers />} />
            <Route path="requests" element={<CollaborationRequests />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback to Public Profile if format is /:username, or root */}
          <Route path="/:username" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
