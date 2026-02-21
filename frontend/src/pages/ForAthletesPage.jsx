import React, { useEffect } from 'react';
import './ForAthletesPage.css';

const ForAthletesPage = ({ onOpenAuth }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="athletes-page-main">
            <section className="athletes-hero">
                <div className="athletes-hero-content">
                    <div className="badge">POWER YOUR JOURNEY</div>
                    <h1 className="athletes-title">
                        UNLEASH YOUR<br />
                        <span className="text-gradient">POTENTIAL</span>
                    </h1>
                    <p className="athletes-subtitle">
                        Upload your gameplay, get instant AI-driven metrics, and discover your true SPI (Scoutrix Performance Index). Transform raw talent into undeniable proof.
                    </p>

                    <div className="athletes-quick-stats">
                        <div className="quick-stat">
                            <span className="qs-value">12.4K</span>
                            <span className="qs-label">Athletes Analyzed</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">500+</span>
                            <span className="qs-label">Players Signed</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">&lt;24h</span>
                            <span className="qs-label">Analysis Turnaround</span>
                        </div>
                    </div>

                    <div className="athletes-hero-actions">
                        <button className="btn-primary" onClick={onOpenAuth}>
                            Start Uploading
                            <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                <div className="athletes-hero-visual">
                    <div className="athletes-visual-composition">
                        <div className="athletes-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2669&auto=format&fit=crop"
                                alt="Athlete training"
                                className="athletes-image"
                            />
                            <div className="glow-overlay"></div>
                        </div>

                        {/* HUD Elements */}
                        <div className="athletes-hud metric-1">
                            <span className="hud-label">MAX VELOCITY</span>
                            <span className="hud-value">32.4 km/h</span>
                        </div>
                        <div className="athletes-hud metric-2">
                            <span className="hud-label">SPI SCORE</span>
                            <span className="hud-value">91.4</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ForAthletesPage;
