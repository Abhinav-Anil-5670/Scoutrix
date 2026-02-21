import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const tabs = ['FOR ATHLETES', 'FOR SCOUTS', 'BY SPORT', 'BY REGION'];

    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span className="logo-text">SCOUTRIX<span className="logo-accent">.</span></span>
                </Link>
            </div>

            <div className="navbar-tabs">
                {tabs.map((tab, idx) => (
                    <button key={idx} className="nav-tab">
                        <span>{tab}</span>
                        <span className="arrow">›</span>
                    </button>
                ))}
            </div>

            <div className="navbar-actions">
                <button className="btn-login">Log In</button>
                <button className="btn-signup">Sign Up</button>
            </div>
        </nav>
    );
};

export default Navbar;
