import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ForAthletesPage from './pages/ForAthletesPage';
import ForScoutsPage from './pages/ForScoutsPage';
import BySportPage from './pages/BySportPage';
import ByRegionPage from './pages/ByRegionPage';
import AuthModal from './components/AuthModal';
import AthleteDashboard from './pages/AthleteDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import './App.css';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ── Global auth state, persisted in localStorage ──
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('scoutrixUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('scoutrixUser', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) { /* ignore network errors on logout */ }
    setUser(null);
    localStorage.removeItem('scoutrixUser');
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/athletes" element={<ForAthletesPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/scouts" element={<ForScoutsPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/sports" element={<BySportPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/regions" element={<ByRegionPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/dashboard/athlete" element={<AthleteDashboard user={user} />} />
        <Route path="/dashboard/recruiter" element={<RecruiterDashboard user={user} />} />
      </Routes>
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
