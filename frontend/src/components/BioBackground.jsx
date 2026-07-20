"use client";
import { useEffect, useState } from 'react';

function DNAStrand({ x, y, scale, delay, color }) {
  return (
    <div 
      className="absolute animate-dna-spin"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`,
        animationDuration: '20s',
      }}
    >
      <svg width="80" height="200" viewBox="0 0 80 200">
        <defs>
          <linearGradient id={`dna-gradient-${x}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M40 10 Q60 30 40 50 Q20 70 40 90 Q60 110 40 130 Q20 150 40 170 Q60 190 40 195"
          fill="none"
          stroke={`url(#dna-gradient-${x})`}
          strokeWidth="2"
        />
        <path
          d="M40 10 Q20 30 40 50 Q60 70 40 90 Q20 110 40 130 Q60 150 40 170 Q20 190 40 195"
          fill="none"
          stroke={`url(#dna-gradient-${x})`}
          strokeWidth="2"
        />
        {[10, 50, 90, 130, 170].map((pos, i) => (
          <g key={i}>
            <circle cx="30" cy={pos} r="4" fill={color} opacity="0.6" />
            <circle cx="50" cy={pos} r="4" fill={color} opacity="0.6" />
            <line x1="30" y1={pos} x2="50" y2={pos} stroke={color} strokeWidth="1" opacity="0.4" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Molecule({ x, y, size, delay, color }) {
  return (
    <div 
      className="absolute animate-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${15 + Math.random() * 10}s`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="10" fill={color} opacity="0.8" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rx = 50 + 30 * Math.cos((angle * Math.PI) / 180);
          const ry = 50 + 30 * Math.sin((angle * Math.PI) / 180);
          return (
            <g key={i}>
              <line x1="50" y1="50" x2={rx} y2={ry} stroke={color} strokeWidth="1.5" opacity="0.5" />
              <circle cx={rx} cy={ry} r="5" fill={color} opacity="0.6" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Atom({ x, y, size, delay, color }) {
  return (
    <div 
      className="absolute animate-pulse"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="8" fill={color} opacity="0.7" />
        <circle cx="30" cy="30" r="20" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        <circle cx="30" cy="30" r="35" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
        <circle cx="30" cy="30" r="4" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}

function GlucoseMolecule({ x, y, scale, delay }) {
  return (
    <div 
      className="absolute animate-float-slow"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        animationDelay: `${delay}s`,
        animationDuration: `${20 + Math.random() * 10}s`,
      }}
    >
      <svg width="120" height="100" viewBox="0 0 120 100">
        <ellipse cx="60" cy="50" rx="45" ry="35" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rx = 60 + 35 * Math.cos((angle * Math.PI) / 180);
          const ry = 50 + 30 * Math.sin((angle * Math.PI) / 180);
          const label = ['O', 'C', 'H', 'C', 'H', 'O'][i];
          return (
            <g key={i}>
              <circle cx={rx} cy={ry} r="8" fill="#10b981" opacity="0.5" />
              <text x={rx} y={ry + 4} textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold" opacity="0.8">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function BioBackground() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements = [];
      const colors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
      
      for (let i = 0; i < 4; i++) {
        newElements.push({
          id: `dna-${i}`,
          type: 'dna',
          x: 5 + i * 30 + Math.random() * 10,
          y: 10 + Math.random() * 60,
          scale: 0.5 + Math.random() * 0.5,
          delay: Math.random() * 5,
          color: colors[i % colors.length],
        });
      }

      for (let i = 0; i < 6; i++) {
        newElements.push({
          id: `molecule-${i}`,
          type: 'molecule',
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 40 + Math.random() * 40,
          delay: Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      for (let i = 0; i < 12; i++) {
        newElements.push({
          id: `atom-${i}`,
          type: 'atom',
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 30 + Math.random() * 30,
          delay: Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      for (let i = 0; i < 2; i++) {
        newElements.push({
          id: `glucose-${i}`,
          type: 'glucose',
          x: 20 + i * 50 + Math.random() * 10,
          y: 70 + Math.random() * 20,
          scale: 0.6 + Math.random() * 0.3,
          delay: Math.random() * 8,
        });
      }

      setElements(newElements);
    };

    generateElements();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes dna-spin {
          0% { transform: scale(var(--scale, 1)) rotateY(0deg); }
          100% { transform: scale(var(--scale, 1)) rotateY(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: scale(var(--scale, 1)) translateY(0px); }
          50% { transform: scale(var(--scale, 1)) translateY(-15px); }
        }
        .animate-dna-spin {
          animation: dna-spin 20s linear infinite;
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
      `}</style>
      
      {elements.map((el) => {
        switch (el.type) {
          case 'dna':
            return <DNAStrand key={el.id} {...el} />;
          case 'molecule':
            return <Molecule key={el.id} {...el} />;
          case 'atom':
            return <Atom key={el.id} {...el} />;
          case 'glucose':
            return <GlucoseMolecule key={el.id} {...el} />;
          default:
            return null;
        }
      })}
    </div>
  );
}