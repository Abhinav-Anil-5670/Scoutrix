import React, { useEffect } from 'react';
import './BySportPage.css';

const BySportPage = ({ onOpenAuth }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="sport-page-main">
            <section className="sport-hero">
                <div className="sport-hero-content">
                    <div className="badge">TAILORED ANALYTICS</div>
                    <h1 className="sport-title">
                        EXPLORE BY<br />
                        <span className="text-gradient">SPORT</span>
                    </h1>
                    <p className="sport-subtitle">
                        Detailed biomechanical analysis models across Badminton, Cricket, Football, and more. Our engine adapts to the specific kinetic needs of every game, ensuring relevant, action-oriented data.
                    </p>

                    <div className="sport-quick-stats">
                        <div className="quick-stat">
                            <span className="qs-value">15+</span>
                            <span className="qs-label">Sports Modules</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">60fps</span>
                            <span className="qs-label">Pose Tracking</span>
                        </div>
                        <div className="quick-stat divider"></div>
                        <div className="quick-stat">
                            <span className="qs-value">1Ms</span>
                            <span className="qs-label">Latency</span>
                        </div>
                    </div>

                    <div className="sport-hero-actions">
                        <button className="btn-primary" onClick={onOpenAuth}>
                            See All Sports
                            <span className="arrow">→</span>
                        </button>
                    </div>
                </div>

                <div className="sport-hero-visual">
                    <div className="sport-visual-composition">
                        <div className="sport-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2670&auto=format&fit=crop"
                                alt="Multi-sport collage"
                                className="sport-image"
                            />
                            <div className="glow-overlay"></div>
                        </div>

                        {/* HUD Elements */}
                        <div className="sport-hud metric-1">
                            <span className="hud-label">KINETIC CHAIN</span>
                            <span className="hud-value">OPTIMIZED</span>
                        </div>
                        <div className="sport-hud metric-2">
                            <span className="hud-label">FRAME RATE</span>
                            <span className="hud-value">60 FPS</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default BySportPage;
