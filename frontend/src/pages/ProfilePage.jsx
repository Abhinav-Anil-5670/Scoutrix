import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PolarRadiusAxis,
} from 'recharts';
import './ProfilePage.css';

const API = 'http://localhost:3000/api';

/* ── helpers ─────────────────────────────────────────────────── */
const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const scoreColor = (s) => s >= 75 ? '#00e5a0' : s >= 50 ? '#fbbf24' : '#f87171';

const sportColor = (sport) => ({
    Cricket: '#00e5a0', Football: '#a78bfa', Badminton: '#fbbf24',
}[sport] || '#00e5a0');

/* ── Compute performance chart data from posts ─────────────────── */
function buildChartData(posts) {
    return posts.map((p, i) => {
        const metrics = p.aiMetrics || {};
        const vals = Object.values(metrics).filter(v => typeof v === 'number');
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        return {
            name: `#${i + 1}`,
            score: avg,
            date: p.createdAt,
            ...metrics,
        };
    }).slice(-12); // last 12 posts
}

/* ── Build radar data from scout sub-scores ──────────────────── */
function buildRadarData(scoutScore, sport) {
    const sub = scoutScore?.subScores || {};
    const CRICKET_KEYS = ['footwork_score', 'timing_score', 'shot_selection', 'run_up_balance', 'release_point_score', 'line_and_length_rating'];
    const FOOTBALL_KEYS = ['ball_control', 'agility_score', 'passing_accuracy'];
    const BADMINTON_KEYS = ['court_coverage', 'smash_power', 'reflex_speed'];
    const keys = sport === 'Cricket' ? CRICKET_KEYS : sport === 'Football' ? FOOTBALL_KEYS : BADMINTON_KEYS;
    const available = Object.keys(sub).filter(k => keys.includes(k));
    if (!available.length) return [];
    return available.map(k => ({
        subject: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: Math.round((sub[k] / 10) * 100), // normalize 0-10 → 0-100
    }));
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: Profile Hero
═══════════════════════════════════════════════════════════════ */
function ProfileHero({ user, postCount }) {
    const color = sportColor(user.sport);
    const metaScore = user.scoutScore?.metaScore || 0;
    const sportScore = user.scoutScore?.sportScore || 0;

    const waPhone = user.phoneNumber?.replace(/\D/g, '');

    return (
        <div className="pfp-hero" style={{ '--c': color }}>
            <div className="pfp-hero-bg" style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}18, transparent 65%)` }} />

            {/* LEFT col: avatar → name → location → contact buttons */}
            <div className="pfp-left-col">
                <div className="pfp-avatar-wrap">
                    <div className="pfp-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="pfp-avatar-ring" style={{ borderColor: color + '55' }} />
                </div>

                {/* Name + sport badge */}
                <div className="pfp-name-row">
                    <h1 className="pfp-name">{user.name}</h1>
                    <span className="pfp-sport-badge" style={{ background: color + '18', borderColor: color + '44', color }}>
                        {user.sport}
                    </span>
                </div>

                {/* Location */}
                <p className="pfp-location">📍 {user.location}</p>

                {/* Contact buttons */}
                <div className="pfp-contact-row">
                    {user.email && (
                        <a href={`mailto:${user.email}`} className="pfp-contact-btn" title={user.email} style={{ '--c': color }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" />
                            </svg>
                            <span>Email</span>
                        </a>
                    )}
                    {user.phoneNumber && (
                        <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                            className="pfp-contact-btn" title="WhatsApp" style={{ '--c': '#25d366' }}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span>WhatsApp</span>
                        </a>
                    )}
                    {user.phoneNumber && (
                        <a href={`tel:${user.phoneNumber}`} className="pfp-contact-btn" title={user.phoneNumber} style={{ '--c': color }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.48 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>Call</span>
                        </a>
                    )}
                </div>
            </div>

            {/* RIGHT col: role/bio/stats + scout ring */}
            <div className="pfp-hero-info">
                <p className="pfp-role">
                    {[user.style, user.subRole, user.playerRole].filter(Boolean).join(' · ')}
                </p>
                {user.bio && <p className="pfp-bio">{user.bio}</p>}

                <div className="pfp-quick-stats">
                    {user.age && <div className="pfp-qs"><span>{user.age}</span><small>Age</small></div>}
                    {user.height && <div className="pfp-qs"><span>{user.height}</span><small>Height</small></div>}
                    {user.weight && <div className="pfp-qs"><span>{user.weight}</span><small>Weight</small></div>}
                    <div className="pfp-qs"><span style={{ color }}>{postCount}</span><small>Posts</small></div>
                </div>
            </div>

            {/* Scout score ring (right-most) */}
            <div className="pfp-score-panel">
                {/* Outer circle border wrapper */}
                <div className="pfp-score-outer-ring" style={{ borderColor: color + '30' }}>
                    <div className="pfp-score-ring-wrap">
                        <svg viewBox="0 0 90 90" width="90" height="90">
                            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                            <circle cx="45" cy="45" r="38" fill="none" stroke={color}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 38}`}
                                strokeDashoffset={`${2 * Math.PI * 38 * (1 - metaScore / 1000)}`}
                                transform="rotate(-90 45 45)"
                                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                            />
                        </svg>
                        <div className="pfp-ring-center">
                            <span style={{ color }}>{metaScore}</span>
                            <small>/ 1000</small>
                        </div>
                    </div>
                </div>
                <p className="pfp-score-label">Scout Score</p>
                <div className="pfp-sport-score" style={{ color }}>Athletic: {sportScore}</div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   SECTION: Performance Charts
