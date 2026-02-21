import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="badge">
                    <span className="live-dot"></span> NEXT GENERATION SCOUTING
                </div>
                <h1 className="hero-title">
                    REVOLUTIONIZING<br />
                    <span className="text-gradient">SPORTS SECRETS</span>
                </h1>
                <p className="hero-subtitle">
                    Discover top-tier athletes through AI-driven video analysis, standardized performance indexing, and immersive global talent discovery.
                </p>

                <div className="hero-actions">
                    <button className="btn-primary">
                        Start Scouting <span className="arrow">›</span>
                    </button>
                    <button className="btn-secondary">
                        Watch Demo
                    </button>
                </div>

                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-value">50K+</span>
                        <span className="stat-label">Athletes Analyzed</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">99%</span>
                        <span className="stat-label">AI Accuracy</span>
                    </div>
                </div>
            </div>

            <div className="hero-visual">
                <div className="visual-composition">
                    <div className="image-wrapper">
                        <img
                            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2670&auto=format&fit=crop"
                            alt="Sprinter on track"
                            className="hero-image"
                        />
                        <div className="glow-overlay"></div>
                    </div>
                    <div className="hud-element top-right">
                        <span>SPI: 94.2</span>
                        <div className="mini-chart"></div>
                    </div>
                    <div className="hud-element bottom-left">
                        <span>VELOCITY: 10.4m/s</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
