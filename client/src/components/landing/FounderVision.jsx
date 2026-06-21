import React, { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';

export function FounderVision() {
  const quoteText = "India's greatest leverage is its young minds. By matching their raw talent with global opportunities, we aren't just filling jobs—we are building the next generation of industrial leaders, founders, and innovators. NextGenGrowth is the trust-layer that makes this friction-free.";
  const words = quoteText.split(" ");
  
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasIntersected, setHasIntersected] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasIntersected]);

  useEffect(() => {
    if (!hasIntersected) return;

    let currentWord = 0;
    const interval = setInterval(() => {
      if (currentWord < words.length) {
        setVisibleCount(prev => prev + 1);
        currentWord++;
      } else {
        clearInterval(interval);
      }
    }, 60); // Reveal speed: 60ms per word

    return () => clearInterval(interval);
  }, [hasIntersected, words.length]);

  return (
    <section ref={containerRef} className="lp-vision">
      <div className="lp-container">
        <div className="lp-vision-inner">
          {/* Green spotlight */}
          <div className="lp-vision-glow" />

          <div className="lp-vision-content">
            <div className="lp-hero-pill" style={{ margin: '0 auto' }}>
              <Eye size={14} /> Founder Vision
            </div>

            {/* Word-by-word quote reveal */}
            <blockquote className="lp-vision-quote">
              {words.map((word, idx) => (
                <span 
                  key={idx} 
                  className={`lp-vision-word ${idx < visibleCount ? 'visible' : ''}`}
                >
                  {word}
                </span>
              ))}
            </blockquote>

            <div className="lp-vision-author" style={{ marginTop: '20px' }}>
              <h4>Swatantra Shukla</h4>
              <span>Founder & CEO, NextGenGrowth</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
