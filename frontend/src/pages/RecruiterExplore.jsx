import React, { useState, useEffect, useMemo } from 'react';
import './RecruiterExplore.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

/* ── helpers ─────────────────────────────────────────────── */
const timeAgo = d => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

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

const generateNarrative = post => {
    const a = post.athleteId;
    const meta = a?.scoutScore?.metaScore;
    const sport = a?.sport;
    const role = a?.playerRole;
    const metrics = post.aiMetrics || {};
    const numKeys = Object.keys(metrics).filter(k => typeof metrics[k] === 'number');
    if (numKeys.length === 0) return post.scoutSummary || 'Performance data is being processed.';
    const topKey = numKeys.sort((a, b) => metrics[b] - metrics[a])[0];
    const topVal = metrics[topKey];
    const topLabel = topKey.replace(/_/g, ' ').replace(/score|rating/i, '').trim();

    const IconWrapper = ({ children, color }) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px', color: color || 'inherit', transform: 'translateY(2px)' }}>
            {children}
        </span>
    );

    const narrativeOptions = [
        meta >= 700 ? (
            <span key="1">
                <IconWrapper color="#00e5a0"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></IconWrapper>
                Elite performer — MetaScore {meta} puts them in the top tier of {sport || 'their sport'}.
            </span>
        ) : null,
        topVal >= 8.5 ? (
            <span key="2">
                <IconWrapper color="#fbbf24"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></IconWrapper>
                Exceptional {topLabel} of {topVal}/10 — recruiter-grade standout metric.
            </span>
        ) : null,
        role ? (
            <span key="3">
                <IconWrapper color="#a78bfa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg></IconWrapper>
                Scouted as a {role} — AI confirms strong positional awareness.
            </span>
        ) : null,
        post.scoutSummary ? (
            <span key="4">
                <IconWrapper color="#38bdf8"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg></IconWrapper>
                "{post.scoutSummary}"
            </span>
        ) : null,
        (
            <span key="5">
                <IconWrapper color="#f472b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5" /></svg></IconWrapper>
                {numKeys.length} AI performance metrics extracted from this session.
            </span>
        ),
    ];

    return narrativeOptions.filter(Boolean)[0];
};

/* ── INDIAN REGIONS ── */
const REGIONS = [
    'All Regions',
    'North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India',
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan',
    'Gujarat', 'Punjab', 'Kerala', 'Telangana', 'Bihar', 'West Bengal', 'Odisha',
];

const PLAYER_ROLES = {
    All: [],
    Cricket: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    Badminton: ['Singles', 'Doubles', 'Mixed Doubles'],
};

const regionMatch = (location, region) => {
    if (!region || region === 'All Regions') return true;
    return (location || '').toLowerCase().includes(region.toLowerCase().split(' ')[0]);
};

/* ── MetricBar ── */
const MetricBar = ({ label, value }) => {
    const pct = Math.min(Math.round((value / 10) * 100), 100);
    const col = pct >= 80 ? '#00e5a0' : pct >= 60 ? '#fbbf24' : '#f87171';
    return (
        <div className="re-metric-row">
            <span className="re-metric-label">{label.replace(/_/g, ' ')}</span>
            <div className="re-metric-track"><div className="re-metric-fill" style={{ width: `${pct}%`, background: col }} /></div>
            <span className="re-metric-val" style={{ color: col }}>{value}/10</span>
        </div>
    );
};

