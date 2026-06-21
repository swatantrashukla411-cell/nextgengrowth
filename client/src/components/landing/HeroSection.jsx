import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Award, CheckCircle, Briefcase, Zap } from 'lucide-react';
import { HeroGlobeCanvas } from './HeroGlobeCanvas';
import gsap from 'gsap';

export function HeroSection() {
  const headlineRef = useRef(null);
  const subheadlineRef = useRef(null);
  const ctasRef = useRef(null);
  const pillRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    // GSAP Entrance Animations
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(pillRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
    )
    .fromTo(headlineRef.current.children,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
      '-=0.4'
    )
    .fromTo(subheadlineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(ctasRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(visualRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1 },
      '-=0.8'
    );
  }, []);

  const handleExploreClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header id="hero" className="lp-hero">
      <div className="lp-container">
        <div className="lp-hero-grid">
          {/* Left Column: Text Copy */}
          <div className="lp-hero-content">
            {/* Pill badge */}
            <div ref={pillRef} className="lp-hero-pill">
              <Zap size={14} /> India's Student Workforce Ecosystem
            </div>

            {/* Headline */}
            <div ref={headlineRef} className="lp-hero-headline-wrapper">
              <h1 className="lp-hero-headline">
                Build the <span>Future of</span> Student Work.
              </h1>
            </div>

            {/* Subheading */}
            <p ref={subheadlineRef} className="lp-subtitle">
              One ecosystem where brands discover verified talent, students build real careers, and opportunities become reality.
            </p>

            {/* CTA Buttons */}
            <div ref={ctasRef} className="lp-hero-ctas">
              <Link to="/register" className="lp-btn lp-btn-primary">
                Join NextGenGrowth <ArrowRight size={18} />
              </Link>
              <a href="#about" onClick={handleExploreClick} className="lp-btn lp-btn-secondary">
                Explore Platform
              </a>
            </div>
          </div>

          {/* Right Column: 3D Globe & Floating Cards */}
          <div ref={visualRef} className="lp-hero-visual">
            {/* Three.js Globe */}
            <div className="lp-hero-canvas-container">
              <HeroGlobeCanvas />
            </div>

            {/* Floating Glass Cards */}
            <div className="lp-hero-floating-card lp-card-pos-1">
              <Briefcase size={16} />
              <span>Internships Live</span>
            </div>

            <div className="lp-hero-floating-card lp-card-pos-2">
              <Terminal size={16} />
              <span>Paid Projects</span>
            </div>

            <div className="lp-hero-floating-card lp-card-pos-3">
              <Award size={16} />
              <span>Skills Verified</span>
            </div>

            <div className="lp-hero-floating-card lp-card-pos-4">
              <CheckCircle size={16} />
              <span>AI Matches</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
