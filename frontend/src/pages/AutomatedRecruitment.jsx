import React, { useState } from 'react';
import './AutomatedRecruitment.css';

const API = `${import.meta.env.VITE_API_URL}/api`;

const SPORTS = ['Cricket', 'Football', 'Badminton', 'All'];

const AutomatedRecruitment = () => {
    const [formData, setFormData] = useState({
        sport: 'All',
        minAge: '',
        maxAge: '',
        region: '',
        minSpi: '600',
        numProfiles: '10'
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: 'Generating AI Shortlist Report...' });

        try {
            const res = await fetch(`${API}/recruit/shortlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to generate report');
            }

            // The response is a PDF Blob stream
            const blob = await res.blob();

            // Check if backend returned empty (could respond with JSON error if so designed, but here we check blob size/type)
            if (blob.type === 'application/json') {
                const text = await blob.text();
                const errData = JSON.parse(text);
                throw new Error(errData.message || 'No profiles found matching criteria.');
            }

            // Create a downloadable link for the blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Scoutrix_Shortlist_${formData.sport}_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setStatus({ type: 'success', msg: '✓ Report downloaded successfully!' });
        } catch (error) {
            setStatus({ type: 'error', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ar-page">
            <div className="ar-header">
                <span className="ar-icon">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </span>
                <h1 className="ar-title">Targeted AI Shortlisting</h1>
                <p className="ar-subtitle">
                    Enter your requirements and our AI Engine will find, rank, and export the top matching athletes into a beautiful PDF report.
                </p>
            </div>

            <div className="ar-content">
                <form className="ar-form" onSubmit={handleGenerate}>
                    {status.msg && (
                        <div className={`ar-status-banner ${status.type}`}>
                            {status.msg}
                        </div>
                    )}

                    <div className="ar-section-title">Search Parameters</div>

                    <div className="ar-row">
                        <div className="ar-group">
                            <label>Target Sport</label>
                            <select name="sport" value={formData.sport} onChange={handleChange}>
                                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="ar-group">
                            <label>Target Region</label>
                            <input
                                type="text"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                placeholder="e.g. Mumbai, Bangalore"
                            />
                        </div>
                    </div>

                    <div className="ar-row ar-three-col">
                        <div className="ar-group">
                            <label>Min Age</label>
                            <input
                                type="number"
                                name="minAge"
                                value={formData.minAge}
                                onChange={handleChange}
                                placeholder="e.g. 14"
                                min="10" max="40"
                            />
                        </div>
                        <div className="ar-group">
                            <label>Max Age</label>
                            <input
                                type="number"
                                name="maxAge"
                                value={formData.maxAge}
                                onChange={handleChange}
                                placeholder="e.g. 21"
                                min="10" max="40"
                            />
                        </div>
                    </div>

                    <div className="ar-row">
                        <div className="ar-group">
                            <label>Minimum SPI Score (Base: 600)</label>
                            <input
                                type="number"
                                name="minSpi"
                                value={formData.minSpi}
                                onChange={handleChange}
                                placeholder="Minimum AI tech score (0-1000)"
                                min="0" max="1000"
                            />
                            <span className="ar-hint">Athletes will be ranked primarily by their SPI Score.</span>
                        </div>
                        <div className="ar-group">
                            <label>Max Profiles to Fetch</label>
                            <select name="numProfiles" value={formData.numProfiles} onChange={handleChange}>
                                <option value="5">Top 5</option>
                                <option value="10">Top 10</option>
                                <option value="20">Top 20</option>
                                <option value="50">Top 50</option>
                            </select>
                        </div>
                    </div>

                    <div className="ar-action-area">
                        <button type="submit" className="ar-btn-generate" disabled={loading}>
                            {loading ? (
                                <><span className="ar-spinner" /> Processing Shortlist...</>
                            ) : (
                                <>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                    </span>
                                    Generate & Download PDF Report
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="ar-info-panel">
                    <h3>How it Works</h3>
                    <ul className="ar-steps">
                        <li>
                            <div className="step-num">1</div>
                            <div>
                                <strong>Query Database</strong>
                                <p>Filters all athletes matching your sport, age, and region constraints.</p>
                            </div>
                        </li>
                        <li>
                            <div className="step-num">2</div>
                            <div>
                                <strong>AI Ranking</strong>
                                <p>Sorts the exact matches hierarchically based on their algorithmic SPI Score.</p>
                            </div>
                        </li>
                        <li>
                            <div className="step-num">3</div>
                            <div>
                                <strong>Report Compilation</strong>
                                <p>Builds a professional, recruiter-ready PDF report highlighting vital metrics and deep contact links.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AutomatedRecruitment;