═══════════════════════════════════════════════════════════════ */
function PerformanceCharts({ posts, user }) {
    const color = sportColor(user.sport);
    const chartData = buildChartData(posts);
    const radarData = buildRadarData(user.scoutScore, user.sport);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="pfp-tooltip">
                <p className="pfp-tooltip-label">{label}</p>
                {payload.map(p => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    };

    if (!chartData.length) {
        return (
            <div className="pfp-chart-empty">
                <span>📊</span>
                <p>Post videos to unlock performance charts</p>
            </div>
        );
    }

    return (
        <div className="pfp-charts-section">
            <div className="pfp-section-header">
                <h2 className="pfp-section-title">Performance Analytics</h2>
                <span className="pfp-section-sub">Based on {posts.length} AI-analysed posts</span>
            </div>

            <div className="pfp-charts-grid">
                {/* AI Score over time */}
                <div className="pfp-chart-card">
                    <h3 className="pfp-chart-title">AI Score Progression</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="score" stroke={color} strokeWidth={2.5}
                                fill="url(#scoreGrad)" dot={{ fill: color, r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: color }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Skill Radar */}
                {radarData.length > 0 && (
                    <div className="pfp-chart-card">
                        <h3 className="pfp-chart-title">Skill Radar</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Skill" dataKey="value" stroke={color} fill={color} fillOpacity={0.18} strokeWidth={2} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: Posts Grid
═══════════════════════════════════════════════════════════════ */
function PostsGrid({ posts }) {
    const [focused, setFocused] = useState(null);

    if (!posts.length) {
        return (
            <div className="pfp-section-empty">
                <span>🎬</span>
                <p>No posts yet</p>
            </div>
        );
    }

    return (
        <div className="pfp-posts-section">
            <div className="pfp-section-header">
                <h2 className="pfp-section-title">Posts</h2>
                <span className="pfp-section-sub">{posts.length} clips</span>
            </div>

            <div className="pfp-posts-grid">
                {posts.map(post => (
                    <button key={post._id} className="pfp-post-cell" onClick={() => setFocused(post)}>
                        <video src={post.videoUrl} className="pfp-post-thumb" muted playsInline preload="metadata" />
                        <div className="pfp-post-overlay">
                            <span className="pfp-post-time">{timeAgo(post.createdAt)}</span>
                            {post.scoutSummary && <span className="pfp-post-ai">✓ Verified</span>}
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {focused && (
                <div className="pfp-lightbox" onClick={() => setFocused(null)}>
                    <div className="pfp-lightbox-card" onClick={e => e.stopPropagation()}>
                        <button className="pfp-lightbox-close" onClick={() => setFocused(null)}>✕</button>
                        <video src={focused.videoUrl} className="pfp-lightbox-video" controls autoPlay />
                        {focused.scoutSummary && (
                            <p className="pfp-lightbox-summary">"{focused.scoutSummary}"</p>
                        )}
                        {focused.aiMetrics && Object.keys(focused.aiMetrics).length > 0 && (
                            <div className="pfp-lightbox-metrics">
                                {Object.entries(focused.aiMetrics)
                                    .filter(([k]) => !['scout_summary', 'scoutSummary'].includes(k))
                                    .map(([k, v]) => (
                                        <div key={k} className="pfp-metric-chip">
                                            <span className="pfp-mc-key">{k.replace(/_/g, ' ')}</span>
                                            <span className="pfp-mc-val">{v}</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                        <span className="pfp-lightbox-time">{timeAgo(focused.createdAt)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION: AI Analysis History
═══════════════════════════════════════════════════════════════ */
function AnalysisHistory({ posts, user }) {
    const color = sportColor(user.sport);
    const analysed = posts.filter(p => p.aiMetrics && Object.keys(p.aiMetrics).length > 0);

    if (!analysed.length) {
        return (
            <div className="pfp-section-empty">
                <span>🤖</span>
                <p>No AI analyses yet — upload a video to get started</p>
            </div>
        );
    }

    return (
        <div className="pfp-analysis-section">
            <div className="pfp-section-header">
                <h2 className="pfp-section-title">AI Analysis History</h2>
                <span className="pfp-section-sub">{analysed.length} sessions</span>
            </div>

            <div className="pfp-analysis-timeline">
                {analysed.map((post, i) => {
                    const metrics = post.aiMetrics || {};
                    const vals = Object.values(metrics).filter(v => typeof v === 'number');
                    const avgScore = vals.length
                        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10)
                        : 0;

                    return (
                        <div key={post._id} className="pfp-analysis-card" style={{ '--c': color }}>
                            <div className="pfp-analysis-left">
                                <div className="pfp-analysis-num" style={{ color }}>{String(analysed.length - i).padStart(2, '0')}</div>
                                <div className="pfp-analysis-line" />
                            </div>

                            <div className="pfp-analysis-body">
                                <div className="pfp-analysis-header-row">
                                    <span className="pfp-analysis-sport" style={{ color }}>
                                        {user.sport} Analysis
                                    </span>
                                    <span className="pfp-analysis-time">{timeAgo(post.createdAt)}</span>
                                    <span className="pfp-analysis-score" style={{ color: scoreColor(avgScore) }}>
                                        {avgScore}/100
                                    </span>
                                </div>

                                {post.scoutSummary && (
                                    <p className="pfp-analysis-summary">"{post.scoutSummary}"</p>
                                )}

                                <div className="pfp-analysis-metrics">
                                    {Object.entries(metrics)
                                        .filter(([k]) => !['scout_summary', 'scoutSummary'].includes(k))
                                        .slice(0, 4)
                                        .map(([k, v]) => {
                                            const pct = typeof v === 'number' ? Math.round((v / 10) * 100) : null;
                                            return (
                                                <div key={k} className="pfp-am-chip">
                                                    <span className="pfp-am-key">{k.replace(/_/g, ' ')}</span>
                                                    <span className="pfp-am-val" style={{ color }}>{v}{typeof v === 'number' ? '/10' : ''}</span>
                                                    {pct !== null && (
                                                        <div className="pfp-am-bar">
                                                            <div className="pfp-am-fill" style={{ width: `${pct}%`, background: color }} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
const ProfilePage = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('charts'); // charts | posts | analysis

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/videos/my-posts`, { credentials: 'include' });
            if (res.ok) setPosts(await res.json());
        } catch (_) { }
        setLoading(false);
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    if (!user) return null;

    return (
        <div className="pfp-page">
            {/* Hero */}
            <ProfileHero user={user} postCount={posts.length} />

            {/* Tab bar */}
            <div className="pfp-tabs">
                {[
                    { id: 'charts', label: '📊 Analytics' },
                    { id: 'posts', label: '🎬 Posts' },
                    { id: 'analysis', label: '🤖 AI History' },
                ].map(t => (
                    <button
                        key={t.id}
                        className={`pfp-tab ${tab === t.id ? 'active' : ''}`}
                        style={{ '--c': sportColor(user.sport) }}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="pfp-tab-content">
                {loading ? (
                    <div className="pfp-loading">
                        <div className="pfp-spinner" style={{ borderTopColor: sportColor(user.sport) }} />
                        <p>Loading profile data…</p>
                    </div>
                ) : (
                    <>
                        {tab === 'charts' && <PerformanceCharts posts={posts} user={user} />}
                        {tab === 'posts' && <PostsGrid posts={posts} />}
                        {tab === 'analysis' && <AnalysisHistory posts={posts} user={user} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
