import React from 'react';
import { ArrowRight, Zap, Radio, ShieldCheck, BarChart3, Wallet } from 'lucide-react';

export function CampusHero({ onOpenBrandModal, onOpenStudentModal }) {
  return (
    <header id="campus-hero" className="cp-section cp-hero">
      <div className="cp-container">
        <div className="cp-hero-grid">
          
          {/* Left Column: Text Copy */}
          <div className="cp-hero-content">
            <div className="cp-eyebrow">
              <Zap size={14} />
              <span>India's Full-Stack Campus Ecosystem</span>
            </div>

            <h1 className="cp-hero-title">
              Scale Your Brand Across <span className="cp-green-gradient-text">500+ Indian Campuses</span>
            </h1>

            <p className="cp-hero-subtitle">
              We don't just market on campuses — NextGenGrowth builds the operating infrastructure connecting 50,000+ verified student leaders, D2C brands, and tech startups for on-ground activations, micro-gigs, and talent deployment.
            </p>

            <div className="cp-hero-ctas">
              <button onClick={onOpenBrandModal} className="cp-btn cp-btn-primary">
                Launch Campus Campaign <ArrowRight size={18} />
              </button>
              <button onClick={onOpenStudentModal} className="cp-btn cp-btn-secondary">
                Become Campus Leader
              </button>
            </div>

            {/* Live Stats Bar */}
            <div className="cp-hero-stats-bar">
              <div className="cp-stat-item">
                <div className="cp-stat-value">500+</div>
                <div className="cp-stat-label">Campuses</div>
              </div>
              <div className="cp-stat-item">
                <div className="cp-stat-value">50,000+</div>
                <div className="cp-stat-label">Ambassadors</div>
              </div>
              <div className="cp-stat-item">
                <div className="cp-stat-value">10M+</div>
                <div className="cp-stat-label">Monthly Reach</div>
              </div>
              <div className="cp-stat-item">
                <div className="cp-stat-value">98%</div>
                <div className="cp-stat-label">Execution Rate</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Spheres & Floating Badges */}
          <div className="cp-hero-visual">
            <div className="cp-visual-glow-sphere" />

            <div className="cp-hero-badge badge-1">
              <Radio size={16} />
              <span>Live Activations</span>
            </div>
            <div className="cp-hero-badge badge-2">
              <ShieldCheck size={16} />
              <span>Verified Leaders</span>
            </div>
            <div className="cp-hero-badge badge-3">
              <BarChart3 size={16} />
              <span>Real-Time Analytics</span>
            </div>
            <div className="cp-hero-badge badge-4">
              <Wallet size={16} />
              <span>Escrow Payouts</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
