import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onOpenAuth }) => {
    const tabs = [
        { name: 'ABOUT US', path: '/about' },
        { name: 'FOR ATHLETES', path: '/athletes' },
        { name: 'FOR SCOUTS', path: '/scouts' },
        { name: 'BY SPORT', path: '/sports' },
        { name: 'BY REGION', path: '/regions' }
    ];

    return (
        <nav className="navbar-container">
            <div className="navbar-logo">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span className="logo-text">SCOUTRIX<span className="logo-accent">.</span></span>
                </Link>
            </div>

            <div className="navbar-tabs">
                {tabs.map((tab, idx) => (
                    <Link key={idx} to={tab.path} className="navbar-tab">
                        <span>{tab.name}</span>
                        <span className="arrow">›</span>
                    </Link>
                ))}
            </div>

            <div className="navbar-actions">
                <button className="btn-login-unified" onClick={onOpenAuth}>
                    LOG IN
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
