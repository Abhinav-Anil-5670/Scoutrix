import React, { useState, useEffect } from 'react';
import ExplorePage from './ExplorePage';
import AIVideoAnalysis from './AIVideoAnalysis';
import PostPage from './PostPage';
import ProfilePage from './ProfilePage';
import './AthleteDashboard.css';

/* ─── Nav item definitions ─────────────────────────────────────── */
const NAV_ITEMS = [
    {
        id: 'explore',
        label: 'Explore',
        color: '#00e5a0',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        ),
        iconFilled: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.15" />
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.24 5.76-2.12 6.36-6.36 2.12 2.12-6.36z" />
            </svg>
        ),
    },
    {
        id: 'analysis',
        label: 'Analysis',
        color: '#a78bfa',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
        iconFilled: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 7.27a1 1 0 0 0-1-.12L16 9.86V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4.86l5.5 2.71A1 1 0 0 0 23 16V8a1 1 0 0 0-.5-.73z" />
            </svg>
        ),
    },
    {
        id: 'post',
        label: 'Post',
        color: '#fbbf24',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
        iconFilled: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 21H5a2 2 0 0 1-2-2v-4h2v4h14v-4h2v4a2 2 0 0 1-2 2z" />
                <path d="M13 3v10.586l3.293-3.293 1.414 1.414L12 17.414l-5.707-5.707 1.414-1.414L11 13.586V3h2z" />
            </svg>
        ),
    },
    {
        id: 'profile',
        label: 'Profile',
        color: '#38bdf8',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        iconFilled: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
            </svg>
        ),
    },
];

/* ─── Placeholder for unbuilt sections ─────────────────────────── */
const PlaceholderSection = ({ id, label, color }) => (
    <div className="placeholder-section">
        <div className="placeholder-pulse" style={{ background: color }} />
        <div className="placeholder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: color }}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
        </div>
        <h2>{label}</h2>
        <p>This section is coming soon.</p>
    </div>
);

/* ─── Sun icon ──────────────────────────────────────────────────── */
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

/* ─── Moon icon ─────────────────────────────────────────────────── */
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

/* ─── Main Component ────────────────────────────────────────────── */
const AthleteDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('explore');
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('scoutrixTheme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        return saved;
    });

    useEffect(() => {
        // Ensure the theme is set on mount
        document.documentElement.setAttribute('data-theme', theme);
        return () => {
            // Clean up when leaving dashboard, to prevent light themed navbar on landing pages
            document.documentElement.removeAttribute('data-theme');
        };
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('scoutrixTheme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'explore': return <ExplorePage theme={theme} />;
            case 'analysis': return <AIVideoAnalysis />;
            case 'post': return <PostPage user={user} />;
            case 'profile': return <ProfilePage user={user} />;
            default: return null;
        }
    };

    const activeItem = NAV_ITEMS.find(n => n.id === activeTab);

    return (
        <div className="ad-shell" data-theme={theme}>


            {/* ── Main content area ── */}
            <main className="ad-content">
                {renderContent()}
            </main>

            {/* ── Instagram-style bottom tab bar ── */}
            <nav className="ad-bottom-nav" role="navigation" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`ad-tab ${isActive ? 'ad-tab--active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            aria-label={item.label}
                            style={{ '--tab-color': item.color }}
                        >
                            <span className="ad-tab-icon">
                                {isActive ? item.iconFilled : item.icon}
                            </span>
                            <span className="ad-tab-label">{item.label}</span>
                            {isActive && <span className="ad-tab-indicator" />}
                        </button>
                    );
                })}
                <button
                    className="ad-tab theme-toggle-tab"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{ '--tab-color': 'var(--text-primary)' }}
                >
                    <span className="ad-tab-icon">
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </span>
                    <span className="ad-tab-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </nav>

        </div>
    );
};

export default AthleteDashboard;
