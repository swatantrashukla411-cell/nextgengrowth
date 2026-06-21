import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={`lp-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="lp-container lp-navbar-inner">
          {/* Logo */}
          <a href="#" className="lp-nav-logo" onClick={(e) => scrollToSection(e, 'hero')}>
            NextGen<span>Growth</span>
          </a>

          {/* Desktop Nav Links */}
          <div className="lp-nav-links">
            <a href="#about" className="lp-nav-link" onClick={(e) => scrollToSection(e, 'about')}>About</a>
            <a href="#features" className="lp-nav-link" onClick={(e) => scrollToSection(e, 'features')}>Features</a>
            <a href="#timeline" className="lp-nav-link" onClick={(e) => scrollToSection(e, 'timeline')}>Timeline</a>
            <a href="#whyus" className="lp-nav-link" onClick={(e) => scrollToSection(e, 'whyus')}>Why NNG</a>
            <a href="#community" className="lp-nav-link" onClick={(e) => scrollToSection(e, 'community')}>Community</a>
          </div>

          {/* Desktop Actions */}
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Login
            </Link>
            <Link to="/register" className="lp-btn-primary" style={{ padding: '10px 22px', fontSize: '0.85rem' }}>
              Join Platform
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lp-nav-mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`lp-nav-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <a href="#about" className="lp-nav-link" style={{ fontSize: '1.2rem' }} onClick={(e) => scrollToSection(e, 'about')}>About</a>
        <a href="#features" className="lp-nav-link" style={{ fontSize: '1.2rem' }} onClick={(e) => scrollToSection(e, 'features')}>Features</a>
        <a href="#timeline" className="lp-nav-link" style={{ fontSize: '1.2rem' }} onClick={(e) => scrollToSection(e, 'timeline')}>Timeline</a>
        <a href="#whyus" className="lp-nav-link" style={{ fontSize: '1.2rem' }} onClick={(e) => scrollToSection(e, 'whyus')}>Why NNG</a>
        <a href="#community" className="lp-nav-link" style={{ fontSize: '1.2rem' }} onClick={(e) => scrollToSection(e, 'community')}>Community</a>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <Link to="/login" className="lp-btn-secondary" style={{ width: '100%' }} onClick={() => setIsMobileMenuOpen(false)}>
            Login
          </Link>
          <Link to="/register" className="lp-btn-primary" style={{ width: '100%' }} onClick={() => setIsMobileMenuOpen(false)}>
            Join NextGenGrowth <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
