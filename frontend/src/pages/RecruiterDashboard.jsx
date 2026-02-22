import React, { useState } from 'react';
import RecruiterExplore from './RecruiterExplore';
import AIVideoAnalysis from './AIVideoAnalysis';
import RecruiterPost from './RecruiterPost';
import RecruiterApplicants from './RecruiterApplicants';
import AutomatedRecruitment from './AutomatedRecruitment';
import './RecruiterDashboard.css';

/* ── Icons ── */

/* ── Icons ── */


/* ─── Nav items ─────────────────────────────────────────────── */
const NAV_ITEMS = [
    {
        id: 'explore', label: 'Explore', color: '#00e5a0',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        iconFilled: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.71 20.29l-5.01-5.01A8 8 0 1 0 4.93 17.07a8 8 0 0 0 11.77-1.37l5.01 5.01a1 1 0 0 0 1.42-1.42zM11 17a6 6 0 1 1 6-6 6 6 0 0 1-6 6z" />
            </svg>
        ),
    },
    {
        id: 'analysis', label: 'AI Analysis', color: '#a78bfa',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
        iconFilled: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 7.27a1 1 0 0 0-1-.12L16 9.86V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4.86l5.5 2.71A1 1 0 0 0 23 16V8a1 1 0 0 0-.5-.73z" />
            </svg>
        ),
    },
    {
        id: 'post', label: 'Post', color: '#fbbf24',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
        iconFilled: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 21H5a2 2 0 0 1-2-2v-4h2v4h14v-4h2v4a2 2 0 0 1-2 2z" /><path d="M13 3v10.586l3.293-3.293 1.414 1.414L12 17.414l-5.707-5.707 1.414-1.414L11 13.586V3h2z" />
            </svg>
        ),
    },
    {
        id: 'recruit', label: 'Recruit', color: '#f472b6',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        iconFilled: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        ),
    },
    {
        id: 'auto', label: 'AI Match', color: '#f43f5e',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        iconFilled: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 14.5a4.5 4.5 0 0 1-4.5 4.5h-1a1 1 0 0 1 0-2h1a2.5 2.5 0 0 0 0-5h-5a4.5 4.5 0 0 1 0-9h1a1 1 0 0 1 0 2h-1a2.5 2.5 0 0 0 0 5h5a4.5 4.5 0 0 1 4.5 4.5zM12 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1z" />
            </svg>
        ),
    }
];

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;

const ComingSoon = ({ label, color, emoji }) => (
    <div className="rdb-coming-soon">
        <div className="rdb-cs-emoji">{emoji}</div>
        <h2 style={{ color }}>{label}</h2>
        <p>Coming soon — actively being built.</p>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
const RecruiterDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('explore');
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('scoutrixTheme') || 'dark';
    });

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        return () => {
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
            case 'explore': return <RecruiterExplore user={user} theme={theme} />;
            case 'analysis': return <AIVideoAnalysis />;
            case 'post': return <RecruiterPost user={user} />;
            case 'recruit': return <RecruiterApplicants />;
            case 'auto': return <AutomatedRecruitment />;
            default: return null;
        }
    };

    return (
        <div className="rdb-shell" data-theme={theme}>
            <header className="rdb-topbar">
                <span className="rdb-role-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    RECRUITER
                </span>
                <button className="rdb-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </header>

            <main className="rdb-content">{renderContent()}</main>

            <nav className="rdb-bottom-nav" role="navigation" aria-label="Recruiter navigation">
                {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`rdb-tab ${isActive ? 'rdb-tab--active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            aria-label={item.label}
                            style={{ '--tab-color': item.color }}
                        >
                            <span className="rdb-tab-icon">{isActive ? item.iconFilled : item.icon}</span>
                            <span className="rdb-tab-label">{item.label}</span>
                            {isActive && <span className="rdb-tab-indicator" />}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default RecruiterDashboard;
