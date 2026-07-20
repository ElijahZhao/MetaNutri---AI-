'use client';
import { useEffect, useState } from 'react';

export default function GlowingTitle({ 
  children, 
  className = '', 
  glowColor = 'from-emerald-400 via-cyan-400 to-blue-400',
  duration = 4,
  delay = 0 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="relative z-10 block">
        {children}
      </span>
      <div 
        className={`absolute inset-0 opacity-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : ''}`}
        style={{
          background: `linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), rgba(34, 211, 238, 0.5), rgba(59, 130, 246, 0.3), transparent)`,
          backgroundSize: '200% 100%',
          animation: isVisible ? `shimmer ${duration}s ease-in-out infinite` : 'none',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'blur(8px)',
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}