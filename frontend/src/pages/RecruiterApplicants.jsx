import React, { useState, useEffect } from 'react';
import './RecruiterApplicants.css';

const API = 'http://localhost:3000/api';

const RecruiterApplicants = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedApplicant, setExpandedApplicant] = useState(null); // id of expanded app

    useEffect(() => {
        const fetchOpps = async () => {
            try {
                const res = await fetch(`${API}/opportunities/me`, { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch your opportunities');
                const data = await res.json();
                setOpportunities(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOpps();
    }, []);

    if (loading) return <div className="ra-page"><div className="ra-state"><div className="ra-spinner" /> Loading applicants...</div></div>;
    if (error) return <div className="ra-page"><div className="ra-state ra-error">{error}</div></div>;

    return (
        <div className="ra-page">
            <div className="ra-header">
                <span className="ra-icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
                </span>
                <h1 className="ra-title">Automated Recruitment</h1>
                <p className="ra-subtitle">Track applications for your posted trials and opportunities.</p>
            </div>

            {opportunities.length === 0 ? (
                <div className="ra-empty">
                    You haven't posted any opportunities yet. Go to the Post tab to announce a trial!
                </div>
            ) : (
                <div className="ra-list">
                    {opportunities.map(opp => (
                        <div key={opp._id} className="ra-card">
                            <div className="ra-card-header">
                                <div>
                                    <h3 className="ra-card-title">{opp.title}</h3>
                                    <div className="ra-card-meta">
                                        <span className="ra-badge">{opp.sport} • {opp.role}</span>
                                        <span className="ra-date">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(2px)', marginRight: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            {opp.date}
                                        </span>
                                        <span className="ra-loc">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1.5px)', marginRight: '4px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                            {opp.location}
                                        </span>
                                    </div>
                                </div>
                                <div className="ra-count">
                                    <strong>{opp.applicants.length}</strong> Applicants
                                </div>
                            </div>

                            {opp.applicants.length > 0 ? (
                                <div className="ra-applicants">
                                    {opp.applicants.map(app => (
                                        <div key={app._id} className="ra-app-wrap">
                                            <div
                                                className={`ra-applicant-row ${expandedApplicant === app._id ? 'expanded' : ''}`}
                                                onClick={() => setExpandedApplicant(expandedApplicant === app._id ? null : app._id)}
                                            >
                                                <div className="ra-app-identity">
                                                    <div className="ra-app-avatar">{app.name.charAt(0)}</div>
                                                    <div className="ra-app-details">
                                                        <span className="ra-app-name">{app.name}</span>
                                                        <span className="ra-app-info">{app.playerRole || 'Athlete'} • {app.location || 'India'}</span>
                                                    </div>
                                                </div>
                                                <div className="ra-app-scores">
                                                    <div className="ra-score-box">
                                                        <span className="ra-score-label">MetaScore</span>
                                                        <strong className="ra-score-val" style={{ color: app.metaScore >= 700 ? '#00e5a0' : '#fbbf24' }}>
                                                            {app.metaScore || 'Unranked'}
                                                        </strong>
                                                    </div>
                                                    <div className="ra-score-box">
                                                        <span className="ra-score-label">SPI Score</span>
                                                        <strong className="ra-score-val" style={{ color: '#38bdf8' }}>
                                                            {app.sportScore || 'N/A'}
                                                        </strong>
                                                    </div>
                                                    <div className="ra-score-box">
                                                        <a
                                                            href={`mailto:${app.email}`}
                                                            className="ra-email-link"
                                                            onClick={(e) => e.stopPropagation()} /* Prevent row expansion */
                                                        >
                                                            Contact
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedApplicant === app._id && (
                                                <div className="ra-app-profile">
                                                    <h4 style={{ margin: '0 0 12px', color: '#f472b6', fontSize: '15px' }}>Athlete Profile</h4>
                                                    <div className="ra-profile-grid">
                                                        <div className="ra-prof-item"><span className="ra-lbl">Role:</span> {app.playerRole || 'N/A'}</div>
                                                        <div className="ra-prof-item"><span className="ra-lbl">Sub-Role:</span> {app.subRole || 'N/A'}</div>
                                                        <div className="ra-prof-item"><span className="ra-lbl">Style:</span> {app.style || 'N/A'}</div>
                                                        <div className="ra-prof-item"><span className="ra-lbl">Sport:</span> {app.sport || 'N/A'}</div>
                                                    </div>
                                                    <div className="ra-prof-divider" />
                                                    <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                                                        <p style={{ margin: '0 0 8px' }}><strong>Verified MetaScore:</strong> {app.metaScore || '0'}/1000 — <i>Determines Tier</i></p>
                                                        <p style={{ margin: 0 }}><strong>Verified SPI Score:</strong> {app.sportScore || '0'}/1000 — <i>AI Technique Rating</i></p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="ra-no-applicants">
                                    No athletes have applied for this opportunity yet.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruiterApplicants;
