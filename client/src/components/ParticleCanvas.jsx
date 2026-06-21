import React, { useRef, useEffect } from 'react';

export const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let pts = [];
    let w = 0;
    let h = 0;

    const initCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      pts = Array.from({ length: 40 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vX: (Math.random() - 0.5) * 0.5,
        vY: (Math.random() - 0.5) * 0.5,
        s: Math.random() * 2 + 1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0, 201, 107, 0.4)';
      pts.forEach((p) => {
        p.x += p.vX;
        p.y += p.vY;

        // Bounce handlers
        if (p.x < 0 || p.x > w) p.vX *= -1;
        if (p.y < 0 || p.y > h) p.vY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    initCanvas();
    draw();

    window.addEventListener('resize', initCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initCanvas);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef} />;
};
export default ParticleCanvas;
