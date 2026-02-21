import React, { useEffect } from 'react';
import indianMap from '../assets/Indian map.png';
import './ByRegionPage.css';

const ByRegionPage = ({ onOpenAuth }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="region-page-main">
            <section className="region-hero">
                <div className="region-hero-content">
                    <div className="badge">TALENT EVERYWHERE</div>
                    <h1 className="region-title">
                        SCOUT BY<br />
                        <span className="text-gradient">REGION</span>
                    </h1>
                    <p className="region-subtitle">
                        We are mapping the future stars across India, state by state, district by district. True democratization means reaching the unreached and giving every athlete a platform.
                    </p>

                    <div className="region-quick-stats">
                        <div className="quick-stat">
                            <span className="qs-value">28</span>
                            <span className="qs-label">States Covered</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">400+</span>
                            <span className="qs-label">Districts Mapped</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">Tier 3</span>
                            <span className="qs-label">Focus Area</span>
                        </div>
                    </div>

                    <div className="region-hero-actions">
                        <button className="btn-primary" onClick={onOpenAuth}>
                            View Heatmap
                            <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                <div className="region-hero-visual">
                    <div className="region-visual-composition">
                        <div className="region-image-wrapper">
                            <img
                                src={indianMap}
                                alt="Map visualization"
                                className="region-image"
                            />
                            <div className="glow-overlay"></div>
                        </div>

                        {/* HUD Elements */}
                        <div className="region-hud metric-1">
                            <span className="hud-label">TALENT DENSITY</span>
                            <span className="hud-value">SURGING</span>
                        </div>
                        <div className="region-hud metric-2">
                            <span className="hud-label">NEW UPLOADS</span>
                            <span className="hud-value">+420 TODAY</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default ByRegionPage;
