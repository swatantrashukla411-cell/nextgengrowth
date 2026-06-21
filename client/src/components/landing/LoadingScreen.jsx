import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export function LoadingScreen({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // 1. Percentage counter animation (simulated fast asset loading)
    let currentPercent = 0;
    const intervalTime = 20; // ms
    const increment = () => {
      const remaining = 100 - currentPercent;
      // Faster at first, slower towards the end for realistic loading feel
      const step = Math.max(1, Math.floor(Math.random() * 4) + (remaining > 30 ? 2 : 0));
      currentPercent = Math.min(100, currentPercent + step);
      setPercent(currentPercent);

      if (currentPercent < 100) {
        setTimeout(increment, intervalTime + (100 - remaining) * 0.5);
      } else {
        // Trigger fade out once 100% is reached
        triggerFadeOut();
      }
    };

    setTimeout(increment, 100);

    // 2. Cinematic fade out
    const triggerFadeOut = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      // Scale down content slightly and fade out
      tl.to(contentRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: 'power2.inOut'
      })
      // Fade out background container
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      }, '-=0.2');
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="lp-loader-screen"
    >
      <div ref={contentRef} className="lp-loader-content">
        {/* Animated glowing orbital orb */}
        <div className="lp-loader-sphere" />
        
        {/* Percentage Counter */}
        <div className="lp-loader-percentage">
          {percent}%
        </div>
        
        {/* Animated NextGenGrowth Logo */}
        <div className="lp-loader-logo">
          NextGen<span>Growth</span>
        </div>
        
        {/* Subtitle */}
        <div className="lp-loader-text">
          Building India's Future Workforce
        </div>
      </div>
    </div>
  );
}
