import React, { useState, useEffect, useMemo } from 'react';
import Icons from '../components/Icons';
import './ExplorePage.css';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const getSportColor = (sport) => {
    const map = { Cricket: '#00e5a0', Badminton: '#a78bfa', Football: '#fbbf24' };
    return map[sport] || '#38bdf8';
};

const getScoreColor = (score) => {
    if (!score || score === 0) return '#64748b';
    if (score >= 700) return '#00e5a0';
    if (score >= 400) return '#fbbf24';
    return '#f87171';
};

const getScoreTier = (score) => {
    if (!score || score === 0) return 'Unranked';
    if (score >= 800) return 'Elite';
    if (score >= 700) return 'Pro';
    if (score >= 500) return 'Developing';
    if (score >= 400) return 'Rising';
    return 'Beginner';
};

/**
 * Auto-generate a narrative sentence from a post's data.
 * Mimics a live sports commentary tone.
 */
const generateNarrative = (post) => {
    const a = post.athleteId;
    const meta = a?.scoutScore?.metaScore;
    const sport = a?.sport;
    const role = a?.playerRole;
    const metrics = post.aiMetrics || {};
    const numericKeys = Object.keys(metrics).filter(k => typeof metrics[k] === 'number');

    if (numericKeys.length === 0) return post.scoutSummary || 'Performance data is being processed.';

    const sortedMetrics = numericKeys.sort((a, b) => metrics[b] - metrics[a]);
    const topKey = sortedMetrics[0];
    const topVal = metrics[topKey];
    const topLabel = topKey.replace(/_/g, ' ').replace(/score|rating/i, '').trim();

    const narratives = [
        meta && meta >= 700
            ? <><Icons.Zap /> Elite performer — MetaScore {meta} puts them in the top tier of {sport || 'their sport'}.</>
            : null,
        topVal >= 8.5
            ? <><Icons.Flame /> Exceptional {topLabel} of {topVal}/10 — a standout metric in this clip.</>
            : null,
        role
            ? <><Icons.BarChart /> Scouted as a {role} — AI confirms strong positional awareness and technique.</>
            : null,
        post.scoutSummary
            ? <><Icons.Target /> "{post.scoutSummary}"</>
            : null,
        <><Icons.Lightbulb /> AI analysis complete — {numericKeys.length} performance metrics extracted from this session.</>,
    ].filter(Boolean);

    return narratives[0] || narratives[narratives.length - 1];
};

// ─────────────────────────────────────────────
// METRIC BAR — one stat row
// ─────────────────────────────────────────────
const MetricBar = ({ label, value }) => {
    const pct = Math.min(Math.round((value / 10) * 100), 100);
    const barColor = pct >= 80 ? '#00e5a0' : pct >= 60 ? '#fbbf24' : '#f87171';
    return (
        <div className="metric-row">
            <div className="metric-label">{label.replace(/_/g, ' ')}</div>
            <div className="metric-bar-track">
                <div
                    className="metric-bar-fill"
                    style={{ width: `${pct}% `, background: barColor }}
                />
            </div>
            <div className="metric-value" style={{ color: barColor }}>{value}/10</div>
        </div>
    );
};

