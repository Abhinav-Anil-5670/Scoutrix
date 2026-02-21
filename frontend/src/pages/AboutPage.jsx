import React, { useEffect } from 'react';
import './AboutPage.css';

const AboutPage = () => {
    // Ensure the page scrolls to top on navigation
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="about-page-main">
            {/* About Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <div className="badge">OUR MISSION</div>
                    <h1 className="about-title">
                        DEMOCRATIZING<br />
                        <span className="text-gradient">SPORTS SCOUTING</span>
                    </h1>
                    <p className="about-subtitle">
                        We believe that raw talent shouldn't be hidden by geography or lack of funding.
                        Scoutrix utilizes edge AI to put world-class sports analytics into the
                        hands of every aspiring athlete across India, from bustling urban centers to remote villages.
                    </p>

                    <div className="about-quick-stats">
                        <div className="quick-stat">
                            <span className="qs-value">50+</span>
                            <span className="qs-label">Sports Analyzed</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">28</span>
                            <span className="qs-label">States Reached</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">&lt;50ms</span>
                            <span className="qs-label">Inference Time</span>
                        </div>
                    </div>

                    <div className="about-hero-actions">
                        <button className="btn-primary">
                            Join the Revolution
                            <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                <div className="about-hero-visual">
                    <div className="about-visual-composition">
                        <div className="about-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=2670&auto=format&fit=crop"
                                alt="Badminton game in action"
                                className="about-image"
                            />
                            <div className="glow-overlay"></div>
                        </div>

                        {/* HUD Elements */}
                        <div className="about-hud metric-1">
                            <span className="hud-label">ATHLETES SCOUTED</span>
                            <span className="hud-value">12,450+</span>
                        </div>
                        <div className="about-hud metric-2">
                            <span className="hud-label">AI ACCURACY</span>
                            <span className="hud-value">98.4%</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values">
                <div className="values-header">
                    <h2 className="section-title">THE SCOUTRIX <span className="text-gradient">VALUES</span></h2>
                    <p className="section-subtitle">What drives our engine forward everyday.</p>
                </div>

                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <h3>Accessibility First</h3>
                        <p>High-end analytics usually costs thousands. We optimized our models to run locally on budget smartphones, offline.</p>
                    </div>

                    <div className="value-card">
                        <div className="value-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /></svg>
                        </div>
                        <h3>Global Standards</h3>
                        <p>Our SPI scoring is calibrated against international benchmarks. A 90 in a rural village means a 90 on the world stage.</p>
                    </div>

                    <div className="value-card">
                        <div className="value-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                        </div>
                        <h3>Unyielding Precision</h3>
                        <p>We don't compromise on data integrity. Our 60fps skeletal tracking captures micro-movements invisible to the human eye.</p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AboutPage;
