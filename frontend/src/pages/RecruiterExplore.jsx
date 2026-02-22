import React, { useState, useEffect, useMemo } from 'react';
import './RecruiterExplore.css';

const API = 'http://localhost:3000/api';

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
    return [
        meta >= 700 ? `⚡ Elite performer — MetaScore ${meta} puts them in the top tier of ${sport || 'their sport'}.` : null,
        topVal >= 8.5 ? `🔥 Exceptional ${topLabel} of ${topVal}/10 — recruiter-grade standout metric.` : null,
        role ? `📊 Scouted as a ${role} — AI confirms strong positional awareness.` : null,
        post.scoutSummary ? `🎯 "${post.scoutSummary}"` : null,
        `💡 ${numKeys.length} AI performance metrics extracted from this session.`,
    ].filter(Boolean)[0];
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
const AthleteCard = ({ post, showDetails, showScores }) => {
    const [expanded, setExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const a = post.athleteId;
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
            if (r.ok) setSaved(v => !v);
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
                        <span className="re-athlete-loc">📍 {a.location || 'India'}</span>
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
            <p className="re-narrative">{narrative}</p>

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
            <span className="re-live-item">📡 <strong>{posts.length}</strong> athletes in feed</span>
            {topSport && <span className="re-live-item">🏆 <strong>{topSport[1]}</strong> in <strong>{topSport[0]}</strong></span>}
            {topScore && <span className="re-live-item">⚡ Top Score: <strong style={{ color: '#00e5a0' }}>{topScore}</strong></span>}
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
    const [filterOpen, setFilterOpen] = useState(false);

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
                    <div className="re-state"><span>🔐</span><p>Please log in to view the feed.</p></div>
                )}
                {error && error !== '__auth__' && (
                    <div className="re-state re-state--err"><span>⚠️</span><p>{error}</p></div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="re-state"><span className="re-empty-icon">🏟️</span><p>No athletes match your filters.</p></div>
                )}
                {!loading && !error && filtered.map(post => (
                    <AthleteCard
                        key={post._id}
                        post={post}
                        showDetails={showDetails}
                        showScores={showScores}
                    />
                ))}
            </div>
        </section>
    );
};

export default RecruiterExplore;
