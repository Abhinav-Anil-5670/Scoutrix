import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span className="logo-text">SCOUTRIX<span className="logo-accent">.</span></span>
                    </div>
                    <p className="footer-description">
                        Democratizing sports scouting across India. High-precision AI analysis directly from your smartphone.
                    </p>
                </div>

                <div className="footer-links-grid">
                    <div className="footer-column">
                        <h4 className="footer-heading">Platform</h4>
                        <a href="#" className="footer-link">For Athletes</a>
                        <a href="#" className="footer-link">For Scouts</a>
                        <a href="#" className="footer-link">AI Technology</a>
                        <a href="#" className="footer-link">SPI Scoring</a>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Company</h4>
                        <Link to="/about" className="footer-link">About Us</Link>
                        <a href="#" className="footer-link">Careers</a>
                        <a href="#" className="footer-link">Press</a>
                        <a href="#" className="footer-link">Contact</a>
                    </div>

                    <div className="footer-column">
                        <h4 className="footer-heading">Legal</h4>
                        <a href="#" className="footer-link">Terms of Service</a>
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Data Security</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Scoutrix Nxtgen. All rights reserved.</p>
                <div className="social-links">
                    <a href="#" className="social-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                    </a>
                    <a href="#" className="social-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    <a href="#" className="social-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
