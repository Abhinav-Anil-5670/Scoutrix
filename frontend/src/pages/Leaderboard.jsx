import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

const getSportColor = s => ({ Cricket: '#00e5a0', Badminton: '#a78bfa', Football: '#fbbf24' }[s] || '#38bdf8');

/* ── Medal SVG icons ── */
const GoldMedal = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="15" r="7" fill="#fbbf24" opacity="0.15" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="4.5" fill="#fbbf24" opacity="0.25" />
        <text x="12" y="19.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fbbf24">1ST</text>
        <path d="M8 8l4-6 4 6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const SilverMedal = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="15" r="7" fill="#94a3b8" opacity="0.15" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="4.5" fill="#94a3b8" opacity="0.25" />
        <text x="12" y="19.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#94a3b8">2ND</text>
        <path d="M8 8l4-6 4 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const BronzeMedal = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="15" r="7" fill="#cd7c4a" opacity="0.15" stroke="#cd7c4a" strokeWidth="1.5" />
        <circle cx="12" cy="15" r="4.5" fill="#cd7c4a" opacity="0.25" />
        <text x="12" y="19.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="#cd7c4a">3RD</text>
        <path d="M8 8l4-6 4 6" stroke="#cd7c4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const CrownIcon = () => (
    <svg width="28" height="22" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20h26M3 20L6 8l7 7 3-10 3 10 7-7 3 12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="8" r="2" fill="#fbbf24" />
        <circle cx="26" cy="8" r="2" fill="#fbbf24" />
        <circle cx="16" cy="5" r="2" fill="#fbbf24" />
    </svg>
);

const SPORTS = ['All', 'Cricket', 'Football', 'Badminton'];
const REGIONS = [
    'All India', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
    'Hyderabad', 'Pune', 'Kochi', 'Jaipur', 'Lucknow'
];

