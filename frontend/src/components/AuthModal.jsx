import React, { useState, useEffect } from 'react';
import './AuthModal.css';

const SPORTS_TAXONOMY = {
    Cricket: {
        "The Batsman (Includes Wicketkeepers)": {
            subRoles: ["Pure Opener", "Pure Middle-Order", "Pure Finisher / Lower-Order", "Opener & Wicketkeeper", "Middle-Order & Wicketkeeper", "Finisher & Wicketkeeper"],
            styles: ["Aggressive / Power Hitter", "Anchor", "Accumulator"]
        },
        "The Bowler": {
            subRoles: ["Fast", "Medium-Pace", "Spin"],
            styles: ["Seam / Swing", "Wrist Spin", "Finger Spin"]
        },
        "The All-Rounder": {
            subRoles: ["Opener", "Middle-Order", "Finisher / Lower-Order", "Opener & Wicketkeeper", "Middle-Order & Wicketkeeper", "Finisher & Wicketkeeper"],
            styles: ["Fast Pace (Seam/Swing)", "Medium Pace", "Spin (Wrist)", "Spin (Finger)"]
        }
    },
    Badminton: {
        "The Singles Specialist": {
            subRoles: ["Defensive Specialist", "Offensive Specialist", "Balanced / All-Court"],
            styles: ["The Deceptive Artist", "The Powerhouse", "The Grinder"]
        },
        "The Doubles Specialist": {
            subRoles: ["The Net Controller", "The Back-Court Bomber", "The Rotation Expert"],
            styles: ["Drive Specialist", "Soft-Touch Creator"]
        }
    },
    Football: {
        "The Goal-Getter (Forwards)": {
            subRoles: ["Target Man", "Poacher / Fox-in-the-box", "False 9", "Inside Forward / Inverted Winger"],
            styles: ["Speedster", "Pressing Forward"]
        },
        "The Engine Room (Midfielders)": {
            subRoles: ["Deep-Lying Playmaker (Regista)", "Box-to-Box (B2B)", "Attacking Midfielder (No. 10)", "The Destroyer"],
            styles: ["The Dribbler", "The Metronome"]
        },
        "The Wall (Defenders & Goalkeepers)": {
            subRoles: ["Ball-Playing Center Back", "Sweeper / Libero", "Attacking Full-back / Wing-back", "Sweeper-Keeper"],
            styles: ["Aggressive Stopper", "Covering Defender"]
        }
    }
};

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('athlete'); // 'athlete' or 'recruiter'

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', location: '', phoneNumber: '',
        sport: '', playerRole: '', subRole: '', style: '', bio: '', height: '', weight: '', age: '',
        organization: ''
    });

    // Reset internal sliding state if modal closes and reopens
    useEffect(() => {
        if (isOpen) {
            setIsLogin(true);
            setRole('athlete');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = 'auto'; // Restore scrolling
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const togglePanel = () => {
        setIsLogin(!isLogin);
        if (isLogin) setRole('athlete');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSportChange = (e) => {
        setFormData(prev => ({
            ...prev, sport: e.target.value, playerRole: '', subRole: '', style: ''
        }));
    };

    const handlePlayerRoleChange = (e) => {
        setFormData(prev => ({
            ...prev, playerRole: e.target.value, subRole: '', style: ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Submitting ${isLogin ? 'Login' : 'Signup'} for role: ${!isLogin ? role : 'user'}`, formData);
        // TODO: API
    };

    const availableSports = Object.keys(SPORTS_TAXONOMY);
    const availableRoles = formData.sport ? Object.keys(SPORTS_TAXONOMY[formData.sport]) : [];
    const currentRoleData = (formData.sport && formData.playerRole)
        ? SPORTS_TAXONOMY[formData.sport][formData.playerRole]
        : { subRoles: [], styles: [] };

    return (
        <div className="auth-modal-overlay">
            <div className={`auth-container ${isLogin ? '' : 'right-panel-active'}`}>

                {/* Close Button X */}
                <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* --- SIGN UP FORM CONTAINER --- */}
                <div className="form-container sign-up-container">
                    <form className="auth-form light-theme-form" onSubmit={handleSubmit}>
                        <h1 className="form-title">Create Account</h1>

                        <div className="role-toggle-wrapper">
                            {/* Visual sliding pill block */}
                            <div className={`role-slider-bg ${role === 'recruiter' ? 'slide-right' : ''}`}></div>

                            <button
                                type="button"
                                className={`role-toggle-btn ${role === 'athlete' ? 'active' : ''}`}
                                onClick={() => setRole('athlete')}
                            >
                                Athlete
                            </button>
                            <button
                                type="button"
                                className={`role-toggle-btn ${role === 'recruiter' ? 'active' : ''}`}
                                onClick={() => setRole('recruiter')}
                            >
                                Recruiter
                            </button>
                        </div>

                        <div className="form-scroll-area">
                            <span className="form-subtitle">Use your email for registration</span>

                            {/* Common Signup Fields */}
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />

                            <div className="input-row">
                                <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
                                <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} required />
                            </div>

                            {role === 'recruiter' && (
                                <div className="conditional-fields">
                                    <input type="text" name="organization" placeholder="Organization / Agency Name" value={formData.organization} onChange={handleInputChange} required />
                                </div>
                            )}

                            {role === 'athlete' && (
                                <div className="conditional-fields">
                                    <div className="input-row">
                                        <select name="sport" value={formData.sport} onChange={handleSportChange} required>
                                            <option value="" disabled>Select Sport</option>
                                            {availableSports.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                                        </select>
                                        <select name="playerRole" value={formData.playerRole} onChange={handlePlayerRoleChange} required disabled={!formData.sport}>
                                            <option value="" disabled>Select Primary Role</option>
                                            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-row">
                                        <select name="subRole" value={formData.subRole} onChange={handleInputChange} required disabled={!formData.playerRole}>
                                            <option value="" disabled>Select Sub-Role</option>
                                            {currentRoleData.subRoles.map(sr => <option key={sr} value={sr}>{sr}</option>)}
                                        </select>
                                        <select name="style" value={formData.style} onChange={handleInputChange} required disabled={!formData.playerRole}>
                                            <option value="" disabled>Select Playing Style</option>
                                            {currentRoleData.styles.map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-row">
                                        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleInputChange} />
                                        <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleInputChange} />
                                        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleInputChange} />
                                    </div>
                                    <textarea name="bio" placeholder="Athlete Bio..." value={formData.bio} onChange={handleInputChange} rows="3"></textarea>
                                </div>
                            )}
                        </div>
                        <button type="submit" className="btn-auth-submit mt-3">Sign Up</button>
                    </form>
                </div>

                {/* --- SIGN IN FORM CONTAINER --- */}
                <div className="form-container sign-in-container">
                    <form className="auth-form light-theme-form" onSubmit={handleSubmit}>
                        <h1 className="form-title">Welcome Back</h1>
                        <span className="form-subtitle">Enter your credentials to access your dashboard</span>

                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />

                        <a href="#" className="forgot-password">Forgot your password?</a>
                        <button type="submit" className="btn-auth-submit">Log In</button>
                    </form>
                </div>

                {/* --- OVERLAY CONTAINER (THE SLIDER) --- */}
                <div className="overlay-container">
                    <div className="overlay">
                        {/* Overlay Left (Visible when Signup is active) */}
                        <div className="overlay-panel overlay-left">
                            <h1 className="overlay-title has-shadow">Already scouted?</h1>
                            <p className="overlay-desc has-shadow">Log in to your account with your personal info to see your latest SPI data and analytics.</p>
                            <button className="btn-secondary ghost" onClick={togglePanel}>Log In</button>
                        </div>

                        {/* Overlay Right (Visible when Login is active) */}
                        <div className="overlay-panel overlay-right">
                            <h1 className="overlay-title has-shadow">Join the<br />Revolution!</h1>
                            <p className="overlay-desc has-shadow">Enter your personal details and start your journey with the world's leading AI scouting platform.</p>
                            <button className="btn-secondary ghost" onClick={togglePanel}>Sign Up</button>
                        </div>
                    </div>
                </div>

            </div >
        </div >
    );
};

export default AuthModal;