// ─────────────────────────────────────────────
// EXPLORE CARD — one athlete post
// ─────────────────────────────────────────────
const ExploreCard = ({ post, showPlayerDetails, showRecruiterDetails }) => {
    const [expanded, setExpanded] = useState(false);
    const a = post.athleteId;
    if (!a) return null;

    const sportColor = getSportColor(a.sport);
    const meta = a.scoutScore?.metaScore ?? 0;
    const sport = a.scoutScore?.sportScore ?? 0;
    const narrative = generateNarrative(post);

    const numericMetrics = Object.entries(post.aiMetrics || {})
        .filter(([, v]) => typeof v === 'number');
    const stringMetrics = Object.entries(post.aiMetrics || {})
        .filter(([, v]) => typeof v === 'string');

    return (
        <article className="explore-card">
            {/* ── Top row: name + sport badge + time ── */}
            <div className="card-header">
                <div className="card-identity">
                    <div className="athlete-avatar" style={{ background: `${sportColor} 22`, color: sportColor }}>
                        {a.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="athlete-meta">
                        <span className="athlete-name">{a.name}</span>
                        <span className="athlete-location"><Icons.MapPin /> {a.location || 'India'}</span>
                    </div>
                </div>
                <div className="card-right">
                    <span className="sport-badge" style={{ background: `${sportColor} 18`, color: sportColor, borderColor: `${sportColor} 40` }}>
                        {a.sport}
                    </span>
                    <span className="card-time">{timeAgo(post.createdAt)}</span>
                </div>
            </div>

            {/* ── Player role tags ── */}
            {showPlayerDetails && (a.playerRole || a.subRole || a.style) && (
                <div className="role-tags">
                    {a.playerRole && <span className="role-tag">{a.playerRole}</span>}
                    {a.subRole && <span className="role-tag muted">{a.subRole}</span>}
                    {a.style && <span className="role-tag muted">{a.style}</span>}
                </div>
            )}

            {/* ── Narrative headline ── */}
            <p className="card-narrative">{narrative}</p>

            {/* ── Scout Score (Recruiter details) ── */}
            {showRecruiterDetails && (
                <div className="score-strip">
                    <div className="score-pill" style={{ '--col': getScoreColor(meta) }}>
                        <span className="score-tier">{getScoreTier(meta)}</span>
                        <span className="score-number">{meta > 0 ? meta : '—'}<span className="score-denom">/1000</span></span>
                        <span className="score-label-sm">MetaScore</span>
                    </div>
                    {sport > 0 && (
                        <div className="score-pill" style={{ '--col': getScoreColor(sport) }}>
                            <span className="score-tier">AI Rating</span>
                            <span className="score-number">{sport}<span className="score-denom">/1000</span></span>
                            <span className="score-label-sm">SPI Score</span>
                        </div>
                    )}
                </div>
            )}

            {/* ── String traits (signature shot, play style, etc.) ── */}
            {stringMetrics.length > 0 && (
                <div className="trait-chips">
                    {stringMetrics.map(([k, v]) => (
                        <span key={k} className="trait-chip">
                            <span className="trait-key">{k.replace(/_/g, ' ')}: </span>
                            {v}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Expandable AI Stat Card ── */}
            {numericMetrics.length > 0 && (
                <div className="stat-card-wrap">
                    <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {expanded
                                ? <><polyline points="18 15 12 9 6 15" /></>
                                : <><polyline points="6 9 12 15 18 9" /></>}
                        </svg>
                        {expanded ? 'Hide AI Metrics' : `View AI Metrics(${numericMetrics.length})`}
                    </button>

                    {expanded && (
                        <div className="stat-card">
                            <div className="stat-card-title">
                                <span className="ai-chip">✦ AI Stat Card</span>
                            </div>
                            {numericMetrics.map(([k, v]) => (
                                <MetricBar key={k} label={k} value={v} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Footer: video link ── */}
            {post.videoUrl && (
                <a className="video-link" href={post.videoUrl} target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    Watch Clip
                </a>
            )}
        </article>
    );
};

// ─────────────────────────────────────────────
// LIVE SUMMARY BAR — top narrative strip
// ─────────────────────────────────────────────
const LiveSummaryBar = ({ posts }) => {
    const sportCounts = posts.reduce((acc, p) => {
        const s = p.athleteId?.sport;
        if (s) acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];
    const scores = posts
        .map(p => p.athleteId?.scoutScore?.metaScore)
        .filter(s => s && s > 0);
    const maxScore = scores.length ? Math.max(...scores) : null;

    return (
        <div className="live-summary-bar">
            <span className="live-summary-item">
                <Icons.Radio /> <strong>{posts.length}</strong> performances in the feed
            </span>
            {topSport && (
                <span className="live-summary-item">
                    <Icons.Trophy /> <strong>{topSport[1]}</strong> uploads in <strong>{topSport[0]}</strong>
                </span>
            )}
            {maxScore && (
                <span className="live-summary-item">
                    <Icons.Zap /> Top MetaScore: <strong style={{ color: '#00e5a0' }}>{maxScore}</strong>
                </span>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// OPPORTUNITY CARD (Recruiter Post)
// ─────────────────────────────────────────────
const OpportunityCard = ({ opp }) => {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const handleApply = async () => {
        setApplying(true);
        try {
            const r = await fetch(`${import.meta.env.VITE_API_URL}/api/opportunities/${opp._id}/apply`, {
                method: 'POST', credentials: 'include'
            });
            if (r.ok) setApplied(true);
        } catch (_) { }
        setApplying(false);
    };

    const isRecent = (Date.now() - new Date(opp.createdAt)) / 1000 / 3600 < 24;

    return (
        <article className="explore-card opp-card" style={{ borderLeft: '4px solid #f472b6' }}>
            <div className="card-header">
                <div className="card-identity">
                    <div className="athlete-avatar opp-avatar" style={{ background: 'rgba(244,114,182,0.1)', color: '#f472b6' }}><Icons.Megaphone /></div>
                    <div className="athlete-meta">
                        <span className="athlete-name" style={{ color: '#f472b6' }}>
                            {opp.recruiterId?.name || 'Recruiter'}
                        </span>
                        <span className="athlete-location">📍 {opp.location}</span>
                    </div>
                </div>
                <div className="card-right">
                    {isRecent && <span className="sport-badge" style={{ borderColor: '#f472b6', color: '#f472b6' }}>New</span>}
                    <span className="card-time" style={{ color: '#f472b6' }}>Recruitment Drive</span>
                </div>
            </div>

            <div className="opp-body" style={{ padding: '8px 0px 4px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', color: '#f1f5f9' }}>{opp.title}</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <span className="role-tag" style={{ color: '#00e5a0', borderColor: 'rgba(0,229,160,0.3)' }}>{opp.sport}</span>
                    <span className="role-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>{opp.role}</span>
                    <span className="role-tag muted" style={{ border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center' }}><Icons.Calendar /> {opp.date}</span>
                </div>
                <p className="card-narrative" style={{ borderLeftColor: '#f472b6', fontSize: '13px' }}>
                    {opp.description}
                </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex' }}>
                <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    style={{
                        background: applied ? 'rgba(0,229,160,0.1)' : '#f472b6',
                        color: applied ? '#00e5a0' : '#111827',
                        border: applied ? '1px solid rgba(0,229,160,0.3)' : 'none',
                        padding: '10px 18px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer',
                        fontSize: '13px', width: '100%', transition: 'all 0.2s ease'
                    }}
                >
                    {applied ? <><Icons.Check /> Trial Request Sent</> : 'Raise Hand (Apply for Trial)'}
                </button>
            </div>
        </article>
    );
};

// ─────────────────────────────────────────────
// MAIN — ExplorePage
// ─────────────────────────────────────────────
const ExplorePage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [sportFilter, setSportFilter] = useState('All');
    const [showPlayerDetails, setShowPlayerDetails] = useState(true);
    const [showRecruiterDetails, setShowRecruiterDetails] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                // Fetch videos
                const resVids = await fetch(`${import.meta.env.VITE_API_URL}/api/videos/feed`, { credentials: 'include' });
                // Fetch opportunities
                const resOpps = await fetch(`${import.meta.env.VITE_API_URL}/api/opportunities`, { credentials: 'include' });

                if (resVids.status === 401 || resOpps.status === 401) throw new Error('__auth__');
                if (!resVids.ok || !resOpps.ok) throw new Error(`Server error — please try again.`);

                const videos = await resVids.json();
                const opps = await resOpps.json();

                // Interleave both into a single feed
                const combined = [
                    ...videos.map(v => ({ ...v, feedType: 'video' })),
                    ...opps.map(o => ({ ...o, feedType: 'opportunity' }))
                ];

                combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(combined);
            } catch (err) {
                if (err.message === '__auth__') {
                    setError('__auth__');
                } else if (err.name === 'TypeError') {
                    setError('Cannot reach the server. Make sure the backend is running on port 3000.');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const filteredPosts = useMemo(() => {
        if (sportFilter === 'All') return posts;
        return posts.filter(p => {
            if (p.feedType === 'opportunity') return p.sport === sportFilter;
            return p.athleteId?.sport === sportFilter;
        });
    }, [posts, sportFilter]);

    return (
        <section className="explore-page">
            {/* ── Header ── */}
            <div className="explore-header">
                <div className="explore-badge">
                    <span className="live-dot" />
                    LIVE FEED
                </div>
                <h1 className="explore-title">
                    EXPLORE <span className="explore-gradient">TALENT</span>
                </h1>
                <p className="explore-subtitle">
                    Real-time narratives from grassroots athletes across India — ranked, analyzed, and ready to be discovered.
                </p>
            </div>

            {/* ── Live summary bar ── */}
            {!loading && !error && posts.length > 0 && (
                <LiveSummaryBar posts={posts} />
            )}

            {/* ── Filters ── */}
            <div className="filters-bar">
                {/* Sport filter */}
                <div className="filter-group">
                    <span className="filter-label">Sport</span>
                    <div className="sport-pills">
                        {['All', 'Cricket', 'Badminton', 'Football'].map(s => (
                            <button
                                key={s}
                                className={`sport-pill ${sportFilter === s ? 'active' : ''}`}
                                style={sportFilter === s ? { '--pill-color': getSportColor(s) } : {}}
                                onClick={() => setSportFilter(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggle: Player details */}
                <label className="toggle-wrap">
                    <span className="toggle-label">Player Details</span>
                    <div className={`pill-toggle ${showPlayerDetails ? 'on' : ''}`} onClick={() => setShowPlayerDetails(v => !v)}>
                        <div className="pill-thumb" />
                    </div>
                </label>

                {/* Toggle: Recruiter details */}
                <label className="toggle-wrap">
                    <span className="toggle-label">Scout Scores</span>
                    <div className={`pill-toggle ${showRecruiterDetails ? 'on' : ''}`} onClick={() => setShowRecruiterDetails(v => !v)}>
                        <div className="pill-thumb" />
                    </div>
                </label>
            </div>

            {/* ── Feed ── */}
            <div className="explore-feed">
                {loading && (
                    <div className="feed-state">
                        <div className="spinner" />
                        <p>Fetching live performances…</p>
                    </div>
                )}
                {error && error === '__auth__' && (
                    <div className="feed-state">
                        <span className="empty-icon"><Icons.Lock /></span>
                        <p style={{ color: '#94a3b8' }}>Please log in to view the live feed.</p>
                    </div>
                )}
                {error && error !== '__auth__' && (
                    <div className="feed-state feed-error">
                        <span><Icons.AlertTriangle /></span>
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && filteredPosts.length === 0 && (
                    <div className="feed-state">
                        <span className="empty-icon"><Icons.Stadium /></span>
                        <p>No discoveries yet — be the first to upload!</p>
                    </div>
                )}
                {!loading && !error && filteredPosts.map(post =>
                    post.feedType === 'opportunity' ? (
                        <OpportunityCard key={post._id} opp={post} />
                    ) : (
                        <ExploreCard
                            key={post._id}
                            post={post}
                            showPlayerDetails={showPlayerDetails}
                            showRecruiterDetails={showRecruiterDetails}
                        />
                    )
                )}
            </div>
        </section>
    );
};

export default ExplorePage;
