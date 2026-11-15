import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { Landing } from './pages/Landing.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { EditPortfolio } from './pages/EditPortfolio.jsx';
import { Discover } from './pages/Discover.jsx';
import { ProjectsList } from './pages/ProjectsList.jsx';
import { PostProject } from './pages/PostProject.jsx';
import { ProjectMatches } from './pages/ProjectMatches.jsx';
import { Requests } from './pages/Requests.jsx';
import { PublicProfile } from './pages/PublicProfile.jsx';
import { NotFound } from './pages/NotFound.jsx';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#0d1117] text-gray-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/:id" element={<ProjectMatches />} />

              {/* Protected User Pages */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/edit"
                element={
                  <ProtectedRoute>
                    <EditPortfolio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <PostProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <Requests />
                  </ProtectedRoute>
                }
              />

              {/* Shareable Public Profile URLs (e.g. devhub.app/asha and devhub.app/profile/asha) */}
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/:username" element={<PublicProfile />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
