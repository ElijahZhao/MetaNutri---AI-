'use client';
import ParticleBackground from './ParticleBackground';
import BioBackground from './BioBackground';
import { LanguageProvider } from '../lib/i18n';

export default function ClientProvider({ children }) {
  return (
    <LanguageProvider>
      <ParticleBackground />
      <BioBackground />
      <div className="relative z-10">{children}</div>
    </LanguageProvider>
  );
}