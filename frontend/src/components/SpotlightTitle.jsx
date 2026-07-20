'use client';
import { useEffect, useState } from 'react';

export default function SpotlightTitle({ 
  children, 
  className = '', 
  color = 'rgba(16, 185, 129, 0.6)',
  intensity = 0.8,
  speed = 3,
  delay = 1000 
}) {
  const [position, setPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);

    if (!isAnimating) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = ((timestamp - startTime) % (speed * 1000)) / (speed * 1000);
      setPosition(progress);
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animationFrame);
    };
  }, [isAnimating, speed, delay]);

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10 block">
        {children}
      </span>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${position * 100}% 50%, ${color} 0%, transparent 50%)`,
          opacity: isAnimating ? intensity : 0,
          transition: 'opacity 1s ease-in-out',
          filter: 'blur(4px)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${position * 100}% 50%, rgba(255,255,255,0.3) 0%, transparent 40%)`,
          opacity: isAnimating ? intensity * 0.5 : 0,
          transition: 'opacity 1s ease-in-out',
        }}
      />
    </div>
  );
}