/* ── Athlete Card ── */
const AthleteCard = ({ post, showDetails, showScores, user }) => {
    const a = post.athleteId;

    // Check initial saved status from the passed user object (from localStorage)
    const initialSaved = user?.savedPlayers?.includes(a?._id) || false;

    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(initialSaved);

    if (!a) return null;

    const color = getSportColor(a.sport);
    const meta = a.scoutScore?.metaScore ?? 0;
    const spi = a.scoutScore?.sportScore ?? 0;
    const narrative = generateNarrative(post);
    const numMetrics = Object.entries(post.aiMetrics || {}).filter(([, v]) => typeof v === 'number');
    const stringMetrics = Object.entries(post.aiMetrics || {}).filter(([, v]) => typeof v === 'string');

    const handleSave = async () => {
        setSaving(true);
        try {
            const r = await fetch(`${API}/users/save/${a._id}`, { method: 'POST', credentials: 'include' });
            if (r.ok) {
                setSaved(v => !v);

                // Keep the global localStorage in sync so refreshing/navigating preserves the state
                const userStr = localStorage.getItem('scoutrixUser');
                if (userStr) {
                    let u = JSON.parse(userStr);
                    if (!u.savedPlayers) u.savedPlayers = [];

                    if (u.savedPlayers.includes(a._id)) {
                        u.savedPlayers = u.savedPlayers.filter(id => id !== a._id);
                    } else {
                        u.savedPlayers.push(a._id);
                    }
                    localStorage.setItem('scoutrixUser', JSON.stringify(u));
                }
            }
        } catch (_) { }
        setSaving(false);
    };

    return (
        <article className="re-card" style={{ '--c': color }}>
            {/* Header */}
            <div className="re-card-header">
                <div className="re-card-identity">
                    <div className="re-avatar" style={{ background: `${color}20`, color }}>
                        {a.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="re-athlete-meta">
                        <span className="re-athlete-name">{a.name}</span>
                        <span className="re-athlete-loc">
                            <svg style={{ display: 'inline-block', marginRight: '2px', transform: 'translateY(1px)' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {a.location || 'India'}
                        </span>
                    </div>
                </div>
                <div className="re-card-right">
                    <span className="re-sport-badge" style={{ background: `${color}15`, color, borderColor: `${color}40` }}>{a.sport}</span>
                    <span className="re-time">{timeAgo(post.createdAt)}</span>
                </div>
            </div>

            {/* Role tags */}
            {showDetails && (a.playerRole || a.subRole || a.style) && (
                <div className="re-role-tags">
                    {a.playerRole && <span className="re-role-tag" style={{ borderColor: `${color}40`, color }}>{a.playerRole}</span>}
                    {a.subRole && <span className="re-role-tag muted">{a.subRole}</span>}
                    {a.style && <span className="re-role-tag muted">{a.style}</span>}
                    {a.age && <span className="re-role-tag muted">Age {a.age}</span>}
                </div>
            )}

            {/* Narrative */}
            <p className="re-narrative" style={{ display: 'flex', alignItems: 'flex-start' }}>{narrative}</p>

            {/* Scout scores */}
            {showScores && (
                <div className="re-score-strip">
                    <div className="re-score-pill" style={{ '--col': getScoreColor(meta) }}>
                        <span className="re-score-tier">{getScoreTier(meta)}</span>
                        <span className="re-score-num">{meta > 0 ? meta : '—'}<span className="re-denom">/1000</span></span>
                        <span className="re-score-sub">MetaScore</span>
                    </div>
                    {spi > 0 && (
                        <div className="re-score-pill" style={{ '--col': getScoreColor(spi) }}>
                            <span className="re-score-tier">AI Rating</span>
                            <span className="re-score-num">{spi}<span className="re-denom">/1000</span></span>
                            <span className="re-score-sub">SPI Score</span>
                        </div>
                    )}
                    {/* Save button */}
                    <button
                        className={`re-save-btn ${saved ? 'saved' : ''}`}
                        style={saved ? { background: `${color}20`, borderColor: `${color}55`, color } : {}}
                        onClick={handleSave} disabled={saving}
                    >
                        {saved ? '✓ Saved' : '＋ Save'}
                    </button>
                </div>
            )}

            {/* Trait chips */}
            {stringMetrics.length > 0 && (
                <div className="re-trait-chips">
                    {stringMetrics.map(([k, v]) => (
                        <span key={k} className="re-trait"><span className="re-trait-key">{k.replace(/_/g, ' ')}: </span>{v}</span>
                    ))}
                </div>
            )}

            {/* Expandable AI metrics */}
            {numMetrics.length > 0 && (
                <div className="re-expand-wrap">
                    <button className="re-expand-btn" onClick={() => setExpanded(e => !e)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {expanded ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                        </svg>
                        {expanded ? 'Hide AI Metrics' : `View AI Metrics (${numMetrics.length})`}
                    </button>
                    {expanded && (
                        <div className="re-stat-card">
                            <span className="re-ai-chip">✦ AI Stat Card</span>
                            {numMetrics.map(([k, v]) => <MetricBar key={k} label={k} value={v} />)}
                        </div>
                    )}
                </div>
            )}

            {/* Contact + Watch */}
            <div className="re-card-footer">
                {post.videoUrl && (
                    <a className="re-watch-link" href={post.videoUrl} target="_blank" rel="noopener noreferrer">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        Watch Clip
                    </a>
                )}
                {a.email && (
                    <a className="re-contact-link" href={`mailto:${a.email}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                        </svg>
                        Contact
                    </a>
                )}
            </div>
        </article>
    );
};

/* ── Live Summary Bar ── */
const LiveBar = ({ posts }) => {
    const sportCounts = posts.reduce((acc, p) => {
        const s = p.athleteId?.sport;
        if (s) acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];
    const scores = posts.map(p => p.athleteId?.scoutScore?.metaScore).filter(s => s > 0);
    const topScore = scores.length ? Math.max(...scores) : null;
    return (
        <div className="re-live-bar">
            <span className="re-live-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" /></svg>
                <strong>{posts.length}</strong> athletes in feed
            </span>
            {topSport && <span className="re-live-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 16 21 16 17 8 17 8 21" /><path d="M16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 14.6569 9.34315 16 11 16H13C14.6569 16 16 14.6569 16 13Z" strokeWidth="2" /><path d="M5 9V11C5 12.1046 5.89543 13 7 13H8" /><path d="M19 9V11C19 12.1046 18.1046 13 17 13H16" /></svg>
                <strong>{topSport[1]}</strong> in <strong>{topSport[0]}</strong>
            </span>}
            {topScore && <span className="re-live-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                Top Score: <strong style={{ color: '#00e5a0' }}>{topScore}</strong>
            </span>}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN — RecruiterExplore
═══════════════════════════════════════════════════════════════ */
const RecruiterExplore = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* Filters */
    const [sport, setSport] = useState('All');
    const [region, setRegion] = useState('All Regions');
    const [playerRole, setPlayerRole] = useState('All');
    const [showDetails, setShowDetails] = useState(true);
    const [showScores, setShowScores] = useState(true);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${API}/videos/feed`, { credentials: 'include' });
                if (r.status === 401) throw new Error('__auth__');
                if (!r.ok) throw new Error(`Server error (${r.status})`);
                setPosts(await r.json());
            } catch (err) {
                setError(err.message);
            } finally { setLoading(false); }
        })();
    }, []);

    const roleOptions = ['All', ...(PLAYER_ROLES[sport] || [])];

    const filtered = useMemo(() => {
        return posts.filter(p => {
            const a = p.athleteId;
            if (!a) return false;
            if (sport !== 'All' && a.sport !== sport) return false;
            if (playerRole !== 'All' && a.playerRole !== playerRole) return false;
            if (!regionMatch(a.location, region)) return false;
            if (searchQ) {
                const q = searchQ.toLowerCase();
                const match = (a.name || '').toLowerCase().includes(q) ||
                    (a.location || '').toLowerCase().includes(q) ||
                    (a.playerRole || '').toLowerCase().includes(q) ||
                    (a.sport || '').toLowerCase().includes(q);
                if (!match) return false;
            }
            return true;
        });
    }, [posts, sport, region, playerRole, searchQ]);

    return (
        <section className="re-page">
            {/* Header */}
            <div className="re-header">
                <div className="re-live-badge"><span className="re-live-dot" />SCOUT FEED</div>
                <h1 className="re-title">DISCOVER <span className="re-gradient">TALENT</span></h1>
                <p className="re-subtitle">
                    Real-time AI-ranked athletes from across India — filter, analyse, and recruit the best.
                </p>
                {/* Search */}
                <div className="re-search-wrap">
                    <svg className="re-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="re-search"
                        placeholder="Search by name, location, sport, role…"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                    />
                    {searchQ && <button className="re-search-clear" onClick={() => setSearchQ('')}>✕</button>}
                </div>
            </div>

            {/* Live bar */}
            {!loading && !error && posts.length > 0 && <LiveBar posts={filtered.length ? filtered : posts} />}

            {/* Filter panel */}
            <div className="re-filters">
                {/* Sport pills */}
                <div className="re-filter-row">
                    <span className="re-filter-label">Sport</span>
                    <div className="re-pills">
                        {['All', 'Cricket', 'Badminton', 'Football'].map(s => (
                            <button key={s}
                                className={`re-pill ${sport === s ? 'active' : ''}`}
                                style={sport === s ? { '--pill-c': getSportColor(s) } : {}}
                                onClick={() => { setSport(s); setPlayerRole('All'); }}
                            >{s}</button>
                        ))}
                    </div>
                </div>

                {/* Player role pills */}
                {sport !== 'All' && (
                    <div className="re-filter-row">
                        <span className="re-filter-label">Role</span>
                        <div className="re-pills">
                            {roleOptions.map(r => (
                                <button key={r}
                                    className={`re-pill ${playerRole === r ? 'active' : ''}`}
                                    style={playerRole === r ? { '--pill-c': getSportColor(sport) } : {}}
                                    onClick={() => setPlayerRole(r)}
                                >{r}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Region select */}
                <div className="re-filter-row re-filter-row--wrap">
                    <span className="re-filter-label">Region</span>
                    <select
                        className="re-region-select"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                    >
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    {/* Toggles */}
                    <label className="re-toggle-wrap">
                        <span className="re-toggle-label">Player Details</span>
                        <div className={`re-pill-toggle ${showDetails ? 'on' : ''}`} onClick={() => setShowDetails(v => !v)}>
                            <div className="re-pill-thumb" />
                        </div>
                    </label>
                    <label className="re-toggle-wrap">
                        <span className="re-toggle-label">Scout Scores</span>
                        <div className={`re-pill-toggle ${showScores ? 'on' : ''}`} onClick={() => setShowScores(v => !v)}>
                            <div className="re-pill-thumb" />
                        </div>
                    </label>
                </div>
            </div>

            {/* Result count */}
            {!loading && !error && (
                <div className="re-result-count">
                    {filtered.length} athlete{filtered.length !== 1 ? 's' : ''} matched
                </div>
            )}

            {/* Feed */}
            <div className="re-feed">
                {loading && (
                    <div className="re-state"><div className="re-spinner" /><p>Fetching athlete feed…</p></div>
                )}
                {error === '__auth__' && (
                    <div className="re-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <p>Please log in to view the feed.</p>
                    </div>
                )}
                {error && error !== '__auth__' && (
                    <div className="re-state re-state--err">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="re-state">
                        <span className="re-empty-icon">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </span>
                        <p>No athletes match your filters.</p>
                    </div>
                )}
                {!loading && !error && filtered.map(post => (
                    <AthleteCard
                        key={post._id}
                        post={post}
                        showDetails={showDetails}
                        showScores={showScores}
                        user={user}
                    />
                ))}
            </div>
        </section>
    );
};

export default RecruiterExplore;
