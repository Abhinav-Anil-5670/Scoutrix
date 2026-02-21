import React from 'react';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <main className="landing-page-main">
            <HeroSection />
            <Features />
        </main>
    );
};

export default LandingPage;
