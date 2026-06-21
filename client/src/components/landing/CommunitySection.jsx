import React from 'react';
import { ParticleNetworkCanvas } from './ParticleNetworkCanvas';
import { Users, Radio } from 'lucide-react';

export function CommunitySection() {
  return (
    <section id="community" className="lp-community">
      <div className="lp-container">
        <div className="lp-community-inner">
          {/* Left Column: Text Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="lp-hero-pill" style={{ margin: 0 }}>
              <Users size={14} /> Ecosystem Grid
            </div>

            <h2 className="lp-title-section">
              India's Connected <span>Student Workforce</span>
            </h2>

            <p className="lp-subtitle">
              Our decentralized mesh connects technical minds from elite universities across India (IITs, NITs, BITS) into one high-performance workforce grid.
            </p>

            <div style={{ padding: '24px', background: 'rgba(52, 211, 153, 0.03)', border: '1px solid rgba(52, 211, 153, 0.15)', borderRadius: '20px', display: 'flex', gap: '16px' }}>
              <div style={{ color: '#34D399', animation: 'logo-pulsate 2s infinite ease-in-out' }}>
                <Radio size={22} />
              </div>
              <div>
                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '6px' }}>Live Matching Network</h4>
                <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.88rem' }}>Move your cursor over the grid on the right to interact with the neural network nodes. It visualizes live hiring activities connecting student developers to active startup briefs in real-time.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Canvas */}
          <div className="lp-community-visual">
            <ParticleNetworkCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
