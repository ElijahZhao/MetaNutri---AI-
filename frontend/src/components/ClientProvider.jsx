'use client';
import ParticleBackground from './ParticleBackground';

export default function ClientProvider({ children }) {
  return (
    <>
      <ParticleBackground />
      <div className="relative z-10">{children}</div>
    </>
  );
}