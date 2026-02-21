import React from 'react';
import './Features.css';

const Features = () => {
    const features = [
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
            ),
            title: "AI Video Analysis",
            desc: "Record any event on a basic phone. Our AI extracts sprint times, jump heights, and throw distances automatically — no equipment, no manual entry."
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            ),
            title: "SPI Score",
            desc: "Every athlete gets a Standardized Performance Index — normalized by age, gender, and sport. Fair, data-driven comparison across every district in India."
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
            ),
            title: "Offline-First App",
            desc: "No internet? No problem. Record and store performance data locally on any Android device. Everything syncs the moment connectivity returns."
        },
        {
            icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            title: "Global Discovery",
            desc: "Connect athletes in remote regions directly to top-tier academies, scouts, and scholarships without geographic or socioeconomic barriers."
        }
    ];

    return (
        <section className="features-section">
            <div className="features-header">
                <h2 className="section-title">CORE <span className="text-gradient">CAPABILITIES</span></h2>
                <p className="section-subtitle">A seamless integration of cutting-edge AI and offline accessibility.</p>
            </div>

            <div className="features-grid">
                {features.map((feature, idx) => (
                    <div key={idx} className="feature-card">
                        <div className="icon-wrapper">
                            {feature.icon}
                        </div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-desc">{feature.desc}</p>
                        <button className="learn-more">
                            Learn More <span className="arrow">→</span>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