/* ═══════════════════════════════════════════════════════ */
const Leaderboard = ({ theme }) => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sport, setSport] = useState('All');
    const [region, setRegion] = useState('All India');

    useEffect(() => {
        const fetchBoard = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ limit: 20 });
                if (sport !== 'All') params.set('sport', sport);
                if (region !== 'All India') params.set('location', region);

                const r = await fetch(`${API}/leaderboard?${params}`, { credentials: 'include' });
                if (!r.ok) throw new Error(`Server error (${r.status})`);
                const data = await r.json();
                setAthletes(data.data || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBoard();
    }, [sport, region]);

    const topThree = athletes.slice(0, 3);
    const rest = athletes.slice(3);

    return (
        <section className="lb-page">
            {/* Header */}
            <div className="lb-header">
                <div className="lb-live-badge">
                    <span className="lb-live-dot" />
                    LIVE RANKINGS
                </div>
                <h1 className="lb-title">ATHLETE <span className="lb-gradient">LEADERBOARD</span></h1>
                <p className="lb-subtitle">
                    Top-ranked athletes across India — sorted by AI MetaScore.
                </p>
            </div>

            {/* Filters */}
            <div className="lb-filters">
                <div className="lb-filter-row">
                    <span className="lb-filter-label">Sport</span>
                    <div className="lb-pills">
                        {SPORTS.map(s => (
                            <button
                                key={s}
                                className={`lb-pill ${sport === s ? 'active' : ''}`}
                                style={sport === s ? { '--pill-c': getSportColor(s) } : {}}
                                onClick={() => setSport(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lb-filter-row">
                    <span className="lb-filter-label">Region</span>
                    <div className="lb-pills lb-pills--scroll">
                        {REGIONS.map(r => (
                            <button
                                key={r}
                                className={`lb-pill ${region === r ? 'active' : ''}`}
                                style={region === r ? { '--pill-c': '#38bdf8' } : {}}
                                onClick={() => setRegion(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="lb-state">
                    <div className="lb-spinner" />
                    <p>Fetching rankings…</p>
                </div>
            )}

            {error && (
                <div className="lb-state lb-state--err">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && athletes.length === 0 && (
                <div className="lb-state">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <p>No athletes found for this filter.</p>
                </div>
            )}

            {!loading && !error && athletes.length > 0 && (
                <>
                    {/* Podium — top 3 */}
                    {topThree.length >= 2 && (
                        <div className="lb-podium">
                            {/* 2nd place */}
                            {topThree[1] && (
                                <div className="lb-podium-slot lb-podium-slot--2">
                                    <div className="lb-podium-rank"><SilverMedal /></div>
                                    <div className="lb-podium-avatar" style={{ background: `${getSportColor(topThree[1].sport)}25`, color: getSportColor(topThree[1].sport) }}>
                                        {topThree[1].name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="lb-podium-name">{topThree[1].name?.split(' ')[0]}</span>
                                    <span className="lb-podium-sport" style={{ color: getSportColor(topThree[1].sport) }}>{topThree[1].sport}</span>
                                    <span className="lb-podium-score">{topThree[1].scoutScore?.metaScore ?? '—'}</span>
                                    <div className="lb-podium-bar lb-podium-bar--2" />
                                </div>
                            )}
                            {/* 1st place */}
                            {topThree[0] && (
                                <div className="lb-podium-slot lb-podium-slot--1">
                                    <div className="lb-crown"><CrownIcon /></div>
                                    <div className="lb-podium-rank"><GoldMedal /></div>
                                    <div className="lb-podium-avatar lb-podium-avatar--1" style={{ background: `${getSportColor(topThree[0].sport)}25`, color: getSportColor(topThree[0].sport) }}>
                                        {topThree[0].name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="lb-podium-name">{topThree[0].name?.split(' ')[0]}</span>
                                    <span className="lb-podium-sport" style={{ color: getSportColor(topThree[0].sport) }}>{topThree[0].sport}</span>
                                    <span className="lb-podium-score lb-podium-score--1">{topThree[0].scoutScore?.metaScore ?? '—'}</span>
                                    <div className="lb-podium-bar lb-podium-bar--1" />
                                </div>
                            )}
                            {/* 3rd place */}
                            {topThree[2] && (
                                <div className="lb-podium-slot lb-podium-slot--3">
                                    <div className="lb-podium-rank"><BronzeMedal /></div>
                                    <div className="lb-podium-avatar" style={{ background: `${getSportColor(topThree[2].sport)}25`, color: getSportColor(topThree[2].sport) }}>
                                        {topThree[2].name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="lb-podium-name">{topThree[2].name?.split(' ')[0]}</span>
                                    <span className="lb-podium-sport" style={{ color: getSportColor(topThree[2].sport) }}>{topThree[2].sport}</span>
                                    <span className="lb-podium-score">{topThree[2].scoutScore?.metaScore ?? '—'}</span>
                                    <div className="lb-podium-bar lb-podium-bar--3" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ranked list — position 4+ */}
                    {rest.length > 0 && (
                        <div className="lb-list">
                            {rest.map((athlete, i) => {
                                const pos = i + 4;
                                const color = getSportColor(athlete.sport);
                                const score = athlete.scoutScore?.metaScore ?? 0;
                                return (
                                    <div key={athlete._id} className="lb-row">
                                        <span className="lb-pos">#{pos}</span>
                                        <div className="lb-row-avatar" style={{ background: `${color}20`, color }}>
                                            {athlete.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="lb-row-info">
                                            <span className="lb-row-name">{athlete.name}</span>
                                            <span className="lb-row-detail">
                                                {athlete.playerRole && <span>{athlete.playerRole} · </span>}
                                                <span style={{ color }}>{athlete.sport}</span>
                                                {athlete.location && <span> · {athlete.location}</span>}
                                            </span>
                                        </div>
                                        <div className="lb-row-right">
                                            <span className="lb-row-score" style={{ color: score >= 700 ? '#00e5a0' : score >= 400 ? '#fbbf24' : '#94a3b8' }}>
                                                {score > 0 ? score : '—'}
                                            </span>
                                            <span className="lb-row-denom">/1000</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default Leaderboard;
