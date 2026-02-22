import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedProfiles.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

const getSportColor = s => ({ Cricket: '#00e5a0', Badminton: '#a78bfa', Football: '#fbbf24' }[s] || '#38bdf8');

const getScoreColor = s => {
    if (!s || s === 0) return '#64748b';
    if (s >= 700) return '#00e5a0';
    if (s >= 400) return '#fbbf24';
    return '#f87171';
};

const getScoreTier = s => {
    if (!s || s === 0) return 'Unranked';
    if (s >= 800) return 'Elite';
    if (s >= 700) return 'Pro';
    if (s >= 500) return 'Developing';
    if (s >= 400) return 'Rising';
    return 'Beginner';
};

/* ── Sun / Moon icons ── */
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

/* ── Saved Athlete Card ── */
const SavedAthleteCard = ({ athlete, onUnsave }) => {
    const color = getSportColor(athlete.sport);
    const meta = athlete.scoutScore?.metaScore ?? 0;
    const [removing, setRemoving] = useState(false);

    const handleUnsave = async () => {
        setRemoving(true);
        try {
            const r = await fetch(`${API}/users/save/${athlete._id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (r.ok) {
                // Update localStorage
                const userStr = localStorage.getItem('scoutrixUser');
                if (userStr) {
                    const u = JSON.parse(userStr);
                    u.savedPlayers = (u.savedPlayers || []).filter(id => id !== athlete._id);
                    localStorage.setItem('scoutrixUser', JSON.stringify(u));
                }
                onUnsave(athlete._id);
            }
        } catch (_) { }
        setRemoving(false);
    };

    return (
        <article className="sp-card" style={{ '--c': color }}>
            <div className="sp-card-header">
                <div className="sp-identity">
                    <div className="sp-avatar" style={{ background: `${color}20`, color }}>
                        {athlete.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sp-meta">
                        <span className="sp-name">{athlete.name}</span>
                        <span className="sp-loc">
                            <svg style={{ display: 'inline-block', marginRight: '3px', transform: 'translateY(1px)' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {athlete.location || 'India'}
                        </span>
                    </div>
                </div>
                <span className="sp-sport-badge" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
                    {athlete.sport}
                </span>
            </div>

            {/* Role tags */}
            {(athlete.playerRole || athlete.subRole || athlete.style || athlete.age) && (
                <div className="sp-role-tags">
                    {athlete.playerRole && <span className="sp-tag" style={{ borderColor: `${color}40`, color }}>{athlete.playerRole}</span>}
                    {athlete.subRole && <span className="sp-tag muted">{athlete.subRole}</span>}
                    {athlete.style && <span className="sp-tag muted">{athlete.style}</span>}
                    {athlete.age && <span className="sp-tag muted">Age {athlete.age}</span>}
                </div>
            )}

            {/* Bio */}
            {athlete.bio && <p className="sp-bio">"{athlete.bio}"</p>}

            {/* Score strip */}
            <div className="sp-score-strip">
                <div className="sp-score-pill" style={{ '--col': getScoreColor(meta) }}>
                    <span className="sp-score-tier">{getScoreTier(meta)}</span>
                    <span className="sp-score-num">{meta > 0 ? meta : '—'}<span className="sp-denom">/1000</span></span>
                    <span className="sp-score-sub">MetaScore</span>
                </div>

                {athlete.trustScore > 0 && (
                    <div className="sp-score-pill" style={{ '--col': '#a78bfa' }}>
                        <span className="sp-score-tier">Trust</span>
                        <span className="sp-score-num">{athlete.trustScore}<span className="sp-denom">/100</span></span>
                        <span className="sp-score-sub">Trust Score</span>
                    </div>
                )}

                <button
                    className="sp-unsave-btn"
                    onClick={handleUnsave}
                    disabled={removing}
                    title="Remove from saved"
                >
                    {removing ? '…' : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                            Unsave
                        </>
                    )}
                </button>
            </div>

            {/* Footer actions */}
            <div className="sp-card-footer">
                {athlete.email && (
                    <a className="sp-contact-link" href={`mailto:${athlete.email}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                        </svg>
                        Contact
                    </a>
                )}
                <span className="sp-invite-hint">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92" />
                    </svg>
                    Send invite from Dashboard
                </span>
            </div>
        </article>
    );
};

