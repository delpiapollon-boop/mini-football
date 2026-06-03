import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { authAPI } from './api';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import MatchesPage from './pages/MatchesPage';
import MatchesCreatePage from './pages/MatchesCreatePage';
import RequestsPage from './pages/RequestsPage';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import NotificationCenter from './components/NotificationCenter';

function App() {
  const { isAuthenticated, setAuth, logout } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        setAuth(JSON.parse(user), token);
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, [setAuth, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-pulse-subtle text-amber-400 text-3xl mb-4">⚽</div>
          <p className="text-slate-400 font-mono text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-slate-900 text-slate-100">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Topbar />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/teams" element={<TeamsPage />} />
                      <Route path="/players" element={<PlayersPage />} />
                      <Route path="/matches" element={<MatchesPage />} />
                      <Route path="/matches/create" element={<MatchesCreatePage />} />
                      <Route path="/requests" element={<RequestsPage />} />
                    </Routes>
                  </main>
                </div>
                <NotificationCenter />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
