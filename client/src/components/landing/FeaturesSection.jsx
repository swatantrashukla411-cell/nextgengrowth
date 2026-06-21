import React, { useRef } from 'react';
import { Briefcase, CreditCard, Award, UserCheck, Shield, Sparkles } from 'lucide-react';

function TiltCard({ children, icon: Icon, title, desc }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    
    // Calculate normalized cursor position within the card (-0.5 to 0.5)
    const x = (e.clientX - box.left) / box.width - 0.5;
    const y = (e.clientY - box.top) / box.height - 0.5;
    
    // Tilt limits: 15 degrees max
    const tiltX = -y * 20;
    const tiltY = x * 20;
    
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div 
      className="lp-feature-card" 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      <div ref={cardRef} className="lp-feature-card-inner">
        <div className="lp-feature-icon">
          <Icon size={24} />
        </div>
        <h3 className="lp-feature-title">{title}</h3>
        <p className="lp-feature-desc">{desc}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: Briefcase,
      title: "Paid Projects",
      desc: "Work on vetted micro-gigs, custom freelance development, and designing milestones for established brands."
    },
    {
      icon: UserCheck,
      title: "Student Hiring",
      desc: "For brands: access verified, skill-tested student developers, content writers, marketers, and designers instantly."
    },
    {
      icon: Shield,
      title: "Secure Escrows",
      desc: "Payments are locked in escrow up front. Once milestones are approved, funds release immediately to your account."
    },
    {
      icon: Sparkles,
      title: "AI Resume & Portfolio",
      desc: "Import GitHub, Behance, or LinkedIn. Our AI builds a dynamic live portfolio highlighting verified project grades."
    },
    {
      icon: Award,
      title: "Cryptographic Credentials",
      desc: "Receive cryptographic credentials and digital work experience certificates signed by partner brands."
    },
    {
      icon: CreditCard,
      title: "Instant Invoicing & Taxes",
      desc: "Automatic invoicing, compliance management, and instant payouts to local bank accounts or digital wallets."
    }
  ];

  return (
    <section id="features" className="lp-features">
      <div className="lp-container">
        <div className="lp-features-header">
          <div className="lp-hero-pill">
            <Sparkles size={14} /> Features Ecosystem
          </div>
          <h2 className="lp-title-section">
            Engineered for the <span>Next Generation</span> of Work
          </h2>
          <p className="lp-subtitle">
            A comprehensive suite of tools built specifically to support high-velocity projects, transparent payouts, and verified career tracks.
          </p>
        </div>

        <div className="lp-features-grid">
          {features.map((feature, i) => (
            <TiltCard 
              key={i} 
              icon={feature.icon} 
              title={feature.title} 
              desc={feature.desc} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
