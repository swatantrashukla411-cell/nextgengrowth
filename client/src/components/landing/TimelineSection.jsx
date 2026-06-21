import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

export function TimelineSection() {
  const steps = [
    {
      num: "01",
      title: "Discover & Learn",
      desc: "Join student communities, take technical assessments, and build initial skill profiles powered by NNG mentors."
    },
    {
      num: "02",
      title: "Micro Projects",
      desc: "Apply to short, vetted milestone tasks posted by verified brands. Work on real codebases and earn your first payouts."
    },
    {
      num: "03",
      title: "Structured Internships",
      desc: "Secure 3-to-6 month corporate internships. Integrate into teams, work remotely, and earn monthly stipends."
    },
    {
      num: "04",
      title: "Milestone Freelancing",
      desc: "Level up to high-ticket contract deliverables. Manage client communications and build robust proof-of-work histories."
    },
    {
      num: "05",
      title: "Corporate Placement",
      desc: "Graduate directly into full-time roles with partner companies using your pre-verified platform work history."
    },
    {
      num: "06",
      title: "Career Growth",
      desc: "Become a student leader, run developer circles, and mentor the next generation entering the workforce."
    }
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const timeline = timelineRef.current;
      const rect = timeline.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Calculate the progress of the timeline section scroll
      // Start when timeline top hits 60% of viewport
      const start = viewHeight * 0.6;
      const distance = -rect.top + start;
      const totalHeight = rect.height;
      const progress = Math.min(Math.max(distance / totalHeight, 0), 1);
      setScrollProgress(progress);

      // Check which steps are active (passed 50% height of screen)
      let activeIndex = 0;
      stepsRef.current.forEach((stepEl, idx) => {
        if (!stepEl) return;
        const stepRect = stepEl.getBoundingClientRect();
        if (stepRect.top < viewHeight * 0.55) {
          activeIndex = idx;
        }
      });
      setActiveStep(activeIndex);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initially
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="timeline" className="lp-timeline">
      <div className="lp-container">
        <div className="lp-features-header" style={{ marginBottom: '40px' }}>
          <div className="lp-hero-pill">
            <Calendar size={14} /> Career Roadmap
          </div>
          <h2 className="lp-title-section">
            The Student <span>Growth Journey</span>
          </h2>
          <p className="lp-subtitle">
            From your first day in college to landing a high-paying corporate role, NextGenGrowth guides your step-by-step career timeline.
          </p>
        </div>

        {/* Timeline Container */}
        <div ref={timelineRef} className="lp-timeline-container">
          {/* Timeline background laser track */}
          <div className="lp-timeline-laser">
            <div 
              className="lp-timeline-laser-fill"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Timeline Steps */}
          {steps.map((step, idx) => (
            <div 
              key={idx}
              ref={el => stepsRef.current[idx] = el}
              className={`lp-timeline-step ${idx <= activeStep ? 'active' : ''}`}
            >
              {/* Step Node dot */}
              <div className="lp-timeline-node">
                {step.num}
              </div>

              {/* Step Info Card */}
              <div className="lp-timeline-card">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
