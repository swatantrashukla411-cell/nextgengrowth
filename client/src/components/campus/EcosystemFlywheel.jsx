import React from 'react';
import { Users, Megaphone, Smartphone, GitBranch, BarChart2, Award, Layers } from 'lucide-react';

const flywheelData = [
  { 
    icon: Users, 
    title: 'Ambassador Squads', 
    desc: 'Verified student leaders embedded in 500+ top campuses — trained, managed, and performance-tracked by NextGenGrowth. Not random reps. An organized force.' 
  },
  { 
    icon: Megaphone, 
    title: 'On-Ground Activations', 
    desc: 'End-to-end managed campus campaigns — poster blitzes, product stalls, flash mobs, merch drops, and fest sponsorships. We execute on the ground.' 
  },
  { 
    icon: Smartphone, 
    title: 'Gen-Z Digital Outreach', 
    desc: 'Exclusive WhatsApp & Telegram campus channels, Instagram reel challenges, micro-influencer UGC, and viral referral loops reaching 10M+ students.' 
  },
  { 
    icon: GitBranch, 
    title: 'Talent Pipeline Engine', 
    desc: 'Ambassador → Paid Micro-Projects → Structured Internships → Full-Time Placements. Every campus leader enters an automated progression engine.' 
  },
  { 
    icon: BarChart2, 
    title: 'Campus Intelligence', 
    desc: 'Real-time engagement analytics, campus heatmaps, conversion funnels, and verifiable ROI metrics for brand sponsors.' 
  },
  { 
    icon: Award, 
    title: 'Student Career Rewards', 
    desc: 'Monthly stipends (₹2K–₹10K), official Certificates of Excellence, Letters of Recommendation, skill badges, and pre-placement offers.' 
  }
];

export function EcosystemFlywheel() {
  return (
    <section id="ecosystem" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-section-header">
          <div className="cp-eyebrow">
            <Layers size={14} />
            <span>The 6 Pillars</span>
          </div>
          <h2 className="cp-section-title">
            More Than Marketing. <span className="cp-green-gradient-text">A Full-Stack Ecosystem.</span>
          </h2>
          <p className="cp-section-subtitle">
            Our operating platform seamlessly connects brands seeking market expansion with ambitious college students building real-world careers.
          </p>
        </div>

        <div className="cp-flywheel-grid">
          {flywheelData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="cp-glass-card cp-flywheel-card">
                <div className="cp-card-icon-wrap">
                  <Icon size={24} />
                </div>
                <h3 className="cp-card-title">{item.title}</h3>
                <p className="cp-card-desc">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
