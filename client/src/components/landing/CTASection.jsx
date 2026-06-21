import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { MiniEarthCanvas } from './MiniEarthCanvas';

export function CTASection() {
  return (
    <section className="lp-closing-cta">
      {/* Background glow waves */}
      <div className="lp-cta-glow" />

      <div className="lp-container">
        {/* WebGL 3D Earth Canvas */}
        <div className="lp-cta-visual">
          <MiniEarthCanvas />
        </div>

        {/* Floating Content Overlap */}
        <div className="lp-cta-content">
          <div className="lp-hero-pill">
            <Globe size={14} /> Global Work Integration
          </div>
          
          <h2 className="lp-title-section" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05 }}>
            Ready to Build India's <br /><span>Next Generation?</span>
          </h2>
          
          <p className="lp-subtitle" style={{ maxWidth: '650px' }}>
            Create your account today. Establish a brand presence to source top-tier student contract talent, or join as a student to jumpstart your career with pre-vetted corporate briefs.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            <Link to="/register" className="lp-btn lp-btn-primary">
              Get Started Now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="lp-btn lp-btn-secondary">
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
