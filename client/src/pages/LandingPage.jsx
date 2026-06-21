import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';

// Section imports
import { LoadingScreen } from '../components/landing/LoadingScreen';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { TimelineSection } from '../components/landing/TimelineSection';
import { WhyUsSection } from '../components/landing/WhyUsSection';
import { FounderVision } from '../components/landing/FounderVision';
import { CommunitySection } from '../components/landing/CommunitySection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

// Style import
import '../styles/landing.css';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    // Initialize Lenis smooth scroll engine
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    // Clean up scroll instance on unmount
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [isLoading]);

  return (
    <div className="landing-page-root">
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}

      {/* Main Website Structure (revealed after loading) */}
      {!isLoading && (
        <>
          {/* Scoped Ambient Floating Auroras */}
          <div className="lp-ambient-aurora">
            <div className="lp-aurora-glow-1" />
            <div className="lp-aurora-glow-2" />
          </div>

          <Navbar />
          
          <main style={{ position: 'relative', zIndex: 1 }}>
            <HeroSection />
            <AboutSection />
            <FeaturesSection />
            <TimelineSection />
            <WhyUsSection />
            <FounderVision />
            <CommunitySection />
            <TestimonialsSection />
            <CTASection />
          </main>

          <Footer />
        </>
      )}
    </div>
  );
}
