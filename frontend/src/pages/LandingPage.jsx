import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Features from '../components/Features';
import Footer from '../components/Footer';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <main>
                <HeroSection />
                <Features />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
