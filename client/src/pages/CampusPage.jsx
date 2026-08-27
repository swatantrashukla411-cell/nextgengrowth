import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';

// Import design system CSS
import '../styles/campus.css';

// Import components
import { CampusHero } from '../components/campus/CampusHero';
import { EcosystemFlywheel } from '../components/campus/EcosystemFlywheel';
import { CampusSolutions } from '../components/campus/CampusSolutions';
import { CampusCalculator } from '../components/campus/CampusCalculator';
import { CampusNetwork } from '../components/campus/CampusNetwork';
import { AmbassadorJourney } from '../components/campus/AmbassadorJourney';
import { CampusCTA } from '../components/campus/CampusCTA';

export default function CampusPage() {
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
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

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  const handleOpenBrandModal = () => {
    setShowStudentModal(false);
    setShowBrandModal(true);
  };

  const handleOpenStudentModal = () => {
    setShowBrandModal(false);
    setShowStudentModal(true);
  };

  const handleCloseModals = () => {
    setShowBrandModal(false);
    setShowStudentModal(false);
  };

  return (
    <div className="campus-page-root">
      {/* Background Grid Lines & Auroras */}
      <div className="cp-grid-bg" />
      <div className="cp-ambient-aurora">
        <div className="cp-aurora-1" />
        <div className="cp-aurora-2" />
      </div>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <CampusHero 
          onOpenBrandModal={handleOpenBrandModal}
          onOpenStudentModal={handleOpenStudentModal}
        />
        <EcosystemFlywheel />
        <CampusSolutions />
        <CampusCalculator 
          onOpenBrandModal={handleOpenBrandModal}
        />
        <CampusNetwork />
        <AmbassadorJourney />
        <CampusCTA 
          showBrandModal={showBrandModal}
          showStudentModal={showStudentModal}
          onCloseModals={handleCloseModals}
          onOpenBrandModal={handleOpenBrandModal}
          onOpenStudentModal={handleOpenStudentModal}
        />
      </main>
    </div>
  );
}
