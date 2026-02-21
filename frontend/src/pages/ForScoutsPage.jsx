import React, { useEffect } from 'react';
import './ForScoutsPage.css';

const ForScoutsPage = ({ onOpenAuth }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="scouts-page-main">
            <section className="scouts-hero">
                <div className="scouts-hero-content">
                    <div className="badge">FIND THE NEXT STAR</div>
                    <h1 className="scouts-title">
                        DATA DRIVEN<br />
                        <span className="text-gradient">DISCOVERY</span>
                    </h1>
                    <p className="scouts-subtitle">
                        Access an unprecedented database of verified talent. Filter by position, SPI, region, and physical traits. Make informed decisions backed by objective AI metrics.
                    </p>

                    <div className="scouts-quick-stats">
                        <div className="quick-stat">
                            <span className="qs-value">98.4%</span>
                            <span className="qs-label">AI Accuracy Match</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">40+</span>
                            <span className="qs-label">Data Points Per Player</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">Zero</span>
                            <span className="qs-label">Bias</span>
                        </div>
                    </div>

                    <div className="scouts-hero-actions">
                        <button className="btn-primary" onClick={onOpenAuth}>
                            Access Database
                            <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                <div className="scouts-hero-visual">
                    <div className="scouts-visual-composition">
                        <div className="scouts-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                                alt="Data analytics screen"
                                className="scouts-image"
                            />
                            <div className="glow-overlay"></div>
                        </div>

                        {/* HUD Elements */}
                        <div className="scouts-hud metric-1">
                            <span className="hud-label">SEARCH FILTERS</span>
                            <span className="hud-value">ACTIVE</span>
                        </div>
                        <div className="scouts-hud metric-2">
                            <span className="hud-label">MATCH RATE</span>
                            <span className="hud-value">HIGH</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ForScoutsPage;
