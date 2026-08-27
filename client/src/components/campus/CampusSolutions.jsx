import React from 'react';
import { Building2, Users, Tent, Share2, Beaker, GraduationCap, Coins, FolderOpen, Rocket } from 'lucide-react';

const brandsSolutions = [
  { icon: Users, title: 'Campus Ambassador Squads', desc: 'Deploy dedicated, trained student representatives across target colleges. Each ambassador becomes your authentic brand advocate.', featured: true },
  { icon: Tent, title: 'Guerrilla & Offline Activations', desc: 'Stall setups, flash mobs, poster blitzes, merch distribution, and fest booth activations — managed end-to-end.' },
  { icon: Share2, title: 'Digital Blitz Campaigns', desc: 'Social media takeovers, Instagram reel challenges, WhatsApp broadcast storms, and campus influencer content.' },
  { icon: Beaker, title: 'Product Sampling & Beta Testing', desc: 'Get 1,000+ real college student app or product testers in 48 hours with verified feedback and authentic UGC reviews.' }
];

const studentSolutions = [
  { icon: GraduationCap, title: 'Apply as Campus Leader', desc: 'Represent top startups and national brands on your college campus. Lead activations, build communities, and gain leadership experience.' },
  { icon: Coins, title: 'Earn While You Learn', desc: 'Receive monthly stipends from ₹2,000 to ₹10,000, milestone performance bonuses, exclusive swag, and event access.' },
  { icon: FolderOpen, title: 'Build Proof-of-Work Portfolio', desc: 'Add real corporate marketing campaigns to your resume. Earn verified certificates, LORs, and LinkedIn skill badges.' },
  { icon: Rocket, title: 'Fast-Track Career Progression', desc: 'Ambassador → Campus Lead → City Manager → Direct Placement. Get priority access to NNG paid projects and hiring partners.' }
];

export function CampusSolutions() {
  return (
    <section id="solutions" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-section-header">
          <div className="cp-eyebrow">Tailored Solutions</div>
          <h2 className="cp-section-title">
            Built For <span className="cp-green-gradient-text">Brands & Student Leaders</span>
          </h2>
          <p className="cp-section-subtitle">
            Whether you are a startup expanding your campus footprint or a student aiming to build a high-impact career, our ecosystem delivers measurable results.
          </p>
        </div>

        <div className="cp-solutions-wrapper">
          {/* For Brands */}
          <div>
            <div className="cp-group-title">
              <Building2 size={24} />
              <span>For Startups & Brands</span>
            </div>
            <div className="cp-bento-grid">
              {brandsSolutions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`cp-glass-card cp-bento-card ${item.featured ? 'featured' : ''}`}>
                    <div className="cp-bento-icon">
                      <Icon size={24} />
                    </div>
                    <div className="cp-bento-content">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* For Students */}
          <div>
            <div className="cp-group-title" style={{ color: '#34d399' }}>
              <GraduationCap size={24} />
              <span>For Students & Campus Leaders</span>
            </div>
            <div className="cp-bento-grid">
              {studentSolutions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="cp-glass-card cp-bento-card">
                    <div className="cp-bento-icon">
                      <Icon size={24} />
                    </div>
                    <div className="cp-bento-content">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