/* ═══════════════════════════════════════════════════
   MAIN — SavedProfiles
═══════════════════════════════════════════════════ */
const SavedProfiles = ({ user }) => {
    const navigate = useNavigate();
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQ, setSearchQ] = useState('');
    const [sport, setSport] = useState('All');

    const [theme, setTheme] = useState(() => localStorage.getItem('scoutrixTheme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('scoutrixTheme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${API}/users/saved`, { credentials: 'include' });
                if (r.status === 401) throw new Error('__auth__');
                if (!r.ok) throw new Error(`Server error (${r.status})`);
                setAthletes(await r.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleUnsave = (id) => setAthletes(prev => prev.filter(a => a._id !== id));

    const filtered = athletes.filter(a => {
        if (sport !== 'All' && a.sport !== sport) return false;
        if (searchQ) {
            const q = searchQ.toLowerCase();
            return (
                (a.name || '').toLowerCase().includes(q) ||
                (a.location || '').toLowerCase().includes(q) ||
                (a.sport || '').toLowerCase().includes(q) ||
                (a.playerRole || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="sp-shell" data-theme={theme}>
            {/* Top bar */}
            <header className="sp-topbar">
                <button className="sp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
                <span className="sp-role-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    SAVED PROFILES
                </span>
                <button className="sp-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </header>

            <main className="sp-content">
                {/* Page header */}
                <div className="sp-header">
                    <div className="sp-live-badge">
                        <span className="sp-live-dot" />
                        YOUR SHORTLIST
                    </div>
                    <h1 className="sp-title">SAVED <span className="sp-gradient">PROFILES</span></h1>
                    <p className="sp-subtitle">
                        Athletes you've saved for consideration — manage your recruitment shortlist here.
                    </p>

                    {/* Search */}
                    <div className="sp-search-wrap">
                        <svg className="sp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="sp-search"
                            placeholder="Search saved athletes…"
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                        />
                        {searchQ && <button className="sp-search-clear" onClick={() => setSearchQ('')}>✕</button>}
                    </div>
                </div>

                {/* Sport filter */}
                {!loading && !error && athletes.length > 0 && (
                    <div className="sp-filters">
                        <span className="sp-filter-label">Sport</span>
                        <div className="sp-pills">
                            {['All', 'Cricket', 'Badminton', 'Football'].map(s => (
                                <button
                                    key={s}
                                    className={`sp-pill ${sport === s ? 'active' : ''}`}
                                    style={sport === s ? { '--pill-c': getSportColor(s) } : {}}
                                    onClick={() => setSport(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <span className="sp-count">{filtered.length} athlete{filtered.length !== 1 ? 's' : ''} saved</span>
                    </div>
                )}

                {/* States */}
                {loading && (
                    <div className="sp-state">
                        <div className="sp-spinner" />
                        <p>Loading your saved profiles…</p>
                    </div>
                )}

                {error === '__auth__' && (
                    <div className="sp-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <p>Please log in as a recruiter to view saved profiles.</p>
                    </div>
                )}

                {error && error !== '__auth__' && (
                    <div className="sp-state sp-state--err">
                        <p>Error: {error}</p>
                    </div>
                )}

                {!loading && !error && athletes.length === 0 && (
                    <div className="sp-state">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <p>No saved profiles yet.</p>
                        <span>Find athletes in the <strong>Explore</strong> tab and tap <strong>+ Save</strong>.</span>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && athletes.length > 0 && (
                    <div className="sp-state">
                        <p>No athletes match your filter.</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="sp-feed">
                        {filtered.map(athlete => (
                            <SavedAthleteCard
                                key={athlete._id}
                                athlete={athlete}
                                onUnsave={handleUnsave}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedProfiles;
