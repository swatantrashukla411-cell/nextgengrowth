import React, { useState, useEffect, useRef } from 'react';
import { Compass, UserPlus, BookOpen, Rocket, Coins, TrendingUp, Trophy } from 'lucide-react';

const stepsData = [
  { 
    num: '01', 
    icon: UserPlus, 
    title: 'Apply & Screening', 
    desc: 'Submit your application detailing your college, leadership roles, and social media presence. Our selection team shortlists top influencers.', 
    reward: 'Shortlist within 48 Hours' 
  },
  { 
    num: '02', 
    icon: BookOpen, 
    title: 'Onboarding & Training', 
    desc: 'Attend virtual masterclasses on leadership, brand communication, content creation, and campaign ops. Access your NNG Leader Portal.', 
    reward: 'Official Leader Welcome Kit' 
  },
  { 
    num: '03', 
    icon: Rocket, 
    title: 'Campaign Activation', 
    desc: 'Execute on-ground activations, campus events, and digital blitzes. Track deliverables, submit proof-of-work, and coordinate with squad leads.', 
    reward: 'Milestone Activation Bonuses' 
  },
  { 
    num: '04', 
    icon: Coins, 
    title: 'Monthly Stipends & Swag', 
    desc: 'Earn monthly stipends ranging from ₹2,000 to ₹10,000 based on your performance tier, plus exclusive startup merchandise and event passes.', 
    reward: '₹2,000 – ₹10,000 / Month' 
  },
  { 
    num: '05', 
    icon: TrendingUp, 
    title: 'Leadership Promotion', 
    desc: 'Deliver consistent results to unlock promotions: Campus Ambassador → Campus Lead → City Manager → Regional Director.', 
    reward: 'Higher Stipends & Responsibilities' 
  },
  { 
    num: '06', 
    icon: Trophy, 
    title: 'Corporate Career Launchpad', 
    desc: 'Graduate with verified Certificates of Merit, Letters of Recommendation from startup founders, and priority corporate hiring placement.', 
    reward: 'LORs & Pre-Placement Offers' 
  }
];

export function AmbassadorJourney() {
  const [scrollFillPercent, setScrollFillPercent] = useState(25);
  const [activeStepIdx, setActiveStepIdx] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const startPoint = windowHeight * 0.6;
      
      const distance = startPoint - rect.top;
      let pct = (distance / totalHeight) * 100;
      pct = Math.max(10, Math.min(100, pct));
      setScrollFillPercent(pct);

      const stepIndex = Math.min(
        stepsData.length - 1,
        Math.floor((pct / 100) * stepsData.length)
      );
      setActiveStepIdx(stepIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="journey" className="cp-section">
      <div className="cp-container">
        
        <div className="cp-section-header">
          <div className="cp-eyebrow">
            <Compass size={14} />
            <span>Path to Leadership</span>
          </div>
          <h2 className="cp-section-title">
            Your Journey as a <span className="cp-green-gradient-text">Campus Ambassador</span>
          </h2>
          <p className="cp-section-subtitle">
            From your first campaign activation to landing pre-placement job offers, NextGenGrowth guides your step-by-step career progression.
          </p>
        </div>

        <div className="cp-timeline-wrapper" ref={containerRef}>
          
          {/* Laser Track */}
          <div className="cp-timeline-laser">
            <div 
              className="cp-timeline-laser-fill"
              style={{ height: `${scrollFillPercent}%` }}
            />
          </div>

          {/* Steps */}
          {stepsData.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= activeStepIdx;
            return (
              <div key={idx} className={`cp-timeline-step ${isActive ? 'active' : ''}`}>
                <div className="cp-timeline-node">
                  {step.num}
                </div>
                <div className="cp-glass-card cp-timeline-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ color: '#34d399' }}><Icon size={22} /></div>
                    <h3 style={{ fontFamily: 'var(--cp-font-heading)', fontSize: '1.2rem', color: '#ffffff' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                  <span className="cp-step-reward-tag">
                    {step.reward}
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
