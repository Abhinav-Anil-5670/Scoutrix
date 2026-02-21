import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ForAthletesPage from './pages/ForAthletesPage';
import ForScoutsPage from './pages/ForScoutsPage';
import BySportPage from './pages/BySportPage';
import ByRegionPage from './pages/ByRegionPage';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/athletes" element={<ForAthletesPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/scouts" element={<ForScoutsPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/sports" element={<BySportPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
        <Route path="/regions" element={<ByRegionPage onOpenAuth={() => setIsAuthModalOpen(true)} />} />
      </Routes>
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default App;
