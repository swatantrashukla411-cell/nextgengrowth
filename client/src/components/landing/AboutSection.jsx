import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, BrainCircuit, CreditCard } from 'lucide-react';

function Counter({ endValue, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(endValue.replace(/[^0-9]/g, ''));
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, endValue, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="lp-about">
      <div className="lp-container">
        <div className="lp-about-grid">
          {/* Left Column: Copy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="lp-hero-pill" style={{ margin: 0 }}>
              <ShieldCheck size={14} /> Ecosystem Values
            </div>
            
            <h2 className="lp-title-section">
              Bridging the gap between <span>Aspirations & Opportunities</span>.
            </h2>
            
            <p className="lp-subtitle">
              NextGenGrowth is India's leading student talent network, offering a secure infrastructure for brands to source, hire, and pay elite student freelancers and interns.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(52, 211, 153, 0.08)', borderRadius: '12px', color: '#34D399' }}>
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>AI-Powered Matching</h4>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.9rem' }}>We evaluate skill stacks, project portfolios, and past feedback to match students with appropriate corporate gigs automatically.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(52, 211, 153, 0.08)', borderRadius: '12px', color: '#34D399' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>Skill Verification & KYC</h4>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.9rem' }}>Every student profile undergoes credentials checking and technical assessments, ensuring pre-screened, ready-to-deploy talent.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(52, 211, 153, 0.08)', borderRadius: '12px', color: '#34D399' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>Escrow-Secured Payments</h4>
                  <p style={{ color: 'var(--lp-text-muted)', fontSize: '0.9rem' }}>Funds are locked in secure escrows and disbursed instantly upon milestone completion, safeguarding both brands and students.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Statistics Grid */}
          <div className="lp-about-stats">
            <div className="lp-stat-box">
              <div className="lp-stat-num">
                <Counter endValue="50000" suffix="+" />
              </div>
              <div className="lp-stat-lbl">Active Students Across India</div>
            </div>

            <div className="lp-stat-box">
              <div className="lp-stat-num">
                <Counter endValue="500" suffix="+" />
              </div>
              <div className="lp-stat-lbl">Brands Sourcing Talent</div>
            </div>

            <div className="lp-stat-box">
              <div className="lp-stat-num">
                <Counter endValue="1200" suffix="+" />
              </div>
              <div className="lp-stat-lbl">Completed Projects</div>
            </div>

            <div className="lp-stat-box">
              <div className="lp-stat-num">
                98%
              </div>
              <div className="lp-stat-lbl">Hiring Match Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
