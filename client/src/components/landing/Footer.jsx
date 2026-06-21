import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing, ${email}! We will keep you updated.`);
      setEmail('');
    }
  };

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          {/* Brand Col */}
          <div className="lp-footer-brand">
            <a href="#" className="lp-nav-logo" onClick={(e) => handleLinkClick(e, 'hero')}>
              NextGen<span>Growth</span>
            </a>
            <p className="lp-footer-desc">
              India's premier verified student workforce network. Empowering talent and driving startup projects with cryptographic trust.
            </p>
            <div className="lp-footer-socials">
              <a href="#" className="lp-social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </a>
              <a href="#" className="lp-social-icon" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
              <a href="#" className="lp-social-icon" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="#" className="lp-social-icon" aria-label="Discord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z" />
                  <circle cx="8" cy="12" r="1" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="lp-footer-col">
            <h4>Platform</h4>
            <ul className="lp-footer-links">
              <li><a href="#about" className="lp-footer-link" onClick={(e) => handleLinkClick(e, 'about')}>About Us</a></li>
              <li><a href="#features" className="lp-footer-link" onClick={(e) => handleLinkClick(e, 'features')}>Features</a></li>
              <li><a href="#timeline" className="lp-footer-link" onClick={(e) => handleLinkClick(e, 'timeline')}>Timeline</a></li>
              <li><a href="#community" className="lp-footer-link" onClick={(e) => handleLinkClick(e, 'community')}>Community</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lp-footer-col">
            <h4>Ecosystem</h4>
            <ul className="lp-footer-links">
              <li><a href="/login" className="lp-footer-link">Portal Login</a></li>
              <li><a href="/register" className="lp-footer-link">Brand Registration</a></li>
              <li><a href="/register" className="lp-footer-link">Student Sign Up</a></li>
              <li><a href="#" className="lp-footer-link">Terms & Security</a></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="lp-footer-col">
            <h4>Stay Connected</h4>
            <div className="lp-footer-newsletter">
              <p className="lp-footer-desc" style={{ fontSize: '0.85rem' }}>
                Subscribe to receive platform feature releases and hiring digests.
              </p>
              <form onSubmit={handleSubscribe} className="lp-newsletter-form">
                <input 
                  type="email" 
                  className="lp-newsletter-input" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <button type="submit" className="lp-newsletter-btn">
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="lp-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} NextGenGrowth. All rights reserved.
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Proudly Built for India's Future Workforce.
          </div>
        </div>
      </div>
    </footer>
  );
}
