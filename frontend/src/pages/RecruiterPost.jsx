import React, { useState } from 'react';
import './RecruiterPost.css';

const API = 'http://localhost:3000/api';

const SPORTS = ['Cricket', 'Football', 'Badminton'];
const ROLES = {
    Cricket: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
    Football: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
    Badminton: ['Singles', 'Doubles', 'Mixed Doubles'],
};

const RecruiterPost = ({ user }) => {
    const [formData, setFormData] = useState({
        title: '',
        sport: 'Cricket',
        role: 'Batsman',
        location: '',
        date: '',
        description: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // Reset role if sport changes
            if (name === 'sport') next.role = ROLES[value][0];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const res = await fetch(`${API}/opportunities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include' // needed for JWT cookie
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to post opportunity');
            }

            setStatus({ type: 'success', msg: 'Opportunity posted successfully! Athletes can now apply.' });
            setFormData({ title: '', sport: 'Cricket', role: 'Batsman', location: '', date: '', description: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rp-page">
            <div className="rp-header">
                <span className="rp-icon">📢</span>
                <h1 className="rp-title">Post an Opportunity</h1>
                <p className="rp-subtitle">Announce trials, club openings, or events. Scout top talent directly.</p>
            </div>

            <form className="rp-form" onSubmit={handleSubmit}>
                {status.msg && (
                    <div className={`rp-alert ${status.type}`}>
                        {status.msg}
                    </div>
                )}

                <div className="rp-group">
                    <label>Opportunity Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. U-19 Club Selections, Open Trial"
                        required
                        maxLength={60}
                    />
                </div>

                <div className="rp-row">
                    <div className="rp-group">
                        <label>Sport</label>
                        <select name="sport" value={formData.sport} onChange={handleChange} required>
                            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="rp-group">
                        <label>Target Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} required>
                            {ROLES[formData.sport]?.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <div className="rp-row">
                    <div className="rp-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai, Shivaji Park"
                            required
                        />
                    </div>
                    <div className="rp-group">
                        <label>Date / Timeframe</label>
                        <input
                            type="text"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            placeholder="e.g. 15th October 2024"
                            required
                        />
                    </div>
                </div>

                <div className="rp-group">
                    <label>Description & Requirements</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what you're looking for... (e.g., minimum 800+ MetaScore, specific age range, etc.)"
                        rows={5}
                        required
                    />
                </div>

                <button type="submit" className="rp-submit-btn" disabled={loading}>
                    {loading ? (
                        <div className="rp-spinner" />
                    ) : (
                        <>Publish Opportunity</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RecruiterPost;
